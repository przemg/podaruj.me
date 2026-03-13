// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";
import { mockSupabaseAuth } from "./helpers/mock-supabase";

test.describe("Auth - Sign in page", () => {
  test("renders sign-in form", async ({ page }) => {
    await page.goto("/en/auth/sign-in");
    await expect(page.getByText("Sign in to your account")).toBeVisible();
    await expect(page.getByPlaceholder("your@email.com")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Send magic link" })
    ).toBeVisible();
    // Logo links back to home
    await expect(page.getByText("Podaruj.me")).toBeVisible();
  });

  test("shows expired link error from callback", async ({ page }) => {
    await page.goto("/en/auth/sign-in?error=expired");
    await expect(
      page.getByText("Your link has expired. Please request a new one.")
    ).toBeVisible();
  });

  test("shows invalid link error from callback", async ({ page }) => {
    await page.goto("/en/auth/sign-in?error=invalid");
    await expect(
      page.getByText("This link is no longer valid.")
    ).toBeVisible();
  });

  test("auto-submits magic link when email param is present", async ({ page }) => {
    // Mock Supabase to prevent hitting real OTP endpoint
    await mockSupabaseAuth(page);
    await page.goto("/en/auth/sign-in?email=test@example.com");
    // Auto-submit fires → success state shows the email
    await expect(page.getByText("test@example.com")).toBeVisible();
    await expect(page.getByText("Check your email!")).toBeVisible();
  });

  test("works in Polish", async ({ page }) => {
    await page.goto("/pl/auth/sign-in");
    await expect(page.getByText("Zaloguj się na swoje konto")).toBeVisible();
    await expect(page.getByPlaceholder("twoj@email.com")).toBeVisible();
  });
});

test.describe("Auth - Protected routes", () => {
  test("dashboard redirects to sign-in when not authenticated", async ({
    page,
  }) => {
    await page.goto("/en/dashboard");
    await expect(page).toHaveURL(/\/en\/auth\/sign-in/);
    // Should include next param for redirect back
    await expect(page).toHaveURL(/next=/);
  });
});

test.describe("Auth - Landing page integration", () => {
  test("Create list button links to sign-in when logged out (desktop)", async ({
    page,
  }) => {
    test.skip(test.info().project.name === "mobile", "Desktop-only test");
    await page.goto("/en");
    const createListLink = page
      .locator("nav")
      .getByText("Create list", { exact: true });
    await createListLink.click();
    await expect(page).toHaveURL(/\/en\/auth\/sign-in/);
  });

  test("Create list button links to sign-in when logged out (mobile)", async ({
    page,
  }) => {
    test.skip(test.info().project.name !== "mobile", "Mobile-only test");
    await page.goto("/en");
    await page.getByLabel("Open menu").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const createListLink = page
      .getByRole("dialog")
      .getByText("Create list", { exact: true });
    await createListLink.click();
    await expect(page).toHaveURL(/\/en\/auth\/sign-in/);
  });

  test("hero email input navigates to sign-in with email", async ({
    page,
  }) => {
    // Mock Supabase to prevent auto-submit from hitting real OTP endpoint
    await mockSupabaseAuth(page);
    await page.goto("/en");
    await page.getByPlaceholder("Enter your email").fill("test@example.com");
    await page.getByRole("button", { name: "Get Started" }).click();
    await expect(page).toHaveURL(/\/en\/auth\/sign-in/);
    await expect(page).toHaveURL(/email=test%40example\.com/);
  });

  test("CTA button links to sign-in when logged out", async ({ page }) => {
    await page.goto("/en");
    const ctaButton = page.getByRole("link", {
      name: "Create your list",
    });
    await ctaButton.scrollIntoViewIfNeeded();
    await expect(ctaButton).toHaveAttribute("href", /\/auth\/sign-in/);
  });
});

// Note: Authenticated flow tests (dashboard content, user menu, sign-out)
// require seeding a Supabase session. These will be added when we have
// test user helpers or Supabase test utilities set up.
