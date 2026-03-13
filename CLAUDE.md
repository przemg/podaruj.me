# CLAUDE.md

## Project

Podaruj.me — gift list sharing platform. See [PROJECT.md](PROJECT.md) for the full product vision (source of truth for all product decisions).

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Backend:** Supabase (Postgres, Auth, Storage)
- **Styling:** Tailwind CSS + shadcn/ui
- **i18n:** next-intl (EN + PL)
- **Deploy:** Vercel

## Code Conventions

- Use TypeScript strict mode; avoid `any`
- React Server Components by default; add `"use client"` only when needed
- Use shadcn/ui components — don't build custom UI primitives
- Tailwind for all styling; no CSS modules or styled-components
- Keep components small and focused; one component per file
- Use Supabase client from shared utility (don't instantiate in every file)
- Prefer named exports

## Folder Structure (Next.js App Router)

```
src/
  app/              # Routes and layouts
  components/       # Reusable UI components
  lib/              # Utilities, Supabase client, helpers
  types/            # Shared TypeScript types
```

This will evolve as the project grows — update this section accordingly.

## Key Principles

1. **Zero friction for guests** — viewing and reserving must work without an account
2. **Mobile first** — most users arrive via messenger links
3. **Privacy by design** — reservation modes must be bulletproof
4. **Simple over clever** — no over-engineering, no premature abstractions
5. **Vibe coding friendly** — small, well-scoped tasks with clear context for AI
