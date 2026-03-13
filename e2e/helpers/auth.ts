import { type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TEST_EMAIL = "e2e-test@podaruj.me";
const TEST_PASSWORD = "e2e-test-password-only";

/**
 * Check if the auth helper can be used.
 * Requires SUPABASE_SERVICE_ROLE_KEY to be set.
 */
export function canAuthenticate(): boolean {
  return !!(supabaseUrl && supabaseServiceKey);
}

/**
 * Sign in a test user for E2E tests.
 * Creates the user if it doesn't exist, then signs in via password.
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 */
export async function signInTestUser(page: Page) {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for authenticated E2E tests"
    );
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Create test user if it doesn't exist
  const { data: existingUsers } = await adminClient.auth.admin.listUsers();
  const testUser = existingUsers?.users?.find((u) => u.email === TEST_EMAIL);

  if (!testUser) {
    await adminClient.auth.admin.createUser({
      email: TEST_EMAIL,
      email_confirm: true,
      password: TEST_PASSWORD,
    });
  }

  // Sign in via the sign-in page using a direct session approach
  // Navigate to a page first to set up cookies
  await page.goto("/en/auth/sign-in");

  // Use Supabase client in the browser to sign in
  await page.evaluate(
    async ({ url, email, password }) => {
      const { createClient } = await import("@supabase/supabase-js");
      const anonKey = document
        .querySelector('meta[name="supabase-anon-key"]')
        ?.getAttribute("content");

      // Use the env var directly since it's public
      const supabase = createClient(
        url,
        // The anon key is embedded in the page's JS bundle
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || anonKey || "",
        { auth: { persistSession: true } }
      );
      await supabase.auth.signInWithPassword({ email, password });
    },
    { url: supabaseUrl, email: TEST_EMAIL, password: TEST_PASSWORD }
  );

  // Wait for the session to be established
  await page.goto("/en/dashboard");
  await page.waitForURL(/\/en\/dashboard/);
}
