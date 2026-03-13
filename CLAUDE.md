# CLAUDE.md

## Project

Podaruj.me — gift list sharing platform. See [PROJECT.md](PROJECT.md) for the full product vision (source of truth for all product decisions).

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Backend:** Supabase (Postgres, Auth with Google OAuth + magic link, Storage)
- **Styling:** Tailwind CSS + shadcn/ui
- **i18n:** next-intl (EN + PL)
- **Deploy:** Vercel

## Code Conventions

- Use TypeScript strict mode; avoid `any`
- React Server Components by default; add `"use client"` only when needed
- Use shadcn/ui components — don't build custom UI primitives
- Tailwind for all styling; no CSS modules or styled-components
- Keep components small and focused; one component per file
- Use Supabase client from `src/lib/supabase/` (don't instantiate in every file)
- Prefer named exports
- Use `src/proxy.ts` (Next.js 16 convention), NOT `middleware.ts`

## Folder Structure (Next.js App Router)

```
src/
  app/              # Routes and layouts
    [locale]/
      auth/         # Auth pages (sign-in, callback)
      dashboard/    # Protected dashboard
  components/
    auth/           # Auth components (sign-in-form, user-menu)
    landing/        # Landing page components
    ui/             # shadcn/ui components
  lib/
    supabase/       # Supabase client utilities (client, server, middleware)
    utils.ts        # General utilities (cn helper)
  i18n/             # Internationalization config
  types/            # Shared TypeScript types
  proxy.ts          # Next.js 16 proxy (replaces deprecated middleware.ts)
supabase/
  migrations/       # Database migrations (version-controlled SQL)
```

## Key Principles

1. **Zero friction for guests** — viewing and reserving must work without an account
2. **Mobile first** — most users arrive via messenger links
3. **Privacy by design** — reservation modes must be bulletproof
4. **Simple over clever** — no over-engineering, no premature abstractions
5. **Vibe coding friendly** — small, well-scoped tasks with clear context for AI

## Testing

- Use **Playwright** for all E2E tests
- Every new feature must have E2E test coverage
- Tests must pass before any PR
- **Always run tests after completing all tasks** — never mark work as done without verifying tests pass

## Git Workflow

- Always create a new branch from `master` before starting work on a new feature
- Branch naming: `feature/<short-description>` (e.g. `feature/auth`, `feature/gift-list`)
- Commit often with small, focused commits
- Push and create a PR when the feature is ready

## Superpowers Workflow

When using Superpowers, save all generated plans, specs, and documents to `docs/<feature_name>/`:

- Always save the initial prompt that started the task as `docs/<feature_name>/prompt.md`
- Save plans, specs, and other artifacts alongside it

Example — working on auth:

```
docs/auth/prompt.md
docs/auth/plan.md
docs/auth/spec.md
```

## UI Design

When designing or building UI components, use the **UI UX Pro Max** MCP server to generate design system recommendations (color palettes, typography, UI styles, animations). Always consult it before making visual design decisions.

## End of Task Checklist

Before finishing any task:

1. Run linter and type check
2. Write E2E tests for new/changed features using Playwright
3. Run all E2E tests and make sure they pass
4. Run `/review` and `/security-review` on all changes
5. Run `/simplify` on modified files
6. Update CLAUDE.md if any architectural decisions changed
7. Push to remote and update PR description
8. Deploy to Vercel
