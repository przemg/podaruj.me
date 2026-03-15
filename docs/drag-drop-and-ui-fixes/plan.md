# Drag & Drop, Sorting, and Mobile UI Fixes — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add drag & drop reordering, sorting dropdown, and fix mobile UI issues across the app.

**Architecture:** Three parallel workstreams: (1) DnD reordering using @dnd-kit library wrapping existing GiftList/GiftCard components, (2) client-side sorting with animated transitions using @formkit/auto-animate, (3) mobile UI fixes across navigation, menus, cards, tooltips, and privacy mode form logic.

**Tech Stack:** @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @formkit/auto-animate, existing shadcn/ui + Tailwind + next-intl

---

## Chunk 1: Setup & Dependencies

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install dnd-kit packages**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @formkit/auto-animate
```

- [ ] **Step 2: Verify installation**

```bash
npm ls @dnd-kit/core @dnd-kit/sortable @formkit/auto-animate
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add dnd-kit and auto-animate dependencies"
```

### Task 2: Add i18n translation keys

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/pl.json`

- [ ] **Step 1: Add new English translations**

Add these keys to `messages/en.json`:

In `"items"` section, add:
```json
"sort": {
  "label": "Sort by",
  "custom": "Custom order",
  "priority": "Priority",
  "priceLow": "Price: low to high",
  "priceHigh": "Price: high to low",
  "nameAz": "Name: A-Z",
  "dateNewest": "Newest first",
  "dateOldest": "Oldest first",
  "availableFirst": "Available first"
},
"dragHandle": "Drag to reorder"
```

In `"auth"."userMenu"` section, add:
```json
"myLists": "My Lists"
```

In `"dashboard"."mobile"` section, add:
```json
"createList": "Create new list",
"settings": "Settings",
"myLists": "My Lists",
"myReservations": "My Reservations"
```

In `"lists"."create"` section, add:
```json
"fullSurpriseWarning": "Full Surprise mode is permanent and cannot be changed later. Are you sure?",
"fullSurpriseConfirm": "Yes, use Full Surprise",
"fullSurpriseCancel": "Choose another mode"
```

In `"lists"."edit"` section, add:
```json
"fullSurpriseLocked": "Full Surprise mode cannot be changed after creation to protect the surprise for gift givers."
```

- [ ] **Step 2: Add Polish translations**

Add these keys to `messages/pl.json`:

In `"items"` section, add:
```json
"sort": {
  "label": "Sortuj wg",
  "custom": "Własna kolejność",
  "priority": "Priorytet",
  "priceLow": "Cena: rosnąco",
  "priceHigh": "Cena: malejąco",
  "nameAz": "Nazwa: A-Z",
  "dateNewest": "Najnowsze",
  "dateOldest": "Najstarsze",
  "availableFirst": "Dostępne najpierw"
},
"dragHandle": "Przeciągnij aby zmienić kolejność"
```

In `"auth"."userMenu"` section, add:
```json
"myLists": "Moje listy"
```

In `"dashboard"."mobile"` section, add:
```json
"createList": "Utwórz nową listę",
"settings": "Ustawienia",
"myLists": "Moje listy",
"myReservations": "Moje rezerwacje"
```

In `"lists"."create"` section, add:
```json
"fullSurpriseWarning": "Tryb Pełna Niespodzianka jest trwały i nie można go zmienić później. Czy jesteś pewien?",
"fullSurpriseConfirm": "Tak, użyj Pełnej Niespodzianki",
"fullSurpriseCancel": "Wybierz inny tryb"
```

In `"lists"."edit"` section, add:
```json
"fullSurpriseLocked": "Trybu Pełna Niespodzianka nie można zmienić po utworzeniu, aby chronić niespodziankę dla kupujących."
```

- [ ] **Step 3: Commit**

```bash
git add messages/en.json messages/pl.json
git commit -m "feat: add i18n keys for sorting, drag-drop, and mobile menu"
```

---

## Chunk 2: Drag & Drop Reordering

### Task 3: Add drag handle to GiftCard

**Files:**
- Modify: `src/components/lists/gift-card.tsx`

- [ ] **Step 1: Add drag handle prop and GripVertical icon**

Add to imports:
```typescript
import { GripVertical } from "lucide-react";
```

Add new props to `GiftCardProps`:
```typescript
dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
isDragDisabled?: boolean;
```

- [ ] **Step 2: Replace the reorder buttons strip with drag handle + bigger move buttons**

Replace the `{/* Reorder — compact vertical strip */}` section. The new layout:
- Drag handle (GripVertical) at top — receives `dragHandleProps` for dnd-kit
- Move up/down buttons below — bigger tap targets (h-10 w-10 on mobile, h-8 w-8 on desktop)
- When `isDragDisabled` is true, the drag handle is greyed out

```tsx
{/* Reorder controls */}
<div className="flex flex-col items-center gap-0.5 pt-0.5">
  <button
    {...dragHandleProps}
    className={`flex h-8 w-8 touch-none items-center justify-center rounded-md transition-colors ${
      isDragDisabled
        ? "cursor-not-allowed text-landing-text-muted/20"
        : "cursor-grab text-landing-text-muted/40 hover:bg-landing-text/5 hover:text-landing-text active:cursor-grabbing"
    }`}
    aria-label={t("dragHandle")}
    tabIndex={isDragDisabled ? -1 : 0}
  >
    <GripVertical className="h-4 w-4" />
  </button>
  <button
    onClick={onMoveUp}
    disabled={isFirst || isDragDisabled}
    className="flex h-10 w-10 sm:h-8 sm:w-8 cursor-pointer items-center justify-center rounded-md text-landing-text-muted/40 transition-colors hover:bg-landing-text/5 hover:text-landing-text disabled:invisible"
    aria-label={t("moveUp")}
  >
    <ChevronUp className="h-4 w-4" />
  </button>
  <button
    onClick={onMoveDown}
    disabled={isLast || isDragDisabled}
    className="flex h-10 w-10 sm:h-8 sm:w-8 cursor-pointer items-center justify-center rounded-md text-landing-text-muted/40 transition-colors hover:bg-landing-text/5 hover:text-landing-text disabled:invisible"
    aria-label={t("moveDown")}
  >
    <ChevronDown className="h-4 w-4" />
  </button>
</div>
```

- [ ] **Step 3: Verify build compiles**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 4: Commit**

```bash
git add src/components/lists/gift-card.tsx
git commit -m "feat: add drag handle and bigger move buttons to gift card"
```

### Task 4: Wrap GiftList with DnD context

**Files:**
- Modify: `src/components/lists/gift-list.tsx`

- [ ] **Step 1: Add dnd-kit imports and sortable wrapper**

Add imports:
```typescript
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
```

- [ ] **Step 2: Create SortableGiftCard wrapper component**

Add inside the file, before the GiftList component:
```typescript
function SortableGiftCard({
  item,
  isDragDisabled,
  ...cardProps
}: {
  item: ItemData;
  isDragDisabled: boolean;
} & Omit<React.ComponentProps<typeof GiftCard>, "dragHandleProps" | "isDragDisabled">) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: isDragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto" as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <GiftCard
        {...cardProps}
        item={item}
        isDragDisabled={isDragDisabled}
        dragHandleProps={{ ...attributes, ...listeners } as React.HTMLAttributes<HTMLButtonElement>}
      />
    </div>
  );
}
```

- [ ] **Step 3: Add DnD context and sensors to GiftList**

Inside the GiftList component, add:
```typescript
const [activeId, setActiveId] = useState<string | null>(null);

const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  }),
  useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);

const handleDragStart = useCallback((event: DragStartEvent) => {
  setActiveId(event.active.id as string);
}, []);

const handleDragEnd = useCallback(
  async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedItems.findIndex((i) => i.id === active.id);
    const newIndex = orderedItems.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = [...orderedItems];
    const [moved] = newItems.splice(oldIndex, 1);
    newItems.splice(newIndex, 0, moved);
    setOrderedItems(newItems);

    await reorderItems(
      locale,
      listId,
      listSlug,
      newItems.map((item) => item.id)
    );
  },
  [orderedItems, locale, listId, listSlug]
);

const activeItem = activeId ? orderedItems.find((i) => i.id === activeId) : null;
```

- [ ] **Step 4: Replace the items rendering with DnD-wrapped version**

Replace the `<div className="space-y-3">` block with:
```tsx
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
>
  <SortableContext
    items={orderedItems.map((i) => i.id)}
    strategy={verticalListSortingStrategy}
  >
    <div className="space-y-3">
      {orderedItems.map((item, index) => {
        const itemLocked = privacyMode === "full_surprise" && isPublished && !!publishedAt && !!item.created_at && item.created_at <= publishedAt;
        return (
          <SortableGiftCard
            key={item.id}
            item={item}
            isDragDisabled={sortMode !== "custom"}
            isFirst={index === 0}
            isLast={index === orderedItems.length - 1}
            locale={locale}
            reservation={reservations?.[item.id]}
            privacyMode={privacyMode}
            isReserved={!!reservations?.[item.id] || !!reservedItemIds?.includes(item.id)}
            hasAnyReservation={(reservedItemIds?.length ?? 0) > 0 || Object.keys(reservations ?? {}).length > 0}
            isLocked={itemLocked}
            onMoveUp={() => handleMoveUp(index)}
            onMoveDown={() => handleMoveDown(index)}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDeleteClick(item)}
          />
        );
      })}
    </div>
  </SortableContext>
  <DragOverlay>
    {activeItem ? (
      <div className="scale-[1.02] rounded-2xl shadow-xl ring-2 ring-landing-coral/20">
        <GiftCard
          item={activeItem}
          isFirst={false}
          isLast={false}
          locale={locale}
          reservation={reservations?.[activeItem.id]}
          privacyMode={privacyMode}
          isReserved={false}
          hasAnyReservation={false}
          isLocked={false}
          isDragDisabled={true}
          onMoveUp={() => {}}
          onMoveDown={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      </div>
    ) : null}
  </DragOverlay>
</DndContext>
```

- [ ] **Step 5: Verify build**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 6: Commit**

```bash
git add src/components/lists/gift-list.tsx
git commit -m "feat: add drag & drop reordering to gift list"
```

---

## Chunk 3: Sorting

### Task 5: Add sort dropdown and client-side sorting to GiftList

**Files:**
- Modify: `src/components/lists/gift-list.tsx`

- [ ] **Step 1: Add auto-animate and sort imports**

```typescript
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";
```

- [ ] **Step 2: Add sort state and sorting logic**

Add inside GiftList component:
```typescript
const [sortMode, setSortMode] = useState<string>("custom");
const [animateRef] = useAutoAnimate();

const sortedItems = useMemo(() => {
  if (sortMode === "custom") return orderedItems;
  const sorted = [...orderedItems];
  switch (sortMode) {
    case "priority": {
      const order = { must_have: 0, would_love: 1, nice_to_have: 2 };
      sorted.sort((a, b) => (order[a.priority as keyof typeof order] ?? 2) - (order[b.priority as keyof typeof order] ?? 2));
      break;
    }
    case "price_low":
      sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
      break;
    case "price_high":
      sorted.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
      break;
    case "name_az":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "date_newest":
      sorted.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
      break;
    case "date_oldest":
      sorted.sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""));
      break;
    case "available_first":
      sorted.sort((a, b) => {
        const aReserved = reservations?.[a.id] || reservedItemIds?.includes(a.id) ? 1 : 0;
        const bReserved = reservations?.[b.id] || reservedItemIds?.includes(b.id) ? 1 : 0;
        return aReserved - bReserved;
      });
      break;
  }
  return sorted;
}, [sortMode, orderedItems, reservations, reservedItemIds]);
```

Add `useMemo` to imports from React.

- [ ] **Step 3: Add sort dropdown to the section header**

Replace the section header div with:
```tsx
<div className="mb-5 flex items-center justify-between gap-3">
  <div className="flex items-center gap-2.5">
    <h2 className="text-lg font-semibold text-landing-text">
      {t("sectionTitle")}
    </h2>
    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-landing-text/5 px-2 text-xs font-medium text-landing-text-muted">
      {orderedItems.length}
    </span>
  </div>
  <div className="flex items-center gap-2">
    {orderedItems.length > 1 && (
      <Select value={sortMode} onValueChange={setSortMode}>
        <SelectTrigger className="h-8 w-auto gap-1.5 border-landing-text/10 px-2.5 text-xs">
          <ArrowUpDown className="h-3 w-3 text-landing-text-muted" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="custom">{tSort("custom")}</SelectItem>
          <SelectItem value="priority">{tSort("priority")}</SelectItem>
          <SelectItem value="price_low">{tSort("priceLow")}</SelectItem>
          <SelectItem value="price_high">{tSort("priceHigh")}</SelectItem>
          <SelectItem value="name_az">{tSort("nameAz")}</SelectItem>
          <SelectItem value="date_newest">{tSort("dateNewest")}</SelectItem>
          <SelectItem value="date_oldest">{tSort("dateOldest")}</SelectItem>
          <SelectItem value="available_first">{tSort("availableFirst")}</SelectItem>
        </SelectContent>
      </Select>
    )}
    <Button
      onClick={() => setAddDialogOpen(true)}
      size="sm"
      className="cursor-pointer bg-landing-coral-dark text-white hover:bg-landing-coral-hover"
    >
      <Plus className="mr-1.5 h-4 w-4" />
      {t("addButton")}
    </Button>
  </div>
</div>
```

Add translation hook:
```typescript
const tSort = useTranslations("items.sort");
```

- [ ] **Step 4: Apply auto-animate ref and use sortedItems for rendering**

Add `ref={animateRef}` to the `<div className="space-y-3">` that wraps items.
Replace `orderedItems.map` with `sortedItems.map` in the rendering loop.

- [ ] **Step 5: Disable DnD and move buttons when sorting is active**

The `isDragDisabled={sortMode !== "custom"}` is already passed in Task 4 Step 4. The move buttons are also disabled via `isDragDisabled` prop which was added to GiftCard in Task 3.

- [ ] **Step 6: Verify build**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 7: Commit**

```bash
git add src/components/lists/gift-list.tsx
git commit -m "feat: add sort dropdown with 8 sort options for gift list"
```

---

## Chunk 4: Mobile UI Fixes

### Task 6: Fix UserMenu z-index and add Dashboard link

**Files:**
- Modify: `src/components/auth/user-menu.tsx`

- [ ] **Step 1: Fix z-index — use z-[100] on dropdown and ensure relative positioning is isolated**

Change the dropdown div's className from `z-50` to `z-[100]`.

- [ ] **Step 2: Add "My Lists" link as first menu item**

Add `LayoutList` to lucide-react imports.

Add this button BEFORE the "Create new list" button:
```tsx
<button
  onClick={() => {
    router.push("/dashboard");
    setIsOpen(false);
  }}
  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-landing-text-muted transition-colors hover:bg-landing-peach-wash hover:text-landing-text"
  role="menuitem"
>
  <LayoutList className="h-4 w-4" />
  {t("myLists")}
</button>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/auth/user-menu.tsx
git commit -m "fix: user menu z-index and add dashboard link"
```

### Task 7: Replace dashboard mobile menu with full-screen overlay

**Files:**
- Modify: `src/components/dashboard/mobile-menu.tsx`

- [ ] **Step 1: Rewrite MobileMenu to use full-screen overlay (matching landing page style)**

Replace the entire component with a full-screen overlay menu instead of Sheet:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { signOut } from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  LogOut,
  User,
  List,
  Gift,
  Plus,
  Settings,
} from "lucide-react";

export function MobileMenu({
  email,
  displayName,
}: {
  email: string;
  displayName?: string | null;
}) {
  const t = useTranslations("dashboard.mobile");
  const tNav = useTranslations("dashboard.nav");
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  async function handleSignOut() {
    setIsOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  }

  const navItems = [
    {
      href: "/dashboard" as const,
      label: t("myLists"),
      icon: List,
      isActive:
        pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/lists"),
    },
    {
      href: "/dashboard/reservations" as const,
      label: t("myReservations"),
      icon: Gift,
      isActive: pathname.startsWith("/dashboard/reservations"),
    },
  ];

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-landing-text-muted transition-colors hover:bg-landing-peach-wash hover:text-landing-text"
        aria-label={t("menu")}
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-white"
          style={{ animation: "slide-in-overlay 0.3s ease-out" }}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex h-full flex-col px-6 pt-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold text-landing-text"
                onClick={() => setIsOpen(false)}
              >
                <Gift className="h-6 w-6 text-landing-coral" />
                <span>Podaruj.me</span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-landing-text transition-colors hover:bg-landing-peach-wash"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* User info */}
            <div className="mt-6 flex items-center gap-3 rounded-xl bg-landing-peach-wash/50 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-landing-coral/10">
                <User className="h-4 w-4 text-landing-coral" />
              </div>
              <span className="truncate text-sm font-medium text-landing-text">
                {displayName || email}
              </span>
            </div>

            {/* Navigation */}
            <nav className="mt-8 flex flex-col gap-2">
              {navItems.map(({ href, label, icon: Icon, isActive }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition-all",
                    isActive
                      ? "bg-landing-coral/10 text-landing-coral-dark"
                      : "text-landing-text hover:bg-landing-peach-wash"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isActive
                        ? "text-landing-coral"
                        : "text-landing-text-muted"
                    )}
                  />
                  {label}
                </Link>
              ))}
              <div className="my-2 h-px bg-landing-text/5" />
              <Link
                href="/dashboard/lists/new"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-landing-coral-dark transition-all hover:bg-landing-peach-wash"
              >
                <Plus className="h-5 w-5 text-landing-coral" />
                {t("createList")}
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-landing-text hover:bg-landing-peach-wash"
              >
                <Settings className="h-5 w-5 text-landing-text-muted" />
                {t("settings")}
              </Link>
            </nav>

            {/* Sign out at bottom */}
            <div className="mt-auto pb-8">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-landing-text-muted transition-all hover:bg-landing-peach-wash hover:text-landing-text"
              >
                <LogOut className="h-5 w-5" />
                {t("signOut")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update dashboard layout to pass displayName to MobileMenu**

In `src/app/[locale]/dashboard/layout.tsx`, change:
```tsx
<MobileMenu email={user.email} />
```
to:
```tsx
<MobileMenu email={user.email} displayName={displayName} />
```

- [ ] **Step 3: Add slide-in-overlay animation if not already in global CSS**

Check if `slide-in-overlay` keyframe animation exists. If not, add it to the global CSS file (or use Tailwind `@keyframes` in `app/globals.css` or equivalent):

```css
@keyframes slide-in-overlay {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/mobile-menu.tsx src/app/[locale]/dashboard/layout.tsx
git commit -m "feat: replace dashboard mobile sidebar with full-screen overlay menu"
```

### Task 8: Fix gift card text overflow on mobile

**Files:**
- Modify: `src/components/lists/gift-card.tsx`

- [ ] **Step 1: Add proper text wrapping classes**

On the item name `<h3>`:
```tsx
<h3 className="font-semibold text-landing-text leading-snug break-words">
```

On the description `<p>`:
```tsx
<p className="mt-0.5 line-clamp-1 text-sm text-landing-text-muted break-words">
```

Ensure the content wrapper has `min-w-0` (already present: `<div className="min-w-0 flex-1">`).

On the meta row, add `min-w-0 flex-wrap`:
```tsx
<div className="mt-2 flex items-center gap-3 min-w-0 flex-wrap">
```

- [ ] **Step 2: Make actions always visible on mobile (not just on hover)**

Change both the disabled and enabled actions containers from `opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100` to just always visible on mobile:
```tsx
className="flex items-center gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"
```

- [ ] **Step 3: Commit**

```bash
git add src/components/lists/gift-card.tsx
git commit -m "fix: gift card text overflow and mobile action visibility"
```

### Task 9: Fix privacy mode tooltip on mobile

**Files:**
- Modify: `src/components/lists/list-header.tsx`
- Modify: `src/components/public/public-list-header.tsx`

- [ ] **Step 1: Fix list-header.tsx — show text on mobile, tooltip on desktop**

Replace the privacy mode badge section (the `<TooltipProvider>` block) with:
```tsx
{/* Privacy mode badge — tooltip on desktop, text below on mobile */}
<div className="flex flex-col gap-1">
  <div className="hidden sm:block">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex cursor-help items-center gap-1.5 rounded-full bg-landing-lavender-wash/80 px-3 py-1 text-xs font-medium text-landing-text">
            <PrivacyIcon className="h-3.5 w-3.5 text-landing-lavender" />
            {tPrivacy(list.privacy_mode)}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs text-center">
          {list.privacy_mode === "buyers_choice" && t("buyersChoiceHint")}
          {list.privacy_mode === "full_surprise" && t("fullSurpriseHint")}
          {list.privacy_mode === "visible" && tPrivacy("visible_description")}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
  <div className="flex items-center gap-1.5 rounded-full bg-landing-lavender-wash/80 px-3 py-1 text-xs font-medium text-landing-text sm:hidden">
    <PrivacyIcon className="h-3.5 w-3.5 text-landing-lavender" />
    {tPrivacy(list.privacy_mode)}
  </div>
  <p className="text-xs text-landing-text-muted sm:hidden">
    {list.privacy_mode === "buyers_choice" && t("buyersChoiceHint")}
    {list.privacy_mode === "full_surprise" && t("fullSurpriseHint")}
    {list.privacy_mode === "visible" && tPrivacy("visible_description")}
  </p>
</div>
```

- [ ] **Step 2: Fix public-list-header.tsx — same pattern**

Replace the privacy badge section (`{privacyLabel && PrivacyIcon && (` block) with:
```tsx
{privacyLabel && PrivacyIcon && (
  <div className="flex flex-col items-center gap-1">
    <div className="group/privacy relative">
      <div className="flex cursor-help items-center gap-1.5 rounded-full bg-landing-lavender-wash px-3.5 py-1.5 text-sm font-medium text-landing-text shadow-sm ring-1 ring-landing-lavender/10">
        <PrivacyIcon className="h-3.5 w-3.5 text-landing-lavender" />
        {privacyLabel}
      </div>
      {privacyHint && (
        <div className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 rounded-lg bg-landing-text/90 px-3 py-1.5 text-xs leading-relaxed text-white opacity-0 shadow-lg backdrop-blur-sm transition-opacity group-hover/privacy:opacity-100 whitespace-nowrap hidden sm:block">
          {privacyHint}
          <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-landing-text/90" />
        </div>
      )}
    </div>
    {privacyHint && (
      <p className="text-xs text-landing-text-muted sm:hidden">
        {privacyHint}
      </p>
    )}
  </div>
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/lists/list-header.tsx src/components/public/public-list-header.tsx
git commit -m "fix: show privacy mode explanation as text on mobile instead of tooltip"
```

### Task 10: Lock Full Surprise privacy mode in form

**Files:**
- Modify: `src/components/lists/list-form.tsx`

- [ ] **Step 1: Add confirmation dialog for Full Surprise on create**

Add Dialog imports:
```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
```

Add state:
```typescript
const [showSurpriseWarning, setShowSurpriseWarning] = useState(false);
const isFullSurpriseLocked = mode === "edit" && defaultValues?.privacyMode === "full_surprise";
```

- [ ] **Step 2: Modify form submission to show warning**

Modify `handleSubmit` — if creating with full_surprise and warning not yet confirmed:
```typescript
const handleSubmit = useCallback(
  async (e: React.FormEvent) => {
    e.preventDefault();

    // Show warning before creating a Full Surprise list
    if (mode === "create" && privacyMode === "full_surprise" && !showSurpriseWarning) {
      setShowSurpriseWarning(true);
      return;
    }

    setLoading(true);
    setError(null);
    // ... rest of existing logic
  },
  [name, description, occasion, eventDate, privacyMode, mode, locale, listId, showSurpriseWarning]
);

const handleConfirmSurprise = useCallback(async () => {
  setShowSurpriseWarning(false);
  setLoading(true);
  setError(null);

  const data: ListFormData = {
    name,
    description: description || undefined,
    occasion: occasion as ListFormData["occasion"],
    eventDate: eventDate || undefined,
    privacyMode: "full_surprise",
  };

  const result = await createList(locale, data);
  if (result?.error) {
    setError(result.error);
    setLoading(false);
  }
}, [name, description, occasion, eventDate, locale]);
```

- [ ] **Step 3: Disable privacy mode selector in edit mode for Full Surprise**

In the privacy mode `<RadioGroup>`, add:
```tsx
<RadioGroup
  value={privacyMode}
  onValueChange={setPrivacyMode}
  className="grid gap-3"
  disabled={isFullSurpriseLocked}
>
```

Add a locked message below the RadioGroup when locked:
```tsx
{isFullSurpriseLocked && (
  <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
    <p className="text-sm text-amber-700">
      {tEdit("fullSurpriseLocked")}
    </p>
  </div>
)}
```

When locked, each privacy mode label should look disabled:
```tsx
className={`group relative flex ${isFullSurpriseLocked ? "pointer-events-none opacity-60" : "cursor-pointer"} items-center gap-4 ...`}
```

- [ ] **Step 4: Add Full Surprise confirmation dialog**

Add after the form closing tag:
```tsx
<Dialog open={showSurpriseWarning} onOpenChange={setShowSurpriseWarning}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
        <AlertTriangle className="h-6 w-6 text-amber-600" />
      </div>
      <DialogTitle className="text-center text-landing-text">
        {tCreate("fullSurpriseWarning")}
      </DialogTitle>
    </DialogHeader>
    <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
      <Button
        variant="outline"
        onClick={() => setShowSurpriseWarning(false)}
        className="w-full cursor-pointer border-landing-text/10 sm:w-auto"
      >
        {tCreate("fullSurpriseCancel")}
      </Button>
      <Button
        onClick={handleConfirmSurprise}
        disabled={loading}
        className="w-full cursor-pointer bg-landing-coral-dark text-white hover:bg-landing-coral-hover sm:w-auto"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {tCreate("fullSurpriseConfirm")}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/lists/list-form.tsx
git commit -m "feat: lock Full Surprise mode in edit and add confirmation on create"
```

---

## Chunk 5: Testing & Verification

### Task 11: E2E tests with Playwright

**Files:**
- Create: `tests/drag-drop-sorting.spec.ts`
- Create: `tests/mobile-ui.spec.ts`

- [ ] **Step 1: Write drag & drop and sorting E2E tests**

Create `tests/drag-drop-sorting.spec.ts`:
- Test: sort dropdown appears when there are 2+ items
- Test: changing sort option reorders items visually
- Test: drag handle is visible on gift cards
- Test: when non-custom sort is active, drag handles look disabled

- [ ] **Step 2: Write mobile UI E2E tests**

Create `tests/mobile-ui.spec.ts`:
- Test: mobile menu opens on hamburger click (375px viewport)
- Test: mobile menu shows all expected items (My Lists, My Reservations, Create new list, Settings, Sign out)
- Test: user menu dropdown shows "My Lists" link
- Test: user menu dropdown doesn't get hidden behind content (z-index)
- Test: gift card text doesn't overflow on 320px viewport
- Test: privacy badge shows explanation text on mobile (not tooltip)
- Test: Full Surprise mode is locked on edit page

- [ ] **Step 3: Run all E2E tests**

```bash
npx playwright test
```

- [ ] **Step 4: Commit tests**

```bash
git add tests/
git commit -m "test: add E2E tests for drag-drop, sorting, and mobile UI fixes"
```

### Task 12: Final verification

- [ ] **Step 1: Run linter and type check**

```bash
npm run lint && npx tsc --noEmit
```

- [ ] **Step 2: Run all tests**

```bash
npx playwright test
```

- [ ] **Step 3: Visual check on mobile viewport**

Use Playwright MCP browser to navigate to dashboard list detail page at 375px width and verify:
- Drag handles visible
- Sort dropdown works
- Mobile menu is full-screen overlay with all items
- Cards don't overflow
- Privacy tooltip shows as text on mobile

- [ ] **Step 4: Final commit if any fixups needed**

```bash
git add -A
git commit -m "fix: address test and visual review findings"
```
