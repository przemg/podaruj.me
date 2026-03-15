# Guest OTP Flow - Initial Prompt

Refactor the guest reservation flow. Remove Resend and simplify.

## New guest flow:

1. Guest clicks Reserve → dialog asks for nickname + email
2. Supabase sends OTP code to their email
3. Guest enters the code in the same dialog → verified and signed in
4. Reservation is created with their user_id
5. They can manage their reservations via dashboard
6. Later they can sign in again with magic link (same email)

## What to remove:

- Resend dependency entirely (uninstall, remove all Resend code)
- Pending/confirmed reservation status — all reservations are instant after OTP verification
- Guest token system
- Confirmation and management pages (`/reservations/confirm/`, `/reservations/manage/`)

## What stays unchanged:

- Privacy modes (Buyer's Choice, Visible, Full Surprise)
- Dashboard "My Reservations" tab (works even better now — all users are authenticated)
- Cancel reservation via dashboard
- Buyer's Choice anonymous/visible toggle

## UX Requirements:

The reserve dialog should feel smooth — nickname, email, OTP code all in one flow without page reloads. Nice animations between steps.

Also update PROJECT.md to reflect this change in the Access Model and remove any mentions of Resend.
