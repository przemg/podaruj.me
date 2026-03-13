# Auth Feature — Design Spec

## Overview

Magic link authentication for Podaruj.me using Supabase Auth with SSR. No passwords — users sign up and log in by entering their email and clicking a magic link. Guest access to shared lists remains frictionless.

## Approach

Supabase Auth with SSR (`@supabase/ssr` + `@supabase/supabase-js`). Auth sessions are verified server-side in middleware, so protected pages never flash unauthorized content. Uses PKCE flow (default for `@supabase/ssr`).

## Architecture

### Supabase Client Utilities

Three client factories following the standard Supabase + Next.js App Router pattern:

- `src/lib/supabase/client.ts` — browser client for Client Components
- `src/lib/supabase/server.ts` — server client for Server Components and Route Handlers
- `src/lib/supabase/middleware.ts` — middleware client for session refresh

### Middleware Composition

The existing next-intl middleware is wrapped in a custom middleware function:

1. Create Supabase middleware client and call `updateSession()` to refresh the session cookie
2. Check if the route is protected and no session exists — if so, redirect to `/[locale]/auth/sign-in`
3. Delegate to next-intl's `createMiddleware(routing)` for locale handling

The middleware matcher is updated to include all locale paths while excluding static assets, `_next`, and the auth callback route (which must be reachable without protection):

```
matcher: ['/', '/(en|pl)/:path*']
```

The auth callback route is explicitly excluded from protection logic inside the middleware (not in the matcher).

Protected route patterns: `/dashboard`, `/my-lists` (and future authenticated routes).

### Magic Link Flow (PKCE)

1. User enters email on sign-in page
2. App calls `supabase.auth.signInWithOtp({ email })`
3. Supabase sends a custom-branded magic link email
4. User clicks link, hits `/[locale]/auth/callback` route handler
5. Callback extracts `code` from URL query string and calls `exchangeCodeForSession(code)`
6. Redirect to `/[locale]/dashboard` (or to a `next` URL if provided — see below)

### Redirect-back Support

The auth callback accepts an optional `next` query parameter. Default destination is `/dashboard`, but future features (email invitations, deep links) can pass a different path. The sign-in page also preserves a `next` parameter from the URL and passes it through the auth flow.

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

### Migration

The profiles table, trigger, and RLS policies are created as a Supabase migration (`supabase/migrations/`), so the schema is version-controlled and reproducible.

## Pages & Routes

### Sign-in Page — `/[locale]/auth/sign-in`

- Email input + "Send magic link" button
- Same warm design as landing page (cream/peach gradient background, rounded corners, soft shadows)
- Accepts optional `?next=/path` parameter to redirect after auth
- Success state: "Check your email for your magic link!" with a cooldown timer (60 seconds) before allowing resend
- Error states:
  - Invalid email format: "Please enter a valid email address"
  - Rate limited: "Too many attempts. Please wait a moment."
  - Generic error: "Something went wrong. Please try again."
- If already logged in: redirect to dashboard
- Loading state on button while sending

### Auth Callback — `/[locale]/auth/callback`

- Route handler (GET) that exchanges the PKCE auth code for a session
- Extracts `code` from query string, calls `exchangeCodeForSession(code)`
- On success: redirect to `next` parameter or `/[locale]/dashboard`
- Error handling:
  - Expired link: redirects to sign-in with `?error=expired` → "Your link has expired. Please request a new one."
  - Invalid/used link: redirects to sign-in with `?error=invalid` → "This link is no longer valid."
  - Generic error: redirects to sign-in with `?error=unknown` → "Something went wrong. Please try again."

### Dashboard — `/[locale]/dashboard`

- Protected route — middleware redirects to sign-in if not authenticated
- Server Component that reads session server-side (no flash of unauthenticated content)
- Shows welcome message: "Welcome to Podaruj.me!" with user's email
- Warm design consistent with landing page
- This is the future home for list management

### Sign Out Flow

- Client-side call to `supabase.auth.signOut()`
- After sign-out: redirect to landing page (`/[locale]`)

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
- Submitting navigates to `/[locale]/auth/sign-in?email={email}` — the sign-in page picks up the email from the URL and sends the magic link automatically
- This avoids duplicating auth logic in two places

### When logged in

- Email input hidden
- Shows "Go to Dashboard" button instead

## CTA Section Updates

- "Create your first list" button → links to sign-in (logged out) or dashboard (logged in)

## Custom Magic Link Email

Custom email template configured in Supabase dashboard:

- Podaruj.me logo at top
- Warm color palette (peach/coral accents matching the landing page)
- English-only for v1 (Supabase templates are global, per-locale emails would require a custom email hook — not worth the complexity now)
- Clear "Sign in" CTA button
- Footer with "You received this email because someone used your email to sign in to Podaruj.me"

## i18n

All new UI text (sign-in page, success/error messages, nav items, dashboard welcome) added to both EN and PL message files.

New translation namespaces:
- `auth.signIn` — sign-in page strings
- `auth.callback` — error messages
- `dashboard` — dashboard page strings
- Updated `landing.nav` — new keys for user menu items
- Updated `landing.hero` — logged-in state strings

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
- Per-locale magic link emails (requires custom email hook, deferred)
