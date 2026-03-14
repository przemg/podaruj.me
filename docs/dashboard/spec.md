# Dashboard Feature Spec

## Overview

Build the dashboard for logged-in users with two URL-based sections: "My Lists" (default at `/dashboard`) and "My Reservations" (`/dashboard/reservations`). Real data from Supabase. Mobile-first with responsive navigation.

## Routing

- `/dashboard` — "My Lists" page (default landing after login)
- `/dashboard/reservations` — "My Reservations" page (empty state for now)
- Existing sub-routes unchanged: `/dashboard/lists/new`, `/dashboard/lists/[slug]`, `/dashboard/lists/[slug]/edit`

### New Files

- `src/app/[locale]/dashboard/page.tsx` — My Lists page (replaces current minimal welcome)
- `src/app/[locale]/dashboard/loading.tsx` — Loading skeleton for dashboard (Suspense boundary)
- `src/app/[locale]/dashboard/reservations/page.tsx` — My Reservations empty state
- `src/app/[locale]/dashboard/reservations/loading.tsx` — Loading state for reservations page

## Navigation & Header

### Desktop
- Existing header: logo (Gift icon + "Podaruj.me") + user menu (email dropdown with sign out)
- Add navigation links below header: "My Lists" and "My Reservations" — styled as pill-shaped links with active state (filled background for current page, subtle for inactive)
- Navigation hrefs: "My Lists" → `/dashboard` (exact match), "My Reservations" → `/dashboard/reservations` (exact match)
- Active state detection uses exact pathname matching to avoid `/dashboard` staying active on `/dashboard/reservations`

### Mobile
- Single hamburger menu button in header (replaces separate nav + user menu)
- Opens a drawer/sheet containing:
  - Navigation links: "My Lists" (`/dashboard`), "My Reservations" (`/dashboard/reservations`)
  - User email display
  - Sign out button — uses shared `signOut()` utility extracted to `src/lib/supabase/auth.ts` (avoids duplicating logic from `UserMenu`)
- **Prerequisite:** Install shadcn Sheet component (`npx shadcn@latest add sheet`)

### UserMenu Changes
- Desktop: no changes — email dropdown remains as-is
- Remove "Dashboard" link from UserMenu dropdown to avoid redundancy with the new `DashboardNav` "My Lists" link
- Hidden on mobile via responsive classes (`hidden md:block`)

## "My Lists" Page (`/dashboard`)

### Data Fetching
- Server-side Supabase query: fetch all lists owned by current user
- Use Supabase aggregation syntax: `supabase.from("lists").select("*, items(count)")` — returns `items: [{ count: N }]` per list
- Order by `created_at` descending (newest first)

### Card Grid
- Responsive: 1 column mobile, 2 columns tablet, 3 columns desktop
- Each card displays:
  - **List name** (title)
  - **Occasion** badge (color-coded: birthday, holiday, wedding, other)
  - **Event date** with relative countdown if in the future (e.g. "in 12 days")
  - **Item count** (e.g. "8 gifts")
- Whole card is a single `Link` element (no nested interactive elements) — navigates to `/dashboard/lists/[slug]`

### Empty State
- Icon/illustration area
- Heading: "No lists yet"
- Subtext encouraging first list creation
- Prominent "Create your first list" button → `/dashboard/lists/new`

### Create List Action
- Mobile: Floating action button (FAB) "+" in bottom-right corner
- Desktop: "Create list" button in page header area

### Animations
- Cards fade-in-up with staggered delay on page load (using existing `fade-in-up` keyframe)
- Must respect `prefers-reduced-motion: reduce` — disable stagger animations when user prefers reduced motion (consistent with existing `.scroll-reveal` pattern in `globals.css`)

## "My Reservations" Page (`/dashboard/reservations`)

Empty state only (reservations system not yet built):
- Icon/illustration area
- Heading: "You haven't reserved any gifts yet"
- Subtext: "When you reserve gifts on someone else's list, they'll appear here"
- No action button

## i18n

All user-facing text in both EN and PL via `next-intl`. Extend the `dashboard` namespace in `/messages/en.json` and `/messages/pl.json`.

## Components

### New Components
- `DashboardNav` — navigation links with active state detection. Client component using `usePathname` from `@/i18n/navigation` (locale-aware, not `next/navigation`). Exact pathname matching for active state.
- `MobileMenu` — hamburger button + shadcn Sheet drawer with nav + user actions. Client component.
- `ListCard` — dashboard list card. Single `Link` wrapper, no nested interactive elements. Server component.
- `DashboardEmptyState` — reusable empty state with icon, heading, subtext, optional action button. Server component.

### Modified Components
- `layout.tsx` — integrate `DashboardNav` (desktop) and `MobileMenu` (mobile), hide desktop `UserMenu` on mobile
- `UserMenu` — remove "Dashboard" link from dropdown, hidden on mobile

## Design System

Follow existing patterns:
- Rounded corners (`rounded-2xl` cards, `rounded-xl` buttons)
- Soft shadows, `bg-white/70` card backgrounds
- Brand colors from CSS variables (coral primary, lavender/mint accents)
- Occasion badge colors: birthday=coral, holiday=mint, wedding=lavender, other=muted
- Staggered `fade-in-up` animations (with `prefers-reduced-motion` respect)

## Out of Scope

- Reservations table/system (future feature)
- Reserved item count on list cards (depends on reservations)
- Sharing features (QR, email invites)
- List filtering/sorting
- Profile editing
