# Podaruj.me

Gift list sharing platform — create wish lists for any occasion, share them via link or QR code, and let others reserve gifts without duplicates. Guests can browse and reserve without creating an account.

**Production:** https://podarujme.vercel.app

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

## Claude Code Setup

This project is developed using **Claude Code**. Development started on the desktop version but moved to the terminal due to plugin loading issues.

### Plugins

| Plugin | Marketplace | Purpose |
| --- | --- | --- |
| `frontend-design` | `claude-plugins-official` | UI design recommendations |
| `superpowers` | `claude-plugins-official` | Enhanced capabilities & workflow |
| `context7` | `claude-plugins-official` | Up-to-date documentation lookup |
| `playwright` | `claude-plugins-official` | Browser automation & E2E testing |
| `supabase` | `claude-plugins-official` | Database integration |
| `ui-ux-pro-max` | `ui-ux-pro-max-skill` | Custom UI/UX design skill |

### Skills Used

- `/simplify` — Review code for reuse, quality, and efficiency
- `/frontend-design` — Generate design system recommendations
- `/superpowers` — Enhanced planning and spec workflow

### Tools (MCP Servers)

- **Context7** — Library documentation lookup
- **Playwright** — Browser automation for E2E tests
- **Supabase** — Database management

> **Note:** Development started on Claude Code desktop, but there were issues with adding/loading plugins. Switched to Claude Code in the terminal to resolve plugin setup. If skills are missing in a session, run `/reload-plugins` or restart the session.
