# Simplified Guest Reservations — Design Spec

**Date:** 2026-03-14
**Status:** Approved

## Overview

Remove all email verification from the guest reservation flow. Guests enter a nickname and confirm — reservation is instant. No accounts, no emails, no tokens.

## Guest Flow (not logged in)

1. Guest clicks "Reserve" on a gift item
2. Dialog opens with:
   - **Nickname** field (required, max 50 chars)
   - **Show my name** toggle (only in Buyer's Choice mode)
3. Guest clicks "Confirm" → reservation created instantly
4. Dialog shows success state → closes

## Logged-in User Flow (unchanged)

- Buyer's Choice mode: popover with show-name toggle → instant reserve
- Other modes: one-click instant reserve
- Display name used automatically, no nickname prompt

## Guest Cancellation

Guests cannot cancel reservations — they have no account, no token, no way to identify themselves. Only logged-in users can cancel via dashboard.

## Removals

| File/Area | Action |
|-----------|--------|
| `src/lib/email.ts` | Delete |
| `resend` package | Uninstall |
| `RESEND_API_KEY`, `EMAIL_FROM` env vars | Remove references |
| `/reservations/confirm/[token]/` page | Delete |
| `/reservations/manage/[token]/` page + component | Delete |
| `/reservations/layout.tsx` | Delete |
| `reserveItemAsGuest()` action | Replace with simpler version |
| `confirmGuestReservation()` action | Delete |
| `cancelGuestReservation()` action | Delete |
| `guest_token` DB column | Drop via migration |
| `guest_email` DB column | Drop via migration |
| `status` DB column | Drop via migration |
| `locale` DB column | Drop via migration |
| "Pending" UI states in reserve-button | Remove |
| Rate limiting logic | Remove |
| Pending expiry cleanup | Remove |

## What Stays Unchanged

- Privacy modes (Buyer's Choice, Visible, Full Surprise)
- `reserveItem()` for logged-in users
- `cancelReservation()` for logged-in users
- `getMyReservations()` for dashboard
- `ReservePopover` (Buyer's Choice toggle for logged-in users)
- Dashboard "My Reservations" page
- `reserve-button.tsx` logic (simplified — no pending state)

## DB Migration

```sql
ALTER TABLE reservations
  DROP COLUMN guest_email,
  DROP COLUMN guest_token,
  DROP COLUMN status,
  DROP COLUMN locale;
```

`guest_nickname` stays (used for display). `user_id` stays nullable (null = guest reservation).

## Simplified `reserveItemAsGuest()` Action

1. Validate nickname (1-50 chars)
2. Check item availability (simple: does a reservation exist for this item?)
3. Insert reservation with `guest_nickname`, `show_name`, `list_id`, `item_id`
4. Revalidate paths
5. Return success

## Updated Permissions

| Action | Registered user | Guest (via link) |
|--------|----------------|------------------|
| Reserve item | Instant | Instant (with nickname) |
| Cancel reservation | Via dashboard | Not possible |

## PROJECT.md Updates

- Remove mentions of email confirmation for guests
- Remove Resend from tech references
- Update Access Model permissions table
- Update Reservations feature list (remove "Guest reservation with email confirmation")
- Simplify guest flow description in Link/QR invitation path
