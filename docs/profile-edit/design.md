# Profile Settings — Design Spec

## Overview

A profile settings page for logged-in users, accessible from the user menu in the dashboard navigation. Three sections: profile info, connected accounts, and account deletion.

## Page

- **Route:** `/dashboard/settings`
- **Access:** Via "Settings" link in the user menu (between "Dashboard" and "Sign out")
- **Layout:** Uses shared dashboard layout (no custom header or background)

## Section 1: Profile Info

- **Avatar** — circular image at top of section
  - Google-connected users: shows Google avatar
  - Others: initials fallback (first letter of display name)
  - Read-only — no upload functionality
- **Display name** — editable text input
  - Prefilled from profile (which gets populated from Google on first sign-in)
  - Max 50 characters
  - "Save" button to persist changes
  - Success/error feedback after save
- **Email** — read-only greyed-out input
  - Shows the auth email address
  - Small helper text: "Email cannot be changed"

## Section 2: Connected Accounts

- **Google account row:**
  - If connected: Google icon + "Connected as john@gmail.com" + green checkmark
  - If not connected: Google icon + "Not connected" + "Link Google account" button
  - Linking triggers Supabase OAuth flow to associate Google identity

## Section 3: Danger Zone

- Red-bordered card with warning styling
- Heading: "Danger Zone"
- Description explaining consequences
- "Delete my account" red button
- **Confirmation dialog:**
  - Warning: "This will permanently delete your account, all your lists, items, and reservation data. This action cannot be undone."
  - Text input: "Type DELETE to confirm"
  - Confirm button — red, disabled until user types "DELETE"
  - Cancel button to dismiss

### Deletion behavior

- Deletes user profile, all lists, all items, all reservation data
- Signs user out after deletion
- Redirects to landing page

## Design

- Follows existing warm, friendly aesthetic (pastels, rounded corners)
- Mobile-first responsive layout
- Danger zone feels serious but not scary — red border/accent, not full red background
- Uses existing shadcn/ui components (Input, Button, Label, Dialog)
- Cards for each section with consistent spacing

## Internationalization

- All text in EN and PL
- New `settings` translation namespace
- Follows existing next-intl patterns

## Navigation

- New "Settings" item in user menu dropdown (gear icon)
- Positioned between "Dashboard" and "Sign out"
- Uses same styling as other menu items

## Database

- Uses existing `profiles` table (display_name, avatar_url columns)
- RLS already configured for owner-only read/update
- Account deletion cascades via foreign key constraints

## Server Actions

- `updateDisplayName` — validates input, updates profiles table
- `deleteAccount` — deletes user account and all associated data, signs out

## Testing

- E2E tests for: navigating to settings, editing display name, danger zone dialog interaction
