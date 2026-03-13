# Auth Feature — Design Spec

## Overview

Magic link authentication for Podaruj.me using Supabase Auth with SSR. No passwords — users sign up and log in by entering their email and clicking a magic link. Guest access to shared lists remains frictionless.

## Approach

Supabase Auth with SSR (`@supabase/ssr` + `@supabase/supabase-js`). Auth sessions are verified server-side in middleware, so protected pages never flash unauthorized content. The middleware combines next-intl locale routing with Supabase session refresh and route protection.

## Architecture

### Supabase Client Utilities

Three client factories following the standard Supabase + Next.js App Router pattern:

- `src/lib/supabase/client.ts` — browser client for Client Components
- `src/lib/supabase/server.ts` — server client for Server Components and Route Handlers
- `src/lib/supabase/middleware.ts` — middleware client for session refresh

### Middleware

Combined middleware that runs on every request:

1. Supabase refreshes the session cookie
2. next-intl handles locale detection/redirect
3. If the route is protected and no session exists, redirect to `/[locale]/auth/sign-in`

Protected route patterns: `/[locale]/dashboard`, `/[locale]/my-lists` (and future authenticated routes).

### Magic Link Flow

1. User enters email (hero section input or sign-in page)
2. App calls `supabase.auth.signInWithOtp({ email })`
3. Supabase sends a custom-branded magic link email
4. User clicks link, hits `/[locale]/auth/callback` route handler
5. Callback exchanges the code for a session cookie
6. Redirect to `/[locale]/dashboard`

## Database

### Profiles Table

| Column       | Type         | Notes                                    |
|-------------|-------------|------------------------------------------|
| id          | uuid        | PK, FK → auth.users.id, ON DELETE CASCADE |
| display_name| text        | Nullable, user can set later             |
| avatar_url  | text        | Nullable, for future use                 |
| created_at  | timestamptz | Default now()                            |
| updated_at  | timestamptz | Auto-updated via trigger                 |

### Automatic Profile Creation

A database trigger on `auth.users` INSERT automatically creates a matching `profiles` row. Every authenticated user always has a profile.

### Row Level Security

- Users can SELECT their own profile only
- Users can UPDATE their own profile only
- No public/anonymous access to profiles

## Pages & Routes

### Sign-in Page — `/[locale]/auth/sign-in`

- Email input + "Send magic link" button
- Same warm design as landing page (cream/peach gradient background, rounded corners, soft shadows)
- Success state: "Check your email for your magic link!" message
- Error state: inline error message below input
- If already logged in: redirect to dashboard

### Auth Callback — `/[locale]/auth/callback`

- Route handler (not a page) that exchanges the auth code for a session
- On success: redirect to dashboard
- On error: redirect to sign-in with error message

### Dashboard — `/[locale]/dashboard`

- Protected route — redirects to sign-in if not authenticated
- For now: welcome message with user's email ("Welcome to Podaruj.me, user@email.com!")
- Warm design consistent with landing page
- This is the future home for list management

## Navigation Updates

### Desktop (logged out)

- Section links (How it works, Features, etc.) — unchanged
- "Create List" button → links to `/[locale]/auth/sign-in`

### Desktop (logged in)

- Section links — unchanged (only visible on landing page)
- "Create List" button replaced by user menu
- User menu shows email with dropdown: "Dashboard" and "Sign out"

### Mobile (logged out)

- Slide-out menu shows section links + "Create List" at bottom → links to sign-in

### Mobile (logged in)

- Slide-out menu shows section links + "Dashboard" link + "Sign out" at bottom
- User email displayed at top of menu

## Hero Section Updates

### When logged out

- Email input + "Get Started" button becomes functional
- Submitting calls `signInWithOtp({ email })`
- Shows success/error feedback inline
- Loading state on button while sending

### When logged in

- Email input hidden
- Shows "Go to Dashboard" button instead

## CTA Section Updates

- "Create your first list" button → links to sign-in (logged out) or dashboard (logged in)

## Custom Magic Link Email

Custom email template configured in Supabase dashboard:

- Podaruj.me logo at top
- Warm color palette (peach/coral accents matching the landing page)
- Friendly copy in the user's locale (EN/PL)
- Clear "Sign in" CTA button
- Footer with "You received this email because someone used your email to sign in to Podaruj.me"

## i18n

All new UI text (sign-in page, success/error messages, nav items, dashboard welcome) added to both EN and PL message files.

New translation namespaces:
- `auth.signIn` — sign-in page strings
- `auth.callback` — error messages
- `dashboard` — dashboard page strings
- Updated `landing.nav` — new keys for user menu items
- Updated `landing.hero` — success/error states

## Environment Variables

Required in `.env.local` (not committed):

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous/public key

## Out of Scope

These are referenced in PROJECT.md but not part of this feature:

- Guest nickname input for reservations (will be built with the reservations feature)
- "Create an account" soft prompt for guests (same — built with reservations)
- Email invitations with magic link (built with sharing feature)
- Profile editing UI (future feature)
