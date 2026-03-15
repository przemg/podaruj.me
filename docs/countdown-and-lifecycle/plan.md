# Countdown & List Lifecycle Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add animated event countdown, list closing/archive with celebratory summary, slug history for old links, and redesigned delete confirmation to Podaruj.me.

**Architecture:** New DB columns (`is_closed`, `closed_at`, `surprise_revealed`) on `lists` table plus a `list_slug_history` table. Countdown is a client component with real-time ticking. Closed state is computed from `is_closed` OR past `event_date`. Summary uses existing reservation query patterns. Slug history uses 302 redirects on public routes.

**Tech Stack:** Next.js 16 App Router, Supabase (Postgres), TypeScript, Tailwind CSS, shadcn/ui, next-intl, canvas-confetti (for celebratory effects)

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `supabase/migrations/20260317000000_add_list_lifecycle.sql` | Migration: is_closed, closed_at, surprise_revealed columns + list_slug_history table |
| `src/components/lists/animated-countdown.tsx` | Client component: real-time ticking countdown for list detail pages |
| `src/components/lists/summary-card.tsx` | Celebratory summary card shown on closed lists (owner view) |
| `src/components/lists/surprise-reveal-dialog.tsx` | Full Surprise reveal confirmation dialog |
| `src/components/lists/close-list-dialog.tsx` | Close list confirmation dialog |
| `e2e/countdown-lifecycle.spec.ts` | E2E tests for all new features |

### Modified Files
| File | Changes |
|------|---------|
| `src/lib/countdown.ts` | Add `getDetailedCountdown()` returning days/hours/minutes/seconds |
| `src/app/[locale]/dashboard/lists/actions.ts` | Add `closeList`, `reopenList`, `revealSurprise` actions; update `updateList` to save slug history |
| `src/app/[locale]/lists/[slug]/page.tsx` | Add slug history redirect on 404; pass `isClosed` to components; show summary for owner |
| `src/app/[locale]/lists/[slug]/reservation-actions.ts` | Check closed state before allowing reservations |
| `src/app/[locale]/dashboard/lists/[id]/page.tsx` | Pass `isClosed`/`surpriseRevealed` to components; fetch summary data for closed lists |
| `src/components/lists/list-header.tsx` | Add Close/Reopen buttons; replace delete dialog with enhanced version |
| `src/components/lists/delete-confirm-dialog.tsx` | Redesign with "Close list" option alongside delete |
| `src/components/dashboard/list-card.tsx` | Add closed styling (muted, badge) |
| `src/components/public/public-list-header.tsx` | Add closed banner |
| `src/components/public/public-gift-card.tsx` | Disable reserve button when closed |
| `messages/en.json` | All new EN translation strings |
| `messages/pl.json` | All new PL translation strings |

---

## Chunk 1: Database & Utilities

### Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260317000000_add_list_lifecycle.sql`

- [ ] **Step 1: Write migration SQL**

```sql
-- Add lifecycle columns to lists
ALTER TABLE public.lists
  ADD COLUMN is_closed boolean NOT NULL DEFAULT false,
  ADD COLUMN closed_at timestamptz,
  ADD COLUMN surprise_revealed boolean NOT NULL DEFAULT false;

-- Slug history table for old link redirects
CREATE TABLE public.list_slug_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  slug varchar(150) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT list_slug_history_slug_unique UNIQUE (slug)
);

CREATE INDEX idx_list_slug_history_list_id ON public.list_slug_history(list_id);
CREATE INDEX idx_list_slug_history_slug ON public.list_slug_history(slug);

-- RLS: allow authenticated users to insert their own list's slug history
ALTER TABLE public.list_slug_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert slug history for own lists"
  ON public.list_slug_history FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lists
      WHERE lists.id = list_slug_history.list_id
      AND lists.user_id = auth.uid()
    )
  );

-- Service client will handle SELECT for redirects (no SELECT policy needed for anon)
```

- [ ] **Step 2: Apply migration**

Run: `npx supabase db push` (or apply via Supabase dashboard)

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260317000000_add_list_lifecycle.sql
git commit -m "feat: add list lifecycle migration (is_closed, slug history)"
```

---

### Task 2: Extend Countdown Utility

**Files:**
- Modify: `src/lib/countdown.ts`

- [ ] **Step 1: Add detailed countdown type and function**

Add to existing file (keep `CountdownResult` and `getCountdown` unchanged):

```typescript
export type DetailedCountdownResult = {
  type: "countdown" | "today" | "past";
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
};

export function getDetailedCountdown(eventDate: string): DetailedCountdownResult {
  const now = new Date();
  const event = new Date(eventDate + "T00:00:00");
  // Event spans the full day — list auto-closes the day after

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDay = new Date(event.getFullYear(), event.getMonth(), event.getDate());

  if (today.getTime() === eventDay.getTime()) {
    return { type: "today", days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  }

  if (eventDay.getTime() < today.getTime()) {
    return { type: "past", days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  }

  // Future event — count down to start of event day
  const diff = event.getTime() - now.getTime();
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { type: "countdown", days, hours, minutes, seconds, totalMs: diff };
}
```

- [ ] **Step 2: Add `isListClosed` helper**

```typescript
export function isListClosed(list: { is_closed: boolean; event_date: string | null }): boolean {
  if (list.is_closed) return true;
  if (!list.event_date) return false;
  const today = new Date();
  const eventDay = new Date(list.event_date + "T00:00:00");
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const eventDate = new Date(eventDay.getFullYear(), eventDay.getMonth(), eventDay.getDate());
  return eventDate.getTime() < todayDate.getTime();
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/countdown.ts
git commit -m "feat: add detailed countdown and isListClosed utility"
```

---

## Chunk 2: Animated Countdown Component

### Task 3: Animated Countdown Component

**Files:**
- Create: `src/components/lists/animated-countdown.tsx`

- [ ] **Step 1: Create the animated countdown client component**

```typescript
"use client";

import { useEffect, useState } from "react";
import { getDetailedCountdown, type DetailedCountdownResult } from "@/lib/countdown";
import { useTranslations } from "next-intl";
import { Clock, PartyPopper, CalendarOff } from "lucide-react";

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-orange-100 px-3 py-2 sm:px-4 sm:py-3 min-w-[60px] sm:min-w-[72px]">
        <span className="text-2xl sm:text-3xl font-bold text-orange-600 tabular-nums transition-all duration-300">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs sm:text-sm text-muted-foreground mt-1.5 font-medium">
        {label}
      </span>
    </div>
  );
}

export function AnimatedCountdown({ eventDate }: { eventDate: string }) {
  const t = useTranslations("lists.countdown");
  const [countdown, setCountdown] = useState<DetailedCountdownResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => setCountdown(getDetailedCountdown(eventDate));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  if (!mounted || !countdown) {
    return (
      <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-6 animate-pulse h-[140px]" />
    );
  }

  if (countdown.type === "today") {
    return (
      <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 text-center animate-in fade-in duration-500">
        <PartyPopper className="h-8 w-8 text-orange-500 mx-auto mb-2 animate-bounce" />
        <p className="text-xl sm:text-2xl font-bold text-orange-600">
          {t("today")}
        </p>
      </div>
    );
  }

  if (countdown.type === "past") {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-6 text-center">
        <CalendarOff className="h-6 w-6 text-gray-400 mx-auto mb-2" />
        <p className="text-lg text-gray-500 font-medium">
          {t("passed")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-5 sm:p-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-center gap-1.5 mb-4">
        <Clock className="h-4 w-4 text-orange-500" />
        <span className="text-sm font-medium text-orange-600">{t("until")}</span>
      </div>
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <CountdownUnit value={countdown.days} label={t("days")} />
        <span className="text-2xl font-bold text-orange-300 mt-[-20px]">:</span>
        <CountdownUnit value={countdown.hours} label={t("hours")} />
        <span className="text-2xl font-bold text-orange-300 mt-[-20px]">:</span>
        <CountdownUnit value={countdown.minutes} label={t("minutes")} />
        <span className="text-2xl font-bold text-orange-300 mt-[-20px]">:</span>
        <CountdownUnit value={countdown.seconds} label={t("seconds")} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/lists/animated-countdown.tsx
git commit -m "feat: add animated real-time countdown component"
```

---

### Task 4: Integrate Countdown into List Detail Pages

**Files:**
- Modify: `src/components/lists/list-header.tsx`
- Modify: `src/components/public/public-list-header.tsx`
- Modify: `src/app/[locale]/lists/[slug]/page.tsx`

- [ ] **Step 1: Add AnimatedCountdown to dashboard list header**

In `list-header.tsx`, import `AnimatedCountdown` and render it below the header badges section when `list.event_date` is set:

```typescript
import { AnimatedCountdown } from "@/components/lists/animated-countdown";
```

Add after the badges/actions section (before the gift list):
```tsx
{list.event_date && (
  <AnimatedCountdown eventDate={list.event_date} />
)}
```

- [ ] **Step 2: Add AnimatedCountdown to public list page**

In `src/app/[locale]/lists/[slug]/page.tsx`, import and render `AnimatedCountdown` between the header and items list when `list.event_date` is set:

```tsx
import { AnimatedCountdown } from "@/components/lists/animated-countdown";
```

Add in the render, after `PublicListHeader` and before the items section:
```tsx
{list.event_date && (
  <div className="mt-6">
    <AnimatedCountdown eventDate={list.event_date} />
  </div>
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/lists/list-header.tsx src/app/[locale]/lists/[slug]/page.tsx
git commit -m "feat: integrate animated countdown into list detail pages"
```

---

## Chunk 3: List Closing

### Task 5: Close/Reopen Server Actions

**Files:**
- Modify: `src/app/[locale]/dashboard/lists/actions.ts`

- [ ] **Step 1: Add closeList server action**

Add after `publishList`:

```typescript
export async function closeList(locale: string, slug: string): Promise<ActionResult> {
  const { supabase } = await getAuthenticatedClient();

  // Verify list exists and is not already closed
  const { data: list, error: fetchError } = await supabase
    .from("lists")
    .select("id, is_closed, is_published, privacy_mode")
    .eq("slug", slug)
    .single();

  if (fetchError || !list) {
    return { error: "List not found" };
  }

  // Draft Full Surprise lists cannot be closed
  if (list.privacy_mode === "full_surprise" && !list.is_published) {
    return { error: "Cannot close an unpublished list" };
  }

  if (list.is_closed) {
    return { error: "List is already closed" };
  }

  const { error } = await supabase
    .from("lists")
    .update({ is_closed: true, closed_at: new Date().toISOString() })
    .eq("slug", slug);

  if (error) {
    return { error: "Failed to close list" };
  }

  revalidatePath(`/${locale}/dashboard/lists/${slug}`);
  revalidatePath(`/${locale}/lists/${slug}`);
  revalidatePath(`/${locale}/dashboard`);
  return {};
}

export async function reopenList(locale: string, slug: string): Promise<ActionResult> {
  const { supabase } = await getAuthenticatedClient();

  const { data: list, error: fetchError } = await supabase
    .from("lists")
    .select("id, is_closed, event_date")
    .eq("slug", slug)
    .single();

  if (fetchError || !list) {
    return { error: "List not found" };
  }

  if (!list.is_closed) {
    return { error: "List is not closed" };
  }

  // Cannot reopen if event date is in the past
  if (list.event_date) {
    const today = new Date();
    const eventDate = new Date(list.event_date + "T00:00:00");
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    if (eventDay.getTime() < todayDate.getTime()) {
      return { error: "Cannot reopen a list whose event date has passed" };
    }
  }

  const { error } = await supabase
    .from("lists")
    .update({ is_closed: false, closed_at: null })
    .eq("slug", slug);

  if (error) {
    return { error: "Failed to reopen list" };
  }

  revalidatePath(`/${locale}/dashboard/lists/${slug}`);
  revalidatePath(`/${locale}/lists/${slug}`);
  revalidatePath(`/${locale}/dashboard`);
  return {};
}
```

- [ ] **Step 2: Add publish guard for past-event Full Surprise lists**

In the existing `publishList` action, add a check before publishing:

```typescript
// Block publishing if event date has passed
if (list.event_date) {
  const today = new Date();
  const eventDate = new Date(list.event_date + "T00:00:00");
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  if (eventDay.getTime() < todayDate.getTime()) {
    return { error: "Cannot publish a list whose event date has passed" };
  }
}
```

- [ ] **Step 3: Add revealSurprise server action**

```typescript
export async function revealSurprise(locale: string, slug: string): Promise<ActionResult> {
  const { supabase } = await getAuthenticatedClient();

  const { data: list, error: fetchError } = await supabase
    .from("lists")
    .select("id, privacy_mode, surprise_revealed, is_closed, event_date")
    .eq("slug", slug)
    .single();

  if (fetchError || !list) {
    return { error: "List not found" };
  }

  if (list.privacy_mode !== "full_surprise") {
    return { error: "Only Full Surprise lists can be revealed" };
  }

  if (!isListClosed({ is_closed: list.is_closed, event_date: list.event_date })) {
    return { error: "List must be closed before revealing" };
  }

  if (list.surprise_revealed) {
    return { error: "Already revealed" };
  }

  const { error } = await supabase
    .from("lists")
    .update({ surprise_revealed: true })
    .eq("slug", slug);

  if (error) {
    return { error: "Failed to reveal surprise" };
  }

  revalidatePath(`/${locale}/dashboard/lists/${slug}`);
  return {};
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/dashboard/lists/actions.ts
git commit -m "feat: add closeList, reopenList, revealSurprise server actions"
```

---

### Task 6: Block Reservations on Closed Lists

**Files:**
- Modify: `src/app/[locale]/lists/[slug]/reservation-actions.ts`

- [ ] **Step 1: Add closed check to reserveItem and reserveItemAsGuest**

Import `isListClosed`:
```typescript
import { isListClosed } from "@/lib/countdown";
```

In both `reserveItem` and `reserveItemAsGuest`, after fetching the list data and before creating the reservation, add:

```typescript
// Check if list is closed
const { data: listData, error: listFetchError } = await serviceClient
  .from("lists")
  .select("is_closed, event_date")
  .eq("slug", listSlug)
  .single();

if (listFetchError || !listData) {
  return { error: "List not found" };
}

if (isListClosed(listData)) {
  return { error: "This list is closed and no longer accepting reservations" };
}
```

Note: The list is already fetched in these actions to validate item ownership. Add `is_closed` to the existing select query and use `isListClosed` on the result instead of a separate query.

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/lists/[slug]/reservation-actions.ts
git commit -m "feat: block reservations on closed lists"
```

---

### Task 7: Close/Reopen UI in List Header

**Files:**
- Modify: `src/components/lists/list-header.tsx`
- Create: `src/components/lists/close-list-dialog.tsx`

- [ ] **Step 1: Create close list confirmation dialog**

```typescript
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Archive } from "lucide-react";

type CloseListDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
};

export function CloseListDialog({
  open,
  onOpenChange,
  onConfirm,
  loading,
  title,
  description,
  confirmLabel,
  cancelLabel,
}: CloseListDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Archive className="h-6 w-6 text-orange-600" />
          </div>
          <AlertDialogTitle className="text-center">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading ? "..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

- [ ] **Step 2: Add Close/Reopen buttons to list-header.tsx**

Add to imports:
```typescript
import { closeList, reopenList } from "@/app/[locale]/dashboard/lists/actions";
import { CloseListDialog } from "./close-list-dialog";
import { isListClosed } from "@/lib/countdown";
import { Archive, ArchiveRestore } from "lucide-react";
```

Add to the component's props — ensure the list type includes `is_closed`, `closed_at`, and `event_date`.

Add state:
```typescript
const [closeOpen, setCloseOpen] = useState(false);
const [closeLoading, setCloseLoading] = useState(false);
```

Compute closed state:
```typescript
const isClosed = isListClosed(list);
const isManuallyClosable = !isClosed && (list.privacy_mode !== "full_surprise" || list.is_published);
const isReopenable = list.is_closed && list.event_date && new Date(list.event_date + "T00:00:00") >= new Date(new Date().toDateString());
const isReopenableNoDate = list.is_closed && !list.event_date;
const canReopen = isReopenable || isReopenableNoDate;
```

Add handlers:
```typescript
const handleClose = async () => {
  setCloseLoading(true);
  const result = await closeList(locale, list.slug);
  setCloseLoading(false);
  if (!result.error) setCloseOpen(false);
};

const handleReopen = async () => {
  setCloseLoading(true);
  await reopenList(locale, list.slug);
  setCloseLoading(false);
};
```

Add buttons in the action buttons area (near share/edit/delete):
```tsx
{isManuallyClosable && (
  <Button variant="outline" size="sm" onClick={() => setCloseOpen(true)}>
    <Archive className="h-4 w-4 mr-1.5" />
    {t("close")}
  </Button>
)}
{canReopen && (
  <Button variant="outline" size="sm" onClick={handleReopen} disabled={closeLoading}>
    <ArchiveRestore className="h-4 w-4 mr-1.5" />
    {t("reopen")}
  </Button>
)}
```

Add the dialog:
```tsx
<CloseListDialog
  open={closeOpen}
  onOpenChange={setCloseOpen}
  onConfirm={handleClose}
  loading={closeLoading}
  title={t("closeDialog.title")}
  description={t("closeDialog.description")}
  confirmLabel={t("closeDialog.confirm")}
  cancelLabel={t("closeDialog.cancel")}
/>
```

Add a "Closed" badge in the badges section:
```tsx
{isClosed && (
  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
    <Archive className="h-3 w-3" />
    {t("closedBadge")}
  </span>
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/lists/close-list-dialog.tsx src/components/lists/list-header.tsx
git commit -m "feat: add close/reopen list UI to dashboard list header"
```

---

### Task 8: Closed State on Public Page

**Files:**
- Modify: `src/app/[locale]/lists/[slug]/page.tsx`
- Modify: `src/components/public/public-list-header.tsx`
- Modify: `src/components/public/public-gift-card.tsx`

- [ ] **Step 1: Compute and pass closed state in public page**

In the public page server component, import `isListClosed`:
```typescript
import { isListClosed } from "@/lib/countdown";
```

Update the `getListBySlug` function's `.select()` to include `is_closed` and `surprise_revealed` fields alongside existing fields.

After fetching the list, compute:
```typescript
const isClosed = isListClosed({ is_closed: list.is_closed, event_date: list.event_date });
```

Pass `isClosed` and `list.is_closed` (for distinguishing manual vs auto close) to `PublicListHeader` and `isClosed` to each `PublicGiftCard`.

- [ ] **Step 2: Add closed banner to public list header**

Add `isClosed` and `isManualClose` props to `PublicListHeader`. Add a banner below existing content:

```tsx
{isClosed && (
  <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center">
    <p className="text-sm text-gray-500 font-medium">
      {isManualClose ? closedLabel : eventPassedLabel}
    </p>
  </div>
)}
```

- [ ] **Step 3: Disable reserve button when closed**

In `PublicGiftCard`, accept `isClosed` prop. When `isClosed` is true, disable or hide the `ReserveButton` component.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/lists/[slug]/page.tsx src/components/public/public-list-header.tsx src/components/public/public-gift-card.tsx
git commit -m "feat: show closed state on public list page"
```

---

### Task 9: Closed Styling on Dashboard Cards

**Files:**
- Modify: `src/components/dashboard/list-card.tsx`
- Modify: `src/app/[locale]/dashboard/page.tsx`

- [ ] **Step 1: Add isClosed prop and muted styling to list-card**

Add `isClosed` prop. Apply conditional styling:
```tsx
<Link
  href={`/dashboard/lists/${slug}`}
  className={cn(
    "group relative flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md",
    isClosed && "opacity-60 grayscale-[30%]"
  )}
>
```

Add "Closed" badge alongside existing badges:
```tsx
{isClosed && (
  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
    {t("closed")}
  </span>
)}
```

- [ ] **Step 2: Pass isClosed from dashboard page**

In the dashboard page, compute `isListClosed` for each list and pass to `ListCard`:
```typescript
import { isListClosed } from "@/lib/countdown";
```

```tsx
<ListCard
  {...props}
  isClosed={isListClosed({ is_closed: list.is_closed, event_date: list.event_date })}
/>
```

Add `is_closed` to the select query on the dashboard page.

- [ ] **Step 3: Add countdown badge to list cards**

The existing `list-card.tsx` already has countdown logic. Verify the existing countdown badge displays correctly ("X days left", "Today!", "Event passed") using the existing `getCountdown` utility. If not present, add a countdown badge using:

```tsx
{eventDate && (
  <span className={cn(
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
    countdown.type === "past" && "bg-gray-100 text-gray-500",
    countdown.type === "today" && "bg-orange-100 text-orange-600",
    countdown.type === "days" && "bg-emerald-50 text-emerald-600"
  )}>
    {countdownLabel}
  </span>
)}
```

Note: The countdown badge on dashboard cards is static (computed on render), not real-time ticking.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/list-card.tsx src/app/[locale]/dashboard/page.tsx
git commit -m "feat: add closed styling and countdown badge to dashboard list cards"
```

---

## Chunk 4: Celebratory Summary

### Task 10: Summary Card Component

**Files:**
- Create: `src/components/lists/summary-card.tsx`

- [ ] **Step 1: Install canvas-confetti**

```bash
npm install canvas-confetti
npm install -D @types/canvas-confetti
```

- [ ] **Step 2: Create the summary card component**

```typescript
"use client";

import { useEffect, useRef } from "react";
import { Gift, PartyPopper, User, UserX } from "lucide-react";
import { useTranslations } from "next-intl";

type ReservationSummaryItem = {
  itemName: string;
  reservedBy: string | null; // null = anonymous
};

type SummaryCardProps = {
  totalItems: number;
  reservedCount: number;
  reservations: ReservationSummaryItem[];
};

export function SummaryCard({ totalItems, reservedCount, reservations }: SummaryCardProps) {
  const t = useTranslations("lists.summary");
  const confettiFired = useRef(false);

  useEffect(() => {
    if (confettiFired.current) return;
    confettiFired.current = true;

    // Dynamic import to avoid SSR issues
    import("canvas-confetti").then((confettiModule) => {
      const confetti = confettiModule.default;
      // Fire from both sides
      confetti({ particleCount: 80, spread: 70, origin: { x: 0.1, y: 0.6 }, colors: ["#f97316", "#fbbf24", "#fb923c", "#f472b6"] });
      setTimeout(() => {
        confetti({ particleCount: 80, spread: 70, origin: { x: 0.9, y: 0.6 }, colors: ["#f97316", "#fbbf24", "#fb923c", "#f472b6"] });
      }, 200);
    });
  }, []);

  const percentage = totalItems > 0 ? Math.round((reservedCount / totalItems) * 100) : 0;

  return (
    <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-center gap-2 mb-4">
        <PartyPopper className="h-6 w-6 text-orange-500" />
        <h3 className="text-lg font-bold text-orange-700">{t("title")}</h3>
        <PartyPopper className="h-6 w-6 text-orange-500 scale-x-[-1]" />
      </div>

      {/* Stats */}
      <div className="text-center mb-6">
        <p className="text-3xl font-bold text-orange-600">
          {reservedCount} / {totalItems}
        </p>
        <p className="text-sm text-orange-600/70 mt-1">
          {t("giftsReserved", { percentage })}
        </p>
        {/* Progress bar */}
        <div className="mt-3 h-2 rounded-full bg-orange-100 overflow-hidden max-w-xs mx-auto">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400 transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Reservation list */}
      {reservations.length > 0 && (
        <div className="space-y-2">
          {reservations.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl bg-white/60 px-4 py-2.5 text-sm animate-in fade-in duration-500"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <Gift className="h-4 w-4 text-orange-400 shrink-0" />
              <span className="font-medium text-gray-700 flex-1 truncate">{item.itemName}</span>
              <span className="flex items-center gap-1 text-gray-500 shrink-0">
                {item.reservedBy ? (
                  <>
                    <User className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[120px]">{item.reservedBy}</span>
                  </>
                ) : (
                  <>
                    <UserX className="h-3.5 w-3.5" />
                    <span>{t("anonymous")}</span>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/lists/summary-card.tsx
git commit -m "feat: add celebratory summary card with confetti"
```

---

### Task 11: Surprise Reveal Dialog

**Files:**
- Create: `src/components/lists/surprise-reveal-dialog.tsx`

- [ ] **Step 1: Create the surprise reveal dialog**

```typescript
"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Gift } from "lucide-react";
import { useTranslations } from "next-intl";
import { revealSurprise } from "@/app/[locale]/dashboard/lists/actions";

type SurpriseRevealDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: string;
  slug: string;
  onRevealed: () => void;
};

export function SurpriseRevealDialog({
  open,
  onOpenChange,
  locale,
  slug,
  onRevealed,
}: SurpriseRevealDialogProps) {
  const t = useTranslations("lists.surpriseReveal");
  const [loading, setLoading] = useState(false);

  const handleReveal = async () => {
    setLoading(true);
    const result = await revealSurprise(locale, slug);
    setLoading(false);
    if (!result.error) {
      onRevealed();
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Gift className="h-6 w-6 text-orange-600" />
          </div>
          <AlertDialogTitle className="text-center">{t("title")}</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {t("description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{t("notYet")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReveal}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading ? "..." : t("reveal")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/lists/surprise-reveal-dialog.tsx
git commit -m "feat: add Full Surprise reveal confirmation dialog"
```

---

### Task 12: Integrate Summary into Dashboard List Detail

**Files:**
- Modify: `src/app/[locale]/dashboard/lists/[id]/page.tsx`
- Modify: `src/components/lists/list-header.tsx`

- [ ] **Step 1: Fetch summary data for closed lists**

In the dashboard list detail page, after existing reservation queries:

```typescript
import { isListClosed } from "@/lib/countdown";
import { SummaryCard } from "@/components/lists/summary-card";
```

Compute closed state:
```typescript
const isClosed = isListClosed({ is_closed: list.is_closed, event_date: list.event_date });
```

For closed lists (non-Full-Surprise, or Full Surprise with `surprise_revealed`), fetch full reservation data:
```typescript
let summaryData = null;
if (isClosed) {
  const showSummary =
    list.privacy_mode !== "full_surprise" || list.surprise_revealed;

  if (showSummary) {
    // Use service client to get all reservations with names
    const serviceClient = createServiceClient();
    const { data: reservations } = await serviceClient
      .from("reservations")
      .select("item_id, user_id, guest_nickname, show_name, profiles:user_id(display_name), items:item_id(name)")
      .eq("list_id", list.id);

    summaryData = {
      totalItems: items.length,
      reservedCount: reservations?.length ?? 0,
      reservations: (reservations ?? []).map((r: any) => ({
        itemName: r.items?.name ?? "Unknown",
        reservedBy:
          list.privacy_mode === "visible"
            ? r.profiles?.display_name ?? r.guest_nickname ?? null
            : list.privacy_mode === "buyers_choice"
              ? r.show_name
                ? r.profiles?.display_name ?? r.guest_nickname ?? null
                : null
              : r.profiles?.display_name ?? r.guest_nickname ?? null, // full_surprise revealed
      })),
    };
  }
}
```

Pass `isClosed`, `summaryData`, and `list.surprise_revealed` to child components.

- [ ] **Step 2: Render summary card and reveal button**

In the page render, before the items list:

```tsx
{isClosed && summaryData && (
  <SummaryCard
    totalItems={summaryData.totalItems}
    reservedCount={summaryData.reservedCount}
    reservations={summaryData.reservations}
  />
)}
```

For Full Surprise closed lists that haven't been revealed yet, create a small client wrapper component inline in the page file (or as a separate file if preferred):

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { SurpriseRevealDialog } from "@/components/lists/surprise-reveal-dialog";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function RevealButton({ locale, slug }: { locale: string; slug: string }) {
  const t = useTranslations("lists");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="border-orange-200 text-orange-700 hover:bg-orange-50"
      >
        <Gift className="h-4 w-4 mr-1.5" />
        {t("revealButton")}
      </Button>
      <SurpriseRevealDialog
        open={open}
        onOpenChange={setOpen}
        locale={locale}
        slug={slug}
        onRevealed={() => router.refresh()}
      />
    </>
  );
}
```

Render this component on the page when `isClosed && list.privacy_mode === "full_surprise" && !list.surprise_revealed`.

- [ ] **Step 3: Pass is_closed to list-header for badges and button visibility**

Ensure the `list` object passed to `ListHeader` includes `is_closed`, `closed_at`, and `event_date` fields so the Close/Reopen logic from Task 7 works.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/dashboard/lists/[id]/page.tsx src/components/lists/list-header.tsx
git commit -m "feat: integrate celebratory summary into closed list detail page"
```

---

## Chunk 5: Slug History

### Task 13: Slug History in updateList Action

**Files:**
- Modify: `src/app/[locale]/dashboard/lists/actions.ts`

- [ ] **Step 1: Save old slug to history on name change**

In the `updateList` action, before updating the list with the new slug, insert the old slug into `list_slug_history`:

```typescript
// Only save to history if slug actually changed
const newSlug = generateSlug(data.name);
if (newSlug !== slug) {
  // slug param is the old slug — save it to history
  await supabase
    .from("list_slug_history")
    .insert({ list_id: existingList.id, slug: slug });
}
```

This must happen before the `UPDATE` statement that changes the slug. The `list_id` comes from the existing list fetch (add `id` to the select if not already there).

Also handle the edge case: if the old slug already exists in history (e.g., user renamed A→B→A→C), use `upsert` or catch the unique constraint error silently.

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/dashboard/lists/actions.ts
git commit -m "feat: save old slugs to history on list name change"
```

---

### Task 14: Slug History Redirect on Public Page

**Files:**
- Modify: `src/app/[locale]/lists/[slug]/page.tsx`

- [ ] **Step 1: Add slug history lookup on 404**

In the public page, after `getListBySlug` returns null, check slug history before returning 404:

```typescript
import { redirect } from "next/navigation";
```

After the existing list fetch:
```typescript
if (!list) {
  // Check slug history for old links
  const serviceClient = createServiceClient();
  const { data: historyEntry } = await serviceClient
    .from("list_slug_history")
    .select("list_id, lists:list_id(slug)")
    .eq("slug", slug)
    .single();

  if (historyEntry?.lists?.slug) {
    // Next.js redirect() uses 307 by default; this is acceptable
    // as the redirect target may change if the list is renamed again
    redirect(`/${locale}/lists/${historyEntry.lists.slug}`);
  }

  notFound();
}
```

The `lists:list_id(slug)` join fetches the current slug from the parent list. Note: Next.js `redirect()` uses 307 (temporary redirect), which is fine for our use case since slugs can change multiple times.

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/lists/[slug]/page.tsx
git commit -m "feat: redirect old slugs to current URL via slug history"
```

---

## Chunk 6: Delete Confirmation Redesign

### Task 15: Enhanced Delete Dialog

**Files:**
- Modify: `src/components/lists/delete-confirm-dialog.tsx`
- Modify: `src/components/lists/list-header.tsx`

- [ ] **Step 1: Redesign delete-confirm-dialog.tsx**

Replace the existing dialog content to include a "Close list" option:

Add new props:
```typescript
type DeleteConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  loading?: boolean;
  // New props for close suggestion
  showCloseOption?: boolean;
  closeLabel?: string;
  onClose?: () => void;
  closeLoading?: boolean;
};
```

Add the "Close list" button in the footer (when `showCloseOption` is true):
```tsx
<AlertDialogFooter className="flex-col sm:flex-row gap-2">
  <AlertDialogCancel disabled={loading || closeLoading}>
    {cancelLabel}
  </AlertDialogCancel>
  {showCloseOption && onClose && (
    <Button
      variant="outline"
      onClick={onClose}
      disabled={loading || closeLoading}
      className="border-orange-200 text-orange-700 hover:bg-orange-50"
    >
      <Archive className="h-4 w-4 mr-1.5" />
      {closeLoading ? "..." : closeLabel}
    </Button>
  )}
  <AlertDialogAction
    onClick={onConfirm}
    disabled={loading || closeLoading}
    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
  >
    {loading ? "..." : confirmLabel}
  </AlertDialogAction>
</AlertDialogFooter>
```

- [ ] **Step 2: Update list-header.tsx to use enhanced delete dialog**

Pass the new props when rendering `DeleteConfirmDialog`:

```tsx
<DeleteConfirmDialog
  open={deleteOpen}
  onOpenChange={setDeleteOpen}
  title={t("deleteDialog.title")}
  description={t("deleteDialog.descriptionWithClose")}
  confirmLabel={t("deleteDialog.deletePermanently")}
  cancelLabel={t("deleteDialog.cancel")}
  onConfirm={handleDelete}
  loading={deleteLoading}
  showCloseOption={!isClosed}
  closeLabel={t("deleteDialog.closeInstead")}
  onClose={async () => {
    setCloseLoading(true);
    const result = await closeList(locale, list.slug);
    setCloseLoading(false);
    if (!result.error) setDeleteOpen(false);
  }}
  closeLoading={closeLoading}
/>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/lists/delete-confirm-dialog.tsx src/components/lists/list-header.tsx
git commit -m "feat: redesign delete dialog with close suggestion"
```

---

## Chunk 7: Translations & Integration Testing

### Task 16: Add Translation Strings

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/pl.json`

- [ ] **Step 1: Add EN translations**

**Important:** Merge these keys into the existing namespaces in `messages/en.json` — do NOT replace the entire namespace objects. The JSON snippets below show only the new keys to add:

```json
{
  "lists": {
    "countdown": {
      "until": "Time until the event",
      "days": "days",
      "hours": "hours",
      "minutes": "minutes",
      "seconds": "seconds",
      "today": "Today is the day!",
      "passed": "This event has passed"
    },
    "close": "Close list",
    "reopen": "Reopen list",
    "closedBadge": "Closed",
    "closeDialog": {
      "title": "Close this list?",
      "description": "No new reservations will be accepted. Existing reservations are preserved. You can reopen the list later if the event date hasn't passed.",
      "confirm": "Close list",
      "cancel": "Cancel"
    },
    "deleteDialog": {
      "title": "Permanently delete this list?",
      "descriptionWithClose": "All items and reservations will be permanently lost. If you just want to stop accepting reservations, you can close the list instead.",
      "deletePermanently": "Delete permanently",
      "closeInstead": "Close list instead",
      "cancel": "Cancel"
    },
    "summary": {
      "title": "Gift Summary",
      "giftsReserved": "{percentage}% of gifts were reserved",
      "anonymous": "Anonymous"
    },
    "surpriseReveal": {
      "title": "Reveal your gifts?",
      "description": "Your list had Full Surprise mode. Would you like to see who reserved your gifts?",
      "reveal": "Reveal",
      "notYet": "Not yet"
    },
    "revealButton": "Reveal reservations"
  }
}
```

Add to the `public` namespace:
```json
{
  "public": {
    "listClosed": "This list is closed",
    "eventPassed": "This event has passed"
  }
}
```

Add to the `dashboard` namespace:
```json
{
  "dashboard": {
    "myLists": {
      "closed": "Closed"
    }
  }
}
```

- [ ] **Step 2: Add PL translations**

**Important:** Merge these keys into the existing namespaces in `messages/pl.json` — same merge approach as EN:

```json
{
  "lists": {
    "countdown": {
      "until": "Czas do wydarzenia",
      "days": "dni",
      "hours": "godziny",
      "minutes": "minuty",
      "seconds": "sekundy",
      "today": "To jest ten dzień!",
      "passed": "Wydarzenie już się odbyło"
    },
    "close": "Zamknij listę",
    "reopen": "Otwórz ponownie",
    "closedBadge": "Zamknięta",
    "closeDialog": {
      "title": "Zamknąć tę listę?",
      "description": "Nowe rezerwacje nie będą przyjmowane. Istniejące rezerwacje zostaną zachowane. Możesz ponownie otworzyć listę, jeśli data wydarzenia jeszcze nie minęła.",
      "confirm": "Zamknij listę",
      "cancel": "Anuluj"
    },
    "deleteDialog": {
      "title": "Trwale usunąć tę listę?",
      "descriptionWithClose": "Wszystkie przedmioty i rezerwacje zostaną trwale utracone. Jeśli chcesz tylko przestać przyjmować rezerwacje, możesz zamiast tego zamknąć listę.",
      "deletePermanently": "Usuń trwale",
      "closeInstead": "Zamknij listę",
      "cancel": "Anuluj"
    },
    "summary": {
      "title": "Podsumowanie prezentów",
      "giftsReserved": "{percentage}% prezentów zostało zarezerwowanych",
      "anonymous": "Anonim"
    },
    "surpriseReveal": {
      "title": "Odsłonić prezenty?",
      "description": "Twoja lista miała tryb Pełnej Niespodzianki. Czy chcesz zobaczyć, kto zarezerwował Twoje prezenty?",
      "reveal": "Odsłoń",
      "notYet": "Jeszcze nie"
    },
    "revealButton": "Odsłoń rezerwacje"
  }
}
```

```json
{
  "public": {
    "listClosed": "Ta lista jest zamknięta",
    "eventPassed": "Wydarzenie już się odbyło"
  }
}
```

```json
{
  "dashboard": {
    "myLists": {
      "closed": "Zamknięta"
    }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add messages/en.json messages/pl.json
git commit -m "feat: add EN and PL translations for countdown and lifecycle"
```

---

### Task 17: Update PROJECT.md

**Files:**
- Modify: `PROJECT.md`

- [ ] **Step 1: Update feature checklist in PROJECT.md**

Mark countdown and lifecycle features as done. Update the List Lifecycle section to reflect the implemented behavior. Add notes about slug history.

- [ ] **Step 2: Update CLAUDE.md**

Update the "Database Tables" section to add:
- **list_slug_history** — stores old slugs for redirect after list rename (FK cascade to lists)

Update the "Lists" entry to mention `is_closed`, `closed_at`, `surprise_revealed` columns.

- [ ] **Step 3: Commit**

```bash
git add PROJECT.md CLAUDE.md
git commit -m "docs: update PROJECT.md and CLAUDE.md with countdown and lifecycle features"
```

---

### Task 18: E2E Tests

**Files:**
- Create: `e2e/countdown-lifecycle.spec.ts`

- [ ] **Step 1: Write E2E tests covering all new features**

Tests should cover:
1. **Countdown display:** Create a list with future event date → verify countdown shows on detail page
2. **Past event:** Create a list with past event date → verify "event passed" message
3. **Close list:** Open list → click Close → verify closed badge, reserve disabled
4. **Reopen list:** Close a list (no event date) → click Reopen → verify active again
5. **Delete dialog with close option:** Click Delete → verify dialog shows "Close instead" option
6. **Delete dialog on closed list:** Close list first → click Delete → verify no "Close instead" option
7. **Public closed list:** Visit public URL of closed list → verify reserve buttons hidden, closed banner shown
8. **Slug history redirect:** Create list → edit name → visit old URL → verify redirect to new URL
9. **Summary card on closed list:** Close list with reservations → verify summary shows on owner view
10. **Full Surprise reveal:** Create Full Surprise list → close → verify reveal dialog → reveal → verify summary
11. **Cancel reservation on closed list:** Close a list with existing reservation → logged-in user can still cancel their reservation

Follow existing E2E test patterns in the codebase (check `e2e/` directory for conventions).

- [ ] **Step 2: Run tests**

```bash
npx playwright test e2e/countdown-lifecycle.spec.ts
```

- [ ] **Step 3: Fix any failures and re-run**

- [ ] **Step 4: Run full test suite**

```bash
npx playwright test
```

- [ ] **Step 5: Commit**

```bash
git add e2e/countdown-lifecycle.spec.ts
git commit -m "test: add E2E tests for countdown and list lifecycle"
```

---

### Task 19: Final Checks

- [ ] **Step 1: Run linter and type check**

```bash
npx next lint
npx tsc --noEmit
```

- [ ] **Step 2: Fix any lint/type errors**

- [ ] **Step 3: Run full E2E suite one more time**

```bash
npx playwright test
```

- [ ] **Step 4: Final commit if any fixes were needed**
