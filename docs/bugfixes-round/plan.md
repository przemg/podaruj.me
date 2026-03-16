# Bugfixes Round Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 9 bugs in the podaruj.me gift list platform — no new features.

**Architecture:** All fixes are isolated changes to existing components, server actions, translations, and styles. One new DB migration adds a `confetti_shown` column. A new `src/lib/layout.ts` centralizes content width constants.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Supabase (Postgres), Tailwind CSS, shadcn/ui, next-intl, Playwright (testing)

---

## Chunk 1: Server-Side Guards and Database Migration (Fixes 1, 2, 4)

### Task 1: Add `confetti_shown` column to lists table

**Files:**
- Create: `supabase/migrations/20260316120000_add_confetti_shown.sql`

- [ ] **Step 1: Create migration file**

```sql
-- Add confetti_shown column to track if celebratory confetti has been shown
ALTER TABLE public.lists ADD COLUMN confetti_shown BOOLEAN DEFAULT false;
```

- [ ] **Step 2: Run migration locally**

Run: `npx supabase db push` or apply via Supabase dashboard.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260316120000_add_confetti_shown.sql
git commit -m "feat(db): add confetti_shown column to lists table"
```

---

### Task 2: Add closed-list guards to server actions + fix reopen + add confetti action

**Files:**
- Modify: `src/app/[locale]/dashboard/lists/actions.ts`

This task adds:
1. Closed-list guards on `updateList`, `createItem`, `updateItem`, `deleteItem`, `reorderItems`
2. Remove event-date restriction from `reopenList` + reset `confetti_shown`
3. New `markConfettiShown` action

All guards follow the same inline pattern: fetch list closed state, call `isListClosed()`, return error if closed.

- [ ] **Step 1: Guard `updateList`**

In `updateList`, after `const { supabase } = await getAuthenticatedClient();` (line 141), add:

```typescript
  // Block editing closed lists
  const { data: closedCheck } = await supabase
    .from("lists")
    .select("is_closed, event_date, event_time")
    .eq("slug", slug)
    .single();

  if (closedCheck && isListClosed({ is_closed: closedCheck.is_closed, event_date: closedCheck.event_date, event_time: closedCheck.event_time })) {
    return { error: "This list is closed. Reopen it to make changes." };
  }
```

- [ ] **Step 2: Guard `createItem`**

In `createItem`, after `const { supabase } = await getAuthenticatedClient();` add:

```typescript
  // Block adding items to closed lists
  const { data: parentList } = await supabase
    .from("lists")
    .select("is_closed, event_date, event_time")
    .eq("id", listId)
    .single();

  if (parentList && isListClosed({ is_closed: parentList.is_closed, event_date: parentList.event_date, event_time: parentList.event_time })) {
    return { error: "This list is closed. Reopen it to make changes." };
  }
```

- [ ] **Step 3: Guard `updateItem`**

Modify the existing `.select()` in `updateItem` (line ~400) to also fetch closed state. Change:

```typescript
  .select("privacy_mode, is_published, published_at")
```
to:
```typescript
  .select("privacy_mode, is_published, published_at, is_closed, event_date, event_time")
```

Then add a null check (currently missing) and the closed guard BEFORE the Full Surprise lock check:

```typescript
  if (!list) return { error: "List not found" };

  if (isListClosed({ is_closed: list.is_closed, event_date: list.event_date, event_time: list.event_time })) {
    return { error: "This list is closed. Reopen it to make changes." };
  }
```

- [ ] **Step 4: Guard `deleteItem`**

Same pattern as `updateItem`. Change the select from:
```typescript
  .select("privacy_mode, is_published, published_at")
```
to:
```typescript
  .select("privacy_mode, is_published, published_at, is_closed, event_date, event_time")
```

Add null check (currently missing) and closed guard BEFORE the Full Surprise lock check:
```typescript
  if (!list) return { error: "List not found" };

  if (isListClosed({ is_closed: list.is_closed, event_date: list.event_date, event_time: list.event_time })) {
    return { error: "This list is closed. Reopen it to make changes." };
  }
```

- [ ] **Step 5: Guard `reorderItems`**

In `reorderItems`, after `const { supabase } = await getAuthenticatedClient();` add:

```typescript
  // Block reordering on closed lists
  const { data: parentList } = await supabase
    .from("lists")
    .select("is_closed, event_date, event_time")
    .eq("id", listId)
    .single();

  if (parentList && isListClosed({ is_closed: parentList.is_closed, event_date: parentList.event_date, event_time: parentList.event_time })) {
    return { error: "This list is closed. Reopen it to make changes." };
  }
```

- [ ] **Step 6: Fix `reopenList` — remove event-date restriction + reset confetti**

Replace the body of `reopenList` from the event-date check onwards. Remove these lines:

```typescript
  // Cannot reopen if event date/time has passed
  if (isListClosed({ is_closed: false, event_date: list.event_date, event_time: list.event_time })) {
    return { error: "Cannot reopen a list whose event date has passed" };
  }
```

And change the update to also reset confetti:

```typescript
  const { error } = await supabase
    .from("lists")
    .update({ is_closed: false, closed_at: null, confetti_shown: false })
    .eq("slug", slug);
```

- [ ] **Step 7: Add `markConfettiShown` action**

Add at the end of the file, before the Item Actions section:

```typescript
export async function markConfettiShown(
  locale: string,
  slug: string
): Promise<ActionResult> {
  const { supabase } = await getAuthenticatedClient();

  const { error } = await supabase
    .from("lists")
    .update({ confetti_shown: true })
    .eq("slug", slug);

  if (error) return { error: "Failed to mark confetti as shown" };

  revalidatePath(`/${locale}/dashboard/lists/${slug}`);
  return {};
}
```

- [ ] **Step 8: Commit**

```bash
git add src/app/[locale]/dashboard/lists/actions.ts
git commit -m "fix: add closed-list guards, fix reopen, add confetti tracking action"
```

---

### Task 3: Add translations for closed-list messages (Fixes 1, 2)

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/pl.json`

- [ ] **Step 1: Add English translations**

In `en.json`, inside the `"items"` object, add:

```json
"closedBanner": "This list is closed. Reopen it to make changes.",
```

In `en.json`, inside the `"lists" > "detail"` object (since `list-header.tsx` uses `useTranslations("lists.detail")`), add:

```json
"eventPassedNote": "The event date has passed, but you can still manage this list.",
```

- [ ] **Step 2: Add Polish translations**

In `pl.json`, same locations (`items.closedBanner` and `lists.detail.eventPassedNote`):

```json
"closedBanner": "Ta lista jest zamknięta. Otwórz ją ponownie, aby wprowadzić zmiany.",
```

```json
"eventPassedNote": "Data wydarzenia minęła, ale nadal możesz zarządzać tą listą.",
```

- [ ] **Step 3: Commit**

```bash
git add messages/en.json messages/pl.json
git commit -m "i18n: add closed list and event passed note translations"
```

---

## Chunk 2: UI Fixes for Closed Lists and Confetti (Fixes 1, 2, 3, 4)

### Task 4: Update list detail page to pass closed state and confetti flag

**Files:**
- Modify: `src/app/[locale]/dashboard/lists/[id]/page.tsx`

**Note:** The `lists` table is fetched with `.select("*")`, so `confetti_shown` will be in the data after migration. Since this project doesn't use generated Supabase types (it uses manual types), we just access it directly — TypeScript will infer it from the `any` return of `.select("*")`. If type errors occur, use `(list as any).confetti_shown ?? false`.

- [ ] **Step 1: Pass `isClosed` to GiftList**

In the return JSX, add `isClosed` prop to `<GiftList>`:

```tsx
      <GiftList
        items={items ?? []}
        listId={list.id}
        listSlug={list.slug}
        locale={locale}
        reservations={reservations}
        privacyMode={list.privacy_mode}
        reservedItemIds={reservedItemIds}
        isPublished={list.is_published}
        publishedAt={list.published_at}
        isClosed={isClosed}
      />
```

- [ ] **Step 2: Pass `confettiShown` and `slug` to SummaryCard**

Change the `<SummaryCard>` usage:

```tsx
          <SummaryCard
            listId={list.id}
            listSlug={list.slug}
            closedAt={list.closed_at ?? list.event_date ?? ""}
            totalItems={summaryData.totalItems}
            reservedCount={summaryData.reservedCount}
            reservations={summaryData.reservations}
            confettiShown={list.confetti_shown ?? false}
            locale={locale}
          />
```

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/dashboard/lists/[id]/page.tsx
git commit -m "fix: pass isClosed and confetti state to child components"
```

---

### Task 5: Update GiftList to respect closed state

**Files:**
- Modify: `src/components/lists/gift-list.tsx`

- [ ] **Step 1: Add `isClosed` prop**

In the `GiftListProps` type, add:

```typescript
  isClosed?: boolean;
```

Destructure it in the component:

```typescript
export function GiftList({
  items,
  listId,
  listSlug,
  locale,
  reservations,
  privacyMode,
  reservedItemIds,
  isPublished,
  publishedAt,
  isClosed,
}: GiftListProps) {
```

- [ ] **Step 2: Add closed banner and hide add/sort controls**

Import `Archive` from lucide-react. Add `Info` too for the banner icon.

Replace the section header div (the `mb-5 flex` container) with:

```tsx
      {isClosed ? (
        <div className="mb-5 flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 ring-1 ring-gray-200/60">
          <Archive className="h-4.5 w-4.5 shrink-0 text-gray-400" />
          <p className="text-sm text-gray-600">{t("closedBanner")}</p>
        </div>
      ) : (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          {/* existing section header content */}
        </div>
      )}
```

Keep the existing section header content inside the else branch.

- [ ] **Step 3: Disable edit/delete/drag on items when closed**

When passing props to `SortableGiftCard`, add disabled state when closed:

```typescript
                    isDragDisabled={isDragDisabled || !!isClosed}
                    // ...
                    onEdit={() => !isClosed && handleEdit(item)}
                    onDelete={() => !isClosed && handleDeleteClick(item)}
                    isLocked={itemLocked || !!isClosed}
```

- [ ] **Step 4: Hide empty state CTA when closed**

In the empty state block, conditionally hide the "Add gift" button:

```tsx
          {!isClosed && (
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="mt-4 cursor-pointer bg-landing-coral-dark text-white hover:bg-landing-coral-hover"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              {t("addButton")}
            </Button>
          )}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/lists/gift-list.tsx
git commit -m "fix: block adding/editing items on closed lists with banner"
```

---

### Task 6: Update ListHeader — hide edit when closed, always show reopen, fix mobile layout

**Files:**
- Modify: `src/components/lists/list-header.tsx`

- [ ] **Step 1: Fix `canReopen` — always allow reopen for closed lists**

Replace the `canReopen` logic (lines 95-98):

```typescript
  const canReopen = list.is_closed;
```

- [ ] **Step 2: Add event-passed detection for reopen note**

Add below `canReopen`:

```typescript
  const eventDatePassed = list.event_date
    ? isListClosed({ is_closed: false, event_date: list.event_date, event_time: list.event_time })
    : false;
```

Import `useTranslations` for the new keys — already imported. Add translations usage:

```typescript
  const tItems = useTranslations("items");
```

- [ ] **Step 3: Hide Edit button when closed**

Wrap the Edit button with `{!isClosed && (...)}`:

```tsx
            {!isClosed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  router.push(`/dashboard/lists/${list.slug}/edit`)
                }
                className="h-9 cursor-pointer gap-1.5 text-landing-text-muted hover:bg-landing-peach-wash hover:text-landing-text"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("editButton")}</span>
              </Button>
            )}
```

- [ ] **Step 4: Show event-passed note when canReopen and event has passed**

Below the actions row closing `</div>`, inside the card but after the actions, add:

```tsx
        {canReopen && eventDatePassed && (
          <p className="mt-3 text-xs text-landing-text-muted">
            {t("eventPassedNote")}
          </p>
        )}
```

- [ ] **Step 5: Fix mobile layout — 2-row action buttons**

Replace the actions row container. The current actions row is:

```tsx
        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-landing-text/[0.06] pt-4">
```

Replace with a mobile-friendly grid layout:

```tsx
        <div className="mt-4 border-t border-landing-text/[0.06] pt-4">
          {/* Mobile: grid layout, Desktop: flex row */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-1.5">
```

Make the Share button always show full text with `whitespace-nowrap` and span full column on mobile:

For the `SharePopover`, wrap it:
```tsx
          {!isDraft && (
            <div className="col-span-2 sm:col-span-1">
              <SharePopover list={list} locale={locale} />
            </div>
          )}
```

The action buttons (close/reopen, edit, delete) go in the remaining grid cells. Remove the `ml-auto` wrapper div and just place buttons directly in the grid:

```tsx
            {isManuallyClosable && (
              <Button variant="ghost" size="sm" onClick={() => setCloseOpen(true)}
                className="h-9 w-full cursor-pointer justify-center gap-1.5 text-landing-text-muted hover:bg-orange-50 hover:text-orange-600 sm:w-auto sm:justify-start">
                <Archive className="h-3.5 w-3.5" />
                {tLists("close")}
              </Button>
            )}
            {canReopen && (
              <Button variant="ghost" size="sm" onClick={handleReopen} disabled={closeLoading}
                className="h-9 w-full cursor-pointer justify-center gap-1.5 text-landing-text-muted hover:bg-emerald-50 hover:text-emerald-600 sm:w-auto sm:justify-start">
                <ArchiveRestore className="h-3.5 w-3.5" />
                {tLists("reopen")}
              </Button>
            )}
            {!isClosed && (
              <Button variant="ghost" size="sm"
                onClick={() => router.push(`/dashboard/lists/${list.slug}/edit`)}
                className="h-9 w-full cursor-pointer justify-center gap-1.5 text-landing-text-muted hover:bg-landing-peach-wash hover:text-landing-text sm:w-auto sm:justify-start">
                <Pencil className="h-3.5 w-3.5" />
                {t("editButton")}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}
              className="h-9 w-full cursor-pointer justify-center gap-1.5 text-landing-text-muted hover:bg-red-50 hover:text-red-500 sm:w-auto sm:justify-start">
              <Trash2 className="h-3.5 w-3.5" />
              {t("deleteButton")}
            </Button>
          </div>
        </div>
```

On desktop (`sm:`), the `sm:flex` takes over and shows the familiar row. On mobile, the `grid-cols-2` creates a 2×2 grid. Share spans 2 columns. Every button shows its label (remove the `hidden sm:inline` from labels).

- [ ] **Step 6: Commit**

```bash
git add src/components/lists/list-header.tsx
git commit -m "fix: hide edit on closed lists, always allow reopen, improve mobile layout"
```

---

### Task 7: Guard edit page against closed lists

**Files:**
- Modify: `src/app/[locale]/dashboard/lists/[id]/edit/page.tsx`

- [ ] **Step 1: Add redirect when list is closed**

Import `isListClosed` and `redirect`:

```typescript
import { isListClosed } from "@/lib/countdown";
import { redirect } from "next/navigation";
```

After fetching the list, add:

```typescript
  if (isListClosed({ is_closed: list.is_closed, event_date: list.event_date, event_time: list.event_time })) {
    redirect(`/${locale}/dashboard/lists/${slug}`);
  }
```

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/dashboard/lists/[id]/edit/page.tsx
git commit -m "fix: redirect to detail page when trying to edit closed list"
```

---

### Task 8: Update SummaryCard to use database-backed confetti tracking

**Files:**
- Modify: `src/components/lists/summary-card.tsx`

- [ ] **Step 1: Update props and imports**

Add the new props and import the server action:

```typescript
import { markConfettiShown } from "@/app/[locale]/dashboard/lists/actions";
```

Update the type:

```typescript
type SummaryCardProps = {
  listId: string;
  listSlug: string;
  closedAt: string;
  totalItems: number;
  reservedCount: number;
  reservations: ReservationSummaryItem[];
  confettiShown: boolean;
  locale: string;
};
```

- [ ] **Step 2: Replace localStorage logic with database check**

Remove ALL `localStorage` references (`localStorage.getItem`, `localStorage.setItem`). Replace the entire `useEffect` with:

```typescript
  useEffect(() => {
    if (confettiFired.current || confettiShown) return;
    confettiFired.current = true;

    // Mark as shown in DB
    markConfettiShown(locale, listSlug);

    import("canvas-confetti").then((confettiModule) => {
      const confetti = confettiModule.default;
      const colors = ["#f97316", "#fbbf24", "#fb923c", "#f472b6", "#a855f7", "#ec4899"];

      confetti({ particleCount: 120, spread: 80, origin: { x: 0.1, y: 0.6 }, colors });
      confetti({ particleCount: 120, spread: 80, origin: { x: 0.9, y: 0.6 }, colors });

      setTimeout(() => {
        confetti({ particleCount: 100, spread: 90, origin: { x: 0.3, y: 0.5 }, colors });
        confetti({ particleCount: 100, spread: 90, origin: { x: 0.7, y: 0.5 }, colors });
      }, 400);

      setTimeout(() => {
        confetti({ particleCount: 80, spread: 100, origin: { x: 0.5, y: 0.4 }, colors });
      }, 800);

      setTimeout(() => {
        confetti({ particleCount: 60, spread: 120, origin: { x: 0.2, y: 0.7 }, colors });
        confetti({ particleCount: 60, spread: 120, origin: { x: 0.8, y: 0.7 }, colors });
      }, 1200);
    });
  }, [listId, closedAt, confettiShown, locale, listSlug]);
```

Update the destructuring to include the new props:

```typescript
export function SummaryCard({ listId, listSlug, closedAt, totalItems, reservedCount, reservations, confettiShown, locale }: SummaryCardProps) {
```

- [ ] **Step 3: Commit**

```bash
git add src/components/lists/summary-card.tsx
git commit -m "fix: track confetti in database instead of localStorage"
```

---

## Chunk 3: Landing Page Animations and Footer Fixes (Fixes 5, 6, 7)

### Task 9: Speed up scroll-reveal animations

**Files:**
- Modify: `src/lib/use-scroll-reveal.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update IntersectionObserver options**

In `use-scroll-reveal.ts`, change the observer creation to add `rootMargin`:

```typescript
    const observer = new IntersectionObserver(
      (entries) => {
        // ... existing callback unchanged
      },
      { threshold, rootMargin: "0px 0px 200px 0px" }
    );
```

Change the default threshold from `0.15` to `0.05`:

```typescript
  const { threshold = 0.05, staggerDelay = 100 } = options;
```

- [ ] **Step 2: Reduce animation durations in globals.css**

Change all three `.revealed` animation durations from `0.6s` to `0.45s`:

```css
.scroll-reveal.revealed {
  animation: fade-in-up 0.45s ease-out forwards;
}

.scroll-reveal-right.revealed {
  animation: fade-in-right 0.45s ease-out forwards;
}

.scroll-reveal-scale.revealed {
  animation: scale-in 0.45s ease-out forwards;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/use-scroll-reveal.ts src/app/globals.css
git commit -m "fix: speed up scroll-reveal animations with earlier trigger and faster duration"
```

---

### Task 10: Reduce stagger delays across landing sections

**Files:**
- Modify: `src/components/landing/hero.tsx`
- Modify: `src/components/landing/how-it-works.tsx`
- Modify: `src/components/landing/features.tsx`
- Modify: `src/components/landing/testimonials.tsx`
- Modify: `src/components/landing/faq.tsx`
- Modify: `src/components/landing/cta-section.tsx`

- [ ] **Step 1: Update stagger delays**

In each file, change the `useScrollReveal` call:

- `hero.tsx`: `{ staggerDelay: 150 }` → `{ staggerDelay: 80 }`
- `how-it-works.tsx`: `{ staggerDelay: 200 }` → `{ staggerDelay: 80 }`
- `features.tsx`: `{ staggerDelay: 120 }` → `{ staggerDelay: 60 }`
- `testimonials.tsx`: `leftRef` default → `{ staggerDelay: 60 }`, `rightRef` `{ staggerDelay: 120 }` → `{ staggerDelay: 80 }`
- `faq.tsx`: `{ staggerDelay: 100 }` → `{ staggerDelay: 60 }`
- `cta-section.tsx`: default → `{ staggerDelay: 60 }`

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/hero.tsx src/components/landing/how-it-works.tsx src/components/landing/features.tsx src/components/landing/testimonials.tsx src/components/landing/faq.tsx src/components/landing/cta-section.tsx
git commit -m "fix: reduce stagger delays across landing page sections"
```

---

### Task 11: Fix name declension in Polish translations

**Files:**
- Modify: `messages/pl.json`

- [ ] **Step 1: Update all 3 `builtBy` translations**

Change:
- `landing.footer.builtBy`: `"Stworzone przez Przemysława Gwóźdź"` → `"Autor: Przemysław Gwóźdź"`
- `dashboard.builtBy`: `"Stworzone przez Przemysława Gwóździa"` → `"Autor: Przemysław Gwóźdź"`
- `public.builtBy`: `"Stworzone przez Przemysława Gwóździa"` → `"Autor: Przemysław Gwóźdź"`

- [ ] **Step 2: Commit**

```bash
git add messages/pl.json
git commit -m "fix: use undeclined name in Polish translations"
```

---

### Task 12: Make footer links easier to tap on mobile

**Files:**
- Modify: `src/components/author-credit.tsx`

- [ ] **Step 1: Update AuthorCredit component**

Replace the entire component:

```tsx
import { Github, Linkedin } from "lucide-react";

export function AuthorCredit({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-sm sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-2 sm:gap-y-1">
      <span>{label}</span>
      <span className="hidden sm:inline" aria-hidden="true">·</span>
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
        <a
          href="https://github.com/przemg"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 py-2 underline decoration-current/30 underline-offset-2 transition-colors hover:decoration-current/60 sm:min-h-0 sm:px-0 sm:py-1"
        >
          <Github className="h-4 w-4" />
          <span>GitHub</span>
        </a>
        <a
          href="https://www.linkedin.com/in/przemyslawgwozdz/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 py-2 underline decoration-current/30 underline-offset-2 transition-colors hover:decoration-current/60 sm:min-h-0 sm:px-0 sm:py-1"
        >
          <Linkedin className="h-4 w-4" />
          <span>LinkedIn</span>
        </a>
      </div>
    </div>
  );
}
```

Key changes:
- Mobile: vertical stack with 44px min tap targets, full text labels always visible
- Desktop (sm+): horizontal row as before
- Icon size: `h-4 w-4` (up from `h-3.5 w-3.5`)
- Removed `sr-only` — text always visible

- [ ] **Step 2: Commit**

```bash
git add src/components/author-credit.tsx
git commit -m "fix: larger tap targets and visible labels for footer links on mobile"
```

---

## Chunk 4: Content Width System (Fix 8)

### Task 13: Create centralized layout width constants

**Files:**
- Create: `src/lib/layout.ts`

- [ ] **Step 1: Create the constants file**

```typescript
/**
 * Centralized content width constants.
 * Change values here to update widths across the entire app.
 */

/** Landing page sections, site header, and site footer */
export const LANDING_MAX_WIDTH = "1440px";

/** App header (dashboard, public pages) */
export const APP_HEADER_MAX_WIDTH = "1440px";

/** Dashboard content pages (My Lists, My Reservations, list detail) */
export const DASHBOARD_MAX_WIDTH = "1024px";

/** Forms and settings (create list, edit list, profile) */
export const FORM_MAX_WIDTH = "800px";
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/layout.ts
git commit -m "feat: add centralized layout width constants"
```

---

### Task 14: Apply width constants to dashboard layout

**Files:**
- Modify: `src/app/[locale]/dashboard/layout.tsx`

- [ ] **Step 1: Import constants and apply**

Add import:
```typescript
import { APP_HEADER_MAX_WIDTH } from "@/lib/layout";
```

Change the header and footer `maxWidth` from `"1280px"` to `APP_HEADER_MAX_WIDTH`:

```tsx
<div className="mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8" style={{ maxWidth: APP_HEADER_MAX_WIDTH }}>
```

```tsx
<div className="mx-auto px-4 text-landing-text-muted/50 sm:px-6 lg:px-8" style={{ maxWidth: APP_HEADER_MAX_WIDTH }}>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/dashboard/layout.tsx
git commit -m "fix: use centralized width constants in dashboard layout"
```

---

### Task 15: Apply width constants to dashboard pages

**Files:**
- Modify: `src/app/[locale]/dashboard/page.tsx` — change `maxWidth: "1280px"` → import `DASHBOARD_MAX_WIDTH` and use it
- Modify: `src/app/[locale]/dashboard/reservations/page.tsx` — change both `maxWidth: "1280px"` and `max-w-7xl` → `DASHBOARD_MAX_WIDTH`
- Modify: `src/app/[locale]/dashboard/loading.tsx` — change `maxWidth: "1280px"` → `DASHBOARD_MAX_WIDTH`
- Modify: `src/app/[locale]/dashboard/reservations/loading.tsx` — change `maxWidth: "1280px"` → `DASHBOARD_MAX_WIDTH`
- Modify: `src/app/[locale]/dashboard/lists/[id]/page.tsx` — already `1024px`, change to use `DASHBOARD_MAX_WIDTH` constant
- Modify: `src/app/[locale]/dashboard/lists/[id]/loading.tsx` — same, use constant

- [ ] **Step 1: Update each file**

For each file, add `import { DASHBOARD_MAX_WIDTH } from "@/lib/layout";` and replace inline width values.

For `reservations/page.tsx`, there are TWO containers with different widths:
  - Empty state (line ~37): `style={{ maxWidth: "1280px" }}` → change to `DASHBOARD_MAX_WIDTH`
  - With reservations (line ~78): `max-w-7xl` class → remove the class, add `style={{ maxWidth: DASHBOARD_MAX_WIDTH }}`

Both must be updated.

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/dashboard/page.tsx src/app/[locale]/dashboard/reservations/page.tsx src/app/[locale]/dashboard/loading.tsx src/app/[locale]/dashboard/reservations/loading.tsx src/app/[locale]/dashboard/lists/[id]/page.tsx src/app/[locale]/dashboard/lists/[id]/loading.tsx
git commit -m "fix: apply centralized DASHBOARD_MAX_WIDTH across dashboard pages"
```

---

### Task 16: Apply width constants to form pages

**Files:**
- Modify: `src/app/[locale]/dashboard/lists/new/page.tsx` — `max-w-2xl` → `FORM_MAX_WIDTH`
- Modify: `src/app/[locale]/dashboard/lists/[id]/edit/page.tsx` — `max-w-2xl` → `FORM_MAX_WIDTH`
- Modify: `src/app/[locale]/dashboard/settings/page.tsx` — `maxWidth: "768px"` → `FORM_MAX_WIDTH`

- [ ] **Step 1: Update each file**

Add `import { FORM_MAX_WIDTH } from "@/lib/layout";` to each.

For the form pages using `max-w-2xl`, change to:
```tsx
<div className="mx-auto w-full px-4 py-8" style={{ maxWidth: FORM_MAX_WIDTH }}>
```

For settings, change the existing `maxWidth: "768px"` to `FORM_MAX_WIDTH`.

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/dashboard/lists/new/page.tsx src/app/[locale]/dashboard/lists/[id]/edit/page.tsx src/app/[locale]/dashboard/settings/page.tsx
git commit -m "fix: apply centralized FORM_MAX_WIDTH across form pages"
```

---

### Task 17: Apply width constants to landing page sections

**Files:**
- Modify: `src/components/landing/navigation.tsx` — `max-w-7xl` → `LANDING_MAX_WIDTH`
- Modify: `src/components/landing/hero.tsx` — `max-w-7xl` → `LANDING_MAX_WIDTH`
- Modify: `src/components/landing/how-it-works.tsx` — `max-w-7xl` → `LANDING_MAX_WIDTH`
- Modify: `src/components/landing/features.tsx` — `max-w-7xl` → `LANDING_MAX_WIDTH`
- Modify: `src/components/landing/testimonials.tsx` — `max-w-7xl` → `LANDING_MAX_WIDTH`
- Modify: `src/components/landing/faq.tsx` — keep inner `max-w-3xl`, wrap in `LANDING_MAX_WIDTH` outer
- Modify: `src/components/landing/cta-section.tsx` — keep inner `max-w-3xl`, wrap in `LANDING_MAX_WIDTH` outer
- Modify: `src/components/landing/footer.tsx` — `max-w-7xl` → `LANDING_MAX_WIDTH`

- [ ] **Step 1: Update each landing component**

For components that use `max-w-7xl` class on the container, replace with:
```tsx
<div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: LANDING_MAX_WIDTH }}>
```

Import: `import { LANDING_MAX_WIDTH } from "@/lib/layout";`

For `faq.tsx` and `cta-section.tsx`: these are full-width sections with narrow inner content (`max-w-3xl`). **Leave them as-is** — no outer max-width needed since the section backgrounds span full viewport width and the inner content is already centered and narrow. The `LANDING_MAX_WIDTH` constant only applies to sections with multi-column layouts.

For `navigation.tsx` (client component): import the constant and use it with inline style instead of `max-w-7xl`:
```tsx
<div className="mx-auto flex items-center justify-between px-4 py-5 sm:px-6 sm:py-6 lg:px-8" style={{ maxWidth: LANDING_MAX_WIDTH }}>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/navigation.tsx src/components/landing/hero.tsx src/components/landing/how-it-works.tsx src/components/landing/features.tsx src/components/landing/testimonials.tsx src/components/landing/faq.tsx src/components/landing/cta-section.tsx src/components/landing/footer.tsx
git commit -m "fix: apply centralized LANDING_MAX_WIDTH across landing sections"
```

---

### Task 18: Apply width constants to public list layout

**Files:**
- Modify: `src/app/[locale]/lists/layout.tsx`

- [ ] **Step 1: Update header and footer widths**

Import: `import { APP_HEADER_MAX_WIDTH } from "@/lib/layout";`

Change header `maxWidth: "1024px"` to `APP_HEADER_MAX_WIDTH`.
Change footer `maxWidth: "1024px"` to `APP_HEADER_MAX_WIDTH`.

The main content area of public lists can keep its current width (set by the page itself).

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/lists/layout.tsx
git commit -m "fix: apply centralized APP_HEADER_MAX_WIDTH to public list layout"
```

---

## Chunk 5: Browser Theme Color and Safe Area (Fix 9)

### Task 19: Update browser theme color and safe area insets

**Files:**
- Modify: `src/app/[locale]/layout.tsx`
- Modify: `src/app/[locale]/dashboard/layout.tsx`
- Modify: `src/app/[locale]/lists/layout.tsx`

- [ ] **Step 1: Change `themeColor` to brand coral**

In `src/app/[locale]/layout.tsx`, change:

```typescript
export const viewport: Viewport = {
  viewportFit: 'cover',
  themeColor: '#F97066',
};
```

- [ ] **Step 2: Add `safe-area-top` to dashboard header**

In `src/app/[locale]/dashboard/layout.tsx`, add `safe-area-top` class to the `<header>`:

```tsx
<header className="safe-area-top relative z-20 border-b border-landing-text/5 bg-white/80 backdrop-blur-sm">
```

- [ ] **Step 3: Add `safe-area-top` to public list layout header if missing**

Check `src/app/[locale]/lists/layout.tsx` header and add `safe-area-top` if not present.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/layout.tsx src/app/[locale]/dashboard/layout.tsx src/app/[locale]/lists/layout.tsx
git commit -m "fix: set brand color for browser toolbar, add safe-area insets to headers"
```

---

## Chunk 6: Testing and Finalization

### Task 20: Run type check and linter

- [ ] **Step 1: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Run linter**

Run: `npx next lint`
Expected: No errors

- [ ] **Step 3: Fix any issues found**

If type errors appear (likely from new props not matching), fix them.

---

### Task 21: Write E2E tests with Playwright

**Files:**
- Create or modify Playwright test files for:
  - Closed list editing blocked
  - Reopen button visible after event date
  - Confetti plays once per close
  - Scroll animations trigger early
  - Footer links accessible on mobile
  - Content widths consistent
  - Browser theme color set

- [ ] **Step 1: Write tests for critical fixes**

Focus on:
1. Closed list blocks add/edit/delete — verify banner shows, buttons hidden
2. Reopen works after event date passed
3. Mobile layout renders properly at 375px
4. Footer links have visible text on mobile viewport

- [ ] **Step 2: Run all E2E tests**

Run: `npx playwright test`
Expected: All tests pass

- [ ] **Step 3: Commit tests**

```bash
git add tests/ e2e/
git commit -m "test: add E2E tests for bugfixes round"
```

---

### Task 22: Final review and push

- [ ] **Step 1: Run /review and /security-review**
- [ ] **Step 2: Run /simplify on modified files**
- [ ] **Step 3: Update PROJECT.md if needed** (confetti tracking is now DB-backed)
- [ ] **Step 4: Push to remote**

```bash
git push origin fix/bugfixes-round
```
