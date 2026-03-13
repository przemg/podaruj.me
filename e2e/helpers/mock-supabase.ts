import { type Page } from "@playwright/test";

/**
 * Mock Supabase auth API calls to prevent hitting real endpoints.
 * This avoids consuming email rate limits during E2E tests.
 *
 * Call this before navigating to pages that trigger auth requests
 * (e.g., sign-in page with ?email= param that auto-submits).
 */
export async function mockSupabaseAuth(page: Page) {
  // Only intercept POST to OTP endpoint (magic link requests)
  // This avoids interfering with GET /user calls used by middleware
  await page.route("**/auth/v1/otp*", (route) => {
    if (route.request().method() === "POST") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    } else {
      route.continue();
    }
  });
}
