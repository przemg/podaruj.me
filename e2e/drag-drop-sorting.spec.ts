import { test, expect } from "@playwright/test";

test.describe("Drag & Drop and Sorting", () => {
  // These features are on the authenticated list detail page.
  // Unauthenticated tests verify the page redirects properly.

  test("list detail page redirects to sign-in when not logged in", async ({
    page,
  }) => {
    await page.goto("/en/dashboard/lists/test-list-slug");
    await expect(page).toHaveURL(/\/en\/auth\/sign-in/);
  });

  test("create list page redirects to sign-in", async ({ page }) => {
    await page.goto("/en/dashboard/lists/new");
    await expect(page).toHaveURL(/\/en\/auth\/sign-in/);
  });
});

// ── Authenticated tests ───────────────────────────────────────────
// These require auth helpers and a seeded list with items.
//
// Planned authenticated tests:
//
// Drag & Drop:
// - Drag handle (GripVertical icon) is visible on each gift card
// - Move up/down buttons have min 44px tap target on mobile
// - Dragging a card reorders items (verify DOM order change)
// - Move up button is hidden on first item
// - Move down button is hidden on last item
// - After reorder, page refresh preserves new order
//
// Sorting:
// - Sort dropdown appears when list has 2+ items
// - Sort dropdown is hidden when list has 0-1 items
// - Selecting "Priority" sorts must_have first
// - Selecting "Price: low to high" sorts by ascending price
// - Selecting "Price: high to low" sorts by descending price
// - Selecting "Name: A-Z" sorts alphabetically
// - Selecting "Newest first" sorts by creation date descending
// - Selecting "Available first" shows unreserved items first
// - When non-custom sort is selected, drag handles are visually disabled
// - When non-custom sort is selected, move up/down buttons are disabled
// - Switching back to "Custom order" re-enables drag handles
//
// Full Surprise lock:
// - Creating a list with Full Surprise shows confirmation dialog
// - Editing a Full Surprise list shows locked privacy selector with warning message
// - Editing a Buyer's Choice list allows changing to Visible
// - Editing a Visible list allows changing to Buyer's Choice
