# Podaruj.me

Gift list sharing platform — create wish lists for any occasion, share them via link or QR code, and let others reserve gifts without duplicates. Guests can browse and reserve without creating an account.

Portfolio / vibe coding learning project. See [PROJECT.md](PROJECT.md) for the full product vision.

## Tech Stack

| Layer     | Technology                  |
| --------- | --------------------------- |
| Framework | Next.js (App Router)        |
| Language  | TypeScript                  |
| Backend   | Supabase (Postgres, Auth, Storage) |
| Styling   | Tailwind CSS + shadcn/ui    |
| i18n      | next-intl (EN + PL)         |
| Deploy    | Vercel                      |

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Supabase keys in .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
