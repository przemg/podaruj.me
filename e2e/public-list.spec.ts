import { test, expect } from "@playwright/test";

test.describe("Public List Page", () => {
  // ── Tests that work without auth ──────────────────────────────

  test("shows 404 for non-existent list slug", async ({ page }) => {
    await page.goto("/en/lists/this-slug-does-not-exist-xxxxx");
    await page.waitForLoadState("networkidle");

    // The not-found page should show — wait longer for SSR hydration
    await expect(
      page.getByRole("heading", { name: "List not found" })
    ).toBeVisible({ timeout: 10000 });
  });

  test("404 page has back-to-home link", async ({ page }) => {
    await page.goto("/en/lists/nonexistent-slug-12345");
    await page.waitForLoadState("networkidle");

    // Wait for the not-found page to render
    const backLink = page.getByRole("link", { name: /back to home/i });
    await expect(backLink).toBeVisible({ timeout: 10000 });
    await backLink.click();
    await expect(page).toHaveURL(/\/en\/?$/);
  });

  test("404 page works in Polish locale", async ({ page }) => {
    await page.goto("/pl/lists/nieistniejaca-lista-xxxxx");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: "Lista nie znaleziona" })
    ).toBeVisible({ timeout: 10000 });
  });

  test("public page does NOT redirect to sign-in", async ({ page }) => {
    // Unlike /dashboard routes, /lists routes should NOT require auth
    await page.goto("/en/lists/some-test-slug-12345");
    await page.waitForLoadState("networkidle");

    // Should NOT redirect to sign-in
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
    // Should stay on /lists path
    await expect(page).toHaveURL(/\/en\/lists\//);
  });

  test("public layout renders header with logo", async ({ page }) => {
    // Even on 404, the layout should render
    await page.goto("/en/lists/any-slug-for-layout-test");
    await page.waitForLoadState("networkidle");

    // Check the header link with Podaruj.me text
    await expect(
      page.locator("header").getByText("Podaruj.me")
    ).toBeVisible({ timeout: 10000 });
  });
});

// ── Authenticated tests ───────────────────────────────────────────
// These tests require auth helpers and a real list in the database.
// Set up auth fixtures to enable them.
//
// Planned authenticated tests:
// - Guest can view a public list with name, description, occasion, items
// - Guest sees disabled Reserve buttons on items
// - Guest cannot see edit/delete/reorder controls
// - Owner visiting public link sees owner banner with dashboard link
// - Owner can dismiss the banner
// - Share button on dashboard copies correct public URL to clipboard
// - Public page has correct Open Graph metadata (og:title, og:description)
// - Reserve buttons have "Coming soon" tooltip
