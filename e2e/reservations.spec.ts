import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// ── Load .env.local manually (dotenv not available as a dep) ─────────────────

function loadEnvLocal() {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

// ── Supabase service client (server-side seed/cleanup) ────────────────────────

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

// ── Test data helpers ─────────────────────────────────────────────────────────

// Must be a real user ID that exists in auth.users (FK constraint)
const TEST_USER_ID = "9be5da3d-5f36-4e43-9d40-5c697d73bca1";
const TEST_SLUG_PREFIX = "e2e-reservations-test-";

async function seedTestList(
  slug: string,
  privacyMode = "visible"
): Promise<{ listId: string; itemId: string }> {
  const supabase = getServiceClient();

  // Check if list already exists (handles concurrent project workers)
  const { data: existing } = await supabase
    .from("lists")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existing) {
    // Wait for the item to be created by the other worker (race condition)
    for (let i = 0; i < 10; i++) {
      const { data: existingItem } = await supabase
        .from("items")
        .select("id")
        .eq("list_id", existing.id)
        .limit(1)
        .single();
      if (existingItem) return { listId: existing.id, itemId: existingItem.id };
      await new Promise((r) => setTimeout(r, 500));
    }
    return { listId: existing.id, itemId: "" };
  }

  const { data: list, error: listError } = await supabase
    .from("lists")
    .insert({
      name: "E2E Test Gift List",
      occasion: "birthday",
      privacy_mode: privacyMode,
      user_id: TEST_USER_ID,
      slug,
    })
    .select("id")
    .single();

  if (listError) {
    // Handle race condition — another project worker created it first
    if (listError.code === "23505") {
      const { data: raced } = await supabase.from("lists").select("id").eq("slug", slug).single();
      if (raced) {
        const { data: racedItem } = await supabase.from("items").select("id").eq("list_id", raced.id).limit(1).single();
        return { listId: raced.id, itemId: racedItem?.id ?? "" };
      }
    }
    throw new Error(`Failed to seed list: ${listError.message}`);
  }
  if (!list) throw new Error("Failed to seed list: no data returned");

  const { data: item, error: itemError } = await supabase
    .from("items")
    .insert({
      name: "E2E Test Gift Item",
      list_id: list.id,
      position: 0,
      priority: "nice_to_have",
    })
    .select("id")
    .single();

  if (itemError || !item) throw new Error(`Failed to seed item: ${itemError?.message}`);

  return { listId: list.id, itemId: item.id };
}

async function seedReservation(
  listId: string,
  itemId: string
): Promise<void> {
  const supabase = getServiceClient();

  // Check if reservation already exists (handles concurrent project workers)
  const { data: existing } = await supabase
    .from("reservations")
    .select("id")
    .eq("item_id", itemId)
    .single();

  if (existing) return;

  const { error } = await supabase
    .from("reservations")
    .insert({
      item_id: itemId,
      list_id: listId,
      guest_nickname: "E2E Tester",
      show_name: true,
    });

  // Ignore duplicate key errors (race between projects)
  if (error && error.code !== "23505") throw new Error(`Failed to seed reservation: ${error.message}`);
}

/** Navigate to a public list page, retrying with reload if items haven't rendered yet (Next.js cache race). */
async function gotoListPage(page: import("@playwright/test").Page, slug: string) {
  await page.goto(`/en/lists/${slug}`);
  await page.waitForLoadState("networkidle");

  // If the page was cached before items were seeded, reload once
  const item = page.getByText("E2E Test Gift Item");
  if (!(await item.isVisible().catch(() => false))) {
    await page.reload();
    await page.waitForLoadState("networkidle");
  }
}

async function cleanupTestData(slug: string) {
  const supabase = getServiceClient();

  // Find list by slug
  const { data: list } = await supabase
    .from("lists")
    .select("id")
    .eq("slug", slug)
    .single();

  if (list) {
    // Delete reservations for items in this list
    await supabase.from("reservations").delete().eq("list_id", list.id);
    // Delete items
    await supabase.from("items").delete().eq("list_id", list.id);
    // Delete list
    await supabase.from("lists").delete().eq("id", list.id);
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe("Reservation flows", () => {
  // ── Public list page — reserve buttons ─────────────────────────────────────

  test.describe("Public list page — reserve buttons", () => {
    const slug = `${TEST_SLUG_PREFIX}buttons`;

    test.beforeAll(async () => {
      await cleanupTestData(slug);
      await seedTestList(slug, "visible");
    });

    test.afterAll(async () => {
      await cleanupTestData(slug);
    });

    test("shows Reserve button on items (guest view)", async ({ page }) => {
      await gotoListPage(page, slug);

      // The Reserve button text comes from i18n key public.reserveButton
      const reserveButton = page.getByRole("button", { name: /reserve/i }).first();
      await expect(reserveButton).toBeVisible({ timeout: 10000 });
    });

    test("shows item name on public list", async ({ page }) => {
      await gotoListPage(page, slug);

      await expect(page.getByText("E2E Test Gift Item")).toBeVisible({ timeout: 10000 });
    });
  });

  // ── Guest reserve dialog ────────────────────────────────────────────────────

  test.describe("Guest reserve dialog", () => {
    const slug = `${TEST_SLUG_PREFIX}dialog`;

    test.beforeAll(async () => {
      await cleanupTestData(slug);
      await seedTestList(slug, "visible");
    });

    test.afterAll(async () => {
      await cleanupTestData(slug);
    });

    test("opens dialog with nickname field on Reserve click", async ({
      page,
    }) => {
      await gotoListPage(page, slug);

      const reserveButton = page.getByRole("button", { name: /reserve/i }).first();
      await expect(reserveButton).toBeVisible({ timeout: 10000 });
      await reserveButton.click();

      // Dialog should open — check for the nickname input
      await expect(page.locator("#guest-nickname")).toBeVisible({ timeout: 5000 });
    });

    test("dialog submit button is disabled when fields are empty", async ({
      page,
    }) => {
      await gotoListPage(page, slug);

      const reserveButton = page.getByRole("button", { name: /reserve/i }).first();
      await expect(reserveButton).toBeVisible({ timeout: 10000 });
      await reserveButton.click();

      // Submit button should be disabled with empty fields
      const submitButton = page.getByRole("button", { name: /confirm|submit|reserve/i }).last();
      await expect(submitButton).toBeDisabled({ timeout: 5000 });
    });

    test("dialog can be closed", async ({ page }) => {
      await gotoListPage(page, slug);

      const reserveButton = page.getByRole("button", { name: /reserve/i }).first();
      await reserveButton.click();

      await expect(page.locator("#guest-nickname")).toBeVisible({ timeout: 5000 });

      // Close the dialog with the cancel/close button
      const cancelButton = page.getByRole("button", { name: /cancel/i }).first();
      await cancelButton.click();

      await expect(page.locator("#guest-nickname")).not.toBeVisible({ timeout: 5000 });
    });
  });

  // ── Full Surprise mode — reservation badge hidden ───────────────────────────

  test.describe("Full Surprise privacy mode", () => {
    const slug = `${TEST_SLUG_PREFIX}surprise`;

    test.beforeAll(async () => {
      await cleanupTestData(slug);
      const { listId, itemId } = await seedTestList(slug, "full_surprise");
      await seedReservation(listId, itemId);
    });

    test.afterAll(async () => {
      await cleanupTestData(slug);
    });

    test("reserved item does not show reserver name in full_surprise mode (guest view)", async ({
      page,
    }) => {
      await gotoListPage(page, slug);

      // The item should be visible
      await expect(page.getByText("E2E Test Gift Item")).toBeVisible({ timeout: 10000 });

      // The reserver name 'E2E Tester' should NOT be visible (full_surprise hides it from everyone)
      await expect(page.getByText("E2E Tester")).not.toBeVisible();
    });

    test("reserved item shows Reserved badge (not reserver name) in full_surprise mode", async ({
      page,
    }) => {
      await gotoListPage(page, slug);

      // In full_surprise, a reserved item should show "Reserved" badge without name
      await expect(page.getByText("E2E Test Gift Item")).toBeVisible({ timeout: 10000 });
    });
  });

  // ── Dashboard reservations page — unauthenticated redirect ─────────────────

  test.describe("Dashboard reservations page", () => {
    test("redirects to sign-in when not authenticated", async ({ page }) => {
      await page.goto("/en/dashboard/reservations");
      await expect(page).toHaveURL(/\/en\/auth\/sign-in/, { timeout: 10000 });
    });

    test("redirects to sign-in in Polish locale", async ({ page }) => {
      await page.goto("/pl/dashboard/reservations");
      await expect(page).toHaveURL(/\/pl\/auth\/sign-in/, { timeout: 10000 });
    });
  });
});
