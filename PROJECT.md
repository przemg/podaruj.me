# Podaruj.me

## Vision

Podaruj.me is a gift list sharing platform where people create wish lists for any occasion — holidays, birthdays, weddings — and share them via link, email, or QR code. Others can browse the list and reserve gifts (with configurable privacy) to avoid duplicates. No friction: guests can interact without creating an account.

## Project Context

- **Type:** Portfolio / vibe coding learning project
- **Developer:** Solo
- **Design:** Mobile first, warm & friendly UI (pastels, rounded corners, soft shadows)
- **Languages:** English (base) + Polish

## Core Concepts

### Gift List

A collection of desired items created by a registered user. Each list has:

- Name, description, occasion type (birthday, holiday, wedding, other)
- Event date (optional) with countdown
- Privacy mode for reservations (set per list)
- Shareable link, email sharing (mailto), QR code

### Item

A single gift wish within a list:

- Name, description, link to store (optional), price (optional), image
- Priority level (nice-to-have → really want)
- Reservation status
- Can be a specific product or just a suggestion/category ("a book about gardening", "something from brand X")

### Reservation Privacy Modes

Each list has one of three modes:

1. **Buyer's Choice** — The person reserving decides whether to reveal their identity to the list owner or stay anonymous. Default mode, good for most occasions.
2. **Visible** — Owner always sees who reserved what. Everyone's identity is shown. Best for birthdays or events where coordination is needed.
3. **Full Surprise** — Owner doesn't see any reservation status at all. Items look unreserved to the list owner. Buyers are hidden. Maximum surprise.

## Access Model

### Authentication

Users sign in via **Google OAuth** (primary) or **magic link** (email-based alternative). Both methods are passwordless. Google sign-in automatically populates the user's display name and avatar from their Google account.

### Two invitation paths

**Email sharing (mailto):**

1. List owner clicks "Share via email" on the list detail page
2. User's email client opens with a pre-filled friendly message and link to the list
3. Owner sends the email to anyone they want — no server-side email infrastructure needed
4. Recipients click the link and can browse/reserve as guests or sign in

**Link / QR sharing:**

1. List owner shares a URL or QR code (messenger, print, social media)
2. Anyone with the link can browse and reserve — no account needed
3. Guest enters a nickname when reserving — reservation is instant
4. Guest is prompted to create an account to manage reservations later

### Permissions

| Action              | Registered user | Guest (via link) |
| ------------------- | --------------- | ---------------- |
| Create list         | ✅               | ❌                |
| Browse shared list  | ✅               | ✅                |
| Reserve item        | ✅               | ✅ (with nickname) |
| Cancel reservation  | ✅ (own only)    | ❌ (requires account) |
| See who reserved    | Per mode         | Per mode         |

## Features Brainstorm

### Lists & Items

- Create, edit, delete gift lists
- Add/edit/remove items — all fields optional except name (link, price, image, priority)
- Import from URL — paste a product link, auto-extract title, price, and image
- Drag & drop sorting / priority reordering
- List archive/history ("Christmas 2025", "Christmas 2026")

### Reservations

- Reserve / unreserve items ✅
- Three privacy modes (Buyer's Choice, Visible, Full Surprise) ✅
- Instant guest reservation with nickname ✅
- Dashboard "My Reservations" with real data ✅
- Owner sees reservation status on list detail page (respects privacy modes) ✅
- Reservation swap — ask someone who already reserved an item to hand it over (with a message explaining why). The other person accepts or declines. Visibility of swaps follows the list's privacy mode.

### Sharing & Access

- Shareable public link (unique slug) ✅
- Email sharing via mailto (pre-filled friendly message) ✅
- QR code generation with branding, download, and print ✅
- Event countdown display
- Groups/Events — multiple people's lists under one event ("Kowalski Family Christmas 2026")

### Notifications

- Email notifications on key events: someone reserved an item, swap request received, swap accepted/declined
- Reminder before event date ("3 days until Anna's birthday — 2 items still unreserved")

### Dashboard

- My lists — all lists I created, with status overview
- My reservations — items I reserved on other people's lists

### List Lifecycle

- **Draft → Published (Full Surprise only):** Full Surprise lists start as drafts — invisible to guests, not shareable. The owner adds items freely, then publishes. After publish, existing items are locked (no edit/delete) to prevent duplicate gifts. New items can still be added but are locked immediately. Non-surprise lists are always published.
- Active list — open for browsing and reservations
- Closed list — after event date (or manually), no new reservations, existing data preserved as archive

### AI Features

- Gift suggester — AI proposes gift ideas based on occasion/interests (one-shot call to minimize token cost)

### Profile Settings

- Editable display name
- Read-only email display
- Avatar from Google account
- Link/unlink Google account
- Delete account with cascade deletion (removes all lists, items, and reservation data)

### UI/UX

- Mobile first responsive design
- Warm, friendly aesthetic — pastels, rounded corners, soft shadows
- EN + PL with language switcher
- Landing page presenting the product

## Key Principles

1. **Zero friction for guests** — viewing and reserving must work without an account
2. **Mobile first** — most users will arrive via messenger links
3. **Privacy by design** — reservation modes must be bulletproof (owner CANNOT see hidden data through any UI path)
4. **Simple over clever** — no over-engineering, no premature abstractions
5. **Vibe coding friendly** — small, well-scoped tasks with clear context for AI
