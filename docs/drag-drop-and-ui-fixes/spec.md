# Spec: Drag & Drop, Sorting, and Mobile UI Fixes

## Overview

Three areas of work on the list detail page and overall mobile experience:
1. Drag & drop reordering of gift items
2. Sort dropdown with multiple sort options
3. Mobile UI consistency and bug fixes

---

## Task 1: Drag & Drop Reordering

### User Experience
- Each gift card has a visible drag handle (grip icon) on the left side
- Desktop: grab the handle to drag and reorder
- Mobile: grab the handle OR long-press anywhere on the card to drag
- While dragging: card lifts visually (shadow + slight scale), other cards shift smoothly
- On drop: new order saves automatically to database
- Existing up/down arrow buttons remain as alternative, made larger for easier mobile tapping (min 44px touch target)

### Technical Approach
- Use `@dnd-kit/core` + `@dnd-kit/sortable` for drag & drop
- Wrap gift list in DndContext + SortableContext
- Each GiftCard becomes a sortable item
- Drag overlay with elevated shadow and 1.02 scale
- On drag end: call existing `reorderItems()` server action
- Optimistic update: reorder items in state immediately, revert on error

---

## Task 2: Sorting

### User Experience
- Dropdown placed next to "Gifts" heading
- Sort options:
  - Custom order (default — manual drag & drop order)
  - Priority (most wanted first)
  - Price: low to high
  - Price: high to low
  - Name: A-Z
  - Date added: newest first
  - Date added: oldest first
  - Reservation status: available first
- Items animate smoothly when sort changes
- When non-custom sort is active, drag handles and move buttons are greyed out/disabled

### Technical Approach
- Client-side sorting (all data already loaded)
- Use `@formkit/auto-animate` on the items container for smooth reorder animations
- Sort state managed in GiftList component
- shadcn Select component for the dropdown

---

## Task 3: Mobile UI Fixes

### a) User dropdown z-index
- Fix UserMenu dropdown to always appear above page content
- Increase z-index and ensure parent doesn't create restrictive stacking context

### b) Dashboard link in landing dropdown
- Add "My Lists" (links to /dashboard) as first item in UserMenu dropdown
- Visible when user is logged in on any page

### c) Mobile header cleanup
- Clean up dashboard mobile header: logo left, hamburger right
- Match the landing page header's clean style

### d) Unified mobile menu
- Replace dashboard's Sheet-based sidebar with full-screen overlay matching landing page
- Menu items: My Lists, My Reservations, Create New List, Settings, Sign Out
- Same animations and visual quality as landing page mobile menu

### e) Item card text overflow
- Fix text wrapping in gift cards on small screens (320px-428px)
- Ensure all text wraps properly, nothing overflows card boundaries

### f) Privacy mode tooltip → mobile text
- On mobile/touch: show privacy mode explanation as always-visible text below badge
- On desktop: keep existing hover tooltip

### g) Visual consistency
- After fixes c+d, landing page, dashboard, and list detail share the same mobile menu pattern
- Same header style, same quality level across all pages

### h) Full Surprise mode is permanent
- **Edit mode:** If list has Full Surprise, privacy mode selector is locked/disabled with message: "Full Surprise mode cannot be changed after creation to protect the surprise for gift givers."
- **Create mode:** Selecting Full Surprise shows confirmation warning before saving: "This mode is permanent and cannot be changed later. Are you sure?"
- Buyer's Choice ↔ Visible can be changed freely at any time

---

## New Dependencies
- `@dnd-kit/core` — drag & drop engine
- `@dnd-kit/sortable` — sortable list preset
- `@dnd-kit/utilities` — CSS utilities for transforms
- `@formkit/auto-animate` — automatic animations for list reordering

## Files to Modify
- `src/components/lists/gift-list.tsx` — add DnD context, sorting state
- `src/components/lists/gift-card.tsx` — add drag handle, fix overflow, larger move buttons
- `src/components/lists/list-header.tsx` — privacy tooltip mobile fix
- `src/components/lists/list-form.tsx` — Full Surprise lock + confirmation
- `src/components/auth/user-menu.tsx` — z-index fix, add Dashboard link
- `src/components/dashboard/mobile-menu.tsx` — replace with full-screen overlay
- `src/app/[locale]/dashboard/layout.tsx` — update mobile menu integration
- `src/components/public/public-list-header.tsx` — privacy tooltip mobile fix
- i18n message files for new translation keys
