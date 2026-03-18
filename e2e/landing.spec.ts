import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en");
  });

  test("renders all main sections", async ({ page }) => {
    // Navigation
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.getByText("Podaruj.me").first()).toBeVisible();

    // Hero — new headline
    await expect(page.getByText("Gift lists that")).toBeVisible();
    await expect(page.getByText("everyone loves")).toBeVisible();
    await expect(page.getByPlaceholder("Enter your email")).toBeVisible();
    await expect(page.getByRole("button", { name: "Get Started" })).toBeVisible();

    // Hero badge pill
    await expect(page.getByText("Free forever · No credit card needed")).toBeVisible();

    // Hero social proof
    await expect(page.getByText(/Loved by.*happy users/)).toBeVisible();

    // How it works
    const howItWorks = page.locator("#how-it-works");
    await expect(howItWorks.getByText("HOW IT WORKS", { exact: true })).toBeVisible();
    await expect(page.getByText("Three steps to")).toBeVisible();
    await expect(page.getByText("perfect gifting")).toBeVisible();
    await expect(page.getByText("Create your list").first()).toBeVisible();

    // Demo video (unchanged)
    await expect(page.getByRole("heading", { name: "See it in action" })).toBeVisible();

    // Features (unchanged)
    await expect(page.getByText("Everything you need")).toBeVisible();

    // Testimonials — new layout
    const testimonialsSection = page.locator("#testimonials");
    await expect(testimonialsSection.getByText("TESTIMONIALS", { exact: true })).toBeVisible();
    await expect(page.getByText("People actually love it")).toBeVisible();
    await expect(page.getByText("Karolina W.")).toBeVisible();
    await expect(testimonialsSection.getByText("Marcin T.", { exact: true })).toBeVisible();

    // FAQ (unchanged)
    await expect(page.getByText("Frequently asked questions")).toBeVisible();

    // CTA — new headline
    const ctaSection = page.locator("#cta");
    await expect(ctaSection.getByText("Start your first list")).toBeVisible();
    await expect(ctaSection.getByText("in 2 minutes", { exact: true })).toBeVisible();
    await expect(page.getByText("Guests don't need an account")).toBeVisible();

    // Footer (unchanged)
    await expect(page.getByText("Gift lists made simple")).toBeVisible();
  });

  test("language switcher navigates to PL", async ({ page }) => {
    // Open locale dropdown via the nav locale button
    const localeButton = page.locator("nav button[aria-haspopup='listbox']");
    await localeButton.click();
    // Click Polski option
    await page.getByRole("link", { name: "Polski" }).click();
    await expect(page).toHaveURL(/\/pl/);
    await expect(page.getByText("Listy prezentów,")).toBeVisible();
    await expect(page.getByText("które wszyscy kochają")).toBeVisible();
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
    await expect(hero.getByText("Free forever").first()).toBeVisible();
    await expect(hero.getByText("No account for guests")).toBeVisible();
    await expect(hero.getByText("Works on mobile")).toBeVisible();
  });

  test("hero product mockup is visible", async ({ page }) => {
    const hero = page.locator("#hero");
    await expect(hero.getByText("Birthday Wishlist")).toBeVisible();
    await expect(hero.getByText(/Karolina.*30/)).toBeVisible();
    await expect(hero.getByText(/Anna just reserved/)).toBeVisible();
    await expect(hero.getByText("Wireless Headphones")).toBeVisible();
  });

  test("testimonials render as grid with star ratings", async ({ page }) => {
    const testimonials = page.locator("#testimonials");
    await testimonials.scrollIntoViewIfNeeded();
    await expect(testimonials.getByText("People actually love it")).toBeVisible();
    await expect(testimonials.getByText("Karolina W.")).toBeVisible();
    await expect(testimonials.getByText("Marcin T.")).toBeVisible();
    await expect(testimonials.getByText("Aleksandra B.")).toBeVisible();
    await expect(testimonials.getByText("Piotr K.")).toBeVisible();
    const stars = testimonials.locator('[aria-label="5 out of 5 stars"]');
    await expect(stars).toHaveCount(4);
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
