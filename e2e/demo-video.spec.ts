import { test, expect } from "@playwright/test";

test.describe("Demo video section", () => {
  test("renders section heading in English", async ({ page }) => {
    await page.goto("/en");
    const section = page.locator("#demo-video");
    await section.scrollIntoViewIfNeeded();
    await expect(
      section.getByRole("heading", { name: "See it in action" })
    ).toBeVisible();
  });

  test("renders section heading in Polish", async ({ page }) => {
    await page.goto("/pl");
    const section = page.locator("#demo-video");
    await section.scrollIntoViewIfNeeded();
    await expect(
      section.getByRole("heading", { name: "Zobacz jak to działa" })
    ).toBeVisible();
  });

  test("play button overlay is visible before interaction", async ({ page }) => {
    await page.goto("/en");
    const section = page.locator("#demo-video");
    await section.scrollIntoViewIfNeeded();
    const playButton = section.getByRole("button", { name: "Play demo" });
    await expect(playButton).toBeVisible();
  });

  test("clicking play hides the overlay", async ({ page }) => {
    await page.goto("/en");
    const section = page.locator("#demo-video");
    await section.scrollIntoViewIfNeeded();
    const playButton = section.getByRole("button", { name: "Play demo" });
    await playButton.click();
    // Overlay transitions to opacity-0 / pointer-events-none
    await expect(playButton).not.toBeVisible();
  });

  test("English locale uses English video", async ({ page }) => {
    await page.goto("/en");
    const section = page.locator("#demo-video");
    await section.scrollIntoViewIfNeeded();
    await section.getByRole("button", { name: "Play demo" }).click();
    const video = section.locator("video");
    await expect(video).toBeVisible();
    const src = await video.getAttribute("src");
    expect(src).toContain("demo-en.mp4");
  });

  test("Polish locale uses Polish video", async ({ page }) => {
    await page.goto("/pl");
    const section = page.locator("#demo-video");
    await section.scrollIntoViewIfNeeded();
    await section.getByRole("button", { name: "Odtwórz demo" }).click();
    const video = section.locator("video");
    await expect(video).toBeVisible();
    const src = await video.getAttribute("src");
    expect(src).toContain("demo-pl.mp4");
  });
});
