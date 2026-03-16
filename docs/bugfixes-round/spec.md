# Bugfixes Round — Design Spec

**Date:** 2026-03-16
**Branch:** fix/bugfixes-round
**Scope:** 9 bug fixes, no new features

---

## Fix 1: Closed List Still Allows Adding Items and Editing

**Problem:** When a list is closed (manually or by event date passing), the owner can still add gifts, edit items, and navigate to the edit page. Nothing blocks mutations on closed lists.

**Current state:**
- `ListHeader` computes `isClosed` but doesn't disable the Edit button
- `GiftList` has no awareness of closed state — shows "Add gift" button and edit/delete actions
- Server actions (`createItem`, `updateItem`, `deleteItem`) don't check if the list is closed

**Solution:**
- Pass `isClosed` prop from the detail page to `GiftList`
- When `isClosed=true`:
  - Hide the "Add gift" button and sort dropdown
  - Show a banner: "This list is closed. Reopen it to make changes."
  - Disable all item edit/delete/drag actions
  - Hide the empty state CTA
- In `ListHeader`: hide the Edit button when closed
- In the edit page (`/dashboard/lists/[slug]/edit`): if list is closed, redirect back to the detail page (guard against direct URL navigation)
- Server-side guards on ALL mutations for closed lists:
  - `createItem`, `updateItem`, `deleteItem`, `reorderItems` — reject with error
  - `updateList` — reject with error (list metadata can't be edited while closed)
- Add translations for the closed banner message in both EN and PL

---

## Fix 2: Reopen Button Missing After Event Date

**Problem:** When the event date has passed and the list auto-closed, there's no way to reopen it. The current logic: `canReopen = list.is_closed && (!list.event_date || eventDateHasntPassed)` — which hides the button when event date has passed.

**Current state:**
- `list-header.tsx` line 95-98: `canReopen` is false when event date has passed
- `reopenList` server action validates event date hasn't passed

**Solution:**
- Change `canReopen` to: `list.is_closed` (always show reopen for closed lists)
- Remove the event date check from `reopenList` server action
- When event date has passed and list is reopened, show a note: "The event date has passed, but you can still manage this list."
- Add translations for this note in EN and PL

---

## Fix 3: Mobile Layout — List Detail Card Too Cramped

**Problem:** On mobile (320px-375px), the list detail header card has badges, privacy info, share button, and action buttons all squeezed together. The share button gets truncated.

**Current state:**
- Badges use `flex-wrap` with `gap-2` — mostly OK but could use more spacing
- Action buttons are in a single flex row with `gap-1` — too tight on mobile
- Share button label can be truncated on narrow screens

**Solution:**
- Badges section: increase gap to `gap-2.5`, add `mb-2` between badge rows for breathing room
- Action buttons: on mobile (< sm), switch to a 2×2 grid layout instead of a single row
  - Row 1: Share + Edit (or Publish for drafts)
  - Row 2: Close/Reopen + Delete
  - Each button gets full width within its grid cell
- Share button: ensure `whitespace-nowrap` so the label never truncates; on mobile make it full-width
- Keep card padding at `p-6` and improve internal spacing between elements for better breathing room
- Test at 320px and 375px widths

---

## Fix 4: Confetti Shows Every Time

**Problem:** Confetti currently uses `localStorage` to track whether it's been shown. This means it plays again on other devices and after clearing browser data.

**Current state:**
- `summary-card.tsx`: uses `localStorage.getItem(`confetti-shown-${listId}`)` with `closedAt` as value
- No database column exists for tracking confetti

**Solution:**
- Add `confetti_shown` boolean column (default `false`) to `lists` table via new migration
- New server action: `markConfettiShown(locale, slug)` — sets `confetti_shown=true`
- In `reopenList` action: reset `confetti_shown=false` (so next close triggers confetti again)
- Update `SummaryCard`:
  - Accept `confettiShown` boolean prop
  - Note: the manually-typed `ListData` types in components need `confetti_shown` added
  - If `confettiShown=true`: skip confetti, show summary only
  - If `confettiShown=false`: play confetti, then call `markConfettiShown` server action
  - Remove all `localStorage` logic
- Pass `confetti_shown` from the detail page to `SummaryCard`

---

## Fix 5: Landing Page Animations Too Slow and Laggy

**Problem:** The features section (dark background) and everything below appears too late when scrolling. Even scrolling fast past and back up shows a delay. Content should be visible by the time the user reaches it.

**Current state:**
- `use-scroll-reveal.ts`: IntersectionObserver with `threshold: 0.15` (triggers when 15% visible)
- No `rootMargin` configured (triggers only when element enters viewport)
- Each section independently uses `useScrollReveal` with various stagger delays

**Solution:**
- Add `rootMargin: "0px 0px 200px 0px"` to the IntersectionObserver — this triggers the animation 200px before the element enters the viewport
- Lower default threshold from `0.15` to `0.05` (trigger earlier)
- Reduce animation duration from `0.6s` to `0.45s` for all scroll-reveal keyframes
- Reduce stagger delays per section:
  - `hero.tsx`: 150ms → 80ms
  - `how-it-works.tsx`: 200ms → 80ms
  - `features.tsx`: 120ms → 60ms
  - `testimonials.tsx`: 120ms → 80ms
  - `faq.tsx`: 100ms → 60ms
  - `cta-section.tsx`: default (100ms) → 60ms
- This keeps the CSS animation approach (no JS library change needed) but makes everything appear much sooner

---

## Fix 6: Surname and Name Declension Bug

**Problem:** Polish translations decline the creator's name grammatically. "Stworzone przez Przemysława Gwóźdź" / "Przemysława Gwóździa" — both first name and surname are incorrectly declined.

**Current state (pl.json) — 3 locations:**
- `landing.footer.builtBy`: "Stworzone przez Przemysława Gwóźdź"
- `dashboard.builtBy`: "Stworzone przez Przemysława Gwóździa"
- `public.builtBy`: "Stworzone przez Przemysława Gwóździa"

**Solution:**
- Change all 3 PL `builtBy` translations to: "Autor: Przemysław Gwóźdź"
- This avoids declension entirely by using a label format
- EN translations (also 3 locations: `landing.footer.builtBy`, `dashboard.builtBy`, `public.builtBy`) already use "Built by Przemysław Gwóźdź" — no change needed

---

## Fix 7: Footer — GitHub and LinkedIn Links Hard to Tap on Mobile

**Problem:** GitHub and LinkedIn icons in the footer are tiny (3.5×3.5) and icon-only on mobile (`sr-only` text). Hard to tap on touch devices.

**Current state:**
- `author-credit.tsx`: icons are `h-3.5 w-3.5`, link text is `sr-only` on mobile, visible on `sm+`
- Dark footer background with `text-landing-footer-text/40` — low contrast

**Solution:**
- On mobile (< sm): show full text labels ("GitHub", "LinkedIn") always, not `sr-only`
- Stack links vertically on mobile with larger tap targets (min-height 44px per WCAG)
- Increase icon size to `h-4 w-4`
- Keep horizontal layout on `sm+` as current
- Ensure the text color has sufficient contrast against the dark footer (`text-landing-footer-text/60` minimum)

---

## Fix 8: Content Width Inconsistency

**Problem:** Pages use different max-widths inconsistently. Some use inline styles, some use Tailwind classes, values vary.

**Current state:**
- Landing sections: `max-w-7xl` (1280px) — should be 1440px per requirements
- Dashboard header/footer: inline `maxWidth: "1280px"` — should be 1440px
- Dashboard content: inline `maxWidth: "1024px"` on detail page — correct
- Forms: `max-w-2xl` (672px) — should be 800px
- FAQ/CTA: `max-w-3xl` (768px) — these are landing sub-sections, should use landing max-width for outer container

**Solution:**
- Create `src/lib/layout.ts` with named width constants:
  ```
  LANDING_MAX_WIDTH = "1440px"   (90rem)
  APP_HEADER_MAX_WIDTH = "1440px" (90rem)
  DASHBOARD_MAX_WIDTH = "1024px"  (64rem)
  FORM_MAX_WIDTH = "800px"        (50rem)
  ```
- Create reusable Tailwind-friendly wrapper approach:
  - Add custom Tailwind utilities in globals.css or tailwind config: `max-w-landing`, `max-w-dashboard`, `max-w-form`
  - Or use the constants with inline `style={{ maxWidth }}` consistently
- Apply across all pages:
  - Landing: all sections use `max-w-landing` (1440px) for outer container
  - Dashboard layout header/footer: `max-w-landing` (1440px)
  - Dashboard content pages (`/dashboard`, `/dashboard/reservations`, list detail): `max-w-dashboard` (1024px) — note: My Lists and My Reservations pages currently use 1280px, this narrows them to 1024px as specified in the prompt
  - Create list / edit list / settings: `max-w-form` (800px) — currently 672px (max-w-2xl) for forms and 768px for settings, this widens them to 800px
  - Public list layout header/footer: `max-w-landing` (1440px) — consistent with app header
  - FAQ/CTA inner content can keep their own narrower max-widths (`max-w-3xl`) for readability within the 1440px outer container

---

## Fix 9: Mobile Sticky Header — Browser Toolbar Color

**Problem:** The browser's address bar / toolbar area doesn't use the app's brand color. Currently `themeColor: '#FFFBF7'` (cream) is set but may not be distinctive enough, or the user wants it to match the brand coral.

**Current state:**
- `layout.tsx` exports `viewport` with `themeColor: '#FFFBF7'` (cream/off-white)
- The `safe-area-top` class is used on the navigation for notch handling

**Solution:**
- Update `themeColor` in the viewport export to use the landing coral brand color: `#F97066`
- This colors the browser's toolbar/address bar with the brand color on supported mobile browsers
- The landing navigation already uses `safe-area-top` class and `viewportFit: 'cover'` is set — no change needed there
- **Dashboard header gap:** The dashboard layout header (`src/app/[locale]/dashboard/layout.tsx`) does NOT have `safe-area-top` — add it so the header content isn't hidden under the browser toolbar on notched devices
- **Public list layout header:** Check and add `safe-area-top` if missing

---

## Files to Modify

| File | Fixes |
|------|-------|
| `src/components/lists/list-header.tsx` | 1, 2, 3 |
| `src/components/lists/gift-list.tsx` | 1 |
| `src/components/lists/summary-card.tsx` | 4 |
| `src/app/[locale]/dashboard/lists/[id]/page.tsx` | 1, 4 |
| `src/app/[locale]/dashboard/lists/[id]/edit/page.tsx` | 1 (redirect guard), 8 (width) |
| `src/app/[locale]/dashboard/lists/actions.ts` | 1, 2, 4 |
| `src/app/[locale]/dashboard/page.tsx` | 8 (width 1280→1024) |
| `src/app/[locale]/dashboard/reservations/page.tsx` | 8 (width 1280→1024) |
| `src/app/[locale]/dashboard/settings/page.tsx` | 8 (width 768→800) |
| `src/app/[locale]/dashboard/lists/new/page.tsx` | 8 (width 672→800) |
| `src/lib/use-scroll-reveal.ts` | 5 |
| `src/app/globals.css` | 5, 8 |
| `messages/pl.json` | 1, 2, 6 |
| `messages/en.json` | 1, 2 |
| `src/components/author-credit.tsx` | 7 |
| `src/lib/layout.ts` | 8 (new file — width constants) |
| `src/app/[locale]/layout.tsx` | 9 |
| `src/app/[locale]/dashboard/layout.tsx` | 8, 9 |
| `src/app/[locale]/lists/layout.tsx` | 8 (width), 9 (safe-area) |
| `src/components/landing/navigation.tsx` | 8 (width) |
| `src/components/landing/hero.tsx` | 5 (stagger), 8 (width) |
| `src/components/landing/how-it-works.tsx` | 5 (stagger), 8 (width) |
| `src/components/landing/features.tsx` | 5 (stagger), 8 (width) |
| `src/components/landing/testimonials.tsx` | 5 (stagger), 8 (width) |
| `src/components/landing/faq.tsx` | 5 (stagger), 8 (width) |
| `src/components/landing/cta-section.tsx` | 5 (stagger), 8 (width) |
| `src/components/landing/footer.tsx` | 8 (width) |
| `supabase/migrations/YYYYMMDD_add_confetti_shown.sql` | 4 (new file) |

## Non-Goals

- No new features
- No design system overhaul
- No changes to reservation logic
- No changes to authentication
