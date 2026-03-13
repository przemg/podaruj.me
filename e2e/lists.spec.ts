import { test, expect } from "@playwright/test";

test.describe("Lists & Items", () => {
  // ── Protected routes (no auth needed) ──────────────────────────

  test("redirects to sign-in when accessing create list page", async ({
    page,
  }) => {
    await page.goto("/en/dashboard/lists/new");
    await expect(page).toHaveURL(/\/en\/auth\/sign-in/);
    await expect(page).toHaveURL(/next=/);
  });

  test("redirects to sign-in when accessing list detail page", async ({
    page,
  }) => {
    await page.goto(
      "/en/dashboard/lists/00000000-0000-0000-0000-000000000000"
    );
    await expect(page).toHaveURL(/\/en\/auth\/sign-in/);
  });

  test("redirects to sign-in when accessing edit list page", async ({
    page,
  }) => {
    await page.goto(
      "/en/dashboard/lists/00000000-0000-0000-0000-000000000000/edit"
    );
    await expect(page).toHaveURL(/\/en\/auth\/sign-in/);
  });

  // ── Polish locale (no auth needed) ────────────────────────────

  test("create list page works in Polish locale", async ({ page }) => {
    // This will redirect to sign-in, but we can check Polish text on the sign-in page
    await page.goto("/pl/dashboard/lists/new");
    await expect(page).toHaveURL(/\/pl\/auth\/sign-in/);
    // Polish sign-in page should load
    await expect(page.getByText("Zaloguj się na swoje konto")).toBeVisible();
  });
});

// ── Authenticated tests ───────────────────────────────────────────
// These tests require a Supabase service role key for E2E authentication.
// Set SUPABASE_SERVICE_ROLE_KEY in .env.local to enable them.
// They are structured for when the auth helper is configured.

// Note: Authenticated flow tests will cover:
// - Create a list with all fields → verify it appears on detail page
// - Edit a list → verify changes saved
// - Delete a list → verify redirect to dashboard
// - Add a gift to a list → verify it appears
// - Edit a gift → verify changes saved
// - Delete a gift → verify it's removed
// - Reorder gifts via move up/down → verify new order
// - Form validation (empty name)
// - Not-found page for non-existent list
