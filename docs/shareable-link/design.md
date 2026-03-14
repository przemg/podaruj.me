# Shareable Links — Design Spec

## Overview

Add public shareable links to gift lists. Every list is shareable by default using its existing slug. Guests can view any list without logging in via a dedicated public route. The owner can copy the share link from the dashboard list detail page.

## Routing & Access

### New Public Route
- **Path:** `/[locale]/lists/[slug]`
- **Auth:** None required — open to everyone (guests and logged-in users)
- **Purpose:** Read-only view of a gift list for anyone with the link

### Existing Owner Route (unchanged)
- **Path:** `/[locale]/dashboard/lists/[slug]`
- **Auth:** Protected — owner only (existing behavior)
- **Purpose:** Full management view with edit/delete/reorder controls

### Share URL Format
- `https://podaruj.me/{locale}/lists/{slug}`
- Example: `https://podaruj.me/en/lists/birthday-wishlist-a3x7k`
- Uses the owner's current locale when generating the link
- Note: Recipients with a different language preference will see the URL in the owner's locale. This is acceptable — next-intl handles locale detection for direct visitors.

### Proxy (Middleware)
- No changes needed — `/lists/*` is not under `/dashboard`, so it is already unprotected by the existing proxy config.

## Data Access

### No RLS Policy Changes
- RLS policies remain owner-only for all operations (SELECT, INSERT, UPDATE, DELETE)
- No public RLS policies are added — this avoids exposing data through the PostgREST API

### Server-Side Service Client
- The public page is a React Server Component — it fetches data on the server, never on the client
- Create a new `createServiceClient()` utility in `src/lib/supabase/service.ts` that uses `SUPABASE_SERVICE_ROLE_KEY`
- This bypasses RLS safely because the key never reaches the browser
- The service client selects only safe columns (excludes `user_id` from the response)
- The public page uses this client to fetch list + items by slug

### No Schema Changes
- All lists are shareable by default — no `is_published` column needed
- Existing slug column is used for public URLs

## Public Guest Page

### Layout
- Simple layout — no dashboard navigation
- Podaruj.me logo at top (links to landing page)
- Minimal footer with "Powered by Podaruj.me" link
- Reuses existing landing page color tokens (cream, coral, lavender, mint)

### Page Content (top to bottom)
1. **Header area:**
   - Occasion badge (icon + label, e.g. "Birthday")
   - Event date countdown (warm visual card: "5 days left" / "Today!" / "Event passed")
   - List name — large, prominent
   - Description — subtle, secondary text
2. **Gift cards grid:**
   - Read-only gift cards — no edit/delete/reorder controls
   - Each card shows: name, description, priority badge, price, image thumbnail, external link
   - "Reserve" button — visually present but disabled, with "Coming soon" label
3. **Empty state:** If list has no items, show a friendly message

### Loading & Error States
- `loading.tsx` — skeleton UI matching the public page layout (occasion badge placeholder, title placeholder, card grid placeholders)
- `not-found.tsx` — friendly 404 page with link to landing page (not dashboard)
- Supabase query errors show a generic error message with retry option

### Owner Banner
- If the authenticated user is the list owner, show a subtle top banner:
  - "This is your list — manage it from your dashboard" + link to dashboard view
  - Dismissible (state stored in component only — reappears on refresh, simple approach)

### Visual Design
- **Background:** Soft cream (`--landing-cream: #FFFBF7`)
- **Cards:** White with soft shadows, rounded corners
- **Accents:** Coral (`--landing-coral: #F97066`) for badges and highlights
- **Typography:** Consistent with existing app (Geist Sans)
- **Animations:** Staggered fade-in-up for gift cards (reuse existing keyframes), respect `prefers-reduced-motion`
- **Mobile-first:** Single column layout, comfortable touch targets (44px+)

### Open Graph Metadata
- `generateMetadata` exports OG tags for rich link previews in messengers:
  - `og:title` — list name
  - `og:description` — list description or "Gift list on Podaruj.me"
  - `og:url` — canonical public URL
- SEO: public pages are indexable (no `robots: noindex`) — this is a sharing platform, discoverability is desired

## Share Button (Owner Dashboard)

### Current State
- Share button exists in `list-header.tsx` with placeholder toast: "Sharing is coming soon!"

### New Behavior
- Click copies the public URL to clipboard
- Success toast: "Link copied!" (translated)
- URL format: `{origin}/{locale}/lists/{slug}`

## Cache Invalidation

- When the owner edits a list or its items, `revalidatePath` is already called for the dashboard path
- Add `revalidatePath` for the public path (`/${locale}/lists/${slug}`) in all relevant server actions (createItem, updateItem, deleteItem, updateList, deleteList, reorderItems)
- This ensures the public page reflects changes immediately

## Shared Utilities

Extract from dashboard components to shared locations to avoid duplication:
- `getCountdown(eventDate)` — countdown logic (days left, "Today!", "Event passed") → `src/lib/countdown.ts`
- Priority config (labels, colors) — already available via i18n, no extraction needed
- Price formatting — already locale-aware in gift-card, reuse same pattern

## New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Public list page | `src/app/[locale]/lists/[slug]/page.tsx` | Server component — fetches list + items via service client |
| Public loading | `src/app/[locale]/lists/[slug]/loading.tsx` | Skeleton UI for loading state |
| Public not-found | `src/app/[locale]/lists/[slug]/not-found.tsx` | Friendly 404 with link to landing |
| Public layout | `src/app/[locale]/lists/layout.tsx` | Simple layout with logo + footer |
| Public list header | `src/components/public/public-list-header.tsx` | Occasion, countdown, name, description |
| Public gift card | `src/components/public/public-gift-card.tsx` | Read-only gift card |
| Owner banner | `src/components/public/owner-banner.tsx` | "This is your list" dismissible banner |
| Service client | `src/lib/supabase/service.ts` | Supabase service-role client for public reads |
| Countdown util | `src/lib/countdown.ts` | Shared countdown logic |

## Updated Components

| Component | Change |
|-----------|--------|
| `src/components/lists/list-header.tsx` | Share button copies URL instead of showing "coming soon" toast |
| `src/app/[locale]/dashboard/lists/actions.ts` | Add `revalidatePath` for public route in all mutation actions |

## Internationalization

New translation keys needed in both `en.json` and `pl.json`:

- `public.listNotFound` — 404 message
- `public.listNotFoundDescription` — 404 description
- `public.backToHome` — "Back to home"
- `public.eventCountdown` — "{count} days left" (with plural)
- `public.eventToday` — "Today!"
- `public.eventPassed` — "Event has passed"
- `public.reserveButton` — "Reserve"
- `public.reserveComingSoon` — "Coming soon"
- `public.ownerBanner` — "This is your list"
- `public.ownerBannerLink` — "Manage in dashboard"
- `public.emptyList` — "No gifts added yet"
- `public.pageTitle` — "{name} — Podaruj.me"
- `public.poweredBy` — "Powered by Podaruj.me"
- `public.createYourOwn` — "Create your own gift list"
- Updated: `lists.detail.shareCopied` — "Link copied!"

## Route Parameter Naming

The new public route uses `[slug]` as the dynamic segment: `/[locale]/lists/[slug]`. The existing dashboard route uses `[id]` (`/[locale]/dashboard/lists/[id]`), even though it also stores a slug. This inconsistency is acknowledged — renaming the dashboard route is out of scope for this feature to avoid breaking existing code. Both routes look up by slug regardless of the parameter name.

## E2E Tests

1. Guest can open a public list link and see list name, description, occasion, items
2. Guest sees reserve buttons (disabled) on items
3. Guest cannot see edit/delete/reorder controls
4. Owner visiting public link sees the owner banner with dashboard link
5. Share button on dashboard copies correct public URL to clipboard
6. Public page shows 404 for non-existent slugs
7. Public page works without authentication (incognito)
8. Public page shows loading skeleton while fetching
9. Public page displays correct Open Graph metadata

## Out of Scope

- QR code generation (future feature)
- Email invitations (future feature)
- Working reserve functionality (next feature)
- Share dialog with multiple options (future)
- Renaming dashboard route param from `[id]` to `[slug]`
