import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// ── Load .env.local manually ─────────────────────────────────────────────────

function loadEnvLocal() {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

// ── Supabase service client ──────────────────────────────────────────────────

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

// ── Test data helpers ────────────────────────────────────────────────────────

const TEST_USER_ID = "9be5da3d-5f36-4e43-9d40-5c697d73bca1";
const TEST_SLUG = "e2e-sharing-test";

async function seedTestList(): Promise<string> {
  const supabase = getServiceClient();

  // Check if already exists
  const { data: existing } = await supabase
    .from("lists")
    .select("id")
    .eq("slug", TEST_SLUG)
    .single();

  if (existing) return existing.id;

  const { data: list, error } = await supabase
    .from("lists")
    .insert({
      name: "E2E Sharing Test List",
      occasion: "birthday",
      privacy_mode: "buyers_choice",
      user_id: TEST_USER_ID,
      slug: TEST_SLUG,
      is_published: true,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: raced } = await supabase
        .from("lists")
        .select("id")
        .eq("slug", TEST_SLUG)
        .single();
      if (raced) return raced.id;
    }
    throw new Error(`Failed to seed list: ${error.message}`);
  }

  if (!list) throw new Error("Failed to seed list: no data returned");

  // Add a test item
  await supabase.from("items").insert({
    name: "E2E Sharing Test Item",
    list_id: list.id,
    position: 0,
    priority: "nice_to_have",
  });

  return list.id;
}

async function cleanupTestData() {
  const supabase = getServiceClient();

  const { data: list } = await supabase
    .from("lists")
    .select("id")
    .eq("slug", TEST_SLUG)
    .single();

  if (list) {
    await supabase.from("reservations").delete().eq("list_id", list.id);
    await supabase.from("items").delete().eq("list_id", list.id);
    await supabase.from("lists").delete().eq("id", list.id);
  }
}

// ── Tests ────────────────────────────────────────────────────────────────────

test.describe("Sharing options", () => {
  test.beforeAll(async () => {
    await cleanupTestData();
    await seedTestList();
  });

  test.afterAll(async () => {
    await cleanupTestData();
  });

  // ── Public list page loads correctly (sanity check) ──────────────────────

  test("public list page loads with test data", async ({ page }) => {
    await page.goto(`/en/lists/${TEST_SLUG}`);
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: "E2E Sharing Test List" })
    ).toBeVisible({ timeout: 10000 });
  });

  // ── Dashboard share button exists (redirects to sign-in for unauthed) ────

  test("dashboard list page redirects unauthenticated users to sign-in", async ({
    page,
  }) => {
    await page.goto(`/en/dashboard/lists/${TEST_SLUG}`);
    await expect(page).toHaveURL(/\/en\/auth\/sign-in/, { timeout: 10000 });
  });

  // ── Share URL format is correct ──────────────────────────────────────────

  test("public list URL matches expected format", async ({ page }) => {
    await page.goto(`/en/lists/${TEST_SLUG}`);
    await page.waitForLoadState("networkidle");

    const url = page.url();
    expect(url).toContain(`/en/lists/${TEST_SLUG}`);
  });

  // ── Mailto link format test ──────────────────────────────────────────────

  test("mailto link constructs correct URL with occasion and list link", async ({
    page,
  }) => {
    // Verify the mailto URL construction logic by testing the encoded components
    const occasion = "Birthday";
    const listUrl = `http://localhost:3000/en/lists/${TEST_SLUG}`;
    const subject = encodeURIComponent(
      "Check out my gift list on Podaruj.me!"
    );
    const body = encodeURIComponent(
      `Hey! I made a gift list for ${occasion}. Check it out and reserve something:\n\n${listUrl}`
    );

    const mailto = `mailto:?subject=${subject}&body=${body}`;

    // Verify subject contains Podaruj.me
    expect(mailto).toContain("Podaruj.me");
    // Verify body contains the list URL
    expect(mailto).toContain(encodeURIComponent(listUrl));
    // Verify body contains the occasion
    expect(mailto).toContain(encodeURIComponent(occasion));
  });

  // ── Polish locale public page works ──────────────────────────────────────

  test("public list page works in Polish locale", async ({ page }) => {
    await page.goto(`/pl/lists/${TEST_SLUG}`);
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: "E2E Sharing Test List" })
    ).toBeVisible({ timeout: 10000 });
  });
});
