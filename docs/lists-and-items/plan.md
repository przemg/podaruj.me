# Lists & Items Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add gift list creation, list detail pages with gift management, and editing/deleting lists.

**Architecture:** Server Components for pages with `getTranslations()` and server Supabase client. Client Components only for interactive pieces (forms, dialogs, reordering). All mutations via Next.js Server Actions in a single `actions.ts` file. Supabase RLS enforces ownership.

**Tech Stack:** Next.js 16 (App Router), Supabase (Postgres + RLS), Tailwind CSS, shadcn/ui, next-intl, Playwright

---

## File Structure

```
src/
  app/[locale]/dashboard/lists/
    actions.ts                    # CREATE — Server Actions for all CRUD
    new/page.tsx                  # CREATE — Create list page
    [id]/page.tsx                 # CREATE — List detail page
    [id]/edit/page.tsx            # CREATE — Edit list page
    [id]/not-found.tsx            # CREATE — List not found page
    [id]/loading.tsx              # CREATE — Loading skeleton
  components/lists/
    list-form.tsx                 # CREATE — Shared form for create + edit
    list-header.tsx               # CREATE — Detail page header with info + actions
    gift-card.tsx                 # CREATE — Single gift display card
    gift-list.tsx                 # CREATE — Gift list container with reordering
    gift-form-dialog.tsx          # CREATE — Modal dialog for add/edit gift
    delete-confirm-dialog.tsx     # CREATE — Reusable delete confirmation
  components/ui/
    button.tsx                    # CREATE — shadcn/ui button
    input.tsx                     # CREATE — shadcn/ui input
    textarea.tsx                  # CREATE — shadcn/ui textarea
    label.tsx                     # CREATE — shadcn/ui label
    select.tsx                    # CREATE — shadcn/ui select
    dialog.tsx                    # CREATE — shadcn/ui dialog
    radio-group.tsx               # CREATE — shadcn/ui radio group
    badge.tsx                     # CREATE — shadcn/ui badge
  proxy.ts                        # MODIFY — Remove /my-lists from protected paths
messages/
  en.json                         # MODIFY — Add lists + items i18n keys
  pl.json                         # MODIFY — Add lists + items i18n keys (Polish)
supabase/
  migrations/
    20260314000000_create_lists_and_items.sql  # CREATE — DB migration
e2e/
  lists.spec.ts                   # CREATE — E2E tests
```

---

## Chunk 1: Foundation (Database, Dependencies, i18n, Proxy)

### Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260314000000_create_lists_and_items.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- Create lists table
create table public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name varchar(100) not null,
  description varchar(500),
  occasion varchar(20) not null check (occasion in ('birthday', 'holiday', 'wedding', 'other')),
  event_date date,
  privacy_mode varchar(20) not null default 'buyers_choice' check (privacy_mode in ('buyers_choice', 'visible', 'full_surprise')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create items table
create table public.items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references public.lists(id) on delete cascade not null,
  name varchar(200) not null,
  description varchar(1000),
  url text,
  price numeric(10,2) check (price >= 0),
  image_url text,
  priority varchar(20) not null default 'nice_to_have' check (priority in ('nice_to_have', 'would_love', 'must_have')),
  position integer not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Reuse existing handle_updated_at() from profiles migration

-- Triggers for updated_at
create trigger on_lists_updated
  before update on public.lists
  for each row
  execute function public.handle_updated_at();

create trigger on_items_updated
  before update on public.items
  for each row
  execute function public.handle_updated_at();

-- Enable RLS
alter table public.lists enable row level security;
alter table public.items enable row level security;

-- RLS policies for lists (Phase 1: owner-only)
create policy "Users can view own lists"
  on public.lists for select
  using (auth.uid() = user_id);

create policy "Users can create own lists"
  on public.lists for insert
  with check (auth.uid() = user_id);

create policy "Users can update own lists"
  on public.lists for update
  using (auth.uid() = user_id);

create policy "Users can delete own lists"
  on public.lists for delete
  using (auth.uid() = user_id);

-- RLS policies for items (owner of parent list)
create policy "Users can view items in own lists"
  on public.items for select
  using (list_id in (select id from public.lists where user_id = auth.uid()));

create policy "Users can add items to own lists"
  on public.items for insert
  with check (list_id in (select id from public.lists where user_id = auth.uid()));

create policy "Users can update items in own lists"
  on public.items for update
  using (list_id in (select id from public.lists where user_id = auth.uid()));

create policy "Users can delete items from own lists"
  on public.items for delete
  using (list_id in (select id from public.lists where user_id = auth.uid()));

-- Index for faster queries
create index idx_lists_user_id on public.lists(user_id);
create index idx_items_list_id on public.items(list_id);
create index idx_items_position on public.items(list_id, position);
```

- [ ] **Step 2: Apply the migration**

Run: `npx supabase db push`

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260314000000_create_lists_and_items.sql
git commit -m "feat(db): add lists and items tables with RLS policies"
```

### Task 2: Install shadcn/ui Components

**Files:**
- Create: `src/components/ui/button.tsx`, `input.tsx`, `textarea.tsx`, `label.tsx`, `select.tsx`, `dialog.tsx`, `radio-group.tsx`, `badge.tsx`

- [ ] **Step 1: Install required shadcn/ui components**

Run each:
```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add dialog
npx shadcn@latest add radio-group
npx shadcn@latest add badge
```

If shadcn CLI is not configured, manually create the components following shadcn/ui source code patterns using the existing `cn()` utility from `@/lib/utils` and `@radix-ui` primitives. Install any missing radix packages.

- [ ] **Step 2: Verify components render**

Run: `npm run dev` — confirm no import errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/
git commit -m "feat(ui): add shadcn button, input, textarea, label, select, dialog, radio-group, badge"
```

### Task 3: i18n Messages

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/pl.json`

- [ ] **Step 1: Add English translations**

Add to `messages/en.json` at the root level alongside existing `common`, `landing`, `auth`, `dashboard` keys:

```json
"lists": {
  "create": {
    "pageTitle": "Create a new list",
    "title": "Create a new list",
    "subtitle": "Set up your gift list for any occasion",
    "nameLabel": "List name",
    "namePlaceholder": "e.g. Birthday Wishlist",
    "descriptionLabel": "Description",
    "descriptionPlaceholder": "Tell people what this list is about...",
    "occasionLabel": "Occasion",
    "occasionPlaceholder": "Select an occasion",
    "eventDateLabel": "Event date",
    "eventDateHint": "Optional — we'll show a countdown",
    "privacyModeLabel": "Reservation privacy",
    "submitButton": "Create list",
    "creating": "Creating..."
  },
  "edit": {
    "pageTitle": "Edit list",
    "title": "Edit list",
    "subtitle": "Update your list details",
    "submitButton": "Save changes",
    "saving": "Saving...",
    "cancel": "Cancel"
  },
  "detail": {
    "pageTitle": "List details",
    "editButton": "Edit",
    "deleteButton": "Delete list",
    "shareButton": "Share",
    "shareComingSoon": "Sharing is coming soon!",
    "daysLeft": "{count, plural, one {# day left} other {# days left}}",
    "today": "Today!",
    "pastEvent": "Event has passed",
    "confirmDelete": "Delete this list?",
    "confirmDeleteDescription": "This will permanently delete the list and all its gifts. This action cannot be undone.",
    "confirmDeleteButton": "Yes, delete list",
    "cancelDelete": "Cancel",
    "backToDashboard": "Back to dashboard"
  },
  "notFound": {
    "title": "List not found",
    "description": "This list doesn't exist or you don't have access to it.",
    "backToDashboard": "Back to dashboard"
  },
  "occasions": {
    "birthday": "Birthday",
    "holiday": "Holiday",
    "wedding": "Wedding",
    "other": "Other"
  },
  "privacyModes": {
    "buyers_choice": "Buyer's Choice",
    "buyers_choice_description": "Guests decide if they want to reveal their name",
    "visible": "Visible",
    "visible_description": "Everyone sees who reserved what",
    "full_surprise": "Full Surprise",
    "full_surprise_description": "You won't see any reservations — maximum surprise!"
  }
},
"items": {
  "addButton": "Add gift",
  "form": {
    "addTitle": "Add a gift",
    "editTitle": "Edit gift",
    "nameLabel": "Gift name",
    "namePlaceholder": "e.g. A book about gardening",
    "descriptionLabel": "Description",
    "descriptionPlaceholder": "Any details about what you'd like...",
    "linkLabel": "Link to store",
    "linkPlaceholder": "https://...",
    "priceLabel": "Price",
    "pricePlaceholder": "0.00",
    "imageLabel": "Image URL",
    "imagePlaceholder": "https://... (link to an image)",
    "priorityLabel": "Priority",
    "addButton": "Add gift",
    "adding": "Adding...",
    "saveButton": "Save changes",
    "saving": "Saving...",
    "cancel": "Cancel"
  },
  "priority": {
    "nice_to_have": "Nice to have",
    "would_love": "Would love",
    "must_have": "Must have"
  },
  "empty": {
    "title": "No gifts yet",
    "description": "Add your first gift to this list!"
  },
  "confirmDelete": {
    "title": "Delete this gift?",
    "description": "This gift will be permanently removed from the list.",
    "confirm": "Yes, delete",
    "cancel": "Cancel"
  },
  "moveUp": "Move up",
  "moveDown": "Move down",
  "openLink": "Open link",
  "edit": "Edit",
  "delete": "Delete"
}
```

- [ ] **Step 2: Add Polish translations**

Add the same structure to `messages/pl.json` with Polish text:

```json
"lists": {
  "create": {
    "pageTitle": "Utwórz nową listę",
    "title": "Utwórz nową listę",
    "subtitle": "Przygotuj listę prezentów na każdą okazję",
    "nameLabel": "Nazwa listy",
    "namePlaceholder": "np. Lista urodzinowa",
    "descriptionLabel": "Opis",
    "descriptionPlaceholder": "Powiedz innym, o czym jest ta lista...",
    "occasionLabel": "Okazja",
    "occasionPlaceholder": "Wybierz okazję",
    "eventDateLabel": "Data wydarzenia",
    "eventDateHint": "Opcjonalnie — pokażemy odliczanie",
    "privacyModeLabel": "Prywatność rezerwacji",
    "submitButton": "Utwórz listę",
    "creating": "Tworzenie..."
  },
  "edit": {
    "pageTitle": "Edytuj listę",
    "title": "Edytuj listę",
    "subtitle": "Zaktualizuj szczegóły listy",
    "submitButton": "Zapisz zmiany",
    "saving": "Zapisywanie...",
    "cancel": "Anuluj"
  },
  "detail": {
    "pageTitle": "Szczegóły listy",
    "editButton": "Edytuj",
    "deleteButton": "Usuń listę",
    "shareButton": "Udostępnij",
    "shareComingSoon": "Udostępnianie już wkrótce!",
    "daysLeft": "{count, plural, one {# dzień} few {# dni} many {# dni} other {# dni}}",
    "today": "Dziś!",
    "pastEvent": "Wydarzenie minęło",
    "confirmDelete": "Usunąć tę listę?",
    "confirmDeleteDescription": "Lista i wszystkie prezenty zostaną trwale usunięte. Tej operacji nie można cofnąć.",
    "confirmDeleteButton": "Tak, usuń listę",
    "cancelDelete": "Anuluj",
    "backToDashboard": "Wróć do panelu"
  },
  "notFound": {
    "title": "Lista nie znaleziona",
    "description": "Ta lista nie istnieje lub nie masz do niej dostępu.",
    "backToDashboard": "Wróć do panelu"
  },
  "occasions": {
    "birthday": "Urodziny",
    "holiday": "Święto",
    "wedding": "Ślub",
    "other": "Inne"
  },
  "privacyModes": {
    "buyers_choice": "Wybór kupującego",
    "buyers_choice_description": "Goście decydują, czy chcą ujawnić swoje imię",
    "visible": "Widoczne",
    "visible_description": "Wszyscy widzą, kto co zarezerwował",
    "full_surprise": "Pełna niespodzianka",
    "full_surprise_description": "Nie zobaczysz żadnych rezerwacji — maksymalna niespodzianka!"
  }
},
"items": {
  "addButton": "Dodaj prezent",
  "form": {
    "addTitle": "Dodaj prezent",
    "editTitle": "Edytuj prezent",
    "nameLabel": "Nazwa prezentu",
    "namePlaceholder": "np. Książka o ogrodnictwie",
    "descriptionLabel": "Opis",
    "descriptionPlaceholder": "Jakieś szczegóły o tym, czego szukasz...",
    "linkLabel": "Link do sklepu",
    "linkPlaceholder": "https://...",
    "priceLabel": "Cena",
    "pricePlaceholder": "0.00",
    "imageLabel": "URL obrazka",
    "imagePlaceholder": "https://... (link do obrazka)",
    "priorityLabel": "Priorytet",
    "addButton": "Dodaj prezent",
    "adding": "Dodawanie...",
    "saveButton": "Zapisz zmiany",
    "saving": "Zapisywanie...",
    "cancel": "Anuluj"
  },
  "priority": {
    "nice_to_have": "Miło mieć",
    "would_love": "Bardzo chcę",
    "must_have": "Muszę mieć"
  },
  "empty": {
    "title": "Brak prezentów",
    "description": "Dodaj pierwszy prezent do tej listy!"
  },
  "confirmDelete": {
    "title": "Usunąć ten prezent?",
    "description": "Prezent zostanie trwale usunięty z listy.",
    "confirm": "Tak, usuń",
    "cancel": "Anuluj"
  },
  "moveUp": "Przesuń w górę",
  "moveDown": "Przesuń w dół",
  "openLink": "Otwórz link",
  "edit": "Edytuj",
  "delete": "Usuń"
}
```

- [ ] **Step 3: Verify build compiles with new messages**

Run: `npm run build` — check no i18n errors.

- [ ] **Step 4: Commit**

```bash
git add messages/en.json messages/pl.json
git commit -m "feat(i18n): add lists and items translations (EN + PL)"
```

### Task 4: Update Proxy

**Files:**
- Modify: `src/proxy.ts`

- [ ] **Step 1: Remove `/my-lists` from protected paths**

In `src/proxy.ts`, change:
```typescript
const PROTECTED_PATHS = ["/dashboard", "/my-lists"];
```
to:
```typescript
const PROTECTED_PATHS = ["/dashboard"];
```

All list routes live under `/dashboard/lists/` which is already covered by `/dashboard`.

- [ ] **Step 2: Verify proxy still works**

Run: `npm run dev` — visit `/en/dashboard` (should redirect to sign-in if not logged in).

- [ ] **Step 3: Commit**

```bash
git add src/proxy.ts
git commit -m "fix: remove unused /my-lists from protected paths"
```

---

## Chunk 2: Server Actions

### Task 5: Server Actions for Lists and Items

**Files:**
- Create: `src/app/[locale]/dashboard/lists/actions.ts`

- [ ] **Step 1: Create the Server Actions file**

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// ── Types ───────────────────────────────────────────────────────────

type ListFormData = {
  name: string;
  description?: string;
  occasion: "birthday" | "holiday" | "wedding" | "other";
  eventDate?: string;
  privacyMode: "buyers_choice" | "visible" | "full_surprise";
};

type ItemFormData = {
  name: string;
  description?: string;
  url?: string;
  price?: number;
  imageUrl?: string;
  priority: "nice_to_have" | "would_love" | "must_have";
};

type ActionResult = {
  error?: string;
};

// ── Validation helpers ──────────────────────────────────────────────

const OCCASIONS = ["birthday", "holiday", "wedding", "other"] as const;
const PRIVACY_MODES = ["buyers_choice", "visible", "full_surprise"] as const;
const PRIORITIES = ["nice_to_have", "would_love", "must_have"] as const;

function validateListData(data: ListFormData): string | null {
  if (!data.name || data.name.trim().length === 0) return "Name is required";
  if (data.name.length > 100) return "Name must be 100 characters or less";
  if (data.description && data.description.length > 500) return "Description must be 500 characters or less";
  if (!OCCASIONS.includes(data.occasion as typeof OCCASIONS[number])) return "Invalid occasion";
  if (!PRIVACY_MODES.includes(data.privacyMode as typeof PRIVACY_MODES[number])) return "Invalid privacy mode";
  return null;
}

function validateItemData(data: ItemFormData): string | null {
  if (!data.name || data.name.trim().length === 0) return "Name is required";
  if (data.name.length > 200) return "Name must be 200 characters or less";
  if (data.description && data.description.length > 1000) return "Description must be 1000 characters or less";
  if (data.url && !/^https?:\/\/.+/.test(data.url)) return "Invalid URL";
  if (data.price !== undefined && data.price < 0) return "Price must be positive";
  if (!PRIORITIES.includes(data.priority as typeof PRIORITIES[number])) return "Invalid priority";
  return null;
}

// ── Auth helper ─────────────────────────────────────────────────────

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

// ── List Actions ────────────────────────────────────────────────────

export async function createList(
  locale: string,
  data: ListFormData
): Promise<ActionResult> {
  const error = validateListData(data);
  if (error) return { error };

  const { supabase, user } = await getAuthenticatedClient();

  const { data: list, error: dbError } = await supabase
    .from("lists")
    .insert({
      user_id: user.id,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      occasion: data.occasion,
      event_date: data.eventDate || null,
      privacy_mode: data.privacyMode,
    })
    .select("id")
    .single();

  if (dbError) return { error: "Failed to create list" };

  redirect(`/${locale}/dashboard/lists/${list.id}`);
}

export async function updateList(
  locale: string,
  listId: string,
  data: ListFormData
): Promise<ActionResult> {
  const error = validateListData(data);
  if (error) return { error };

  const { supabase } = await getAuthenticatedClient();

  const { error: dbError } = await supabase
    .from("lists")
    .update({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      occasion: data.occasion,
      event_date: data.eventDate || null,
      privacy_mode: data.privacyMode,
    })
    .eq("id", listId);

  if (dbError) return { error: "Failed to update list" };

  redirect(`/${locale}/dashboard/lists/${listId}`);
}

export async function deleteList(
  locale: string,
  listId: string
): Promise<ActionResult> {
  const { supabase } = await getAuthenticatedClient();

  const { error: dbError } = await supabase
    .from("lists")
    .delete()
    .eq("id", listId);

  if (dbError) return { error: "Failed to delete list" };

  redirect(`/${locale}/dashboard`);
}

// ── Item Actions ────────────────────────────────────────────────────

export async function createItem(
  locale: string,
  listId: string,
  data: ItemFormData
): Promise<ActionResult> {
  const error = validateItemData(data);
  if (error) return { error };

  const { supabase } = await getAuthenticatedClient();

  // Calculate next position
  const { data: lastItem } = await supabase
    .from("items")
    .select("position")
    .eq("list_id", listId)
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const nextPosition = lastItem ? lastItem.position + 1 : 0;

  const { error: dbError } = await supabase
    .from("items")
    .insert({
      list_id: listId,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      url: data.url?.trim() || null,
      price: data.price ?? null,
      image_url: data.imageUrl?.trim() || null,
      priority: data.priority,
      position: nextPosition,
    });

  if (dbError) return { error: "Failed to add gift" };

  revalidatePath(`/${locale}/dashboard/lists/${listId}`);
  return {};
}

export async function updateItem(
  locale: string,
  listId: string,
  itemId: string,
  data: ItemFormData
): Promise<ActionResult> {
  const error = validateItemData(data);
  if (error) return { error };

  const { supabase } = await getAuthenticatedClient();

  const { error: dbError } = await supabase
    .from("items")
    .update({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      url: data.url?.trim() || null,
      price: data.price ?? null,
      image_url: data.imageUrl?.trim() || null,
      priority: data.priority,
    })
    .eq("id", itemId);

  if (dbError) return { error: "Failed to update gift" };

  revalidatePath(`/${locale}/dashboard/lists/${listId}`);
  return {};
}

export async function deleteItem(
  locale: string,
  listId: string,
  itemId: string
): Promise<ActionResult> {
  const { supabase } = await getAuthenticatedClient();

  const { error: dbError } = await supabase
    .from("items")
    .delete()
    .eq("id", itemId);

  if (dbError) return { error: "Failed to delete gift" };

  revalidatePath(`/${locale}/dashboard/lists/${listId}`);
  return {};
}

export async function reorderItems(
  locale: string,
  listId: string,
  itemIds: string[]
): Promise<ActionResult> {
  const { supabase } = await getAuthenticatedClient();

  // Batch update positions based on array order
  const updates = itemIds.map((id, index) =>
    supabase
      .from("items")
      .update({ position: index })
      .eq("id", id)
      .eq("list_id", listId)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: "Failed to reorder gifts" };

  revalidatePath(`/${locale}/dashboard/lists/${listId}`);
  return {};
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/dashboard/lists/actions.ts
git commit -m "feat: add server actions for lists and items CRUD"
```

---

## Chunk 3: Components

**Important:** Before building each component, consult the **UI UX Pro Max** MCP server and **frontend-design** skill for styling decisions. Use the existing color palette (landing-coral, landing-cream, landing-mint) and animation patterns from `globals.css`.

### Task 6: Delete Confirmation Dialog

**Files:**
- Create: `src/components/lists/delete-confirm-dialog.tsx`

- [ ] **Step 1: Create the delete confirmation dialog component**

A client component that wraps shadcn Dialog. Props: `open`, `onOpenChange`, `title`, `description`, `confirmLabel`, `cancelLabel`, `onConfirm`, `loading`. Shows a warning dialog with cancel and confirm (red/coral) buttons.

- [ ] **Step 2: Commit**

```bash
git add src/components/lists/delete-confirm-dialog.tsx
git commit -m "feat: add delete confirmation dialog component"
```

### Task 7: List Form Component

**Files:**
- Create: `src/components/lists/list-form.tsx`

- [ ] **Step 1: Create the shared list form component**

A `"use client"` component used by both create and edit pages. Props:
- `mode: "create" | "edit"`
- `defaultValues?` — pre-filled data for edit mode
- `listId?` — required for edit mode
- `locale: string`

Uses `useTranslations("lists.create")` and `useTranslations("lists.edit")` for labels.

Form fields:
- **Name**: `<Input>` with `maxLength={100}`, required
- **Description**: `<Textarea>` with `maxLength={500}`
- **Occasion**: `<Select>` with options: birthday, holiday, wedding, other (each using `useTranslations("lists.occasions")` for labels). Occasion icons from lucide-react: `Cake` (birthday), `Snowflake` (holiday), `Heart` (wedding), `Gift` (other)
- **Event date**: `<Input type="date">`
- **Privacy mode**: `<RadioGroup>` with 3 options, each showing label + description from `useTranslations("lists.privacyModes")`. Icons: `HelpCircle` (buyer's choice), `Eye` (visible), `EyeOff` (full surprise)

On submit: calls `createList(locale, data)` or `updateList(locale, listId, data)` Server Action. Shows loading state on button. Displays error message if action returns error.

Edit mode shows an additional "Cancel" link that navigates back to the list detail page.

- [ ] **Step 2: Verify it renders on dev server**

Run: `npm run dev`

- [ ] **Step 3: Commit**

```bash
git add src/components/lists/list-form.tsx
git commit -m "feat: add list form component for create and edit"
```

### Task 8: List Header Component

**Files:**
- Create: `src/components/lists/list-header.tsx`

- [ ] **Step 1: Create the list header component**

A `"use client"` component for the list detail page header. Props:
- `list: { id, name, description, occasion, event_date, privacy_mode }`
- `locale: string`

Displays:
- List name as h1
- Description below (if set)
- Occasion badge with icon (same icons as form: Cake, Snowflake, Heart, Gift) and label
- Privacy mode badge with icon and label
- Event date with countdown: calculates days between now and event_date. Shows "{count} days left" (using ICU plural from i18n), "Today!", or "Event has passed"
- Action buttons row:
  - Edit button (Pencil icon) → links to `/dashboard/lists/[id]/edit`
  - Delete button (Trash2 icon) → opens DeleteConfirmDialog
  - Share button (Share2 icon) → disabled, shows tooltip "Coming soon"

Delete action calls `deleteList(locale, listId)` Server Action.

- [ ] **Step 2: Commit**

```bash
git add src/components/lists/list-header.tsx
git commit -m "feat: add list header component with info and actions"
```

### Task 9: Gift Form Dialog

**Files:**
- Create: `src/components/lists/gift-form-dialog.tsx`

- [ ] **Step 1: Create the gift form dialog component**

A `"use client"` component using shadcn Dialog. Props:
- `open: boolean`
- `onOpenChange: (open: boolean) => void`
- `listId: string`
- `editItem?` — pre-filled data for edit mode (id, name, description, url, price, image_url, priority)

Form fields inside the dialog:
- **Name**: `<Input>` required, maxLength 200
- **Description**: `<Textarea>` maxLength 1000
- **Link**: `<Input type="url">` placeholder "https://..."
- **Price**: `<Input type="number">` min 0, step 0.01
- **Image URL**: `<Input type="url">` — when a valid URL is entered, show a small image preview below the input (use `<img>` with `onError` to hide broken images)
- **Priority**: 3-option radio/button group: Nice to have, Would love, Must have

On submit: calls `createItem(locale, listId, data)` or `updateItem(locale, listId, itemId, data)`. Closes dialog on success. Shows inline error on failure. Shows loading state on button.

After successful add/edit, calls `router.refresh()` to refetch server data.

- [ ] **Step 2: Commit**

```bash
git add src/components/lists/gift-form-dialog.tsx
git commit -m "feat: add gift form dialog for add and edit"
```

### Task 10: Gift Card Component

**Files:**
- Create: `src/components/lists/gift-card.tsx`

- [ ] **Step 1: Create the gift card component**

A `"use client"` component displaying a single gift. Props:
- `item: { id, name, description, url, price, image_url, priority, position }`
- `listId: string`
- `isFirst: boolean` — hides move up button
- `isLast: boolean` — hides move down button
- `onMoveUp: () => void`
- `onMoveDown: () => void`
- `onEdit: () => void`
- `onDelete: () => void`
- `locale: string`

Card layout:
- Left side: move up/down buttons (ChevronUp, ChevronDown icons)
- Center: name (bold), description (truncated to 2 lines, text-muted), price badge (formatted with locale — use `Intl.NumberFormat` with `locale === "pl" ? "pl-PL" : "en-US"` and currency `locale === "pl" ? "PLN" : "USD"`), link icon (ExternalLink, opens in new tab)
- Right side: image thumbnail (48x48, rounded, if image_url set), priority badge, edit (Pencil) and delete (Trash2) icon buttons
- Priority badge colors: nice_to_have → gray, would_love → blue/lavender, must_have → coral

Mobile layout: stack vertically with action buttons in a row at the bottom.

- [ ] **Step 2: Commit**

```bash
git add src/components/lists/gift-card.tsx
git commit -m "feat: add gift card component"
```

### Task 11: Gift List Component

**Files:**
- Create: `src/components/lists/gift-list.tsx`

- [ ] **Step 1: Create the gift list container component**

A `"use client"` component that renders the list of gifts with reordering. Props:
- `items: Array<{ id, name, description, url, price, image_url, priority, position }>`
- `listId: string`
- `locale: string`

State management:
- `orderedItems` state initialized from props, used for rendering
- `editingItem` state for which item is being edited (opens GiftFormDialog)
- `deletingItem` state for which item is being deleted (opens DeleteConfirmDialog)
- `addDialogOpen` state for the add gift dialog

Reordering handlers:
- `handleMoveUp(index)`: swap item at index with item at index-1, then call `reorderItems(locale, listId, newOrderIds)`
- `handleMoveDown(index)`: swap item at index with item at index+1, then call `reorderItems(locale, listId, newOrderIds)`

Delete handler: calls `deleteItem(locale, listId, itemId)`, then calls `router.refresh()`.

Renders:
- "Add gift" button at the top → opens GiftFormDialog
- List of GiftCard components, or empty state if no items
- GiftFormDialog (for add and edit)
- DeleteConfirmDialog (for gift deletion)

Empty state: centered illustration area with gift icon, title "No gifts yet", description "Add your first gift to this list!", and the add button.

- [ ] **Step 2: Commit**

```bash
git add src/components/lists/gift-list.tsx
git commit -m "feat: add gift list component with reordering"
```

---

## Chunk 4: Pages

### Task 12: Create List Page

**Files:**
- Create: `src/app/[locale]/dashboard/lists/new/page.tsx`

- [ ] **Step 1: Create the page**

Server Component pattern:

```typescript
import { getTranslations } from "next-intl/server";
import { ListForm } from "@/components/lists/list-form";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lists.create" });
  return { title: t("pageTitle") };
}

export default async function CreateListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("lists.create");

  return (
    <div className="min-h-screen bg-gradient-to-br from-landing-cream via-landing-cream to-landing-peach-wash">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-landing-text-muted hover:text-landing-text transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {/* Back to dashboard */}
        </Link>

        {/* Page header */}
        <h1 className="text-2xl font-bold text-landing-text mb-2">
          {t("title")}
        </h1>
        <p className="text-landing-text-muted mb-8">{t("subtitle")}</p>

        {/* Form */}
        <ListForm mode="create" locale={locale} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify page renders at `/en/dashboard/lists/new`**

Run: `npm run dev` — navigate to the URL (must be logged in).

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/dashboard/lists/new/page.tsx
git commit -m "feat: add create list page"
```

### Task 13: List Detail Page

**Files:**
- Create: `src/app/[locale]/dashboard/lists/[id]/page.tsx`
- Create: `src/app/[locale]/dashboard/lists/[id]/not-found.tsx`

- [ ] **Step 1: Create the not-found page**

```typescript
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, SearchX } from "lucide-react";

export default async function ListNotFound() {
  const t = await getTranslations("lists.notFound");

  return (
    <div className="min-h-screen bg-gradient-to-br from-landing-cream via-landing-cream to-landing-peach-wash flex items-center justify-center">
      <div className="text-center px-4">
        <SearchX className="h-16 w-16 text-landing-text-muted mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-landing-text mb-2">{t("title")}</h1>
        <p className="text-landing-text-muted mb-6">{t("description")}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-landing-coral hover:text-landing-coral-dark transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToDashboard")}
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the list detail page**

```typescript
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ListHeader } from "@/components/lists/list-header";
import { GiftList } from "@/components/lists/gift-list";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lists.detail" });
  return { title: t("pageTitle") };
}

export default async function ListDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const supabase = await createClient();

  // Fetch list (RLS ensures ownership)
  const { data: list } = await supabase
    .from("lists")
    .select("*")
    .eq("id", id)
    .single();

  if (!list) notFound();

  // Fetch items ordered by position
  const { data: items } = await supabase
    .from("items")
    .select("*")
    .eq("list_id", id)
    .order("position", { ascending: true });

  return (
    <div className="min-h-screen bg-gradient-to-br from-landing-cream via-landing-cream to-landing-peach-wash">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ListHeader list={list} locale={locale} />
        <GiftList items={items ?? []} listId={id} locale={locale} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/dashboard/lists/[id]/page.tsx src/app/[locale]/dashboard/lists/[id]/not-found.tsx
git commit -m "feat: add list detail page with not-found handling"
```

### Task 14: Edit List Page

**Files:**
- Create: `src/app/[locale]/dashboard/lists/[id]/edit/page.tsx`

- [ ] **Step 1: Create the edit page**

```typescript
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ListForm } from "@/components/lists/list-form";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lists.edit" });
  return { title: t("pageTitle") };
}

export default async function EditListPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const supabase = await createClient();

  const { data: list } = await supabase
    .from("lists")
    .select("*")
    .eq("id", id)
    .single();

  if (!list) notFound();

  const t = await getTranslations("lists.edit");

  return (
    <div className="min-h-screen bg-gradient-to-br from-landing-cream via-landing-cream to-landing-peach-wash">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href={`/dashboard/lists/${id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-landing-text-muted hover:text-landing-text transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {/* Back to list */}
        </Link>

        <h1 className="text-2xl font-bold text-landing-text mb-2">
          {t("title")}
        </h1>
        <p className="text-landing-text-muted mb-8">{t("subtitle")}</p>

        <ListForm
          mode="edit"
          locale={locale}
          listId={id}
          defaultValues={{
            name: list.name,
            description: list.description ?? "",
            occasion: list.occasion,
            eventDate: list.event_date ?? "",
            privacyMode: list.privacy_mode,
          }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify edit page loads at `/en/dashboard/lists/[id]/edit`**

Run: `npm run dev` — create a list first, then navigate to its edit page.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/dashboard/lists/[id]/edit/page.tsx
git commit -m "feat: add edit list page"
```

### Task 15: Loading Skeleton

**Files:**
- Create: `src/app/[locale]/dashboard/lists/[id]/loading.tsx`

- [ ] **Step 1: Create loading skeleton for list detail page**

A Server Component that shows placeholder skeletons while the list data loads:
- Skeleton for the header area (name, badges, description)
- Skeleton for 3 gift card placeholders
- Uses `animate-pulse` on gray rounded rectangles
- Matches the same max-width and padding as the detail page

```typescript
export default function ListDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-landing-cream via-landing-cream to-landing-peach-wash">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header skeleton */}
        <div className="mb-8 space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-landing-text/10" />
          <div className="h-4 w-1/2 animate-pulse rounded-lg bg-landing-text/5" />
          <div className="flex gap-2">
            <div className="h-6 w-20 animate-pulse rounded-full bg-landing-text/10" />
            <div className="h-6 w-24 animate-pulse rounded-full bg-landing-text/10" />
          </div>
        </div>
        {/* Gift cards skeleton */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-4 h-24 animate-pulse rounded-xl bg-white/60 shadow-sm" />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/dashboard/lists/[id]/loading.tsx
git commit -m "feat: add loading skeleton for list detail page"
```

---

## Chunk 5: E2E Tests

### Task 16: E2E Auth Helper

**Files:**
- Create: `e2e/helpers/auth.ts`

- [ ] **Step 1: Create authentication helper for E2E tests**

Create a helper that authenticates a test user for Playwright tests. Uses Supabase Admin SDK to create a test user session and sets the auth cookies in the Playwright browser context.

```typescript
import { type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_EMAIL = "e2e-test@podaruj.me";

export async function signInTestUser(page: Page) {
  // Create or get test user via admin API
  const { data: existingUsers } = await adminClient.auth.admin.listUsers();
  let testUser = existingUsers?.users?.find((u) => u.email === TEST_EMAIL);

  if (!testUser) {
    const { data } = await adminClient.auth.admin.createUser({
      email: TEST_EMAIL,
      email_confirm: true,
      password: "test-password-e2e-only",
    });
    testUser = data.user!;
  }

  // Generate a magic link and extract the token
  const { data: linkData } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email: TEST_EMAIL,
  });

  if (!linkData?.properties?.hashed_token) {
    throw new Error("Failed to generate auth link for test user");
  }

  // Visit the auth callback with the token to set session cookies
  const callbackUrl = `/en/auth/callback?token_hash=${linkData.properties.hashed_token}&type=magiclink`;
  await page.goto(callbackUrl);
  await page.waitForURL(/\/en\/dashboard/);
}
```

Note: Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (never commit this key). The exact auth flow may need adjustment based on how Supabase handles the token exchange in the callback route.

- [ ] **Step 2: Commit**

```bash
git add e2e/helpers/auth.ts
git commit -m "test: add E2E auth helper for test user sessions"
```

### Task 17: E2E Tests for Lists and Items

**Files:**
- Create: `e2e/lists.spec.ts`

- [ ] **Step 1: Create the E2E test file**

```typescript
import { test, expect } from "@playwright/test";
import { signInTestUser } from "./helpers/auth";

test.describe("Lists & Items", () => {

  // ── Protected routes ────────────────────────────────────────────
  test("redirects to sign-in when not authenticated", async ({ page }) => {
    await page.goto("/en/dashboard/lists/new");
    await expect(page).toHaveURL(/\/en\/auth\/sign-in/);
  });

  // ── Create list form ───────────────────────────────────────────
  test.describe("Create list form", () => {
    test.beforeEach(async ({ page }) => {
      await signInTestUser(page);
      await page.goto("/en/dashboard/lists/new");
    });

    test("shows the create list form with all fields", async ({ page }) => {
      await expect(page.getByRole("heading", { name: /create a new list/i })).toBeVisible();
      await expect(page.getByLabel(/list name/i)).toBeVisible();
      await expect(page.getByLabel(/description/i)).toBeVisible();
      await expect(page.getByLabel(/occasion/i)).toBeVisible();
      await expect(page.getByLabel(/event date/i)).toBeVisible();
      await expect(page.getByText(/reservation privacy/i)).toBeVisible();
    });

    test("shows privacy mode options with descriptions", async ({ page }) => {
      await expect(page.getByText(/buyer's choice/i)).toBeVisible();
      await expect(page.getByText(/guests decide if they want to reveal/i)).toBeVisible();
      await expect(page.getByText(/visible/i)).toBeVisible();
      await expect(page.getByText(/full surprise/i)).toBeVisible();
    });

    test("requires list name to submit", async ({ page }) => {
      await page.getByRole("button", { name: /create list/i }).click();
      // HTML5 validation prevents submission — name field should be focused
      const nameInput = page.getByLabel(/list name/i);
      await expect(nameInput).toBeFocused();
    });

    test("creates a list and redirects to detail page", async ({ page }) => {
      await page.getByLabel(/list name/i).fill("Birthday Wishlist");
      await page.getByLabel(/description/i).fill("My birthday gifts");
      // Select occasion
      await page.getByLabel(/occasion/i).click();
      await page.getByRole("option", { name: /birthday/i }).click();
      // Submit
      await page.getByRole("button", { name: /create list/i }).click();
      // Should redirect to list detail
      await expect(page).toHaveURL(/\/dashboard\/lists\/[\w-]+$/);
      await expect(page.getByRole("heading", { name: "Birthday Wishlist" })).toBeVisible();
    });
  });

  // ── List detail page ──────────────────────────────────────────
  test.describe("List detail page", () => {
    // Create a list in beforeEach and navigate to it
    test.beforeEach(async ({ page }) => {
      await signInTestUser(page);
      // Create a list via the form
      await page.goto("/en/dashboard/lists/new");
      await page.getByLabel(/list name/i).fill("Test List");
      await page.getByLabel(/occasion/i).click();
      await page.getByRole("option", { name: /birthday/i }).click();
      await page.getByRole("button", { name: /create list/i }).click();
      await expect(page).toHaveURL(/\/dashboard\/lists\/[\w-]+$/);
    });

    test("shows list info with occasion and privacy badges", async ({ page }) => {
      await expect(page.getByText(/birthday/i)).toBeVisible();
      await expect(page.getByText(/buyer's choice/i)).toBeVisible();
    });

    test("shows empty state when no gifts", async ({ page }) => {
      await expect(page.getByText(/no gifts yet/i)).toBeVisible();
      await expect(page.getByText(/add your first gift/i)).toBeVisible();
    });

    test("shows edit and delete buttons", async ({ page }) => {
      await expect(page.getByRole("button", { name: /edit/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /delete/i })).toBeVisible();
    });

    test("share button shows coming soon", async ({ page }) => {
      await page.getByRole("button", { name: /share/i }).click();
      await expect(page.getByText(/coming soon/i)).toBeVisible();
    });
  });

  // ── Edit list ─────────────────────────────────────────────────
  test.describe("Edit list", () => {
    test("pre-fills form with existing values", async ({ page }) => {
      // Navigate to edit page
      const nameInput = page.getByLabel(/list name/i);
      await expect(nameInput).toHaveValue("Birthday Wishlist");
    });

    test("saves changes and redirects to detail", async ({ page }) => {
      await page.getByLabel(/list name/i).fill("Updated Wishlist");
      await page.getByRole("button", { name: /save changes/i }).click();
      await expect(page).toHaveURL(/\/dashboard\/lists\/[\w-]+$/);
      await expect(page.getByRole("heading", { name: "Updated Wishlist" })).toBeVisible();
    });
  });

  // ── Delete list ───────────────────────────────────────────────
  test.describe("Delete list", () => {
    test("shows confirmation dialog before deleting", async ({ page }) => {
      await page.getByRole("button", { name: /delete/i }).click();
      await expect(page.getByText(/delete this list/i)).toBeVisible();
      await expect(page.getByText(/cannot be undone/i)).toBeVisible();
    });

    test("deletes list and redirects to dashboard", async ({ page }) => {
      await page.getByRole("button", { name: /delete/i }).click();
      await page.getByRole("button", { name: /yes, delete list/i }).click();
      await expect(page).toHaveURL(/\/dashboard$/);
    });
  });

  // ── Add gift ──────────────────────────────────────────────────
  test.describe("Add gift", () => {
    test("opens add gift dialog", async ({ page }) => {
      await page.getByRole("button", { name: /add gift/i }).click();
      await expect(page.getByText(/add a gift/i)).toBeVisible();
    });

    test("requires gift name", async ({ page }) => {
      await page.getByRole("button", { name: /add gift/i }).click();
      await page.getByRole("button", { name: /^add gift$/i }).click();
      const nameInput = page.getByLabel(/gift name/i);
      await expect(nameInput).toBeFocused();
    });

    test("adds a gift to the list", async ({ page }) => {
      await page.getByRole("button", { name: /add gift/i }).click();
      await page.getByLabel(/gift name/i).fill("A book about gardening");
      await page.getByLabel(/description/i).fill("Any gardening book");
      await page.getByRole("button", { name: /^add gift$/i }).click();
      // Dialog should close and gift should appear
      await expect(page.getByText("A book about gardening")).toBeVisible();
    });
  });

  // ── Edit gift ─────────────────────────────────────────────────
  test.describe("Edit gift", () => {
    test("opens edit dialog with pre-filled values", async ({ page }) => {
      // Click edit on the gift card
      await page.getByRole("button", { name: /^edit$/i }).first().click();
      await expect(page.getByLabel(/gift name/i)).toHaveValue("A book about gardening");
    });

    test("saves gift changes", async ({ page }) => {
      await page.getByRole("button", { name: /^edit$/i }).first().click();
      await page.getByLabel(/gift name/i).fill("Updated gift name");
      await page.getByRole("button", { name: /save changes/i }).click();
      await expect(page.getByText("Updated gift name")).toBeVisible();
    });
  });

  // ── Delete gift ───────────────────────────────────────────────
  test.describe("Delete gift", () => {
    test("shows confirmation and deletes gift", async ({ page }) => {
      await page.getByRole("button", { name: /^delete$/i }).first().click();
      await expect(page.getByText(/delete this gift/i)).toBeVisible();
      await page.getByRole("button", { name: /yes, delete/i }).click();
      // Gift should be removed
    });
  });

  // ── Reorder gifts ────────────────────────────────────────────
  test.describe("Reorder gifts", () => {
    test("moves gift up", async ({ page }) => {
      // Add two gifts first, then move second one up
      await page.getByRole("button", { name: /move up/i }).last().click();
      // Verify order changed
    });

    test("moves gift down", async ({ page }) => {
      await page.getByRole("button", { name: /move down/i }).first().click();
      // Verify order changed
    });

    test("hides move up on first item and move down on last", async ({ page }) => {
      // First item should not have move up
      // Last item should not have move down
    });
  });

  // ── Not found ─────────────────────────────────────────────────
  test("shows not found for non-existent list", async ({ page }) => {
    await page.goto("/en/dashboard/lists/00000000-0000-0000-0000-000000000000");
    await expect(page.getByText(/list not found/i)).toBeVisible();
  });

  // ── Polish locale ─────────────────────────────────────────────
  test("works in Polish locale", async ({ page }) => {
    await page.goto("/pl/dashboard/lists/new");
    await expect(page.getByRole("heading", { name: /utwórz nową listę/i })).toBeVisible();
    await expect(page.getByLabel(/nazwa listy/i)).toBeVisible();
  });
});
```

- [ ] **Step 2: Run the tests**

Run: `npx playwright test e2e/lists.spec.ts`

- [ ] **Step 3: Fix any failures and re-run**

- [ ] **Step 4: Commit**

```bash
git add e2e/lists.spec.ts
git commit -m "test: add E2E tests for lists and items"
```

---

## Chunk 6: Final Verification

### Task 18: Type Check and Lint

- [ ] **Step 1: Run TypeScript check**

Run: `npx tsc --noEmit`

- [ ] **Step 2: Run linter**

Run: `npm run lint`

- [ ] **Step 3: Fix any issues and commit**

### Task 19: Run All E2E Tests

- [ ] **Step 1: Run full test suite**

Run: `npx playwright test`

- [ ] **Step 2: Verify all tests pass (landing, auth, lists)**

- [ ] **Step 3: Final commit if any fixes needed**

### Task 20: Push and Update PR

- [ ] **Step 1: Push all commits**

Run: `git push`

- [ ] **Step 2: Update PR description with implementation summary**

- [ ] **Step 3: Run `/review` and `/simplify` on all changes**
