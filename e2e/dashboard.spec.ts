import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.describe("Unauthenticated", () => {
    test("redirects dashboard to sign-in when not logged in", async ({
      page,
    }) => {
      await page.goto("/en/dashboard");
      await expect(page).toHaveURL(/\/en\/auth\/sign-in/);
      await expect(page).toHaveURL(/next=/);
    });

    test("redirects reservations page to sign-in", async ({ page }) => {
      await page.goto("/en/dashboard/reservations");
      await expect(page).toHaveURL(/\/en\/auth\/sign-in/);
    });
  });

  test.describe("Polish locale", () => {
    test("dashboard redirects to Polish sign-in page", async ({ page }) => {
      await page.goto("/pl/dashboard");
      await expect(page).toHaveURL(/\/pl\/auth\/sign-in/);
      await expect(page.getByText("Zaloguj się na swoje konto")).toBeVisible();
    });
  });
});

// Note: Authenticated flow tests (dashboard content, navigation, empty states,
// list cards, mobile menu) require seeding a Supabase session. These will be
// added when we have test user helpers or Supabase test utilities set up.
