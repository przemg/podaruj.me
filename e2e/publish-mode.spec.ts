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
const TEST_SLUG_PREFIX = "e2e-publish-test-";

async function seedTestList(
  slug: string,
  privacyMode: string,
  isPublished: boolean
): Promise<{ listId: string; itemId: string }> {
  const supabase = getServiceClient();

  const { data: existing } = await supabase
    .from("lists")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existing) {
    for (let i = 0; i < 10; i++) {
      const { data: existingItem } = await supabase
        .from("items")
        .select("id")
        .eq("list_id", existing.id)
        .limit(1)
        .single();
      if (existingItem) return { listId: existing.id, itemId: existingItem.id };
      await new Promise((r) => setTimeout(r, 500));
    }
    return { listId: existing.id, itemId: "" };
  }

  const { data: list, error: listError } = await supabase
    .from("lists")
    .insert({
      name: "E2E Publish Test List",
      occasion: "birthday",
      privacy_mode: privacyMode,
      user_id: TEST_USER_ID,
      slug,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (listError) {
    if (listError.code === "23505") {
      const { data: raced } = await supabase
        .from("lists")
        .select("id")
        .eq("slug", slug)
        .single();
      if (raced) {
        const { data: racedItem } = await supabase
          .from("items")
          .select("id")
          .eq("list_id", raced.id)
          .limit(1)
          .single();
        return { listId: raced.id, itemId: racedItem?.id ?? "" };
      }
    }
    throw new Error(`Failed to seed list: ${listError.message}`);
  }
  if (!list) throw new Error("Failed to seed list: no data returned");

  const { data: item, error: itemError } = await supabase
    .from("items")
    .insert({
      name: "E2E Publish Test Item",
      list_id: list.id,
      position: 0,
      priority: "nice_to_have",
    })
    .select("id")
    .single();

  if (itemError || !item)
    throw new Error(`Failed to seed item: ${itemError?.message}`);

  return { listId: list.id, itemId: item.id };
}

async function gotoListPage(
  page: import("@playwright/test").Page,
  slug: string
) {
  await page.goto(`/en/lists/${slug}`);
  await page.waitForLoadState("networkidle");

  for (let i = 0; i < 2; i++) {
    const item = page.getByText("E2E Publish Test Item");
    if (await item.isVisible().catch(() => false)) return;
    await page.reload();
    await page.waitForLoadState("networkidle");
  }
}

async function cleanupTestData(slug: string) {
  const supabase = getServiceClient();

  const { data: list } = await supabase
    .from("lists")
    .select("id")
    .eq("slug", slug)
    .single();

  if (list) {
    await supabase.from("reservations").delete().eq("list_id", list.id);
    await supabase.from("items").delete().eq("list_id", list.id);
    await supabase.from("lists").delete().eq("id", list.id);
  }
}

// ── Tests ────────────────────────────────────────────────────────────────────

test.describe("Publish mode for Full Surprise lists", () => {
  // ── Unpublished full_surprise list → 404 for guests ────────────────────────

  test.describe("Unpublished full_surprise list", () => {
    const slug = `${TEST_SLUG_PREFIX}unpublished`;

    test.beforeAll(async () => {
      await cleanupTestData(slug);
      await seedTestList(slug, "full_surprise", false);
    });

    test("returns 404 for guests on unpublished full_surprise list", async ({
      page,
    }) => {
      await page.goto(`/en/lists/${slug}`);
      await page.waitForLoadState("networkidle");

      // Should see the not found page
      await expect(
        page.getByRole("heading", { name: /not found/i })
      ).toBeVisible({ timeout: 10000 });
    });
  });

  // ── Published full_surprise list → accessible to guests ────────────────────

  test.describe("Published full_surprise list", () => {
    const slug = `${TEST_SLUG_PREFIX}published`;

    test.beforeAll(async () => {
      await cleanupTestData(slug);
      await seedTestList(slug, "full_surprise", true);
    });

    test("shows list content for guests on published full_surprise list", async ({
      page,
    }) => {
      await gotoListPage(page, slug);

      await expect(page.getByText("E2E Publish Test Item")).toBeVisible({
        timeout: 10000,
      });
    });
  });

  // ── Non-surprise lists always accessible ───────────────────────────────────

  test.describe("Non-surprise lists always accessible", () => {
    const slug = `${TEST_SLUG_PREFIX}visible`;

    test.beforeAll(async () => {
      await cleanupTestData(slug);
      await seedTestList(slug, "visible", true);
    });

    test("visible list is always accessible to guests", async ({ page }) => {
      await gotoListPage(page, slug);

      await expect(page.getByText("E2E Publish Test Item")).toBeVisible({
        timeout: 10000,
      });
    });
  });

  // ── Dashboard auth redirect still works ────────────────────────────────────

  test.describe("Dashboard auth redirect", () => {
    test("redirects to sign-in when not authenticated", async ({ page }) => {
      await page.goto("/en/dashboard");
      await expect(page).toHaveURL(/\/en\/auth\/sign-in/, { timeout: 10000 });
    });
  });
});
