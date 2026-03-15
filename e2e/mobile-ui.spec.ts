import { test, expect } from "@playwright/test";

test.describe("Mobile UI", () => {
  test.describe("Landing page mobile menu", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/en");
    });

    test("mobile menu opens and shows navigation sections", async ({
      page,
    }) => {
      test.skip(test.info().project.name !== "mobile", "Mobile-only test");

      await page.getByLabel("Open menu").click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();

      // Should show navigation sections
      await expect(dialog.getByText("How it works")).toBeVisible();
      await expect(dialog.getByText("Features")).toBeVisible();
      await expect(dialog.getByText("Testimonials")).toBeVisible();
      await expect(dialog.getByText("FAQ")).toBeVisible();
    });

    test("mobile menu closes with X button", async ({ page }) => {
      test.skip(test.info().project.name !== "mobile", "Mobile-only test");

      await page.getByLabel("Open menu").click();
      await expect(page.getByRole("dialog")).toBeVisible();

      await page.getByLabel("Close menu").click();
      await expect(page.getByRole("dialog")).not.toBeVisible();
    });
  });

  test.describe("Landing page header on mobile", () => {
    test("shows logo on left and hamburger on right", async ({ page }) => {
      test.skip(test.info().project.name !== "mobile", "Mobile-only test");

      await page.goto("/en");
      const nav = page.locator("nav");
      await expect(nav.getByText("Podaruj.me").first()).toBeVisible();
      await expect(nav.getByLabel("Open menu")).toBeVisible();
    });
  });

  test.describe("Public list page mobile", () => {
    test("public 404 page renders correctly on mobile", async ({ page }) => {
      test.skip(test.info().project.name !== "mobile", "Mobile-only test");

      await page.goto("/en/lists/nonexistent-slug-test");
      await page.waitForLoadState("networkidle");

      await expect(
        page.getByRole("heading", { name: "List not found" })
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Sign-in page mobile", () => {
    test("sign-in page renders correctly on mobile", async ({ page }) => {
      test.skip(test.info().project.name !== "mobile", "Mobile-only test");

      await page.goto("/en/auth/sign-in");

      await expect(
        page.getByRole("heading", { name: "Sign in to your account" })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Sign in with Google" })
      ).toBeVisible();
      await expect(page.getByPlaceholder("your@email.com")).toBeVisible();
    });
  });
});

// ── Authenticated mobile tests ───────────────────────────────────
// These require auth helpers to be set up.
//
// Planned tests:
// - Dashboard mobile menu opens as full-screen overlay (not Sheet sidebar)
// - Dashboard mobile menu shows all items: My Lists, My Reservations, Create new list, Settings, Sign out
// - User menu dropdown shows "My Lists" link
// - User menu dropdown appears above page content (z-index test)
// - Gift cards don't overflow on 320px viewport
// - Privacy mode shows explanation text on mobile (not tooltip)
// - Full Surprise privacy mode is locked on edit page
// - Drag handle is visible on gift cards
// - Sort dropdown appears near Gifts heading
// - Changing sort option reorders items
// - When non-custom sort is active, drag handles are disabled
