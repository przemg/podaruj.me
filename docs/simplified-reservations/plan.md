# Simplified Reservations Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove email verification from guest reservations — guests enter nickname and confirm instantly. Remove Resend dependency and all token/confirmation pages.

**Architecture:** Simplify the existing reservation flow by removing the guest email/token/status pipeline. Guest reservations become instant (like logged-in user flow but with `guest_nickname` instead of `user_id`). Remove all Resend code, confirmation/management pages, and pending status logic.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Supabase, Tailwind CSS, shadcn/ui, next-intl

---

## File Structure

**Delete:**
- `src/lib/email.ts` — Resend email client
- `src/app/[locale]/reservations/` — entire directory (layout, confirm, manage pages)

**Modify:**
- `src/app/[locale]/lists/[slug]/reservation-actions.ts` — remove guest email/token actions, simplify
- `src/components/public/guest-reserve-dialog.tsx` — remove email field, add "can't undo" notice
- `src/components/public/reserve-button.tsx` — remove pending state
- `src/app/[locale]/lists/[slug]/page.tsx` — remove pending logic from ReservationInfo
- `messages/en.json` — remove email/pending/confirmation keys, add guest notice keys
- `messages/pl.json` — same
- `e2e/reservations.spec.ts` — remove confirmation/management tests, update dialog tests
- `package.json` — remove resend dependency
- `PROJECT.md` — update access model

**Create:**
- `supabase/migrations/2026XXXX_simplify_reservations.sql` — drop columns

---

## Chunk 1: Database & Backend

### Task 1: Create migration to drop unused columns

**Files:**
- Create: `supabase/migrations/20260314120000_simplify_reservations.sql`

- [ ] **Step 1: Write the migration**

```sql
-- Drop columns no longer needed after removing email verification flow
ALTER TABLE public.reservations
  DROP COLUMN IF EXISTS guest_email,
  DROP COLUMN IF EXISTS guest_token,
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS locale;

-- Drop the index that referenced guest_token (auto-dropped with column, but explicit for clarity)
DROP INDEX IF EXISTS idx_reservations_guest_token;
```

- [ ] **Step 2: Apply the migration**

Run: `npx supabase db push` or apply via Supabase MCP tool.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260314120000_simplify_reservations.sql
git commit -m "feat: add migration to drop guest_email, guest_token, status, locale columns"
```

### Task 2: Simplify reservation-actions.ts

**Files:**
- Modify: `src/app/[locale]/lists/[slug]/reservation-actions.ts`
- Delete: `src/lib/email.ts`

- [ ] **Step 1: Rewrite reservation-actions.ts**

Remove:
- `import { sendConfirmationEmail }` (line 5)
- `ConfirmStatus` type (line 8)
- `confirmStatus` from `ReservationActionResult` (line 13)
- `validateGuestData` — rewrite to only validate nickname (remove email validation, lines 18-30)
- `isItemAvailable` — simplify to just check if row exists (remove pending/expiry logic, lines 39-63)
- `reserveItem` — remove `status: "confirmed"` from insert (line 109)
- `reserveItemAsGuest` — rewrite completely: no email, no token, no rate limiting, no sendConfirmationEmail (lines 125-209)
- `confirmGuestReservation` — delete entirely (lines 213-263)
- `cancelGuestReservation` — delete entirely (lines 292-324)
- `getMyReservations` — remove `.eq("status", "confirmed")` filter (line 362)

New `reserveItemAsGuest`:
```typescript
export async function reserveItemAsGuest(
  listSlug: string,
  itemId: string,
  data: { nickname: string; showName?: boolean }
): Promise<ReservationActionResult> {
  const nickname = data.nickname?.trim();
  if (!nickname || nickname.length === 0) return { error: "Nickname is required" };
  if (nickname.length > 50) return { error: "Nickname must be 50 characters or less" };

  const serviceClient = createServiceClient();

  const { data: item } = await serviceClient
    .from("items")
    .select("id, list_id")
    .eq("id", itemId)
    .single();

  if (!item) return { error: "Item not found" };

  const { data: list } = await serviceClient
    .from("lists")
    .select("id, slug")
    .eq("slug", listSlug)
    .single();

  if (!list || item.list_id !== list.id)
    return { error: "Item does not belong to this list" };

  if (!(await isItemAvailable(serviceClient, itemId)))
    return { error: "This item is already reserved" };

  const { error: dbError } = await serviceClient
    .from("reservations")
    .insert({
      item_id: itemId,
      list_id: list.id,
      guest_nickname: nickname,
      show_name: data.showName ?? true,
    });

  if (dbError) {
    if (dbError.code === "23505")
      return { error: "This item was just reserved by someone else" };
    return { error: "Failed to reserve item" };
  }

  revalidateReservationPaths("en", listSlug);
  revalidateReservationPaths("pl", listSlug);
  return {};
}
```

New `isItemAvailable`:
```typescript
async function isItemAvailable(
  supabase: ReturnType<typeof createServiceClient>,
  itemId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("reservations")
    .select("id")
    .eq("item_id", itemId)
    .single();

  return !data;
}
```

New `ReservationActionResult` (remove `confirmStatus`):
```typescript
export type ReservationActionResult = {
  error?: string;
  success?: string;
};
```

In `reserveItem`, remove `status: "confirmed"` from the insert object (line 109).

In `getMyReservations`, remove `.eq("status", "confirmed")` (line 362).

- [ ] **Step 2: Delete src/lib/email.ts**

- [ ] **Step 3: Uninstall resend package**

Run: `npm uninstall resend`

- [ ] **Step 4: Verify TypeScript compiles (skip full build — pages referencing deleted code will break until Tasks 3-6)**

Run: `npx tsc --noEmit 2>&1 | head -20` — note errors are expected from files that still reference `status`, `ConfirmStatus`, or deleted pages. These are fixed in subsequent tasks.

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/lists/[slug]/reservation-actions.ts package.json package-lock.json
git add -u src/lib/email.ts
git commit -m "feat: simplify reservation actions — remove email verification, tokens, pending status"
```

---

## Chunk 2: Frontend Components & Pages

### Task 3: Simplify public list page (ReservationInfo type + data fetching)

**Files:**
- Modify: `src/app/[locale]/lists/[slug]/page.tsx`

- [ ] **Step 1: Update ReservationInfo type**

Change from:
```typescript
export type ReservationInfo = {
  status: "available" | "pending" | "reserved";
  isOwnReservation: boolean;
  reserverName?: string | null;
};
```
To:
```typescript
export type ReservationInfo = {
  status: "available" | "reserved";
  isOwnReservation: boolean;
  reserverName?: string | null;
};
```

- [ ] **Step 2: Simplify getReservationsForList**

Remove:
- `twentyFourHoursAgo` calculation (line 53)
- The complex `.or()` filter with pending/confirmed status (line 60) — replace with simple `.eq("list_id", listId)`
- `status` from the `.select()` (line 58)
- The pending→reserved status mapping (line 69) — all reservations are "reserved"

New select:
```typescript
const { data: reservations } = await supabase
  .from("reservations")
  .select("item_id, user_id, guest_nickname, show_name")
  .eq("list_id", listId);
```

New map loop body (replace line 69):
```typescript
const status = "reserved" as const;
```

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/lists/[slug]/page.tsx
git commit -m "feat: simplify ReservationInfo — remove pending status from public list page"
```

### Task 4: Update reserve-button.tsx — remove pending state

**Files:**
- Modify: `src/components/public/reserve-button.tsx`

- [ ] **Step 1: Remove pending badge block**

Delete lines 35-43 (the entire `if (reservation.status === "pending")` block).

- [ ] **Step 2: Commit**

```bash
git add src/components/public/reserve-button.tsx
git commit -m "feat: remove pending reservation state from reserve button"
```

### Task 5: Rewrite guest-reserve-dialog.tsx

**Files:**
- Modify: `src/components/public/guest-reserve-dialog.tsx`

- [ ] **Step 1: Remove email-related code**

Remove:
- `email` state variable (line 40)
- `successEmail` state variable (line 42)
- `setEmail("")` in handleOpenChange (line 49)
- `setSuccessEmail(null)` in handleOpenChange (line 51)
- `email: email.trim()` from reserveItemAsGuest call (line 64)
- `locale` from reserveItemAsGuest call (line 66)
- `setSuccessEmail(email.trim())` in success handler (line 72) — replace with close-on-success
- `email` from disabled check on submit button (line 195)
- Entire email input field block (lines 136-153)
- Success state block with "Check your email" (lines 87-109) — replace with auto-close

Update imports: keep `useLocale` (needed for sign-in link), remove `CheckCircle2` from lucide import (line 6).

Update `reserveItemAsGuest` call to new signature:
```typescript
const result = await reserveItemAsGuest(listSlug, itemId, {
  nickname: nickname.trim(),
  showName,
});
```

On success, close the dialog:
```typescript
if (result.error) {
  setError(result.error);
} else {
  handleOpenChange(false);
}
```

- [ ] **Step 2: Add "can't be undone" notice with sign-in link**

Add below the show_name toggle (or below nickname if not buyers_choice mode):
```tsx
{/* Guest notice */}
<p className="text-xs text-landing-text-muted">
  {t("guestDialog.guestNotice")}{" "}
  <a
    href={`/${locale}/auth/sign-in`}
    className="font-medium text-landing-coral hover:text-landing-coral-dark"
  >
    {t("guestDialog.createAccount")}
  </a>
</p>
```

- [ ] **Step 3: Update submit button disabled state**

Change from:
```tsx
disabled={isPending || !nickname.trim() || !email.trim()}
```
To:
```tsx
disabled={isPending || !nickname.trim()}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/public/guest-reserve-dialog.tsx
git commit -m "feat: simplify guest dialog — remove email, add can't-undo notice with sign-in link"
```

### Task 6: Delete reservation confirmation and management pages

**Files:**
- Delete: `src/app/[locale]/reservations/` (entire directory)

- [ ] **Step 1: Delete the reservations directory**

```bash
rm -rf src/app/\[locale\]/reservations/
```

This removes:
- `layout.tsx`
- `confirm/[token]/page.tsx`
- `manage/[token]/page.tsx`
- `manage/[token]/manage-reservation-card.tsx`

- [ ] **Step 2: Commit**

```bash
git add -u src/app/[locale]/reservations/
git commit -m "feat: remove reservation confirmation and management pages"
```

---

## Chunk 3: i18n, Tests, Docs

### Task 7: Update i18n translations

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/pl.json`

- [ ] **Step 1: Update en.json**

In `public` section:
- Remove `pendingBadge` key (line 304)
- Remove from `guestDialog`: `emailLabel`, `emailPlaceholder`, `emailHelp`, `successTitle`, `successMessage` keys
- Also remove `errorRateLimit` (rate limiting is removed)
- Keep: `title`, `nicknameLabel`, `nicknamePlaceholder`, `submitButton`, `submitting`, `errorAlreadyReserved`, `closeButton`
- Add to `guestDialog`:
  - `"guestNotice": "This reservation cannot be undone without an account."`
  - `"createAccount": "Create an account"`

Remove entire `reservations` section (lines 334-362 — `confirm.*` and `manage.*` keys).

- [ ] **Step 2: Update pl.json with same changes**

In `public` section:
- Remove `pendingBadge`
- Remove from `guestDialog`: `emailLabel`, `emailPlaceholder`, `emailHelp`, `successTitle`, `successMessage`
- Add to `guestDialog`:
  - `"guestNotice": "Ta rezerwacja nie może być cofnięta bez konta."`
  - `"createAccount": "Załóż konto"`

Remove entire `reservations` section.

- [ ] **Step 3: Commit**

```bash
git add messages/en.json messages/pl.json
git commit -m "feat: update i18n — remove email/pending/confirmation keys, add guest notice"
```

### Task 8: Update E2E tests

**Files:**
- Modify: `e2e/reservations.spec.ts`

- [ ] **Step 1: Remove tests for deleted pages**

Delete these test.describe blocks:
- "Confirmation page" (lines 216-242)
- "Management page" (lines 246-272)
- "Management page with valid reservation" (lines 318-364)
- "Confirmation page with confirmed reservation" (lines 368-403)
- "Reservations layout" (lines 421-444)

- [ ] **Step 2: Remove seedConfirmedReservation helper changes**

Update `seedConfirmedReservation` (lines 78-100):
- Remove `guest_email` from insert (line 89)
- Remove `status: "confirmed"` from insert (line 92)
- Remove `.select("guest_token")` (line 94)
- Change return type from `string` to `void`
- Remove the `return reservation.guest_token` line

New version:
```typescript
async function seedReservation(
  listId: string,
  itemId: string
): Promise<void> {
  const supabase = getServiceClient();

  const { error } = await supabase
    .from("reservations")
    .insert({
      item_id: itemId,
      list_id: listId,
      guest_nickname: "E2E Tester",
      show_name: true,
    });

  if (error) throw new Error(`Failed to seed reservation: ${error.message}`);
}
```

- [ ] **Step 3: Update "Guest reserve dialog" tests**

Update "opens dialog with nickname and email fields" test (lines 168-181):
- Remove the `#guest-email` assertion (line 180)
- Rename test to "opens dialog with nickname field on Reserve click"

Update "dialog submit button is disabled when fields are empty" test — no change needed (still checks disabled state).

- [ ] **Step 4: Update Full Surprise test to use new seedReservation**

Update beforeAll (line 281):
```typescript
await seedReservation(listId, itemId);
```
(was `await seedConfirmedReservation(...)`)

- [ ] **Step 5: Commit**

```bash
git add e2e/reservations.spec.ts
git commit -m "test: update E2E tests — remove confirmation/management page tests, simplify seeding"
```

### Task 9: Update PROJECT.md

**Files:**
- Modify: `PROJECT.md`

- [ ] **Step 1: Update Access Model section**

In "Link / QR invitation" (lines 57-63), change step 3 from:
```
3. Guest enters a nickname when reserving
4. Soft prompt: "Create an account for easier access next time"
```
To:
```
3. Guest enters a nickname when reserving — reservation is instant
4. Guest is prompted to create an account to manage reservations later
```

In Permissions table (lines 65-72), update:
```
| Cancel reservation  | ✅ (own only)    | ❌ (requires account) |
```

- [ ] **Step 2: Update Reservations feature list**

Change line 88 from:
```
- Guest reservation with email confirmation ✅
```
To:
```
- Instant guest reservation with nickname ✅
```

- [ ] **Step 3: Commit**

```bash
git add PROJECT.md
git commit -m "docs: update PROJECT.md — reflect simplified guest reservation flow"
```

### Task 10: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Remove Resend/email references**

Remove from folder structure:
- `email.ts` line under `lib/`

Update reservations table description:
- Remove "guest tokens, status (pending/confirmed)" — change to just "guest nickname for anonymous reservations"

Remove from reservation actions description any mention of email confirmation.

Remove `/reservations/` routes from folder structure.

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md — remove Resend/email/token references"
```

### Task 11: Run linter, type check, and E2E tests

- [ ] **Step 1: Run type check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Expected: no errors

- [ ] **Step 3: Run E2E tests**

Run: `npx playwright test e2e/reservations.spec.ts`
Expected: all tests pass

- [ ] **Step 4: Run full E2E suite**

Run: `npx playwright test`
Expected: all tests pass
