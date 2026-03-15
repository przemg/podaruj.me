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
- Event time (optional) — countdown counts down to exact time; list closes at that time instead of end of day
- Privacy mode for reservations (set per list)
- Shareable link (slug-based URL), email sharing (mailto), QR code

### Item

A single gift wish within a list:

- Name, description, link to store (optional), price (optional), image URL (optional)
- Priority level (nice-to-have, would love, must have)
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
| Create list         | Yes             | No               |
| Browse shared list  | Yes             | Yes              |
| Reserve item        | Yes             | Yes (with nickname) |
| Cancel reservation  | Yes (own only)  | No (requires account) |
| See who reserved    | Per mode        | Per mode         |

## Implemented Features

### Lists & Items

- Create, edit, delete gift lists
- Add/edit/remove items — all fields optional except name (link, price, image URL, priority)
- Drag & drop sorting / priority reordering (via @dnd-kit)
- 8 sort options (custom, priority, price low/high, name, date newest/oldest, available first)
- Slug-based URLs with history redirects on rename

### Reservations

- Reserve / cancel items (logged-in users)
- Guest reservations with nickname (no account needed)
- Three privacy modes (Buyer's Choice, Visible, Full Surprise) enforced server-side
- Dashboard "My Reservations" with real data, grouped by list
- Owner sees reservation status on list detail page (respects privacy modes)
- Reservation badges with reserver name or "Anonymous" based on privacy

### Sharing & Access

- Shareable public link (unique slug)
- Email sharing via mailto (pre-filled friendly message)
- QR code generation with download and print
- Event countdown display (days, hours, minutes, seconds)

### Dashboard

- My lists — all lists with status overview (item count, countdown, draft/closed badges)
- My reservations — items reserved on other people's lists, with cancel functionality

### List Lifecycle

- **Draft → Published (Full Surprise only):** Full Surprise lists start as drafts — invisible to guests, not shareable. Owner adds items freely, then publishes. After publish, existing items are locked (no edit/delete via server action guards). New items added after publish are also locked immediately. Non-surprise lists are always published.
- Active list — open for browsing and reservations
- Closed list — after event date/time (automatic) or manually by owner. No new reservations, existing data preserved.
- Celebratory summary on closed lists — stats, reservation details, confetti animation
- Full Surprise reveal — owner chooses when to see who reserved (after list closes)
- Slug history — old shareable links redirect to current URL after rename

### Profile Settings

- Editable display name
- Read-only email display
- Avatar from Google account
- Sync Google profile (imports name + avatar)
- Delete account with cascade deletion (removes all lists, items, and reservation data)

### UI/UX

- Mobile first responsive design
- Warm, friendly aesthetic — pastels, rounded corners, soft shadows
- EN + PL with language switcher
- Landing page with features, use case scenarios, FAQ
- Scroll reveal animations
- Real-time animated countdown timer

## Key Principles

1. **Zero friction for guests** — viewing and reserving must work without an account
2. **Mobile first** — most users will arrive via messenger links
3. **Privacy by design** — reservation modes must be bulletproof (owner CANNOT see hidden data through any UI path)
4. **Simple over clever** — no over-engineering, no premature abstractions
5. **Vibe coding friendly** — small, well-scoped tasks with clear context for AI
