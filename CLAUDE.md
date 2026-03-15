# CLAUDE.md

## Project

Podaruj.me — gift list sharing platform. See [PROJECT.md](PROJECT.md) for the full product vision (source of truth for all product decisions).

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Backend:** Supabase (Postgres, Auth with Google OAuth + magic link, Storage)
- **Styling:** Tailwind CSS + shadcn/ui
- **i18n:** next-intl (EN + PL)
- **Deploy:** Vercel

## Code Conventions

- Use TypeScript strict mode; avoid `any`
- React Server Components by default; add `"use client"` only when needed
- Use shadcn/ui components — don't build custom UI primitives
- Tailwind for all styling; no CSS modules or styled-components
- Keep components small and focused; one component per file
- Use Supabase client from `src/lib/supabase/` (don't instantiate in every file)
- Prefer named exports
- Use `src/proxy.ts` (Next.js 16 convention), NOT `middleware.ts`

## Folder Structure (Next.js App Router)

```
src/
  app/              # Routes and layouts
    [locale]/
      auth/         # Auth pages (sign-in, callback)
      dashboard/    # Protected dashboard
        lists/      # Gift list pages
          actions.ts        # Server Actions for lists & items CRUD
          new/              # Create list page
          [id]/             # List detail, edit, not-found, loading
            edit/
      lists/          # Public list pages (no auth required)
        layout.tsx          # Simple layout (logo + footer)
        [slug]/             # Public list view, loading, not-found, error
          reservation-actions.ts  # Server Actions for reservations
  components/
    auth/           # Auth components (sign-in-form, user-menu)
    landing/        # Landing page components
    lists/          # Gift list components (list-form, gift-card, etc.)
    public/         # Public page components (gift card, header, owner banner, reserve button, guest dialog)
    ui/             # shadcn/ui components
  lib/
    supabase/       # Supabase client utilities (client, server, service)
    countdown.ts    # Shared countdown utility
    utils.ts        # General utilities (cn helper)
  i18n/             # Internationalization config
  types/            # Shared TypeScript types
  proxy.ts          # Next.js 16 proxy (replaces deprecated middleware.ts)
supabase/
  migrations/       # Database migrations (version-controlled SQL)
```

## Database Tables

- **profiles** — user profiles (auto-created on signup)
- **lists** — gift lists with occasion, privacy mode, event date, slug, `is_published`, `published_at` (RLS: owner-only). Slug is used in URLs instead of UUID. Full Surprise lists start as drafts (`is_published=false`); all others default to `true`.
- **items** — gift items within lists with priority, position (RLS: owner of parent list)
- **reservations** — gift reservations with privacy modes, guest nickname for anonymous reservations. RLS: logged-in users can SELECT/DELETE own reservations; all other access via service client.

## URL Pattern

Lists use slug-based URLs: `/dashboard/lists/birthday-wishlist-a3x7k` (name + random hash). Slugs are generated on create and regenerated on edit. All pages and actions use slug for lookups, not UUID.

## Public (Shareable) List Pages

Every list has a public URL at `/[locale]/lists/[slug]` — accessible without authentication. The public page uses a **Supabase service-role client** (`src/lib/supabase/service.ts`) to bypass RLS and fetch data server-side. No public RLS policies exist — the service key never reaches the browser.

### Key Architecture
- **Route:** `/[locale]/lists/[slug]` — separate from `/dashboard/lists/[id]` (owner view)
- **Data access:** `createServiceClient()` from `src/lib/supabase/service.ts` (server-only, bypasses RLS)
- **Owner detection:** Server-side check via `createClient()` auth — if logged-in user matches `list.user_id`, show owner banner
- **Cache invalidation:** All server actions in `actions.ts` call `revalidatePath` for both dashboard and public routes
- **Components:** `src/components/public/` — read-only gift cards, list header, owner banner
- **Reservations:** Functional — logged-in users reserve instantly, guests enter nickname and reserve instantly. Privacy mode filtering applied server-side.
- **Reservation actions:** `src/app/[locale]/lists/[slug]/reservation-actions.ts` — uses service client for guest operations (bypasses RLS), auth client for logged-in user cancellation

## Dashboard Layout

All `/dashboard` routes share a layout (`src/app/[locale]/dashboard/layout.tsx`) with a header (logo + desktop nav + user menu on desktop; logo + hamburger menu on mobile). Individual pages should NOT include their own header or `min-h-screen bg-gradient` wrapper.

### Dashboard Navigation
- **Desktop:** Inline pill nav links ("My Lists", "My Reservations") with active state indicator + user menu dropdown
- **Mobile:** Single hamburger menu (shadcn Sheet) combining nav links + user info + sign out
- Shared nav config in `src/components/dashboard/nav-items.ts`
- Active state uses exact match for `/dashboard` and prefix match for sub-routes

### Dashboard Pages
- `/dashboard` — "My Lists" page with card grid (real data via Supabase aggregation), empty state, mobile FAB
- `/dashboard/lists/[slug]` — List detail with items, reservation status badges (respects privacy modes), sharing options (copy link split button + popover with email/QR code)
- `/dashboard/reservations` — "My Reservations" showing reserved items grouped by list, with cancel functionality

## Mutations Pattern

All data mutations use **Next.js Server Actions** (functions with `"use server"` in `actions.ts`). Server Actions validate input, check authentication, and use the server Supabase client with RLS enforcement. List actions receive `locale` for redirect paths; item actions receive `locale` and `listSlug` for `revalidatePath`.

## Publish Mode (Full Surprise Only)

Full Surprise lists use a **draft → published** lifecycle. Non-surprise lists are always published.

- **Draft state:** `is_published=false`. Public page returns 404. Reservations blocked. Owner can freely add/edit/delete items.
- **Publish action:** `publishList()` sets `is_published=true` and `published_at=now()`. Items created before `published_at` become locked (no edit/delete via server action guards). New items added after publish are also locked immediately.
- **UI:** Draft badge + Publish button (with confirmation dialog) in list header. Dashboard cards show "Draft" badge. Add-gift dialog warns that items can't be edited after adding to a published list.

## Key Principles

1. **Zero friction for guests** — viewing and reserving must work without an account
2. **Mobile first** — most users arrive via messenger links
3. **Privacy by design** — reservation modes must be bulletproof
4. **Simple over clever** — no over-engineering, no premature abstractions
5. **Vibe coding friendly** — small, well-scoped tasks with clear context for AI

## Testing

- Use **Playwright** for all E2E tests
- Every new feature must have E2E test coverage
- Tests must pass before any PR
- **Always run tests after completing all tasks** — never mark work as done without verifying tests pass

## Git Workflow

- Always create a new branch from `master` before starting work on a new feature
- Branch naming: `feature/<short-description>` (e.g. `feature/auth`, `feature/gift-list`)
- Commit often with small, focused commits
- Push and create a PR when the feature is ready

## Superpowers Workflow

When using Superpowers, save all generated plans, specs, and documents to `docs/<feature_name>/`:

- Always save the initial prompt that started the task as `docs/<feature_name>/prompt.md`
- Save plans, specs, and other artifacts alongside it

Example — working on auth:

```
docs/auth/prompt.md
docs/auth/plan.md
docs/auth/spec.md
```

## UI Design

When designing or building UI components, use the **UI UX Pro Max** MCP server to generate design system recommendations (color palettes, typography, UI styles, animations). Always consult it before making visual design decisions.

## End of Task Checklist

Before finishing any task:

1. Run linter and type check
2. Write E2E tests for new/changed features using Playwright
3. Run all E2E tests and make sure they pass
4. Run `/review` and `/security-review` on all changes
5. Run `/simplify` on modified files
6. Update CLAUDE.md if any architectural decisions changed
7. Push to remote and update PR description
8. Deploy to Vercel
