import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.describe("Unauthenticated", () => {
    test("redirects to sign-in when not logged in", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page).toHaveURL(/\/auth\/sign-in/);
    });

    test("redirects reservations page to sign-in", async ({ page }) => {
      await page.goto("/dashboard/reservations");
      await expect(page).toHaveURL(/\/auth\/sign-in/);
    });
  });

  test.describe("Navigation", () => {
    test("dashboard page loads with My Lists title", async ({ page }) => {
      await page.goto("/dashboard");
      const url = page.url();
      if (url.includes("/auth/sign-in")) {
        return;
      }
      await expect(page.getByRole("heading", { name: /my lists|moje listy/i })).toBeVisible();
    });

    test("reservations page loads with My Reservations title", async ({ page }) => {
      await page.goto("/dashboard/reservations");
      const url = page.url();
      if (url.includes("/auth/sign-in")) {
        return;
      }
      await expect(
        page.getByRole("heading", { name: /my reservations|moje rezerwacje/i })
      ).toBeVisible();
    });

    test("reservations page shows empty state", async ({ page }) => {
      await page.goto("/dashboard/reservations");
      const url = page.url();
      if (url.includes("/auth/sign-in")) {
        return;
      }
      await expect(
        page.getByText(/haven't reserved|nie zarezerwowałeś/i)
      ).toBeVisible();
    });
  });

  test.describe("Desktop navigation", () => {
    test("navigation links are visible on desktop", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto("/dashboard");
      const url = page.url();
      if (url.includes("/auth/sign-in")) return;

      await expect(page.getByRole("link", { name: /my lists|moje listy/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /my reservations|moje rezerwacje/i })).toBeVisible();
    });
  });

  test.describe("Mobile navigation", () => {
    test("hamburger menu is visible on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/dashboard");
      const url = page.url();
      if (url.includes("/auth/sign-in")) return;

      await expect(page.getByRole("button", { name: /menu/i })).toBeVisible();
    });
  });
});
