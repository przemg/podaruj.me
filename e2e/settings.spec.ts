// e2e/settings.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Settings - Protected route", () => {
  test("settings redirects to sign-in when not authenticated", async ({
    page,
  }) => {
    await page.goto("/en/dashboard/settings");
    await expect(page).toHaveURL(/\/en\/auth\/sign-in/);
  });

  test("settings redirects to sign-in in Polish locale", async ({ page }) => {
    await page.goto("/pl/dashboard/settings");
    await expect(page).toHaveURL(/\/pl\/auth\/sign-in/);
  });
});

// Note: Tests for authenticated settings page (profile info, display name editing,
// connected accounts, danger zone dialog) require seeding a Supabase session.
// These will be added when we have test user helpers or Supabase test utilities set up.
// The pattern matches the note in auth.spec.ts.
