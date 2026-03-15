import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// ── Load .env.local manually ─────────────────────────────────────────────────

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

// ── Supabase service client ──────────────────────────────────────────────────

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

// ── Test data ────────────────────────────────────────────────────────────────

const TEST_USER_ID = "9be5da3d-5f36-4e43-9d40-5c697d73bca1";
const TEST_SLUG_PREFIX = "e2e-lifecycle-test-";

// All slugs used in tests — for thorough cleanup
const ALL_TEST_SLUGS = [
  `${TEST_SLUG_PREFIX}countdown-future`,
  `${TEST_SLUG_PREFIX}countdown-past`,
  `${TEST_SLUG_PREFIX}closed-manual`,
  `${TEST_SLUG_PREFIX}closed-public`,
  `${TEST_SLUG_PREFIX}dashboard-closed`,
  `${TEST_SLUG_PREFIX}slug-history`,
  `${TEST_SLUG_PREFIX}slug-history-new`,
];

async function seedTestList(
  slug: string,
  overrides: Record<string, unknown> = {}
): Promise<{ listId: string; itemId: string }> {
  const supabase = getServiceClient();

  const { data: existing } = await supabase
    .from("lists")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existing) {
    const { data: existingItem } = await supabase
      .from("items")
      .select("id")
      .eq("list_id", existing.id)
      .limit(1)
      .single();
    return { listId: existing.id, itemId: existingItem?.id ?? "" };
  }

  const { data: list, error: listError } = await supabase
    .from("lists")
    .insert({
      name: "E2E Lifecycle Test List",
      occasion: "birthday",
      privacy_mode: "visible",
      user_id: TEST_USER_ID,
      slug,
      is_closed: false,
      ...overrides,
    })
    .select("id")
    .single();

  if (listError) {
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
      name: "E2E Test Gift",
      list_id: list.id,
      position: 0,
      priority: "nice_to_have",
    })
    .select("id")
    .single();

  if (itemError || !item) throw new Error(`Failed to seed item: ${itemError?.message}`);

  return { listId: list.id, itemId: item.id };
}

async function cleanupTestData(slug: string) {
  const supabase = getServiceClient();

  const { data: list } = await supabase
    .from("lists")
    .select("id")
    .eq("slug", slug)
    .single();

  if (list) {
    await supabase.from("reservations").delete().eq("list_id", list.id);
    await supabase.from("items").delete().eq("list_id", list.id);
    // Also clean up slug history for this list
    await supabase.from("list_slug_history").delete().eq("list_id", list.id);
    await supabase.from("lists").delete().eq("id", list.id);
  }
}

/** Clean up ALL test data at once — defensive cleanup */
async function cleanupAllTestData() {
  for (const slug of ALL_TEST_SLUGS) {
    await cleanupTestData(slug);
  }
  // Also clean up any slug history entries that reference test slugs
  const supabase = getServiceClient();
  for (const slug of ALL_TEST_SLUGS) {
    await supabase.from("list_slug_history").delete().eq("slug", slug);
  }
}

async function gotoListPage(page: import("@playwright/test").Page, slug: string) {
  await page.goto(`/en/lists/${slug}`);
  await page.waitForLoadState("networkidle");

  for (let i = 0; i < 2; i++) {
    const item = page.getByText("E2E Test Gift");
    if (await item.isVisible().catch(() => false)) return;
    await page.reload();
    await page.waitForLoadState("networkidle");
  }
}

// ── Tests ────────────────────────────────────────────────────────────────────

test.describe("Countdown & Lifecycle", () => {
  // Run serially to avoid race conditions with shared test data
  test.describe.configure({ mode: "serial" });

  // Clean up everything before AND after all tests
  test.beforeAll(async () => {
    await cleanupAllTestData();
  });

  test.afterAll(async () => {
    await cleanupAllTestData();
  });

  // ── Countdown display ──────────────────────────────────────────────────────

  test.describe("Countdown display", () => {
    const futureSlug = `${TEST_SLUG_PREFIX}countdown-future`;
    const pastSlug = `${TEST_SLUG_PREFIX}countdown-past`;

    test.beforeAll(async () => {
      // Future date: 30 days from now
      const future = new Date();
      future.setDate(future.getDate() + 30);
      const futureDate = future.toISOString().split("T")[0];

      // Past date: 10 days ago
      const past = new Date();
      past.setDate(past.getDate() - 10);
      const pastDate = past.toISOString().split("T")[0];

      await seedTestList(futureSlug, { event_date: futureDate });
      await seedTestList(pastSlug, { event_date: pastDate });
    });

    test("shows animated countdown for future event", async ({ page }) => {
      await gotoListPage(page, futureSlug);

      // Should show countdown section with time labels
      await expect(page.getByText("Time until the event")).toBeVisible({ timeout: 10000 });
      await expect(page.getByText("days", { exact: true })).toBeVisible();
      await expect(page.getByText("hours", { exact: true })).toBeVisible();
      await expect(page.getByText("minutes", { exact: true })).toBeVisible();
      await expect(page.getByText("seconds", { exact: true })).toBeVisible();
    });

    test("shows 'event passed' for past event", async ({ page }) => {
      await gotoListPage(page, pastSlug);

      // Multiple elements show "This event has passed" (badge + countdown + closed banner) — use first()
      await expect(page.getByText("This event has passed").first()).toBeVisible({ timeout: 10000 });
    });
  });

  // ── Closed list — public page ──────────────────────────────────────────────

  test.describe("Closed list — public page", () => {
    const slug = `${TEST_SLUG_PREFIX}closed-public`;

    test.beforeAll(async () => {
      await cleanupTestData(slug);
      await seedTestList(slug, {
        is_closed: true,
        closed_at: new Date().toISOString(),
      });
    });

    test("shows closed banner and hides reserve buttons", async ({ page }) => {
      await gotoListPage(page, slug);

      // Should show the list content first
      await expect(page.getByText("E2E Test Gift")).toBeVisible({ timeout: 10000 });

      // Should show "This list is closed" banner
      await expect(page.getByText("This list is closed").first()).toBeVisible({ timeout: 10000 });

      // Reserve button should NOT be visible (list is closed)
      const reserveButtons = page.getByRole("button", { name: /reserve/i });
      await expect(reserveButtons).toHaveCount(0);
    });
  });

  // ── Dashboard closed styling ───────────────────────────────────────────────

  test.describe("Dashboard closed list card", () => {
    const slug = `${TEST_SLUG_PREFIX}dashboard-closed`;

    test.beforeAll(async () => {
      await cleanupTestData(slug);
      // Past event date — auto-closed
      const past = new Date();
      past.setDate(past.getDate() - 5);
      await seedTestList(slug, {
        event_date: past.toISOString().split("T")[0],
      });
    });

    // This test requires authentication — skip if auth helpers not configured
    test.skip(true, "Requires authenticated session — skipped for now");

    test("shows closed badge on dashboard card", async ({ page }) => {
      // Would need auth to access /en/dashboard
      await page.goto("/en/dashboard");
      await expect(page.getByText("Closed")).toBeVisible();
    });
  });

  // ── Slug history redirect ─────────────────────────────────────────────────

  test.describe("Slug history redirect", () => {
    const oldSlug = `${TEST_SLUG_PREFIX}slug-history`;
    const newSlug = `${TEST_SLUG_PREFIX}slug-history-new`;

    test.beforeAll(async () => {
      await cleanupTestData(oldSlug);
      await cleanupTestData(newSlug);

      // Create list with the "new" slug
      const { listId } = await seedTestList(newSlug);

      // Insert old slug into history pointing to this list
      const supabase = getServiceClient();
      await supabase.from("list_slug_history").insert({
        list_id: listId,
        slug: oldSlug,
      });
    });

    test("old slug redirects to current URL", async ({ page }) => {
      await page.goto(`/en/lists/${oldSlug}`);
      await page.waitForLoadState("networkidle");

      // Should redirect to the new slug URL
      await expect(page).toHaveURL(new RegExp(newSlug), { timeout: 10000 });

      // Content should be visible — use heading to avoid matching <title> tag too
      await expect(page.getByRole("heading", { name: "E2E Lifecycle Test List" })).toBeVisible();
    });
  });
});
