# Demo Video Section — Design Spec

**Date:** 2026-03-17
**Feature:** Demo Video Section on Landing Page
**Branch:** `feature/demo-video-section`

---

## Overview

Add a demo video section to the landing page, inserted between the "How it works" and "Features" sections. The section displays a polished video player using native HTML5 video with a custom branded overlay, matching the warm Podaruj.me design language.

---

## Architecture

### New Component

**`src/components/landing/demo-video-section.tsx`**

- `"use client"` directive — required because the component manages `isPlaying` state and handles click interactions (in line with CLAUDE.md: "add `'use client'` only when needed")
- Receives `locale: string` as a prop from the Server Component page (consistent with how `hero.tsx` and `cta-section.tsx` receive `userEmail` as a prop — server-derived data flows down as props, no client-side `useLocale()` needed)
- Uses `useTranslations("landing.demoVideo")` for the heading
- Local state: `isPlaying: boolean` (starts `false`)
- Holds a `videoRef: RefObject<HTMLVideoElement>` to call `.play()` programmatically

### Behavior

**Not playing state:**
- Shows a branded overlay covering the 16:9 video area
- Warm gradient background (coral → peach, using `landing-coral` / `landing-peach-wash` Tailwind colors)
- Large centered play button: white circle with Lucide `Play` icon, `drop-shadow`
- Rendered as a `<button>` element with `aria-label` (translated: "Play demo" / "Odtwórz demo")
- Keyboard accessible: focusable, activatable via Enter/Space (native `<button>` behavior)

**On play click:**
1. Set `isPlaying = true` — overlay fades out via CSS transition (`opacity-0 pointer-events-none transition-opacity duration-300`)
2. Call `videoRef.current?.play()` — triggered by user gesture, so works on iOS Safari without `muted`
3. Native `<video controls>` is rendered underneath the overlay at all times (hidden visually until overlay fades); `autoPlay` attribute is NOT used

**On video load error:**
- `onError` handler on `<video>` sets `isPlaying = false`
- Overlay reappears (user sees the branded state again, not a broken black box)

### Section `id`

Section element uses `id="demo-video"` for consistency with other landing sections and reliable Playwright locators.

### Scroll-reveal animation

Explicitly opted out. The video overlay itself is the visual focus — animating the section in would conflict with the interaction of clicking to play. The heading uses standard entrance via browser rendering; no `useScrollReveal` applied.

---

## Video Sources

| Locale | Source |
|--------|--------|
| `en`   | `/demo/demo-en.mp4` |
| `pl`   | `/demo/demo-pl.mp4` |

Fallback: if locale is neither `en` nor `pl`, default to `en` video.

---

## Layout & Styling

| Property | Value |
|----------|-------|
| Section background | White (`bg-white`) |
| Section padding | `py-20 sm:py-28` (matches other sections) |
| Container max-width | `LANDING_MAX_WIDTH` (1440px) from `src/lib/layout.ts` |
| Container padding | `px-4 sm:px-6 lg:px-8` |
| Video wrapper max-width | `max-w-3xl` (~768px), centered via `mx-auto` |
| Video wrapper style | `rounded-2xl`, `shadow-xl`, `overflow-hidden` |
| Mobile | Full width within container padding |
| Desktop | Centered within 1440px container |
| Aspect ratio | 16:9 (`aspect-video`) |
| Overlay transition | `opacity-0 pointer-events-none transition-opacity duration-300` when `isPlaying` |

The `<video>` element is always rendered in the DOM (not conditionally mounted), so the overlay sits on top via absolute positioning. This avoids a re-mount on play.

---

## i18n Changes

**`messages/en.json`** — add under `"landing"`:
```json
"demoVideo": {
  "title": "See it in action",
  "playAriaLabel": "Play demo"
}
```

**`messages/pl.json`** — add under `"landing"`:
```json
"demoVideo": {
  "title": "Zobacz jak to działa",
  "playAriaLabel": "Odtwórz demo"
}
```

---

## Landing Page Integration

**`src/app/[locale]/page.tsx`** (Server Component — no `"use client"` change needed):

```tsx
import { DemoVideoSection } from "@/components/landing/demo-video-section";
// ...
<HowItWorks />
<DemoVideoSection locale={locale} />
<Features />
```

No other changes to the landing page.

---

## Testing

New file: `e2e/demo-video.spec.ts`

Scenarios:
1. **Section renders with heading** — navigate to `/en`, assert `h2` with text "See it in action" is visible
2. **Overlay visible before play** — assert play button overlay is visible, video is not yet playing
3. **Clicking play starts the video** — click the play button, assert overlay is gone (opacity/hidden), video element is present
4. **English locale uses EN video** — navigate to `/en`, click play, assert `video` element's `src` contains `demo-en.mp4`
5. **Polish locale uses PL video** — navigate to `/pl`, click play, assert `video` element's `src` contains `demo-pl.mp4`

Existing `e2e/landing.spec.ts` "renders all main sections" test should be updated to include the demo video section heading.

---

## Constraints

- No autoplay on page load — user must click to start
- No `autoPlay` attribute (use `videoRef.play()` on user gesture for iOS compatibility)
- No third-party dependencies
- No changes to any other section or component on the landing page
- Follow existing code conventions: TypeScript strict, Tailwind only, named exports, Lucide icons
