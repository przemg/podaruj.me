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
   - **Notice:** "This reservation cannot be undone. Create an account to manage your reservations." with a link to the sign-in page
3. Guest clicks "Confirm" → reservation created instantly
4. Dialog shows success state → closes

## Logged-in User Flow (unchanged)

- Buyer's Choice mode: popover with show-name toggle → instant reserve
- Other modes: one-click instant reserve
- Display name used automatically, no nickname prompt

## Guest Cancellation

Guests cannot cancel reservations — they have no account, no token, no way to identify themselves. The dialog warns them before confirming and offers a link to create an account.

## Removals

| File/Area | Action |
|-----------|--------|
| `src/lib/email.ts` | Delete |
| `resend` package | Uninstall |
| `RESEND_API_KEY`, `EMAIL_FROM` env vars | Remove references |
| `/reservations/confirm/[token]/` page | Delete |
| `/reservations/manage/[token]/` page + component | Delete |
| `/reservations/layout.tsx` | Delete |
| `reserveItemAsGuest()` action | Replace with simpler version (no email, no token, no status) |
| `confirmGuestReservation()` action | Delete |
| `cancelGuestReservation()` action | Delete |
| `guest_token` DB column | Drop via migration |
| `guest_email` DB column | Drop via migration |
| `status` DB column | Drop via migration |
| `locale` DB column | Drop via migration |
| "Pending" UI states in reserve-button | Remove |
| Rate limiting logic | Remove |
| Pending expiry cleanup | Remove |
| `ConfirmStatus` type | Delete |

## Modifications Required

These files reference dropped columns and need updates:

| File | Change |
|------|--------|
| `reservation-actions.ts` — `reserveItem()` | Remove `status: "confirmed"` from insert |
| `reservation-actions.ts` — `getMyReservations()` | Remove `.eq("status", "confirmed")` filter |
| `reservation-actions.ts` — `isItemAvailable()` | Simplify: just check if any reservation row exists (remove pending/expiry logic) |
| `src/app/[locale]/lists/[slug]/page.tsx` | Remove `status` from select, remove pending filter logic, simplify `ReservationInfo` type to `"available" \| "reserved"` |
| `guest-reserve-dialog.tsx` | Remove email field, email validation, email state, "check your email" success message. Add "can't be undone" notice with sign-in link. |
| `reserve-button.tsx` | Remove pending state handling |
| `messages/en.json` + `messages/pl.json` | Remove: `guestDialog.emailLabel`, `emailPlaceholder`, `emailHelp`, `successMessage`, `pendingBadge`, `reservations.confirm.*`, `reservations.manage.*`. Add: guest notice text. |

## What Stays Unchanged

- Privacy modes (Buyer's Choice, Visible, Full Surprise)
- `cancelReservation()` for logged-in users
- `ReservePopover` (Buyer's Choice toggle for logged-in users)
- Dashboard "My Reservations" page
- `reservation-card.tsx` in dashboard

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
| Cancel reservation | Via dashboard | Not possible (prompted to create account) |

## PROJECT.md Updates

- Remove mentions of email confirmation for guests
- Remove Resend from tech references
- Update Access Model permissions table
- Update Reservations feature list (remove "Guest reservation with email confirmation")
- Simplify guest flow description in Link/QR invitation path
- Note that guests are prompted to create an account for reservation management
