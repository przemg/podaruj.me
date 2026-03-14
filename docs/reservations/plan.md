# Reservations Feature Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add gift reservation functionality with three privacy modes, guest email confirmation, and a dashboard "My Reservations" page.

**Architecture:** New `reservations` table in Supabase with RLS. Server actions handle all mutations (service client for guest ops, auth client for logged-in users). Public list page fetches reservation data server-side and filters based on privacy mode and viewer identity. Guest confirmation/management via token-based URLs. Emails sent via Resend.

**Tech Stack:** Next.js 16 (App Router), Supabase (Postgres), TypeScript, Tailwind + shadcn/ui, next-intl, Resend (email), Playwright (E2E tests)

---

## File Structure

### New Files
- `supabase/migrations/20260315000000_create_reservations.sql` — reservations table, RLS, indexes
- `src/lib/email.ts` — Resend email client wrapper
- `src/app/[locale]/lists/[slug]/reservation-actions.ts` — server actions for reserve/cancel/confirm
- `src/components/public/reserve-button.tsx` — client component: Reserve/Reserved button with state
- `src/components/public/guest-reserve-dialog.tsx` — dialog for guest nickname + email + show_name toggle
- `src/components/public/reserve-popover.tsx` — popover for logged-in Buyer's Choice toggle
- `src/app/[locale]/reservations/confirm/[token]/page.tsx` — guest confirmation page
- `src/app/[locale]/reservations/manage/[token]/page.tsx` — guest cancellation page
- `src/app/[locale]/reservations/layout.tsx` — shared layout for reservation token pages
- `src/components/dashboard/reservation-card.tsx` — card for dashboard "My Reservations"
- `e2e/reservations.spec.ts` — E2E tests for reservation flows

### Modified Files
- `src/app/[locale]/lists/[slug]/page.tsx` — fetch reservation data, pass to cards
- `src/components/public/public-gift-card.tsx` — accept reservation props, render reserve button
- `src/app/[locale]/dashboard/reservations/page.tsx` — replace empty state with real data
- `messages/en.json` — new i18n keys for reservations
- `messages/pl.json` — Polish translations
- `package.json` — add `resend` dependency
- `PROJECT.md` — mark reservations as implemented
- `CLAUDE.md` — update architecture docs (database tables, folder structure, public page notes)

### Prerequisites
- Branch `feature/reservations` must be created from `master` before starting (already created)

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260315000000_create_reservations.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- Create reservations table
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.items(id) on delete cascade not null,
  list_id uuid references public.lists(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  guest_email varchar(320),
  guest_nickname varchar(50),
  guest_token uuid default gen_random_uuid(),
  show_name boolean not null default true,
  status varchar(20) not null default 'confirmed' check (status in ('pending', 'confirmed')),
  locale varchar(5) not null default 'en',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Updated_at trigger (reuses handle_updated_at from profiles migration)
create trigger on_reservations_updated
  before update on public.reservations
  for each row
  execute function public.handle_updated_at();

-- Enable RLS
alter table public.reservations enable row level security;

-- RLS: logged-in users can read their own reservations (for dashboard)
create policy "Users can view own reservations"
  on public.reservations for select
  using (auth.uid() = user_id);

-- RLS: logged-in users can delete their own reservations (cancel)
create policy "Users can delete own reservations"
  on public.reservations for delete
  using (auth.uid() = user_id);

-- Indexes
create unique index idx_reservations_item_id on public.reservations(item_id);
create index idx_reservations_list_id on public.reservations(list_id);
create index idx_reservations_user_id on public.reservations(user_id);
create index idx_reservations_guest_token on public.reservations(guest_token);
```

- [ ] **Step 2: Apply migration to Supabase**

Run: `npx supabase db push` (or apply via Supabase dashboard if using hosted project)

Verify: table `reservations` appears in schema with all columns, RLS enabled, indexes created.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260315000000_create_reservations.sql
git commit -m "feat(db): add reservations table with RLS and indexes"
```

---

## Task 2: Install Resend & Email Utility

**Files:**
- Modify: `package.json` (add resend dependency)
- Create: `src/lib/email.ts`

- [ ] **Step 1: Install resend package**

Run: `npm install resend`

- [ ] **Step 2: Create email utility**

Create `src/lib/email.ts`:

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || "Podaruj.me <noreply@podaruj.me>";

type SendConfirmationEmailParams = {
  to: string;
  itemName: string;
  listName: string;
  confirmUrl: string;
  manageUrl: string;
  locale: string;
};

export async function sendConfirmationEmail({
  to,
  itemName,
  listName,
  confirmUrl,
  manageUrl,
  locale,
}: SendConfirmationEmailParams) {
  const isPl = locale === "pl";

  const subject = isPl
    ? "Potwierdź rezerwację prezentu na Podaruj.me"
    : "Confirm your gift reservation on Podaruj.me";

  const html = buildConfirmationHtml({
    itemName,
    listName,
    confirmUrl,
    manageUrl,
    isPl,
  });

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });
}

function buildConfirmationHtml({
  itemName,
  listName,
  confirmUrl,
  manageUrl,
  isPl,
}: {
  itemName: string;
  listName: string;
  confirmUrl: string;
  manageUrl: string;
  isPl: boolean;
}) {
  const heading = isPl
    ? "Potwierdź swoją rezerwację"
    : "Confirm your reservation";
  const body = isPl
    ? `Zarezerwowałeś(aś) <strong>${escapeHtml(itemName)}</strong> z listy <strong>${escapeHtml(listName)}</strong>.`
    : `You reserved <strong>${escapeHtml(itemName)}</strong> from the list <strong>${escapeHtml(listName)}</strong>.`;
  const confirmLabel = isPl ? "Potwierdź rezerwację" : "Confirm reservation";
  const cancelLabel = isPl ? "Anuluj rezerwację" : "Cancel reservation";
  const expiry = isPl
    ? "Ten link wygasa za 24 godziny."
    : "This link expires in 24 hours.";

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
      <h2 style="color: #1a1a1a; margin-bottom: 16px;">${heading}</h2>
      <p style="line-height: 1.6; margin-bottom: 20px;">${body}</p>
      <a href="${confirmUrl}" style="display: inline-block; background: #e8816d; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-bottom: 12px;">${confirmLabel}</a>
      <p style="margin-top: 16px; font-size: 14px; color: #666;">${expiry}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="font-size: 13px; color: #999;">
        <a href="${manageUrl}" style="color: #e8816d;">${cancelLabel}</a>
      </p>
    </body>
    </html>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
```

- [ ] **Step 3: Add env variables to `.env.local`**

```
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=Podaruj.me <noreply@podaruj.me>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

(Also add `RESEND_API_KEY`, `EMAIL_FROM`, and `NEXT_PUBLIC_SITE_URL` to Vercel environment variables for production, with production URL for `NEXT_PUBLIC_SITE_URL`)

- [ ] **Step 4: Commit**

```bash
git add src/lib/email.ts package.json package-lock.json
git commit -m "feat: add Resend email utility for reservation confirmation"
```

---

## Task 3: Reservation Server Actions

**Files:**
- Create: `src/app/[locale]/lists/[slug]/reservation-actions.ts`

- [ ] **Step 1: Create reservation server actions**

Create `src/app/[locale]/lists/[slug]/reservation-actions.ts`:

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendConfirmationEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

export type ReservationActionResult = {
  error?: string;
  success?: string;
};

// ── Validation ─────────────────────────────────────────────────────

function validateGuestData(data: {
  nickname: string;
  email: string;
}): string | null {
  if (!data.nickname || data.nickname.trim().length === 0)
    return "Nickname is required";
  if (data.nickname.length > 50)
    return "Nickname must be 50 characters or less";
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    return "Valid email is required";
  if (data.email.length > 320) return "Email is too long";
  return null;
}

// ── Helpers ────────────────────────────────────────────────────────

function revalidateReservationPaths(locale: string, listSlug: string) {
  revalidatePath(`/${locale}/lists/${listSlug}`);
  revalidatePath(`/${locale}/dashboard/reservations`);
}

async function isItemAvailable(
  supabase: ReturnType<typeof createServiceClient>,
  itemId: string
): Promise<boolean> {
  // Check for existing confirmed reservation or non-expired pending
  const { data } = await supabase
    .from("reservations")
    .select("id, status, created_at")
    .eq("item_id", itemId)
    .single();

  if (!data) return true;

  // If pending and expired (>24h), it's available
  if (data.status === "pending") {
    const created = new Date(data.created_at);
    const now = new Date();
    const hoursElapsed =
      (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    if (hoursElapsed > 24) {
      // Clean up expired reservation
      await supabase.from("reservations").delete().eq("id", data.id);
      return true;
    }
  }

  return false;
}

// ── Reserve (logged-in user) ───────────────────────────────────────

export async function reserveItem(
  listSlug: string,
  itemId: string,
  data: { showName?: boolean }
): Promise<ReservationActionResult> {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const serviceClient = createServiceClient();

  // Verify item belongs to list
  const { data: item } = await serviceClient
    .from("items")
    .select("id, list_id")
    .eq("id", itemId)
    .single();

  if (!item) return { error: "Item not found" };

  const { data: list } = await serviceClient
    .from("lists")
    .select("id, slug, user_id")
    .eq("slug", listSlug)
    .single();

  if (!list || item.list_id !== list.id)
    return { error: "Item does not belong to this list" };

  // Prevent owner from reserving own items
  if (list.user_id === user.id) return { error: "Cannot reserve your own item" };

  // Check availability
  if (!(await isItemAvailable(serviceClient, itemId)))
    return { error: "This item is already reserved" };

  // Create reservation
  const { error: dbError } = await serviceClient
    .from("reservations")
    .insert({
      item_id: itemId,
      list_id: list.id,
      user_id: user.id,
      show_name: data.showName ?? true,
      status: "confirmed",
    });

  if (dbError) {
    // Unique constraint violation = race condition
    if (dbError.code === "23505")
      return { error: "This item was just reserved by someone else" };
    return { error: "Failed to reserve item" };
  }

  revalidateReservationPaths("en", listSlug);
  revalidateReservationPaths("pl", listSlug);
  return {};
}

// ── Reserve (guest) ────────────────────────────────────────────────

export async function reserveItemAsGuest(
  listSlug: string,
  itemId: string,
  data: { nickname: string; email: string; showName?: boolean; locale: string }
): Promise<ReservationActionResult> {
  const validationError = validateGuestData(data);
  if (validationError) return { error: validationError };

  const serviceClient = createServiceClient();

  // Verify item belongs to list
  const { data: item } = await serviceClient
    .from("items")
    .select("id, name, list_id")
    .eq("id", itemId)
    .single();

  if (!item) return { error: "Item not found" };

  const { data: list } = await serviceClient
    .from("lists")
    .select("id, slug, name")
    .eq("slug", listSlug)
    .single();

  if (!list || item.list_id !== list.id)
    return { error: "Item does not belong to this list" };

  // Rate limit: max 5 pending reservations per email per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await serviceClient
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("guest_email", data.email.trim().toLowerCase())
    .eq("status", "pending")
    .gte("created_at", oneHourAgo);

  if (count !== null && count >= 5)
    return { error: "Too many pending reservations. Please try again later." };

  // Check availability
  if (!(await isItemAvailable(serviceClient, itemId)))
    return { error: "This item is already reserved" };

  // Create pending reservation
  const { data: reservation, error: dbError } = await serviceClient
    .from("reservations")
    .insert({
      item_id: itemId,
      list_id: list.id,
      guest_email: data.email.trim().toLowerCase(),
      guest_nickname: data.nickname.trim(),
      show_name: data.showName ?? true,
      status: "pending",
      locale: data.locale,
    })
    .select("guest_token")
    .single();

  if (dbError) {
    if (dbError.code === "23505")
      return { error: "This item was just reserved by someone else" };
    return { error: "Failed to reserve item" };
  }

  // Send confirmation email
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://podaruj.me";
  const token = reservation.guest_token;

  try {
    await sendConfirmationEmail({
      to: data.email.trim(),
      itemName: item.name,
      listName: list.name,
      confirmUrl: `${baseUrl}/${data.locale}/reservations/confirm/${token}`,
      manageUrl: `${baseUrl}/${data.locale}/reservations/manage/${token}`,
      locale: data.locale,
    });
  } catch {
    // If email fails, delete the reservation so user can retry
    await serviceClient
      .from("reservations")
      .delete()
      .eq("guest_token", token);
    return { error: "Failed to send confirmation email. Please try again." };
  }

  revalidateReservationPaths("en", listSlug);
  revalidateReservationPaths("pl", listSlug);
  return { success: "Check your email to confirm the reservation" };
}

// ── Confirm guest reservation ──────────────────────────────────────

export async function confirmGuestReservation(
  token: string
): Promise<ReservationActionResult> {
  const serviceClient = createServiceClient();

  const { data: reservation } = await serviceClient
    .from("reservations")
    .select("id, status, created_at, list_id")
    .eq("guest_token", token)
    .single();

  if (!reservation) return { error: "Reservation not found" };

  if (reservation.status === "confirmed")
    return { success: "Already confirmed" };

  // Check expiry (24 hours) — only applies to pending reservations
  if (reservation.status === "pending") {
    const created = new Date(reservation.created_at);
    const now = new Date();
    const hoursElapsed =
      (now.getTime() - created.getTime()) / (1000 * 60 * 60);

    if (hoursElapsed > 24) {
      await serviceClient
        .from("reservations")
        .delete()
        .eq("id", reservation.id);
      return { error: "This reservation has expired" };
    }
  }

  // Confirm
  const { error: dbError } = await serviceClient
    .from("reservations")
    .update({ status: "confirmed" })
    .eq("id", reservation.id);

  if (dbError) return { error: "Failed to confirm reservation" };

  // Look up list slug for revalidation
  const { data: list } = await serviceClient
    .from("lists")
    .select("slug")
    .eq("id", reservation.list_id)
    .single();

  if (list) {
    revalidateReservationPaths("en", list.slug);
    revalidateReservationPaths("pl", list.slug);
  }

  return { success: "Reservation confirmed!" };
}

// ── Cancel (logged-in user) ────────────────────────────────────────

export async function cancelReservation(
  listSlug: string,
  itemId: string
): Promise<ReservationActionResult> {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Use auth client — RLS ensures only own reservations
  const { error: dbError } = await authClient
    .from("reservations")
    .delete()
    .eq("item_id", itemId)
    .eq("user_id", user.id);

  if (dbError) return { error: "Failed to cancel reservation" };

  revalidateReservationPaths("en", listSlug);
  revalidateReservationPaths("pl", listSlug);
  return {};
}

// ── Cancel (guest) ─────────────────────────────────────────────────

export async function cancelGuestReservation(
  token: string
): Promise<ReservationActionResult> {
  const serviceClient = createServiceClient();

  // Look up reservation to get list slug for revalidation
  const { data: reservation } = await serviceClient
    .from("reservations")
    .select("id, list_id")
    .eq("guest_token", token)
    .single();

  if (!reservation) return { error: "Reservation not found" };

  const { error: dbError } = await serviceClient
    .from("reservations")
    .delete()
    .eq("id", reservation.id);

  if (dbError) return { error: "Failed to cancel reservation" };

  // Revalidate paths
  const { data: list } = await serviceClient
    .from("lists")
    .select("slug")
    .eq("id", reservation.list_id)
    .single();

  if (list) {
    revalidateReservationPaths("en", list.slug);
    revalidateReservationPaths("pl", list.slug);
  }

  return { success: "Reservation cancelled" };
}

// ── Get my reservations (dashboard) ────────────────────────────────

export type MyReservation = {
  id: string;
  itemId: string;
  itemName: string;
  itemPrice: number | null;
  itemPriority: string;
  listName: string;
  listSlug: string;
  listOccasion: string;
  listEventDate: string | null;
  showName: boolean;
  createdAt: string;
};

export async function getMyReservations(): Promise<MyReservation[]> {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) return [];

  // Use service client to join across tables (RLS on items/lists would block)
  const serviceClient = createServiceClient();

  const { data: reservations } = await serviceClient
    .from("reservations")
    .select(`
      id,
      item_id,
      show_name,
      created_at,
      items!inner (name, price, priority),
      lists!inner (name, slug, occasion, event_date)
    `)
    .eq("user_id", user.id)
    .eq("status", "confirmed")
    .order("created_at", { ascending: false });

  if (!reservations) return [];

  return reservations.map((r: Record<string, unknown>) => {
    const item = r.items as Record<string, unknown>;
    const list = r.lists as Record<string, unknown>;
    return {
      id: r.id as string,
      itemId: r.item_id as string,
      itemName: item.name as string,
      itemPrice: item.price as number | null,
      itemPriority: item.priority as string,
      listName: list.name as string,
      listSlug: list.slug as string,
      listOccasion: list.occasion as string,
      listEventDate: list.event_date as string | null,
      showName: r.show_name as boolean,
      createdAt: r.created_at as string,
    };
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/lists/[slug]/reservation-actions.ts
git commit -m "feat: add reservation server actions (reserve, cancel, confirm, getMyReservations)"
```

---

## Task 4: i18n — Add Reservation Translation Keys

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/pl.json`

- [ ] **Step 1: Add English i18n keys**

Add to `messages/en.json` under `"public"`:

```json
"reserveButton": "Reserve",
"reservedBadge": "Reserved",
"reservedByYou": "Reserved by you",
"pendingBadge": "Pending reservation",
"cancelReservation": "Cancel",
"reserveConfirm": "Confirm reservation",
"showNameToggle": "Show my name to the list owner",
"guestDialog": {
  "title": "Reserve this gift",
  "nicknameLabel": "Your nickname",
  "nicknamePlaceholder": "e.g. John",
  "emailLabel": "Your email",
  "emailPlaceholder": "your@email.com",
  "emailHelp": "We'll send a confirmation link to this email",
  "submitButton": "Reserve",
  "submitting": "Reserving...",
  "successTitle": "Check your email!",
  "successMessage": "We sent a confirmation link to {email}. Click it to confirm your reservation.",
  "errorAlreadyReserved": "This item is already reserved",
  "errorRateLimit": "Too many reservations. Please try again later."
}
```

Add new top-level `"reservations"` section for confirmation/management pages:

```json
"reservations": {
  "confirm": {
    "pageTitle": "Confirm Reservation — Podaruj.me",
    "successTitle": "Reservation confirmed!",
    "successMessage": "Your reservation for \"{itemName}\" has been confirmed.",
    "alreadyConfirmedTitle": "Already confirmed",
    "alreadyConfirmedMessage": "This reservation was already confirmed.",
    "expiredTitle": "Reservation expired",
    "expiredMessage": "This reservation has expired. The item is available for others to reserve.",
    "errorTitle": "Reservation not found",
    "errorMessage": "This reservation link is invalid or has been cancelled.",
    "manageLink": "Manage your reservation"
  },
  "manage": {
    "pageTitle": "Manage Reservation — Podaruj.me",
    "title": "Your reservation",
    "itemLabel": "Gift",
    "listLabel": "From list",
    "statusLabel": "Status",
    "statusConfirmed": "Confirmed",
    "statusPending": "Pending confirmation",
    "cancelButton": "Cancel reservation",
    "cancelling": "Cancelling...",
    "cancelledTitle": "Reservation cancelled",
    "cancelledMessage": "Your reservation has been cancelled. The item is now available for others.",
    "notFoundTitle": "Reservation not found",
    "notFoundMessage": "This reservation link is invalid or has already been cancelled."
  }
}
```

Add to `"dashboard.reservations"`:

```json
"cancelButton": "Cancel",
"cancelling": "Cancelling...",
"listLabel": "List",
"viewList": "View list",
"reservedOn": "Reserved on {date}"
```

- [ ] **Step 2: Add Polish i18n keys**

Add matching keys to `messages/pl.json` under `"public"`:

```json
"reserveButton": "Zarezerwuj",
"reservedBadge": "Zarezerwowane",
"reservedByYou": "Zarezerwowane przez Ciebie",
"pendingBadge": "Rezerwacja w toku",
"cancelReservation": "Anuluj",
"reserveConfirm": "Potwierdź rezerwację",
"showNameToggle": "Pokaż moje imię właścicielowi listy",
"guestDialog": {
  "title": "Zarezerwuj ten prezent",
  "nicknameLabel": "Twój pseudonim",
  "nicknamePlaceholder": "np. Jan",
  "emailLabel": "Twój email",
  "emailPlaceholder": "twoj@email.com",
  "emailHelp": "Wyślemy link potwierdzający na ten adres",
  "submitButton": "Zarezerwuj",
  "submitting": "Rezerwowanie...",
  "successTitle": "Sprawdź swoją skrzynkę!",
  "successMessage": "Wysłaliśmy link potwierdzający na {email}. Kliknij go, aby potwierdzić rezerwację.",
  "errorAlreadyReserved": "Ten prezent jest już zarezerwowany",
  "errorRateLimit": "Za dużo rezerwacji. Spróbuj ponownie później."
}
```

Add `"reservations"` section (Polish):

```json
"reservations": {
  "confirm": {
    "pageTitle": "Potwierdź rezerwację — Podaruj.me",
    "successTitle": "Rezerwacja potwierdzona!",
    "successMessage": "Twoja rezerwacja \"{itemName}\" została potwierdzona.",
    "alreadyConfirmedTitle": "Już potwierdzone",
    "alreadyConfirmedMessage": "Ta rezerwacja została już potwierdzona.",
    "expiredTitle": "Rezerwacja wygasła",
    "expiredMessage": "Ta rezerwacja wygasła. Prezent jest dostępny dla innych.",
    "errorTitle": "Rezerwacja nie znaleziona",
    "errorMessage": "Ten link rezerwacji jest nieprawidłowy lub został anulowany.",
    "manageLink": "Zarządzaj rezerwacją"
  },
  "manage": {
    "pageTitle": "Zarządzaj rezerwacją — Podaruj.me",
    "title": "Twoja rezerwacja",
    "itemLabel": "Prezent",
    "listLabel": "Z listy",
    "statusLabel": "Status",
    "statusConfirmed": "Potwierdzone",
    "statusPending": "Oczekuje na potwierdzenie",
    "cancelButton": "Anuluj rezerwację",
    "cancelling": "Anulowanie...",
    "cancelledTitle": "Rezerwacja anulowana",
    "cancelledMessage": "Twoja rezerwacja została anulowana. Prezent jest teraz dostępny dla innych.",
    "notFoundTitle": "Rezerwacja nie znaleziona",
    "notFoundMessage": "Ten link rezerwacji jest nieprawidłowy lub został już anulowany."
  }
}
```

Add to `"dashboard.reservations"`:

```json
"cancelButton": "Anuluj",
"cancelling": "Anulowanie...",
"listLabel": "Lista",
"viewList": "Zobacz listę",
"reservedOn": "Zarezerwowano {date}"
```

- [ ] **Step 3: Commit**

```bash
git add messages/en.json messages/pl.json
git commit -m "feat(i18n): add reservation translation keys for EN and PL"
```

---

## Task 5: Public List Page — Fetch Reservation Data

**Files:**
- Modify: `src/app/[locale]/lists/[slug]/page.tsx`

- [ ] **Step 1: Add `getReservationsForList` function and update page**

In `src/app/[locale]/lists/[slug]/page.tsx`, add this function after `getListBySlug`:

```typescript
export type ReservationInfo = {
  status: "available" | "pending" | "reserved";
  isOwnReservation: boolean;
  reserverName?: string | null;
};

async function getReservationsForList(
  listId: string,
  privacyMode: string,
  isOwner: boolean,
  currentUserId: string | null
): Promise<Record<string, ReservationInfo>> {
  // Full Surprise: owner sees NO reservation data at all
  if (isOwner && privacyMode === "full_surprise") return {};

  const supabase = createServiceClient();
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Fetch all non-expired reservations for this list
  const { data: reservations } = await supabase
    .from("reservations")
    .select("item_id, user_id, guest_nickname, show_name, status, created_at")
    .eq("list_id", listId)
    .or(`status.eq.confirmed,and(status.eq.pending,created_at.gte.${twentyFourHoursAgo})`);

  if (!reservations || reservations.length === 0) return {};

  // Build a map of item_id → ReservationInfo
  const map: Record<string, ReservationInfo> = {};

  for (const r of reservations) {
    const isOwn = currentUserId !== null && r.user_id === currentUserId;
    const status = r.status === "pending" ? "pending" as const : "reserved" as const;

    // Determine reserver name based on privacy mode and viewer
    let reserverName: string | null = null;

    if (privacyMode === "visible") {
      // Everyone sees names
      reserverName = r.guest_nickname || null;
      // For logged-in reservers, fetch display_name
      if (r.user_id && !r.guest_nickname) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", r.user_id)
          .single();
        reserverName = profile?.display_name || null;
      }
    } else if (isOwner && privacyMode === "buyers_choice" && r.show_name) {
      // Owner sees name only if reserver opted in
      reserverName = r.guest_nickname || null;
      if (r.user_id && !r.guest_nickname) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", r.user_id)
          .single();
        reserverName = profile?.display_name || null;
      }
    }

    map[r.item_id] = { status, isOwnReservation: isOwn, reserverName };
  }

  return map;
}
```

Then update the `PublicListPage` component to call this function and pass data to cards:

```typescript
// After the isOwner check, add:
const currentUserId = isOwner ? list.user_id : (user?.id ?? null);
const reservationMap = await getReservationsForList(
  list.id,
  list.privacy_mode,
  isOwner,
  currentUserId
);

// Update PublicGiftCard usage to pass reservation data:
<PublicGiftCard
  key={item.id}
  item={item}
  locale={locale}
  index={index}
  reservation={reservationMap[item.id] ?? { status: "available", isOwnReservation: false }}
  privacyMode={list.privacy_mode}
  isOwner={isOwner}
  listSlug={list.slug}
  isAuthenticated={!!currentUserId && !isOwner}
  itemId={item.id}
/>
```

Note: `user` needs to be accessible in the page scope. Refactor the auth check to store the user variable at page scope.

- [ ] **Step 2: Update PublicGiftCard props**

The `PublicGiftCard` component needs new props:

```typescript
type ReservationInfo = {
  status: "available" | "pending" | "reserved";
  isOwnReservation: boolean;
  reserverName?: string | null; // only in visible mode or buyers_choice with show_name
};
```

Pass `reservation: ReservationInfo`, `privacyMode: string`, `isOwner: boolean`, `listSlug: string`, and `isAuthenticated: boolean` to each `PublicGiftCard`.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/lists/[slug]/page.tsx
git commit -m "feat: fetch and filter reservation data on public list page"
```

---

## Task 6: Reserve Button & Guest Dialog Components

**Files:**
- Create: `src/components/public/reserve-button.tsx`
- Create: `src/components/public/guest-reserve-dialog.tsx`
- Create: `src/components/public/reserve-popover.tsx`
- Modify: `src/components/public/public-gift-card.tsx`

- [ ] **Step 1: Create ReserveButton component**

Create `src/components/public/reserve-button.tsx` — a client component that renders differently based on reservation status:
- `available`: shows "Reserve" button. If user is authenticated, handles reserve (with popover for Buyer's Choice). If guest, opens GuestReserveDialog.
- `pending`: shows "Pending reservation" badge (disabled)
- `reserved` + own: shows "Reserved by you" + "Cancel" button
- `reserved` + not own: shows "Reserved" badge (optionally with name in Visible mode)

Uses `reserveItem` and `cancelReservation` server actions for logged-in users.

- [ ] **Step 2: Create GuestReserveDialog component**

Create `src/components/public/guest-reserve-dialog.tsx` — shadcn Dialog with:
- Nickname input (required, max 50 chars)
- Email input (required, validated)
- In Buyer's Choice mode: "Show my name to the list owner" Switch toggle
- Submit button → calls `reserveItemAsGuest` server action
- Success state: shows "Check your email" message
- Error state: shows error from server action

- [ ] **Step 3: Create ReservePopover component**

Create `src/components/public/reserve-popover.tsx` — small shadcn Popover for logged-in users in Buyer's Choice mode:
- "Show my name to the list owner" Switch toggle
- "Confirm" button → calls `reserveItem` with `showName` value

- [ ] **Step 4: Update PublicGiftCard to use ReserveButton**

In `src/components/public/public-gift-card.tsx`:
- Replace the disabled button with `<ReserveButton />` component
- Pass through reservation info, privacy mode, item ID, list slug, auth status
- If `isOwner` is true: don't render any reserve button at all

- [ ] **Step 5: Commit**

```bash
git add src/components/public/reserve-button.tsx src/components/public/guest-reserve-dialog.tsx src/components/public/reserve-popover.tsx src/components/public/public-gift-card.tsx
git commit -m "feat: add Reserve button, guest dialog, and Buyer's Choice popover"
```

---

## Task 7: Guest Confirmation & Management Pages

**Files:**
- Create: `src/app/[locale]/reservations/layout.tsx`
- Create: `src/app/[locale]/reservations/confirm/[token]/page.tsx`
- Create: `src/app/[locale]/reservations/manage/[token]/page.tsx`

- [ ] **Step 1: Create shared layout for reservation pages**

Create `src/app/[locale]/reservations/layout.tsx` — reuse the same simple layout as the public list pages (logo header + footer). Can import from or mirror the pattern in `src/app/[locale]/lists/layout.tsx`.

- [ ] **Step 2: Create confirmation page**

Create `src/app/[locale]/reservations/confirm/[token]/page.tsx`:
- Server component
- Calls `confirmGuestReservation(token)` on load
- Shows result: success (with link to management page), already confirmed, expired, or not found
- Uses i18n keys from `reservations.confirm`

- [ ] **Step 3: Create management page**

Create `src/app/[locale]/reservations/manage/[token]/page.tsx`:
- Server component for initial data fetch (reservation details via service client)
- Shows: item name, list name, status badge
- Client component for cancel button → calls `cancelGuestReservation(token)`
- Shows success state after cancellation
- Uses i18n keys from `reservations.manage`

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/reservations/
git commit -m "feat: add guest reservation confirmation and management pages"
```

---

## Task 8: Dashboard "My Reservations" Page

**Files:**
- Modify: `src/app/[locale]/dashboard/reservations/page.tsx`
- Create: `src/components/dashboard/reservation-card.tsx`

- [ ] **Step 1: Create ReservationCard component**

Create `src/components/dashboard/reservation-card.tsx` — displays a single reserved item:
- Item name, priority badge, price (if set)
- List name as link to public list page
- Event date with countdown
- "Cancel" button → calls `cancelReservation` server action
- Warm styling consistent with dashboard list cards

- [ ] **Step 2: Update reservations page with real data**

In `src/app/[locale]/dashboard/reservations/page.tsx`:
- Call `getMyReservations()` to fetch reservation data
- Group by list
- Render each group with list name header + event info
- Render `ReservationCard` for each item
- Keep empty state for when there are no reservations

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/dashboard/reservations/page.tsx src/components/dashboard/reservation-card.tsx
git commit -m "feat: dashboard My Reservations page with real data"
```

---

## Task 9: Update PROJECT.md

**Files:**
- Modify: `PROJECT.md`

- [ ] **Step 1: Update PROJECT.md**

In the Features Brainstorm → Reservations section, mark the implemented features:
- Reserve / unreserve items ✅
- Three privacy modes (Buyer's Choice, Visible, Full Surprise) ✅
- Guest reservation with email confirmation ✅

- [ ] **Step 2: Commit**

```bash
git add PROJECT.md
git commit -m "docs: mark reservations as implemented in PROJECT.md"
```

---

## Task 10: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update CLAUDE.md**

Update the following sections:
- **Database Tables:** Add `reservations` — gift reservations with privacy modes, guest tokens, status tracking (RLS: owner-only SELECT/DELETE, service client for public/guest ops)
- **Folder Structure:** Add `reservations/` routes under `app/[locale]/` (confirm/[token], manage/[token])
- **Public (Shareable) List Pages:** Update "Reserve buttons: Visible but disabled (coming soon)" to "Reserve buttons: Functional — logged-in users reserve instantly, guests enter nickname + email and confirm via email link"
- **Mutations Pattern:** Note that reservation actions live in `src/app/[locale]/lists/[slug]/reservation-actions.ts` and use service client for guest operations

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with reservations architecture"
```

---

## Task 11: E2E Tests

**Files:**
- Create: `e2e/reservations.spec.ts`

- [ ] **Step 1: Write E2E tests**

Create `e2e/reservations.spec.ts` with test cases:

1. **Logged-in user reserves and cancels an item:**
   - Navigate to another user's public list
   - Click Reserve on an available item
   - Verify item shows "Reserved by you" with Cancel option
   - Click Cancel — verify item becomes available again

2. **Guest reservation flow:**
   - Navigate to a public list
   - Click Reserve on an item
   - Fill in nickname + email in the dialog
   - Verify success message (check email)
   - Verify item shows "Pending reservation" badge

3. **Confirmation page:**
   - Navigate to `/en/reservations/confirm/[valid-token]` — verify success
   - Navigate to `/en/reservations/confirm/invalid-token` — verify error

4. **Management page — guest cancels via URL:**
   - Navigate to `/en/reservations/manage/[valid-token]` — verify reservation details shown
   - Click cancel — verify success message

5. **Privacy mode — Buyer's Choice (show_name toggle):**
   - Reserve with "Show my name" toggled on — verify owner sees name
   - Reserve with "Show my name" toggled off — verify owner sees "Reserved" without name

6. **Privacy mode — Full Surprise (owner view):**
   - Owner visits their own public list with Full Surprise mode
   - Verify no reservation badges or hints visible (items look available)

7. **Privacy mode — Visible:**
   - Non-owner visits a list with Visible mode and reserved items
   - Verify reserver name is shown

8. **Double reserve attempt:**
   - Reserve an item, then try to reserve it again from another session
   - Verify error message "already reserved"

9. **Dashboard My Reservations:**
   - Logged-in user with reservations navigates to `/dashboard/reservations`
   - Verify reservation cards are shown with item name, list name
   - Click cancel — verify item removed from list

Note: Some tests require seeding data in Supabase. Use the service client in test setup to create test lists, items, and reservations.

- [ ] **Step 2: Run E2E tests**

Run: `npx playwright test e2e/reservations.spec.ts`
Expected: All tests pass.

- [ ] **Step 3: Run full test suite**

Run: `npx playwright test`
Expected: All tests pass (no regressions).

- [ ] **Step 4: Commit**

```bash
git add e2e/reservations.spec.ts
git commit -m "test: add E2E tests for reservation flows"
```

---

## Task 12: Lint, Type Check & Final Verification

- [ ] **Step 1: Run linter**

Run: `npx eslint src/`
Expected: No errors.

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Run full E2E suite**

Run: `npx playwright test`
Expected: All tests pass.

- [ ] **Step 4: Run code review**

Use `/review` and `/security-review` on all changed files.

- [ ] **Step 5: Run simplify**

Use `/simplify` on modified files.

- [ ] **Step 6: Push and create PR**

```bash
git push -u origin feature/reservations
```

Create PR with description summarizing the reservations feature.
