# Reservations Feature — Design Spec

## Overview

Add gift reservation functionality to Podaruj.me. Users browsing a shared list can reserve items to avoid duplicate gifts. Supports both logged-in users and guests (via email confirmation). Three privacy modes control what the list owner sees.

## Reservation Flow

### Logged-in User
1. Clicks "Reserve" on a gift item
2. In Buyer's Choice mode: a toggle appears — "Show my name to the list owner" (default on)
3. Reservation is confirmed immediately
4. Button changes to "Reserved by you" with a "Cancel" option

### Guest (No Account)
1. Clicks "Reserve" on a gift item
2. A dialog appears asking for nickname + email
3. In Buyer's Choice mode: the dialog also shows a toggle — "Show my name to the list owner" (default on)
4. Reservation is saved as **pending**
5. Guest receives an email with a confirmation link + a cancel link
6. Clicking the confirmation link confirms the reservation
7. If not confirmed within 24 hours, the reservation expires and the item becomes available

### Cancellation
- Logged-in users: click "Cancel reservation" on the item (public page or dashboard)
- Guests: use the cancel link from their confirmation email, which leads to a page where they can cancel that specific reservation
- Cancelling frees the item for others

## Privacy Modes

Set by the list owner when creating/editing the list. Already stored in the `lists.privacy_mode` column.

### Buyer's Choice (default)
- When reserving, the reserver sees a toggle: "Show my name to the list owner"
- If toggled on: owner sees the reserver's name on the item
- If toggled off: owner sees "Reserved" but not by whom
- Other guests always see "Reserved" (no name) to avoid duplicates

### Visible
- Everyone sees who reserved what — name is always shown
- No toggle, no choice
- Owner and all guests see the reserver's name

### Full Surprise
- Owner sees NO reservation info at all — items look completely unreserved
- Other guests see "Reserved" (no name) to avoid duplicates
- The server never returns reservation data when the owner is viewing

### Changing Privacy Mode After Reservations Exist
- Privacy mode changes apply prospectively to how data is displayed
- Existing reservations keep their `show_name` value
- If switching to Full Surprise: owner immediately stops seeing reservation info
- If switching from Full Surprise to Visible: existing reservations become visible; `show_name` defaults to `true` so names show (guests made reservations knowing the mode, but the owner changed it — this is the owner's responsibility)

## Database

### New `reservations` table
- `id` — uuid primary key (`gen_random_uuid()`)
- `item_id` — FK to items (unique constraint — one reservation per item)
- `list_id` — FK to lists (denormalized for query performance)
- `user_id` — FK to auth.users (NULL for guests)
- `guest_email` — text (NULL for logged-in users, max 320 chars)
- `guest_nickname` — text (NULL for logged-in users, max 50 chars)
- `guest_token` — uuid (`gen_random_uuid()`, server-side only, unique per reservation)
- `show_name` — boolean (default true, used in Buyer's Choice mode)
- `status` — varchar: 'pending' | 'confirmed' (pending = guest hasn't clicked email link yet)
- `locale` — varchar(5) (locale the guest was viewing when reserving, for email language)
- `created_at` — timestamptz (default now())
- `updated_at` — timestamptz (with `handle_updated_at()` trigger, consistent with other tables)

### Indexes
- `idx_reservations_item_id` — unique index on `item_id` (enforces one reservation per item)
- `idx_reservations_list_id` — for querying all reservations on a list
- `idx_reservations_user_id` — for querying a user's reservations (dashboard)
- `idx_reservations_guest_token` — for confirmation/cancel lookups

### RLS Policies
- `SELECT`: `auth.uid() = user_id` — logged-in users can read their own reservations (for dashboard)
- `DELETE`: `auth.uid() = user_id` — logged-in users can cancel their own reservations
- All other access (public page data, guest operations) goes through the service-role client server-side
- Guest operations (create, confirm, cancel) use the service client with server-side validation

### Expiry
Queries filter out expired pending reservations at read time: `WHERE NOT (status = 'pending' AND created_at < now() - interval '24 hours')`. A periodic cleanup (Supabase pg_cron) deletes stale pending rows for hygiene but is not required for correctness.

## Email Infrastructure

### Provider: Resend
- Resend (resend.com) for transactional emails — simple API, good deliverability, free tier sufficient
- Install `resend` npm package
- API key stored in `RESEND_API_KEY` environment variable
- Emails sent from `noreply@podaruj.me` (or configured sender domain)

### Email Sending
- Called directly from server actions via `resend.emails.send()`
- Utility function in `src/lib/email.ts` wrapping the Resend client
- HTML email with inline styles (no external template engine needed)
- Rate limiting: max 5 guest reservations per email address per hour (enforced in server action by counting recent pending reservations for that email)

### Confirmation Email Content
- Subject (i18n): "Confirm your gift reservation on Podaruj.me"
- Body: item name, list name, confirmation button/link, expiry note (24 hours), cancel link
- Locale: sent in the locale the guest was viewing (stored in `reservations.locale`)
- Links:
  - Confirm: `{baseUrl}/{locale}/reservations/confirm/{token}`
  - Cancel: `{baseUrl}/{locale}/reservations/manage/{token}`

## Server Actions

New file: `src/app/[locale]/lists/[slug]/reservation-actions.ts`

### `reserveItem(listSlug, itemId, data)`
- `data`: `{ showName?: boolean }`
- Uses auth-aware client — gets `user_id` from session
- Validates: item exists, belongs to list slug, not already reserved (confirmed or non-expired pending)
- Creates reservation with status = 'confirmed'
- Revalidates public and dashboard paths

### `reserveItemAsGuest(listSlug, itemId, data)`
- `data`: `{ nickname: string, email: string, showName?: boolean, locale: string }`
- Uses service client (guest is not authenticated)
- Validates: item exists, not already reserved, nickname (1-50 chars, sanitized), email (valid format, max 320 chars)
- Rate limit: checks count of pending reservations for this email in last hour (max 5)
- Creates reservation with status = 'pending', `guest_token` = `gen_random_uuid()`
- Sends confirmation email via Resend
- Returns success message (check email)

### `confirmGuestReservation(token)`
- Uses service client
- Looks up reservation by `guest_token` where status = 'pending' and not expired
- Sets status to 'confirmed'
- Revalidates paths (looks up list slug from reservation → item → list)
- Returns success/error/expired

### `cancelReservation(listSlug, itemId)`
- Uses auth-aware client (RLS enforces ownership via `user_id = auth.uid()`)
- Deletes the reservation
- Revalidates paths

### `cancelGuestReservation(token)`
- Uses service client
- Looks up reservation by `guest_token`
- Looks up list slug for path revalidation
- Deletes the reservation
- Revalidates paths

### `getMyReservations()`
- Uses auth-aware client (RLS: `user_id = auth.uid()`)
- Joins with items and lists: item name, price, list name, list slug, occasion, event_date
- Returns grouped-by-list data for dashboard

## Public List Page Changes

### Data Fetching (Server-Side)
The public list page (`/[locale]/lists/[slug]`) already uses the service client. It will now also fetch reservations for the list, but filter based on context:

- **If viewer is the owner:**
  - Buyer's Choice: return reservations, include reserver name only where `show_name = true`
  - Visible: return reservations with all names
  - Full Surprise: return NO reservation data at all
- **If viewer is a guest or non-owner:**
  - Return reservation status (reserved/pending/available) for all items
  - In Visible mode: include reserver names
  - In other modes: just show "Reserved" without names

### Identifying "Your Own" Reservation
- **Logged-in users:** server compares `reservation.user_id` with session user ID
- **Guests:** cannot see "Reserved by you" on the public page after navigating away (known limitation). They manage their reservation via the email link. This is acceptable because the email is the guest's proof of reservation.

### Item Display
- Available: "Reserve" button (enabled)
- Pending (guest hasn't confirmed): "Pending reservation" badge — item not available for others
- Reserved (confirmed): "Reserved" badge
  - If it's the viewer's own reservation (logged-in only): "Reserved by you — Cancel"
  - In Visible mode: show reserver's name/nickname
- Owner in Full Surprise mode: all items show as available (no reservation UI at all), reserve button hidden (owner can't reserve own items)

### Guest Reserve Dialog
A client component dialog that appears when a guest clicks "Reserve":
- Nickname field (required, max 50 chars)
- Email field (required, validated format)
- In Buyer's Choice mode: "Show my name to the list owner" toggle
- Submit → calls `reserveItemAsGuest` server action
- Success message: "Check your email to confirm the reservation"
- Error handling: duplicate reservation, rate limit exceeded, validation errors

### Logged-in Reserve
- In Buyer's Choice mode: a small popover with the "Show my name" toggle + confirm button
- In Visible mode: direct reserve on click (no extra UI)
- In Full Surprise mode: direct reserve on click

## Dashboard "My Reservations" Page

Replace the empty placeholder with real data:

- Fetch all reservations for the logged-in user via `getMyReservations()` (auth-aware client, RLS enforced)
- Join with items and lists to show: item name, list name, occasion, event date
- Group by list
- Each item shows: name, price (if set), priority badge, link to public list page
- "Cancel reservation" button on each item
- Empty state remains if no reservations exist

## Guest Reservation Management Page

New route: `/[locale]/reservations/manage/[token]`

- Uses service client to fetch the single reservation for the given `guest_token`
- Shows: item name, list name, reservation status
- "Cancel reservation" button
- No authentication required — the token in the URL is the auth
- Token is a 128-bit UUID — brute-force infeasible

### Token Security
- Tokens are generated server-side via `gen_random_uuid()` (128-bit entropy)
- Tokens appear in URLs (browser history, logs) — acceptable trade-off for a gift list app (low-stakes data). The worst case of a leaked token is someone cancelling a gift reservation.
- Each token maps to exactly one reservation (not shared across reservations)
- No expiry on management tokens (the reservation itself can be cancelled, making the token useless)

## Guest Confirmation Page

New route: `/[locale]/reservations/confirm/[token]`

- Uses service client to look up reservation by `guest_token`
- If valid pending reservation: confirms it, shows success + link to management page
- If already confirmed: shows "already confirmed" message
- If expired (pending + older than 24h): shows "expired" message
- If not found: shows error

## Abuse Prevention

- **Spam reservations:** Rate limit of 5 pending reservations per email address per hour
- **Blocking items with fake emails:** Pending reservations expire after 24 hours, freeing the item. This is an accepted trade-off — 24h blocking is short enough to not cause real harm on a gift list.
- **Email spam:** Rate limit on `reserveItemAsGuest` prevents using the system to spam someone's inbox
- **Input sanitization:** Nickname and email are validated and sanitized server-side before storage and display

## i18n

New keys needed in both EN and PL for:
- Reserve button states (reserve, reserved, pending, cancel, reservedByYou)
- Guest reserve dialog (nickname, email, show name toggle, submit, success, checkEmail)
- Confirmation page (success, alreadyConfirmed, expired, error)
- Management page (title, cancelButton, cancelled)
- Dashboard reservations page (list grouping, cancel, item details, eventCountdown)
- Email content (subject, body text, confirmButton, cancelLink, expiryNote)
- Error messages (alreadyReserved, rateLimitExceeded, validationErrors)

## Edge Cases

- **Race condition:** Two people try to reserve the same item simultaneously → unique constraint on `item_id` prevents duplicates, second request gets a friendly error message
- **Owner tries to reserve own item:** Prevented — reserve button hidden when `isOwner` is true
- **Pending reservation expires:** Filtered out at read time, item becomes available. Periodic cleanup removes stale rows.
- **Guest reserves, then creates account:** Reservations remain under guest identity (no automatic linking — keep it simple)
- **List deleted while items have reservations:** Cascade delete removes reservations too (FK constraint with ON DELETE CASCADE)
- **Item deleted while reserved:** Cascade delete removes reservation (FK constraint with ON DELETE CASCADE)
- **Privacy mode changed after reservations exist:** Changes apply to display only, existing reservations keep their `show_name` values

## Testing

E2E tests with Playwright covering:
- Logged-in user reserves and cancels an item
- Guest reserves (enters nickname + email) — verify pending state shown
- Guest confirms via token URL — verify confirmed state
- Guest cancels via management URL
- Privacy modes: verify owner sees correct info per mode
- Full Surprise: verify owner sees zero reservation hints
- Buyer's Choice: verify show_name toggle works
- Visible: verify names shown to everyone
- Double reserve attempt shows error
- Dashboard "My Reservations" shows real data and cancel works
- Rate limiting on guest reservations
