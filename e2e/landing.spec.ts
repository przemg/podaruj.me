import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en");
  });

  test("renders all main sections", async ({ page }) => {
    // Navigation
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.getByText("Podaruj.me").first()).toBeVisible();

    // Hero
    await expect(page.getByText("The perfect gift, every time")).toBeVisible();
    await expect(page.getByPlaceholder("Enter your email")).toBeVisible();
    await expect(page.getByRole("button", { name: "Get Started" })).toBeVisible();

    // How it works
    await expect(page.getByRole("heading", { name: "How it works" })).toBeVisible();
    await expect(page.getByText("Create your list").first()).toBeVisible();
    await expect(page.getByText("Share the link")).toBeVisible();
    await expect(page.getByText("Friends reserve gifts")).toBeVisible();

    // Demo video
    await expect(page.getByRole("heading", { name: "See it in action" })).toBeVisible();

    // Features
    await expect(page.getByText("Everything you need")).toBeVisible();
    await expect(page.locator("#features").getByRole("heading", { name: "Privacy modes" }).first()).toBeVisible();
    await expect(page.locator("#features").getByRole("heading", { name: "QR code sharing" }).first()).toBeVisible();

    // Testimonials
    await expect(page.getByText("Loved by gift givers")).toBeVisible();

    // FAQ
    await expect(page.getByText("Frequently asked questions")).toBeVisible();

    // CTA
    await expect(page.getByText("Ready to create your first gift list?")).toBeVisible();

    // Footer
    await expect(page.getByText("Gift lists made simple")).toBeVisible();
    await expect(page.getByText(/Made with love in Poland/)).toBeVisible();
  });

  test("language switcher navigates to PL", async ({ page }) => {
    // Open locale dropdown via the nav locale button
    const localeButton = page.locator("nav button[aria-haspopup='listbox']");
    await localeButton.click();
    // Click Polski option
    await page.getByRole("link", { name: "Polski" }).click();
    await expect(page).toHaveURL(/\/pl/);
    await expect(page.getByText("Idealny prezent, za każdym razem")).toBeVisible();
  });

  test("FAQ accordion opens and closes", async ({ page }) => {
    const faqSection = page.locator("#faq");
    await faqSection.scrollIntoViewIfNeeded();

    const firstQuestion = page.getByText("Is Podaruj.me free?");
    await firstQuestion.click();
    await expect(page.getByText("Yes, completely free")).toBeVisible();

    await page.getByText("Do my friends need an account?").click();
    await expect(page.getByText("Anyone with the link")).toBeVisible();
  });

  test("trust badges are visible in hero", async ({ page }) => {
    const hero = page.locator("#hero");
    await expect(hero.getByText("Free", { exact: true })).toBeVisible();
    await expect(hero.getByText("Secure")).toBeVisible();
    await expect(hero.getByText("Easy to use")).toBeVisible();
    await expect(hero.getByText("No account needed to browse")).toBeVisible();
  });

  test("mobile menu opens and closes", async ({ page }) => {
    test.skip(test.info().project.name !== "mobile", "Mobile-only test");

    await page.getByLabel("Open menu").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByLabel("Close menu").click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Podaruj\.me/);
  });
});
