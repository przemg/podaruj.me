# Demo Video Section Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a polished, language-aware demo video section to the landing page, inserted between "How it works" and "Features".

**Architecture:** A new `"use client"` component (`DemoVideoSection`) receives `locale` as a prop from the server page. It renders a branded play button overlay (warm gradient + Play icon) over a native HTML5 `<video>`. Clicking the overlay calls `videoRef.current?.play()` programmatically (iOS-safe), hides the overlay via CSS transition, and shows the video with native controls. On error, the overlay reappears.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Tailwind CSS, next-intl, Lucide React, Playwright E2E

---

## Chunk 1: Translations + Failing Tests

### Task 1: Add i18n translations

**Files:**
- Modify: `messages/en.json` (add `landing.demoVideo` key)
- Modify: `messages/pl.json` (add `landing.demoVideo` key)

- [ ] **Step 1: Add English translations**

In `messages/en.json`, after the `"howItWorks"` object (around line 34), insert a new `"demoVideo"` key inside `"landing"`:

```json
"demoVideo": {
  "title": "See it in action",
  "playAriaLabel": "Play demo"
},
```

- [ ] **Step 2: Add Polish translations**

In `messages/pl.json`, after the `"howItWorks"` object, insert the same key inside `"landing"`:

```json
"demoVideo": {
  "title": "Zobacz jak to działa",
  "playAriaLabel": "Odtwórz demo"
},
```

- [ ] **Step 3: Commit translations**

```bash
git add messages/en.json messages/pl.json
git commit -m "feat: add demoVideo i18n translations (EN + PL)"
```

---

### Task 2: Write failing E2E tests

**Files:**
- Create: `e2e/demo-video.spec.ts`

- [ ] **Step 1: Create the test file**

Create `e2e/demo-video.spec.ts` with the following 6 tests:

```typescript
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx playwright test e2e/demo-video.spec.ts --reporter=line
```

Expected: All 6 tests FAIL (component doesn't exist yet — `#demo-video` not found on page).

- [ ] **Step 3: Commit failing tests**

```bash
git add e2e/demo-video.spec.ts
git commit -m "test: add failing E2E tests for demo video section"
```

---

## Chunk 2: Implementation

### Task 3: Implement DemoVideoSection component

**Files:**
- Create: `src/components/landing/demo-video-section.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/landing/demo-video-section.tsx`:

```typescript
"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Play } from "lucide-react";
import { LANDING_MAX_WIDTH } from "@/lib/layout";

const VIDEO_SOURCES: Record<string, string> = {
  en: "/demo/demo-en.mp4",
  pl: "/demo/demo-pl.mp4",
};

export function DemoVideoSection({ locale }: { locale: string }) {
  const t = useTranslations("landing.demoVideo");
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoSrc = VIDEO_SOURCES[locale] ?? VIDEO_SOURCES["en"];

  function handlePlay() {
    setIsPlaying(true);
    void videoRef.current?.play();
  }

  function handleError() {
    setIsPlaying(false);
  }

  return (
    <section id="demo-video" className="bg-white py-20 sm:py-28">
      <div
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: LANDING_MAX_WIDTH }}
      >
        <h2 className="text-center text-3xl font-bold text-landing-text sm:text-4xl">
          {t("title")}
        </h2>

        <div className="relative mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl shadow-xl">
          {/* Native video — always in DOM, src set immediately */}
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            onError={handleError}
            className="aspect-video w-full bg-black"
          />

          {/* Branded overlay — fades out when isPlaying */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ${
              isPlaying ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
            style={{
              background:
                "linear-gradient(135deg, var(--landing-coral) 0%, #FFB88C 50%, var(--landing-peach-wash) 100%)",
            }}
          >
            <button
              onClick={handlePlay}
              aria-label={t("playAriaLabel")}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Play className="ml-1 h-8 w-8 text-landing-coral" fill="currentColor" />
            </button>
            <p className="mt-4 text-sm font-medium tracking-wide text-white/80 uppercase">
              Podaruj.me
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit the component**

```bash
git add src/components/landing/demo-video-section.tsx
git commit -m "feat: add DemoVideoSection component"
```

---

### Task 4: Add DemoVideoSection to landing page

**Files:**
- Modify: `src/app/[locale]/page.tsx`

- [ ] **Step 1: Import and insert the component**

In `src/app/[locale]/page.tsx`:

1. Add the import after the `HowItWorks` import line:
```typescript
import { DemoVideoSection } from "@/components/landing/demo-video-section";
```

2. In the JSX, insert between `<HowItWorks />` and `<Features />`:
```tsx
<HowItWorks />
<DemoVideoSection locale={locale} />
<Features />
```

- [ ] **Step 2: Commit the page update**

```bash
git add src/app/[locale]/page.tsx
git commit -m "feat: insert DemoVideoSection on landing page after HowItWorks"
```

---

## Chunk 3: Verification + Cleanup

### Task 5: Run linter, type check, and E2E tests

- [ ] **Step 1: Run linter and type check first**

```bash
npx next lint && npx tsc --noEmit
```

Expected: No errors. Fix any issues before proceeding.

- [ ] **Step 2: Run the demo video tests**

```bash
npx playwright test e2e/demo-video.spec.ts --reporter=line
```

Expected: All 6 tests PASS.

- [ ] **Step 3: If any test fails, diagnose**

Common issues:
- Section not found → check `id="demo-video"` is on the `<section>` element
- Play button not found → check `aria-label` matches translation exactly ("Play demo" for EN, "Odtwórz demo" for PL)
- `src` attribute assertion fails → ensure `video` element has `src` attribute set (not via `<source>` child)
- Overlay still visible after click → check `pointer-events-none` is applied when `isPlaying` is true

- [ ] **Step 4: Run the full landing test suite to catch regressions**

```bash
npx playwright test e2e/landing.spec.ts --reporter=line
```

Expected: All tests PASS (no regressions from page.tsx change).

---

### Task 6: Update existing landing test

**Files:**
- Modify: `e2e/landing.spec.ts`

- [ ] **Step 1: Add demo video section to the "renders all main sections" test**

In `e2e/landing.spec.ts`, inside the `"renders all main sections"` test, after the `// How it works` block, add:

```typescript
// Demo video
await expect(page.getByRole("heading", { name: "See it in action" })).toBeVisible();
```

- [ ] **Step 2: Run the full E2E suite**

```bash
npx playwright test --reporter=line
```

Expected: All tests PASS.

- [ ] **Step 3: Commit**

```bash
git add e2e/landing.spec.ts
git commit -m "test: include demo video section in landing page E2E test"
```

---

### Task 7: Push and finish

- [ ] **Step 1: Push branch**

```bash
git push origin feature/demo-video-section
```

- [ ] **Step 2: Update PR description** (handled by post-task checklist)
