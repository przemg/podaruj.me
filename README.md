# 🎁 Podaruj.me

**A wishlist sharing platform — create wishlists, share them with anyone, and let people reserve gifts without spoiling the surprise.**

<p>
  <a href="https://podarujme.vercel.app">🌐 Live Demo</a> · 
  <a href="#features">Features</a> · 
  <a href="#how-it-works">How It Works</a> · 
  <a href="#development-approach">Development Approach</a> · 
  <a href="#tech-stack">Tech Stack</a>
</p>

---

Podaruj.me solves a universal problem: buying gifts without duplicates and awkward guessing. A user creates a wishlist for any occasion — birthday, holidays, wedding — shares a link, and guests can browse and reserve items instantly. No account required for guests. Three privacy modes let the list owner control exactly how much they see, from full transparency to complete surprise.

## 🎬 See it in action
> 🔊 Unmute for voiceover narration · 🇵🇱 [Wersja polska](https://github.com/user-attachments/assets/27e2d8d0-7284-463d-9457-4dac18eecba0)

https://github.com/user-attachments/assets/08b42f80-7438-4cbd-ac0a-e5829cdee67f

**Three things that make this more than a CRUD app:**

🔒 **Privacy modes enforced at the database level** — three reservation visibility tiers, including a Full Surprise mode where even the list owner can't see who reserved what

🎯 **Guest-first access** — no account needed to browse or reserve. One tap from a messenger link and you're in

🤖 **Built through agentic orchestration** — zero hand-written code, fully documented process from prompt to production ([see docs/](./docs/))

## Why I Built This

Gift lists sound simple — until you think about privacy. Who sees what? Can the birthday person find out what's coming? What happens when the event passes? These questions turned a "simple CRUD app" into a product with real UX depth: three privacy modes, a Full Surprise lifecycle with draft/publish/reveal stages, guest access without sign-up walls, and a celebration screen after the event.

I wanted a portfolio project that demonstrates product thinking, not just code output — something with real user flows, edge cases worth solving, and a UI polished enough to pass as a shipped product.

**Built in 3 days** — from concept to deployed product, using document-driven agentic orchestration.

## Features

### 🔒 Privacy That Actually Works

The core differentiator. Each list has one of three reservation privacy modes, enforced server-side — not just hidden in the UI:

- **Buyer's Choice** — the person reserving decides whether to reveal their identity or stay anonymous
- **Visible** — everyone sees who reserved what (great for coordinated gifts)
- **Full Surprise** — the list owner sees nothing. Items appear unreserved. Maximum surprise, with a reveal moment after the event

Full Surprise lists have a dedicated lifecycle: they start as **drafts** (invisible to guests), and once published, items are locked to prevent the owner from reverse-engineering reservations through edits.

### 🎯 Zero Friction for Guests

Guests arrive via a shared link or QR code and can browse and reserve immediately — no sign-up, no login wall. Just enter a nickname and go. This was a deliberate UX decision: most users arrive through a messenger link on their phone, and any friction means drop-off.

### 📋 Lists & Items

- Create multiple lists with occasion types, event dates, and optional countdown timers
- Items support links, prices, images, and three priority levels — but only the name is required
- Drag & drop reordering via `@dnd-kit`, plus 8 sort options
- Slug-based shareable URLs with automatic redirect history on rename

### 📤 Sharing

- Direct link sharing with a clean, readable slug URL
- Email sharing via `mailto:` with a pre-composed friendly message
- QR code generation with download and print options
- Real-time animated countdown to the event

### 📊 Dashboard

- **My Lists** — overview with item counts, countdowns, draft/closed badges
- **My Reservations** — everything you've reserved on other people's lists, with cancel option

### 🔄 List Lifecycle

Lists aren't just static pages — they have a full lifecycle:

1. **Draft** (Full Surprise only) → owner prepares items privately
2. **Published** → open for browsing and reservations
3. **Closed** → after event date/time or manual close. No new reservations.
4. **Celebration** → stats summary, reservation reveal, confetti animation 🎉

### 🌍 Bilingual

Full English and Polish support with a language switcher. Built with `next-intl`.

### 👤 Profile & Auth

Passwordless authentication via Google OAuth or magic link. Profile settings with display name, avatar (synced from Google), and full account deletion with cascade cleanup.

## How It Works

```
Owner                          Guests
  │                              │
  ├─ Creates list                │
  ├─ Adds items                  │
  ├─ Chooses privacy mode        │
  ├─ Shares link / QR / email ──→│
  │                              ├─ Opens link (no account needed)
  │                              ├─ Browses items
  │                              ├─ Reserves with nickname
  │                              │
  ├─ Sees reservations           │
  │  (per privacy mode)          │
  ├─ Event passes → list closes  │
  └─ Celebration + reveal 🎉     ┘
```

## Development Approach

I deliberately chose to build this through **document-driven agentic orchestration** rather than writing code by hand. The goal was to explore and demonstrate a workflow that's becoming increasingly relevant: treating AI agents as an implementation team that you direct through structured documentation, iterative review, and precise prompts.

This isn't about avoiding code — it's about operating at a higher level of abstraction. Defining the product, validating the output, maintaining quality, and steering agents when they drift. The same skills that make a good tech lead or product engineer, applied to a new kind of toolchain.

**Built in 3 days. Zero hand-written code. Full product control.**

### The Process

```
prompt.md  →  design.md  →  my review  →  plan.md  →  execution  →  AI code review  →  E2E tests  →  validation
(intent)      (AI spec)     (approve/     (AI plan)   (AI agents)   (iterative)        (Playwright)   (manual QA)
                             correct)
     ↑                                                                                                     │
     └──────────────────────────── iterative feedback loop ───────────────────────────────────────────────┘
```

Each feature was built as an **atomic delivery** — a small, well-scoped task with a clear prompt, generated design, and execution plan. This modular approach prevents context drift and keeps AI output consistent and predictable.

### My Role

- **Product ownership** — conceived the entire concept from scratch: user flows, occasion types, sharing mechanics, and the three-tier privacy model with its edge cases (What happens when a Full Surprise list is published? Can the owner reverse-engineer reservations through edits? How do closed lists handle existing reservations?)
- **UX direction & iterative validation** — **no Figma, no mockups.** Directed the entire UI through iterative prompting and visual feedback — ran extensive rounds pushing for a polished aesthetic that feels like a real product, not a side project. Mobile-first from day one because the primary use case is tapping a link from a messenger app
- **Context & prompt engineering** — decomposed the entire build into atomic tasks with clear, detailed prompts. Maintained project context across sessions so agents stayed on track and consistent
- **Quality assurance** — manually tested every flow, caught edge cases, and directed the testing strategy (Playwright for E2E, isolated from production Supabase)

### Why This Matters

Orchestrating AI agents is a distinct engineering skill. It requires product thinking to define *what* to build, UX intuition to evaluate *whether it's good*, prompt engineering to communicate *what you want precisely*, and quality standards to catch *what's wrong*. The code is agent-generated. The product vision, UX quality, and relentless iteration are mine.

> 📁 The full development trail — prompts, AI-generated designs, and execution plans — is documented in [`docs/`](./docs/).

### A Note on Approach

This project was deliberately built through full agentic orchestration — an experiment in pushing that workflow as far as it goes. It's great for rapid prototyping, validating product ideas, and shipping MVPs fast. For production-grade work requiring tighter control over architecture and code quality, I use a different workflow: AI pair programming with human-in-the-loop review at every step. You can see that approach in my other repositories.

## Under the Hood

I didn't make the architectural decisions — the AI agents did. But my product requirements forced non-trivial solutions:

- **Full Surprise privacy** demanded that reservation data is invisible to list owners at every level — not just hidden in the UI, but enforced through database policies. One leaky query and the surprise is ruined.
- **Guest reservations without accounts** required a way to track who reserved what using only a nickname, while still preventing duplicates and enabling cancellation for logged-in users.
- **Slug-based URLs with rename support** meant the system needed a redirect history — old shared links can't break when the owner renames a list.
- **List lifecycle with automatic closure** needed time-aware logic: countdown to event date/time, then lock reservations, then enable the celebration reveal.
- **Draft → publish → lock flow** for Full Surprise lists prevents the owner from reverse-engineering reservations by editing or deleting items after publish.

These weren't engineering decisions I made — they were product constraints I defined that shaped the architecture.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16** (App Router, Server Actions) |
| Language | **TypeScript 5** |
| UI | **React 19** |
| Styling | **Tailwind CSS 4** + **shadcn/ui** |
| Backend & Auth | **Supabase** (PostgreSQL, Auth, RLS) |
| Auth Providers | Google OAuth, Magic Link |
| i18n | **next-intl** (EN + PL) |
| Drag & Drop | **@dnd-kit** |
| Testing | **Playwright** (E2E) |
| Hosting | **Vercel** |

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project (for auth and database)

### Local Development

```bash
# Clone the repository
git clone https://github.com/przemg/podaruj.me.git
cd podaruj.me

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Supabase URL, anon key, and Google OAuth credentials

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_BASE_URL` | App base URL (e.g. `http://localhost:3000`) |

## License

This project is for portfolio and educational purposes.

---

<p align="center">
  Built by <strong>Przemysław Gwóźdź</strong> · <a href="https://github.com/przemg">GitHub</a> · <a href="https://www.linkedin.com/in/przemyslawgwozdz/">LinkedIn</a>
</p>
