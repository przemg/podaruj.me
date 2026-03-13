# Lists & Items — Design Spec

## Overview

Add gift list creation, list detail pages, and gift management to Podaruj.me. Logged-in users can create lists for any occasion, then add, edit, reorder, and remove gifts within each list.

## Scope

- Create list page with form
- List detail page (owner view) with gift management
- Edit list page
- Add/edit gifts via modal dialog
- Drag-and-drop gift reordering
- Delete list and gift with confirmation
- Supabase database tables with RLS
- i18n support (EN + PL)
- E2E tests

**Out of scope:** Dashboard modifications, sharing functionality (placeholder only), guest/public view, reservations.

## Pages & Routing

| Route | Purpose |
|-------|---------|
| `/dashboard/lists/new` | Create list form |
| `/dashboard/lists/[id]` | List detail page (owner view) |
| `/dashboard/lists/[id]/edit` | Edit list form |

All routes are protected (require authentication via proxy.ts).

## User Flow

1. User clicks "Create list" → navigates to `/dashboard/lists/new`
2. Fills in form → submits → redirected to `/dashboard/lists/[id]`
3. On list detail page, clicks "Add gift" → modal opens
4. Fills in gift form → submits → gift appears in list
5. Can drag gifts to reorder, click edit/delete on each gift
6. Can edit list info via Edit button → `/dashboard/lists/[id]/edit`
7. Can delete list via Delete button → confirmation dialog → redirects to `/dashboard`

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

Create form submits → inserts into `lists` table → redirects to list detail.
Edit form loads existing data → updates `lists` table → redirects to list detail.

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

## Gift Card

Each gift displays:
- Drag handle (left side) for reordering
- Name (primary text)
- Description (truncated preview)
- Price (if set, formatted with currency)
- Link icon (if URL provided, clickable)
- Image thumbnail (if image URL provided)
- Priority badge: Nice to have (gray), Would love (blue), Must have (coral)
- Edit button → opens modal with pre-filled form
- Delete button → confirmation dialog

## Add / Edit Gift Modal

Fields:
- **Name** — text input, required, max 200 chars
- **Description** — textarea, optional, max 1000 chars
- **Link** — URL input, optional (validated as URL)
- **Price** — number input, optional, min 0
- **Image** — URL input, optional (shows preview when valid image URL entered)
- **Priority** — 3-option selector: Nice to have (default), Would love, Must have

Add: inserts into `items` table with position = last.
Edit: updates existing item.

## Drag & Drop Reordering

- Each gift card has a drag handle
- Dragging a card reorders the list visually
- On drop, new positions are saved to the database (batch update)
- Uses @dnd-kit library (lightweight, accessible, React-friendly)

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
| position | integer | NOT NULL, default 0 |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### Row-Level Security

**lists:**
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

**items:**
- SELECT: user owns the parent list (`list_id` in user's lists)
- INSERT: user owns the parent list
- UPDATE: user owns the parent list
- DELETE: user owns the parent list

Both tables have `updated_at` trigger (same pattern as profiles table).

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
- Reorder gifts via drag and drop → verify new order persists
- Form validation (empty name, invalid URL)
- Protected routes (redirect to sign-in if not logged in)
