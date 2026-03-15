# Countdown & List Lifecycle — Design Spec

**Date:** 2026-03-15
**Status:** Approved

## Overview

Two connected features plus two UX fixes for the Podaruj.me gift list platform:

1. **Animated Event Countdown** — real-time ticking countdown on list pages and dashboard cards
2. **List Closing & Archive** — automatic and manual list closing with reservation blocking
3. **Celebratory Summary** — stats and reservation reveal when a list closes
4. **Slug History** — old shareable links redirect to current URL after edits
5. **Delete Confirmation Redesign** — suggest closing instead of deleting

---

## 1. Animated Event Countdown

### List Detail Page (Owner & Guest View)

- Real-time animated countdown showing **days, hours, minutes, seconds** ticking down every second
- Warm, festive design matching Podaruj.me aesthetic — soft colors, rounded card, gentle flip or pulse animations on digit changes
- Placed prominently on the list detail page (both `/dashboard/lists/[slug]` and `/lists/[slug]`)
- **Event day:** "Today is the day!" celebration message with festive styling
- **Event passed:** "This event has passed" with subtle faded/muted style
- **No event date:** Countdown not shown at all
- Client component with `useEffect` + `setInterval` for real-time ticking

### Dashboard List Cards

- Small countdown badge on each card showing days remaining (e.g., "5 days left")
- "Today!" badge on event day
- "Event passed" badge when date is in the past
- Static (computed on render), not real-time ticking — cards don't need second-by-second updates

### Countdown Utility

- Extend existing `src/lib/countdown.ts` to return hours, minutes, seconds in addition to days
- New return type with full breakdown for the animated component
- Keep existing simple return type for dashboard cards (backward compatible)

### Timezone Handling

- `event_date` represents a full calendar day. The list remains open for the **entire event day** and auto-closes at the **end of that day** (23:59:59 in the user's local timezone for display, UTC for server-side checks).
- On the event day itself, the countdown shows "Today is the day!" — the list is still active and accepts reservations.
- The day **after** the event date, the list is considered auto-closed.
- Server-side closed check: `event_date < CURRENT_DATE` (UTC). This means the list closes when the UTC date rolls past the event date.

---

## 2. List Closing & Archive

### Closed State Logic

A list is "effectively closed" when either:
- `is_closed = true` (manually closed by owner), OR
- `event_date` is set and `event_date < today` (auto-closed, the day after the event)

### Database Changes

- Add `is_closed` (boolean, default `false`) to `lists` table
- Add `closed_at` (timestamptz, nullable) to `lists` table
- Add `surprise_revealed` (boolean, default `false`) to `lists` table — used for Full Surprise summary reveal

### Owner Actions

- **Close list:** New button on list detail page. Sets `is_closed = true` and `closed_at = now()`. Available on any active, published list. Draft (unpublished Full Surprise) lists cannot be closed — they were never open.
- **Reopen list:** Available on manually closed lists where event date is still in the future (or no event date). Sets `is_closed = false` and `closed_at = null`.
- **Cannot reopen** if event date is in the past — the list stays closed because the event has passed.
- New server actions `closeList(locale, slug)` and `reopenList(locale, slug)` in `actions.ts`, following existing `publishList` pattern. Both revalidate dashboard and public paths.

### Interaction with Publish Mode

- Close is only available on **published** lists (or non-Full-Surprise lists, which are always published). Draft lists cannot be closed.
- Publishing a Full Surprise list whose event date has already passed is blocked — show an error message. The list must be published before its event date.

### Reservation Blocking

- All reservation server actions check closed state before allowing reservation
- If list is closed: return error, no reservation created
- Existing reservations are preserved — never deleted on close
- Cancel reservation still works for logged-in users on their own reservations (even on closed lists)

### Guest View (Public Page)

- Closed lists show a friendly banner: "This event has passed" (if event date passed) or "This list is closed" (if manually closed)
- Reserve buttons are disabled/hidden
- List content (items) remains visible as an archive
- Guest reserve dialog does not open on closed lists

### Dashboard Appearance

- Closed lists appear visually muted — reduced opacity or greyed-out card styling
- "Closed" badge displayed on the card
- Closed lists stay in the same grid alongside active lists (no separate section)
- Sort order unchanged — closed lists remain where they are chronologically

---

## 3. Celebratory Summary

### Summary Card (Owner View Only)

Shown at the top of a closed list's detail page for the owner. This provides **aggregate stats** (not currently shown anywhere) plus a celebratory presentation of reservation data:

- **Stats:** "7 out of 10 gifts were reserved!" — aggregate count not shown in normal view
- **Reservation details:** List of reserved items with reserver names — consolidated view (vs. scattered badges on individual items)
- **Celebratory design:** Confetti animation on first view, warm colors, gift icons, festive feel
- **Always accessible:** Owner can revisit the closed list anytime to see the summary
- The summary card supplements the existing item list below it — items still show their individual reservation badges

### Privacy Mode Behavior

- **Buyer's Choice:** Summary shows immediately when the list closes. Names shown for reservers who opted to reveal; "Anonymous" for those who didn't.
- **Visible:** Summary shows immediately with all names visible.
- **Full Surprise:** Owner first sees a confirmation dialog:
  - "Your list had Full Surprise mode. Do you want to reveal who reserved your gifts?"
  - **"Reveal"** button → sets `surprise_revealed = true` on the list, shows full summary with names
  - **"Not yet"** button → dismisses dialog, summary stays hidden until owner chooses to reveal
  - The `surprise_revealed` flag is persisted in the database so the owner isn't asked again on subsequent visits
  - A "Reveal reservations" button remains visible on the page for owners who chose "Not yet", so they can reveal later

### Data Access

- Summary data fetched via the same reservation query patterns already in use
- For Full Surprise lists: data is only fetched/shown after `surprise_revealed = true`
- Guest/public view never shows the summary — it's owner-only

---

## 4. Slug History (Old Links Keep Working)

### Problem

When a list name is edited, a new slug is generated and the old URL stops working. Shared links break.

### Solution

- **New table `list_slug_history`:** Stores old slugs mapped to list IDs
- **On slug change:** Before updating the list with a new slug, save the old slug to history
- **On public page 404:** If no list found for the requested slug, check `list_slug_history`. If found, redirect to the current slug URL.
- **Cascading delete:** When a list is deleted, all its slug history entries are deleted too (FK cascade)

### Table Structure

- `id` (uuid, PK)
- `list_id` (uuid, FK → lists, on delete cascade)
- `slug` (varchar(150), unique)
- `created_at` (timestamptz)

- Slug uniqueness enforced across both `lists.slug` and `list_slug_history.slug` (via unique constraint on history table + existing unique constraint on lists table, plus a check before insert to prevent collisions)
- No RLS policies needed — accessed only via service client on public routes, and via auth client (owner) during `updateList`

### Redirect Behavior

- **302 (temporary redirect)** — safer than 301 since slugs can change multiple times and lists can be deleted. Avoids stale browser caches pointing to deleted resources.
- Preserves locale in the redirect URL
- Works for any number of slug changes — each old slug points to the list, and the current slug is always on the `lists` table
- Dashboard routes don't need slug history lookup — when the owner edits a list name, they're immediately redirected to the new URL. Bookmarked dashboard URLs are an acceptable edge case.

---

## 5. Delete Confirmation Redesign

### Current Behavior

Simple confirmation dialog: "Are you sure?" with Cancel and Delete buttons.

### New Behavior

Enhanced dialog that suggests closing as a safer alternative:

- **Title:** "Are you sure you want to permanently delete this list?"
- **Message:** "All items and reservations will be lost. If you just want to stop accepting reservations, you can close the list instead."
- **Three options:**
  - **"Close list"** — closes the list (safe option), styled as a primary/neutral button
  - **"Delete permanently"** — deletes the list (destructive), styled as red/destructive button
  - **Cancel** — dismisses the dialog (via X or clicking outside)
- If the list is already closed, the "Close list" option is hidden (it's already closed, so only Delete and Cancel remain)

---

## Design Principles

- **Warm & festive:** Countdown and summary should feel celebratory, not clinical
- **Mobile first:** All new UI works great on small screens
- **Zero friction for guests:** Closed list messaging is friendly, not scary
- **Privacy bulletproof:** Full Surprise reveal is opt-in, never leaked
- **Backward compatible:** Existing lists get `is_closed = false` by default, no disruption

## Translations

All new strings need EN + PL translations via next-intl.
