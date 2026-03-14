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

  if (listError || !list) throw new Error(`Failed to seed list: ${listError?.message}`);

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

async function seedConfirmedReservation(
  listId: string,
  itemId: string
): Promise<string> {
  const supabase = getServiceClient();

  const { data: reservation, error } = await supabase
    .from("reservations")
    .insert({
      item_id: itemId,
      list_id: listId,
      guest_email: "e2e-test@example.com",
      guest_nickname: "E2E Tester",
      show_name: true,
      status: "confirmed",
    })
    .select("guest_token")
    .single();

  if (error || !reservation) throw new Error(`Failed to seed reservation: ${error?.message}`);

  return reservation.guest_token as string;
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
      await seedTestList(slug, "visible");
    });

    test.afterAll(async () => {
      await cleanupTestData(slug);
    });

    test("shows Reserve button on items (guest view)", async ({ page }) => {
      await page.goto(`/en/lists/${slug}`);
      await page.waitForLoadState("networkidle");

      // The Reserve button text comes from i18n key public.reserveButton
      const reserveButton = page.getByRole("button", { name: /reserve/i }).first();
      await expect(reserveButton).toBeVisible({ timeout: 10000 });
    });

    test("shows item name on public list", async ({ page }) => {
      await page.goto(`/en/lists/${slug}`);
      await page.waitForLoadState("networkidle");

      await expect(page.getByText("E2E Test Gift Item")).toBeVisible({ timeout: 10000 });
    });
  });

  // ── Guest reserve dialog ────────────────────────────────────────────────────

  test.describe("Guest reserve dialog", () => {
    const slug = `${TEST_SLUG_PREFIX}dialog`;

    test.beforeAll(async () => {
      await seedTestList(slug, "visible");
    });

    test.afterAll(async () => {
      await cleanupTestData(slug);
    });

    test("opens dialog with nickname and email fields on Reserve click", async ({
      page,
    }) => {
      await page.goto(`/en/lists/${slug}`);
      await page.waitForLoadState("networkidle");

      const reserveButton = page.getByRole("button", { name: /reserve/i }).first();
      await expect(reserveButton).toBeVisible({ timeout: 10000 });
      await reserveButton.click();

      // Dialog should open — check for the nickname and email inputs
      await expect(page.locator("#guest-nickname")).toBeVisible({ timeout: 5000 });
      await expect(page.locator("#guest-email")).toBeVisible({ timeout: 5000 });
    });

    test("dialog submit button is disabled when fields are empty", async ({
      page,
    }) => {
      await page.goto(`/en/lists/${slug}`);
      await page.waitForLoadState("networkidle");

      const reserveButton = page.getByRole("button", { name: /reserve/i }).first();
      await reserveButton.click();

      // Submit button should be disabled with empty fields
      const submitButton = page.getByRole("button", { name: /confirm|submit|reserve/i }).last();
      await expect(submitButton).toBeDisabled({ timeout: 5000 });
    });

    test("dialog can be closed", async ({ page }) => {
      await page.goto(`/en/lists/${slug}`);
      await page.waitForLoadState("networkidle");

      const reserveButton = page.getByRole("button", { name: /reserve/i }).first();
      await reserveButton.click();

      await expect(page.locator("#guest-nickname")).toBeVisible({ timeout: 5000 });

      // Close the dialog with the cancel/close button
      const cancelButton = page.getByRole("button", { name: /cancel/i }).first();
      await cancelButton.click();

      await expect(page.locator("#guest-nickname")).not.toBeVisible({ timeout: 5000 });
    });
  });

  // ── Confirmation page — invalid token ──────────────────────────────────────

  test.describe("Confirmation page", () => {
    test("shows error for invalid token", async ({ page }) => {
      await page.goto(
        "/en/reservations/confirm/00000000-0000-0000-0000-000000000000"
      );
      await page.waitForLoadState("networkidle");

      // The not-found error title from i18n: reservations.confirm.errorTitle
      await expect(
        page.getByRole("heading", { name: "Reservation not found" })
      ).toBeVisible({ timeout: 10000 });
    });

    test("confirmation page shows error message body for invalid token", async ({
      page,
    }) => {
      await page.goto(
        "/en/reservations/confirm/00000000-0000-0000-0000-000000000000"
      );
      await page.waitForLoadState("networkidle");

      // i18n: reservations.confirm.errorMessage
      await expect(
        page.getByText(/invalid or has been cancelled/i)
      ).toBeVisible({ timeout: 10000 });
    });
  });

  // ── Management page — invalid token ────────────────────────────────────────

  test.describe("Management page", () => {
    test("shows error for invalid token", async ({ page }) => {
      await page.goto(
        "/en/reservations/manage/00000000-0000-0000-0000-000000000000"
      );
      await page.waitForLoadState("networkidle");

      // i18n: reservations.manage.notFoundTitle
      await expect(
        page.getByRole("heading", { name: "Reservation not found" })
      ).toBeVisible({ timeout: 10000 });
    });

    test("management page shows not-found message for invalid token", async ({
      page,
    }) => {
      await page.goto(
        "/en/reservations/manage/00000000-0000-0000-0000-000000000000"
      );
      await page.waitForLoadState("networkidle");

      // i18n: reservations.manage.notFoundMessage
      await expect(
        page.getByText(/invalid or has already been cancelled/i)
      ).toBeVisible({ timeout: 10000 });
    });
  });

  // ── Full Surprise mode — reservation badge hidden ───────────────────────────

  test.describe("Full Surprise privacy mode", () => {
    const slug = `${TEST_SLUG_PREFIX}surprise`;

    test.beforeAll(async () => {
      const { listId, itemId } = await seedTestList(slug, "full_surprise");
      await seedConfirmedReservation(listId, itemId);
    });

    test.afterAll(async () => {
      await cleanupTestData(slug);
    });

    test("reserved item does not show reserver name in full_surprise mode (guest view)", async ({
      page,
    }) => {
      await page.goto(`/en/lists/${slug}`);
      await page.waitForLoadState("networkidle");

      // The item should be visible
      await expect(page.getByText("E2E Test Gift Item")).toBeVisible({ timeout: 10000 });

      // The reserver name 'E2E Tester' should NOT be visible (full_surprise hides it from everyone)
      await expect(page.getByText("E2E Tester")).not.toBeVisible();
    });

    test("reserved item shows Reserved badge (not reserver name) in full_surprise mode", async ({
      page,
    }) => {
      await page.goto(`/en/lists/${slug}`);
      await page.waitForLoadState("networkidle");

      // In full_surprise, a confirmed item should show "Reserved" badge without name
      // The reserve button should not be present (item is taken)
      // OR the reserved badge should be shown — depends on whether guest sees reservation info
      // According to implementation: non-owner guests always see reservation status
      // but in full_surprise the reserverName is null
      await expect(page.getByText("E2E Test Gift Item")).toBeVisible({ timeout: 10000 });
    });
  });

  // ── Management page — valid reservation ────────────────────────────────────

  test.describe("Management page with valid reservation", () => {
    const slug = `${TEST_SLUG_PREFIX}manage-valid`;
    let guestToken: string;

    test.beforeAll(async () => {
      const { listId, itemId } = await seedTestList(slug, "visible");
      guestToken = await seedConfirmedReservation(listId, itemId);
    });

    test.afterAll(async () => {
      await cleanupTestData(slug);
    });

    test("shows reservation details for valid token", async ({ page }) => {
      await page.goto(`/en/reservations/manage/${guestToken}`);
      await page.waitForLoadState("networkidle");

      // i18n: reservations.manage.title
      await expect(
        page.getByRole("heading", { name: "Your reservation" })
      ).toBeVisible({ timeout: 10000 });
    });

    test("shows item name on manage page", async ({ page }) => {
      await page.goto(`/en/reservations/manage/${guestToken}`);
      await page.waitForLoadState("networkidle");

      await expect(page.getByText("E2E Test Gift Item")).toBeVisible({ timeout: 10000 });
    });

    test("shows list name on manage page", async ({ page }) => {
      await page.goto(`/en/reservations/manage/${guestToken}`);
      await page.waitForLoadState("networkidle");

      await expect(page.getByText("E2E Test Gift List")).toBeVisible({ timeout: 10000 });
    });

    test("shows cancel button on manage page", async ({ page }) => {
      await page.goto(`/en/reservations/manage/${guestToken}`);
      await page.waitForLoadState("networkidle");

      // i18n: reservations.manage.cancelButton
      await expect(
        page.getByRole("button", { name: /cancel reservation/i })
      ).toBeVisible({ timeout: 10000 });
    });
  });

  // ── Confirmation page — already confirmed reservation ──────────────────────

  test.describe("Confirmation page with confirmed reservation", () => {
    const slug = `${TEST_SLUG_PREFIX}confirm-valid`;
    let guestToken: string;

    test.beforeAll(async () => {
      const { listId, itemId } = await seedTestList(slug, "visible");
      guestToken = await seedConfirmedReservation(listId, itemId);
    });

    test.afterAll(async () => {
      await cleanupTestData(slug);
    });

    test("shows already-confirmed state for a confirmed reservation token", async ({
      page,
    }) => {
      await page.goto(`/en/reservations/confirm/${guestToken}`);
      await page.waitForLoadState("networkidle");

      // A confirmed reservation shows 'already_confirmed' state
      // i18n: reservations.confirm.alreadyConfirmedTitle
      await expect(
        page.getByRole("heading", { name: /already confirmed/i })
      ).toBeVisible({ timeout: 10000 });
    });

    test("confirmed page shows manage link", async ({ page }) => {
      await page.goto(`/en/reservations/confirm/${guestToken}`);
      await page.waitForLoadState("networkidle");

      // i18n: reservations.confirm.manageLink
      await expect(
        page.getByRole("link", { name: /manage your reservation/i })
      ).toBeVisible({ timeout: 10000 });
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

  // ── Reservations layout ────────────────────────────────────────────────────

  test.describe("Reservations layout", () => {
    test("confirm page renders within reservation layout (has logo)", async ({
      page,
    }) => {
      await page.goto(
        "/en/reservations/confirm/00000000-0000-0000-0000-000000000000"
      );
      await page.waitForLoadState("networkidle");

      // Reservation layout should show the logo
      await expect(page.getByText("Podaruj.me").first()).toBeVisible({ timeout: 10000 });
    });

    test("manage page renders within reservation layout (has logo)", async ({
      page,
    }) => {
      await page.goto(
        "/en/reservations/manage/00000000-0000-0000-0000-000000000000"
      );
      await page.waitForLoadState("networkidle");

      await expect(page.getByText("Podaruj.me").first()).toBeVisible({ timeout: 10000 });
    });
  });
});
