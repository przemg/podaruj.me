# Podaruj.me

A gift list sharing platform where you create wish lists for any occasion and share them with friends and family. Guests can browse and reserve gifts without creating an account — no duplicates, no spoiled surprises.

**Live:** [podarujme.vercel.app](https://podarujme.vercel.app)

## Features

- **Three privacy modes** — Buyer's Choice, Visible, or Full Surprise (owner sees nothing until reveal)
- **No account needed** for guests — browse and reserve with just a nickname
- **Share anywhere** — copy link, email (pre-filled message), or QR code
- **Real-time countdown** — animated timer counting down to the event
- **Drag & drop sorting** — reorder gifts with 8 sort options
- **Full Surprise lifecycle** — draft → publish → close → reveal reservations
- **Mobile first** — designed for messenger link sharing
- **Bilingual** — English + Polish with language switcher

## Tech Stack

| Layer     | Technology                           |
| --------- | ------------------------------------ |
| Framework | Next.js 16 (App Router)              |
| Language  | TypeScript (strict mode)             |
| Backend   | Supabase (Postgres, Auth, Storage)   |
| Styling   | Tailwind CSS 4 + shadcn/ui          |
| i18n      | next-intl (EN + PL)                  |
| Testing   | Playwright (E2E)                     |
| Deploy    | Vercel                               |

## Getting Started

```bash
# Clone the repository
git clone https://github.com/przemg/podaruj.me.git
cd podaruj.me

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Supabase keys in .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |

## Project Structure

```
src/
  app/[locale]/         # Routes (landing, auth, dashboard, public lists)
  components/           # React components (auth, dashboard, landing, lists, public, ui)
  lib/                  # Utilities (Supabase clients, countdown, helpers)
  i18n/                 # Internationalization config
  types/                # Shared TypeScript types
supabase/migrations/    # Database migrations (version-controlled SQL)
messages/               # Translation files (en.json, pl.json)
e2e/                    # Playwright E2E tests
```

## License

This is a portfolio project. All rights reserved.
