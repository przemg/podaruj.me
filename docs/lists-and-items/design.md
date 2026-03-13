# Lists & Items — Design Spec

## Overview

Add gift list creation, list detail pages, and gift management to Podaruj.me. Logged-in users can create lists for any occasion, then add, edit, reorder, and remove gifts within each list.

## Scope

- Create list page with form
- List detail page (owner view) with gift management
- Edit list page
- Add/edit gifts via modal dialog
- Gift reordering (move up/down buttons)
- Delete list and gift with confirmation
- Supabase database tables with RLS
- i18n support (EN + PL)
- E2E tests

**Out of scope:** Dashboard modifications (user navigates via direct URL or "Create list" link in nav for now), sharing functionality (placeholder only), guest/public view, reservations.

## Pages & Routing

| Route | Purpose |
|-------|---------|
| `/dashboard/lists/new` | Create list form |
| `/dashboard/lists/[id]` | List detail page (owner view) |
| `/dashboard/lists/[id]/edit` | Edit list form |

All routes are protected (require authentication via proxy.ts). The existing `/my-lists` path in proxy.ts should be removed as it's unused — all list routes live under `/dashboard/lists/`.

## User Flow

1. User clicks "Create list" → navigates to `/dashboard/lists/new`
2. Fills in form → submits → redirected to `/dashboard/lists/[id]`
3. On list detail page, clicks "Add gift" → modal opens
4. Fills in gift form → submits → gift appears in list
5. Can move gifts up/down to reorder, click edit/delete on each gift
6. Can edit list info via Edit button → `/dashboard/lists/[id]/edit`
7. Can delete list via Delete button → confirmation dialog → redirects to `/dashboard`

## Mutations

All data mutations use **Next.js Server Actions** (functions with `"use server"` directive). Server Actions are defined in `src/app/[locale]/dashboard/lists/actions.ts` and handle:
- `createList(formData)` → insert into `lists` table, return new list ID
- `updateList(id, formData)` → update `lists` table
- `deleteList(id)` → delete from `lists` table (cascades to items)
- `createItem(listId, formData)` → insert into `items` table with calculated position
- `updateItem(id, formData)` → update `items` table
- `deleteItem(id)` → delete from `items` table
- `reorderItems(listId, itemIds[])` → batch update positions based on array order

All Server Actions validate input and use the server Supabase client with RLS enforcement.

## Create / Edit List Form

Fields:
- **Name** — text input, required, max 100 chars
- **Description** — textarea, optional, max 500 chars
- **Occasion** — select dropdown: Birthday, Holiday, Wedding, Other (each with icon)
- **Event date** — date picker, optional
- **Privacy mode** — radio group with 3 options and explanations:
  - **Buyer's Choice** (default): "Guests decide if they want to reveal their name"
  - **Visible**: "Everyone sees who reserved what"
  - **Full Surprise**: "You won't see any reservations — maximum surprise!"

Create form submits via Server Action → inserts into `lists` table → redirects to list detail.
Edit form loads existing data → submits via Server Action → updates `lists` table → redirects to list detail.

**Validation:** Client-side with HTML5 required + maxLength attributes. Server-side validation in Server Actions (rejects empty name, enforces max lengths, validates occasion/privacy_mode against allowed values). Error messages shown inline next to the field.

## List Detail Page (Owner View)

**Header area:**
- List name (h1)
- Description
- Occasion badge with icon (e.g. cake icon for Birthday)
- Privacy mode badge
- Event date with countdown if set ("12 days left")

**Actions:**
- Edit button → navigates to edit page
- Delete button → confirmation dialog → deletes list + all items → redirects to `/dashboard`
- Share button → placeholder (disabled, shows "Coming soon" tooltip)

**Gifts section:**
- List of gift cards, ordered by position
- Empty state: illustration + "Add your first gift!" prompt
- "Add gift" button

**Error/Loading states:**
- Loading: skeleton placeholders while data loads
- Not found: if list ID doesn't exist or user doesn't own it → show friendly "List not found" page with link back to dashboard
- Mutation errors: toast notification with error message

## Gift Card

Each gift displays:
- Move up/down buttons for reordering
- Name (primary text)
- Description (truncated preview)
- Price (if set, formatted with locale-appropriate currency — PLN for pl, USD for en)
- Link icon (if URL provided, clickable to open in new tab)
- Image thumbnail (if image URL provided)
- Priority badge: Nice to have (gray), Would love (blue), Must have (coral)
- Edit button → opens modal with pre-filled form
- Delete button → confirmation dialog

## Add / Edit Gift Modal

Fields:
- **Name** — text input, required, max 200 chars
- **Description** — textarea, optional, max 1000 chars
- **Link** — URL input, optional (must start with `https://` or `http://`)
- **Price** — number input, optional, min 0
- **Image** — URL input, optional (shows preview when valid image URL entered). Phase 1 uses URL only; Supabase Storage upload planned for future.
- **Priority** — 3-option selector: Nice to have (default), Would love, Must have

Add: inserts into `items` table with position = `max(position) + 1` (calculated in Server Action).
Edit: updates existing item.

## Gift Reordering

- Each gift card has move up / move down arrow buttons
- Clicking moves the item one position and saves immediately via Server Action
- First item hides "move up", last item hides "move down"
- Simple and reliable — drag-and-drop can be added later if needed

## Database Schema

### `lists` table

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| user_id | uuid | FK → auth.users, NOT NULL |
| name | varchar(100) | NOT NULL |
| description | varchar(500) | |
| occasion | varchar(20) | NOT NULL, CHECK (birthday, holiday, wedding, other) |
| event_date | date | |
| privacy_mode | varchar(20) | NOT NULL, default 'buyers_choice', CHECK (buyers_choice, visible, full_surprise) |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### `items` table

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| list_id | uuid | FK → lists(id) ON DELETE CASCADE, NOT NULL |
| name | varchar(200) | NOT NULL |
| description | varchar(1000) | |
| url | text | |
| price | numeric(10,2) | CHECK >= 0 |
| image_url | text | |
| priority | varchar(20) | NOT NULL, default 'nice_to_have', CHECK (nice_to_have, would_love, must_have) |
| position | integer | NOT NULL |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### Row-Level Security

**Phase 1 — owner-only access.** These policies will evolve when sharing/guest access is built (e.g., adding a public slug-based SELECT policy for guests, or a `list_access` junction table).

**lists:**
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

**items:**
- SELECT: user owns the parent list (`list_id IN (SELECT id FROM lists WHERE user_id = auth.uid())`)
- INSERT: user owns the parent list
- UPDATE: user owns the parent list
- DELETE: user owns the parent list

### Triggers

Both tables reuse the existing `handle_updated_at()` function from the profiles migration. Two new triggers are created:
- `on_lists_updated` — BEFORE UPDATE on `lists`, calls `handle_updated_at()`
- `on_items_updated` — BEFORE UPDATE on `items`, calls `handle_updated_at()`

### Position strategy

Positions are sequential integers starting at 0. New items get `max(position) + 1` (calculated in the Server Action, not via DB default). When reordering, all positions in the list are recalculated sequentially. This is simple and correct for small lists.

## Component Structure

```
src/components/lists/
  list-form.tsx           # Shared form for create + edit (receives mode prop)
  list-header.tsx         # List detail page header with info + actions
  gift-card.tsx           # Single gift display card
  gift-list.tsx           # Gift list container with reordering
  gift-form-dialog.tsx    # Modal dialog for add/edit gift
  delete-confirm-dialog.tsx  # Reusable delete confirmation dialog
```

## Design & Styling

- Matches existing warm, friendly aesthetic: pastels, rounded corners, soft shadows
- Uses landing-coral, landing-cream, landing-mint color palette
- shadcn/ui components for form inputs, buttons, dialogs, selects
- Animations: fade-in-up for page loads, scale transitions for cards
- Mobile-first responsive layout
- Consult UI UX Pro Max MCP and frontend-design skill during implementation

## i18n

All user-facing text in `messages/en.json` and `messages/pl.json` under:
- `lists.create` — create form labels, placeholders, buttons
- `lists.edit` — edit form labels, buttons
- `lists.detail` — list detail page text, empty states, confirmations
- `lists.occasions` — occasion type labels
- `lists.privacyModes` — privacy mode labels and descriptions
- `items.form` — gift form labels, placeholders
- `items.priority` — priority level labels
- `items.empty` — empty state text
- `items.confirmDelete` — delete confirmation text

## E2E Tests

Playwright tests covering:
- Create a list with all fields → verify it appears on detail page
- Edit a list → verify changes saved
- Delete a list → verify redirect to dashboard
- Add a gift to a list → verify it appears
- Edit a gift → verify changes saved
- Delete a gift → verify it's removed
- Reorder gifts via move up/down buttons → verify new order persists
- Form validation (empty name, invalid URL)
- Protected routes (redirect to sign-in if not logged in)
