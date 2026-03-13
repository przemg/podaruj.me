# Google Auth - Design Spec

**Date:** 2026-03-14
**Feature:** Add Google sign-in as primary auth method

## Overview

Add Google OAuth sign-in as the primary (recommended) login method on the sign-in page, alongside the existing magic link flow. Google sign-in should populate user profiles with name and avatar automatically.

## Sign-In Page Layout

1. **Google button** — large, prominent "Sign in with Google" button at the top with Google icon. Styled as the primary/recommended action.
2. **Separator** — visual divider with text "or continue with email" (i18n: EN + PL)
3. **Magic link form** — existing email form unchanged below the separator

## Prerequisites

- Google OAuth must be enabled in the Supabase dashboard (Authentication > Providers > Google)
- Google Cloud Console: OAuth 2.0 client ID + secret created, with Supabase redirect URI registered
- Credentials pasted into Supabase Google provider settings

## Auth Flow

- Google button calls `supabase.auth.signInWithOAuth({ provider: 'google' })` with PKCE
- Must pass `options.redirectTo` pointing to `${origin}/${locale}/auth/callback` (with `?next=` forwarded if present), mirroring the magic link callbackUrl pattern
- Supabase redirects to Google consent screen (default scopes: `email`, `profile`)
- On success, Google redirects back to existing `/auth/callback` route
- Existing `exchangeCodeForSession(code)` handles the token exchange (works for both OAuth and magic link)
- User lands on `/dashboard` (or `?next=` destination)

## Profile Creation

- Update the `handle_new_user()` database trigger to extract `display_name` and `avatar_url` from `auth.users.raw_user_meta_data`
- Exact fields from `raw_user_meta_data`: `full_name` (fallback `name`) for display_name, `avatar_url` for avatar
- Falls back to NULL if metadata not present (magic link users won't have these)
- Single trigger handles both Google and magic link signups

## i18n Updates

New translation keys in `auth.signIn`:
- `googleButton`: "Sign in with Google" / "Zaloguj się przez Google"
- `orContinueWithEmail`: "or continue with email" / "lub kontynuuj przez email"

Update existing key:
- `subtitle`: change to reflect both options (e.g. "Sign in to manage your gift lists" / "Zaloguj się, aby zarządzać listami prezentów")

## Files to Change

1. `src/components/auth/sign-in-form.tsx` — add Google button + separator
2. `supabase/migrations/` — new migration to update `handle_new_user()` trigger
3. `messages/en.json` — add new i18n keys
4. `messages/pl.json` — add new i18n keys
5. `PROJECT.md` — update auth section
6. `e2e/auth.spec.ts` — add tests for Google button presence

## Testing

- E2E: verify Google button renders on sign-in page
- E2E: verify separator text renders
- E2E: verify Google button triggers OAuth redirect (mock or check URL)
- Existing magic link tests must still pass

## Out of Scope

- Google One Tap / popup sign-in
- Other OAuth providers (GitHub, Apple, etc.)
- Profile editing UI (name/avatar changes)
