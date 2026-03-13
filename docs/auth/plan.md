# Auth Feature Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add magic link authentication to Podaruj.me using Supabase Auth with SSR, including sign-in page, protected dashboard, and auth-aware landing page.

**Architecture:** Supabase Auth with PKCE flow via `@supabase/ssr`. Middleware combines session refresh with next-intl locale routing and route protection. Server Components read sessions for initial render; client components handle interactive auth (sign-in form, sign-out, user menu).

**Tech Stack:** Next.js 16 (App Router), TypeScript, Supabase Auth, `@supabase/ssr`, Tailwind CSS, next-intl, Playwright

---

## File Structure

### New files

| File | Purpose |
|------|---------|
| `src/lib/supabase/client.ts` | Browser Supabase client for Client Components |
| `src/lib/supabase/server.ts` | Server Supabase client for Server Components / Route Handlers |
| `src/lib/supabase/middleware.ts` | Middleware Supabase client for session refresh |
| `src/app/[locale]/auth/sign-in/page.tsx` | Sign-in page (Server Component) |
| `src/components/auth/sign-in-form.tsx` | Sign-in form (Client Component) |
| `src/app/[locale]/auth/callback/route.ts` | Auth callback route handler (PKCE code exchange) |
| `src/app/[locale]/dashboard/page.tsx` | Dashboard page (Server Component, protected) |
| `src/components/auth/user-menu.tsx` | User menu dropdown (Client Component) |
| `supabase/migrations/20260313000000_create_profiles.sql` | Profiles table migration |
| `e2e/auth.spec.ts` | E2E tests for auth flows |
| `.env.local.example` | Example environment variables |

### Modified files

| File | Changes |
|------|---------|
| `src/middleware.ts` | Combine Supabase session refresh + next-intl + route protection |
| `src/app/[locale]/page.tsx` | Read session, pass user to Navigation/Hero/CTA |
| `src/components/landing/navigation.tsx` | Accept `userEmail` prop, show UserMenu when logged in |
| `src/components/landing/hero.tsx` | Accept `userEmail` prop, functional email input or dashboard link |
| `src/components/landing/cta-section.tsx` | Accept `userEmail` prop, auth-aware link |
| `messages/en.json` | Add auth, dashboard, and user menu translations |
| `messages/pl.json` | Add auth, dashboard, and user menu translations |

---

## Chunk 1: Foundation

### Task 1: Install dependencies and environment setup

**Files:**
- Modify: `package.json` (via npm install)
- Create: `.env.local.example`

- [ ] **Step 1: Install Supabase packages**

Run: `npm install @supabase/supabase-js @supabase/ssr`

- [ ] **Step 2: Create .env.local.example**

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

- [ ] **Step 3: Create .env.local with real values**

Get the Supabase project URL and anon key from the Supabase MCP (`get_project_url` and `get_publishable_keys`). Write `.env.local` with the real values.

- [ ] **Step 4: Verify build still works**

Run: `npm run build`
Expected: Build succeeds (no Supabase code yet, just packages installed)

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .env.local.example
git commit -m "chore: install Supabase packages and add env example"
```

---

### Task 2: Supabase client utilities

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`

- [ ] **Step 1: Create browser client**

```ts
// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Create server client**

```ts
// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from Server Component — can be ignored
            // if middleware refreshes sessions.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 3: Create middleware client**

This client collects cookies to set and provides an `applyCookies` helper to apply them to any response (redirect or next-intl response).

```ts
// src/lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export function createMiddlewareClient(request: NextRequest) {
  const cookiesToSet: Array<{
    name: string;
    value: string;
    options: Record<string, unknown>;
  }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.length = 0;
          cookiesToSet.push(...cookies);
        },
      },
    }
  );

  function applyCookies(response: NextResponse) {
    cookiesToSet.forEach(({ name, value, options }) =>
      response.cookies.set(name, value, options)
    );
    return response;
  }

  return { supabase, applyCookies };
}
```

- [ ] **Step 4: Verify types**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase/
git commit -m "feat(auth): add Supabase client utilities"
```

---

### Task 3: Database migration

**Files:**
- Create: `supabase/migrations/20260313000000_create_profiles.sql`

- [ ] **Step 1: Create migration SQL file**

Save the migration as a version-controlled file so the schema is reproducible.

```sql
-- supabase/migrations/20260313000000_create_profiles.sql

-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Use `mcp apply_migration` with name `create_profiles` and the SQL content from the file above.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "feat(auth): add profiles table migration"
```

---

### Task 4: Update middleware

**Files:**
- Modify: `src/middleware.ts`

- [ ] **Step 1: Replace middleware with combined Supabase + next-intl middleware**

```ts
// src/middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

const PROTECTED_PATHS = ["/dashboard", "/my-lists"];

export async function middleware(request: NextRequest) {
  const { supabase, applyCookies } = createMiddlewareClient(request);

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check protected routes
  const pathname = request.nextUrl.pathname;
  const pathWithoutLocale = pathname.replace(/^\/(en|pl)/, "") || "/";

  if (PROTECTED_PATHS.some((p) => pathWithoutLocale.startsWith(p)) && !user) {
    const locale =
      pathname.match(/^\/(en|pl)/)?.[1] || routing.defaultLocale;
    const signInUrl = new URL(`/${locale}/auth/sign-in`, request.url);
    signInUrl.searchParams.set("next", pathname);
    return applyCookies(NextResponse.redirect(signInUrl));
  }

  // Delegate to next-intl
  const response = intlMiddleware(request);
  return applyCookies(response);
}

export const config = {
  matcher: ["/", "/(en|pl)/:path*"],
};
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat(auth): combine Supabase session refresh with next-intl middleware"
```

---

### Task 5: Add i18n translations

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/pl.json`

- [ ] **Step 1: Add English translations**

Add these keys to `messages/en.json`:

```json
{
  "auth": {
    "signIn": {
      "pageTitle": "Sign in — Podaruj.me",
      "title": "Sign in to your account",
      "subtitle": "Enter your email and we'll send you a magic link",
      "emailPlaceholder": "your@email.com",
      "sendLink": "Send magic link",
      "sending": "Sending...",
      "successTitle": "Check your email!",
      "successMessage": "We sent a magic link to your email. Click it to sign in.",
      "resendIn": "Resend in {seconds}s",
      "resend": "Resend magic link",
      "errorExpired": "Your link has expired. Please request a new one.",
      "errorInvalid": "This link is no longer valid.",
      "errorRateLimit": "Too many attempts. Please wait a moment.",
      "errorGeneric": "Something went wrong. Please try again."
    },
    "userMenu": {
      "dashboard": "Dashboard",
      "signOut": "Sign out"
    }
  },
  "dashboard": {
    "pageTitle": "Dashboard — Podaruj.me",
    "welcome": "Welcome to Podaruj.me!"
  }
}
```

Also add to `landing.hero`:
```json
"goToDashboard": "Go to Dashboard"
```

- [ ] **Step 2: Add Polish translations**

Add equivalent Polish keys to `messages/pl.json`:

```json
{
  "auth": {
    "signIn": {
      "pageTitle": "Zaloguj się — Podaruj.me",
      "title": "Zaloguj się na swoje konto",
      "subtitle": "Podaj swój email, a wyślemy Ci magiczny link",
      "emailPlaceholder": "twoj@email.com",
      "sendLink": "Wyślij magiczny link",
      "sending": "Wysyłanie...",
      "successTitle": "Sprawdź swoją skrzynkę!",
      "successMessage": "Wysłaliśmy magiczny link na Twój email. Kliknij go, aby się zalogować.",
      "resendIn": "Wyślij ponownie za {seconds}s",
      "resend": "Wyślij ponownie",
      "errorExpired": "Twój link wygasł. Poproś o nowy.",
      "errorInvalid": "Ten link jest już nieaktywny.",
      "errorRateLimit": "Za dużo prób. Poczekaj chwilę.",
      "errorGeneric": "Coś poszło nie tak. Spróbuj ponownie."
    },
    "userMenu": {
      "dashboard": "Panel",
      "signOut": "Wyloguj się"
    }
  },
  "dashboard": {
    "pageTitle": "Panel — Podaruj.me",
    "welcome": "Witaj w Podaruj.me!"
  }
}
```

Also add to `landing.hero`:
```json
"goToDashboard": "Przejdź do panelu"
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add messages/en.json messages/pl.json
git commit -m "feat(auth): add i18n translations for auth and dashboard"
```

---

## Chunk 2: Auth Pages

### Task 6: Auth callback route

**Files:**
- Create: `src/app/[locale]/auth/callback/route.ts`

- [ ] **Step 1: Create the callback route handler**

```ts
// src/app/[locale]/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Extract locale from URL path
  const locale = request.url.match(/\/(en|pl)\//)?.[1] || "en";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const redirectPath = next.startsWith("/en") || next.startsWith("/pl")
        ? next
        : `/${locale}${next}`;
      return NextResponse.redirect(new URL(redirectPath, origin));
    }

    // Map Supabase error to user-friendly code
    let errorCode = "unknown";
    if (error.message?.includes("expired")) errorCode = "expired";
    else if (error.message?.includes("invalid") || error.message?.includes("used"))
      errorCode = "invalid";

    return NextResponse.redirect(
      new URL(`/${locale}/auth/sign-in?error=${errorCode}`, origin)
    );
  }

  // No code provided
  return NextResponse.redirect(
    new URL(`/${locale}/auth/sign-in?error=invalid`, origin)
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/auth/callback/
git commit -m "feat(auth): add auth callback route for PKCE code exchange"
```

---

### Task 7: Sign-in page and form

**Files:**
- Create: `src/components/auth/sign-in-form.tsx`
- Create: `src/app/[locale]/auth/sign-in/page.tsx`

- [ ] **Step 1: Create sign-in form component**

Client component handling email input, OTP sending, success/error states, cooldown timer.

```tsx
// src/components/auth/sign-in-form.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignInForm({ locale }: { locale: string }) {
  const t = useTranslations("auth.signIn");
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const hasAutoSubmitted = useRef(false);

  // Handle error from callback redirect
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setStatus("error");
      switch (error) {
        case "expired":
          setErrorMessage(t("errorExpired"));
          break;
        case "invalid":
          setErrorMessage(t("errorInvalid"));
          break;
        default:
          setErrorMessage(t("errorGeneric"));
      }
    }
  }, [searchParams, t]);

  const sendMagicLink = useCallback(
    async (targetEmail: string) => {
      if (!targetEmail) return;

      setStatus("loading");
      setErrorMessage("");

      // Forward ?next param so callback can redirect back
      const next = searchParams.get("next");
      const callbackUrl = new URL(
        `/${locale}/auth/callback`,
        window.location.origin
      );
      if (next) callbackUrl.searchParams.set("next", next);

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: targetEmail,
        options: {
          emailRedirectTo: callbackUrl.toString(),
        },
      });

      if (error) {
        setStatus("error");
        if (error.message?.includes("rate") || error.status === 429) {
          setErrorMessage(t("errorRateLimit"));
        } else {
          setErrorMessage(t("errorGeneric"));
        }
        return;
      }

      setStatus("success");
      setCooldown(60);
    },
    [locale, searchParams, t]
  );

  // Auto-fill and auto-submit from hero email param
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam && !hasAutoSubmitted.current) {
      setEmail(emailParam);
      hasAutoSubmitted.current = true;
      sendMagicLink(emailParam);
    }
  }, [searchParams, sendMagicLink]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  return (
    <div className="w-full max-w-md">
      {status === "success" ? (
        <div className="rounded-2xl border border-landing-mint/20 bg-landing-mint/10 p-6 text-center">
          <p className="text-lg font-medium text-landing-text">
            {t("successTitle")}
          </p>
          <p className="mt-2 text-landing-text-muted">
            {t("successMessage")}
          </p>
          {cooldown > 0 ? (
            <p className="mt-4 text-sm text-landing-text-muted">
              {t("resendIn", { seconds: cooldown })}
            </p>
          ) : (
            <button
              onClick={() => sendMagicLink(email)}
              className="mt-4 text-sm font-medium text-landing-coral-dark hover:underline"
            >
              {t("resend")}
            </button>
          )}
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (status !== "loading" && cooldown <= 0) {
              sendMagicLink(email);
            }
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            required
            autoFocus
            className="w-full rounded-xl border border-landing-text/10 bg-white px-5 py-3.5 text-landing-text placeholder:text-landing-text-muted/50 focus:border-landing-coral focus:ring-2 focus:ring-landing-coral/20 focus:outline-none"
          />
          {errorMessage && (
            <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
          )}
          <button
            type="submit"
            disabled={status === "loading" || cooldown > 0}
            className="mt-4 w-full rounded-xl bg-landing-coral-dark px-8 py-3.5 font-semibold text-white transition-all hover:bg-landing-coral-hover hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? t("sending") : t("sendLink")}
          </button>
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create sign-in page**

Server Component that checks if already logged in and renders the form. Wraps `SignInForm` in `Suspense` because it uses `useSearchParams`.

```tsx
// src/app/[locale]/auth/sign-in/page.tsx
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Gift } from "lucide-react";
import { Link, redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignInForm } from "@/components/auth/sign-in-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.signIn" });
  return { title: t("pageTitle") };
}

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Redirect if already logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect({ href: "/dashboard", locale });
  }

  const t = await getTranslations({ locale, namespace: "auth.signIn" });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-landing-cream via-landing-cream to-landing-peach-wash px-4">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-2xl font-bold text-landing-text"
      >
        <Gift className="h-8 w-8 text-landing-coral" />
        <span>Podaruj.me</span>
      </Link>
      <h1 className="mb-2 text-3xl font-bold text-landing-text">
        {t("title")}
      </h1>
      <p className="mb-8 text-center text-landing-text-muted">
        {t("subtitle")}
      </p>
      <Suspense>
        <SignInForm locale={locale} />
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/auth/sign-in-form.tsx src/app/[locale]/auth/sign-in/
git commit -m "feat(auth): add sign-in page with magic link form"
```

---

### Task 8: User menu component

**Files:**
- Create: `src/components/auth/user-menu.tsx`

- [ ] **Step 1: Create user menu dropdown**

Client component with dropdown showing Dashboard and Sign out options. Used in both landing nav and dashboard header.

```tsx
// src/components/auth/user-menu.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";

export function UserMenu({ email }: { email: string }) {
  const t = useTranslations("auth.userMenu");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-landing-text/10 px-3 py-2 text-sm text-landing-text transition-colors hover:bg-landing-peach-wash"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <User className="h-4 w-4 opacity-60" />
        <span className="max-w-[150px] truncate">{email}</span>
        <ChevronDown
          className={`h-3 w-3 opacity-40 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-xl border border-landing-text/10 bg-white py-1 shadow-lg"
          role="menu"
        >
          <button
            onClick={() => {
              router.push("/dashboard");
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-landing-text-muted transition-colors hover:bg-landing-peach-wash hover:text-landing-text"
            role="menuitem"
          >
            <LayoutDashboard className="h-4 w-4" />
            {t("dashboard")}
          </button>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-landing-text-muted transition-colors hover:bg-landing-peach-wash hover:text-landing-text"
            role="menuitem"
          >
            <LogOut className="h-4 w-4" />
            {t("signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/auth/user-menu.tsx
git commit -m "feat(auth): add user menu dropdown component"
```

---

### Task 9: Dashboard page

**Files:**
- Create: `src/app/[locale]/dashboard/page.tsx`

- [ ] **Step 1: Create dashboard page**

Server Component — protected by middleware (redirects to sign-in if unauthenticated). Reads session and shows welcome message. Includes a minimal header with logo, user menu, and sign-out.

```tsx
// src/app/[locale]/dashboard/page.tsx
import { getTranslations } from "next-intl/server";
import { Gift } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/auth/user-menu";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return { title: t("pageTitle") };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const t = await getTranslations("dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-landing-cream via-landing-cream to-landing-peach-wash">
      <header className="border-b border-landing-text/5 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-landing-text"
          >
            <Gift className="h-6 w-6 text-landing-coral" />
            <span>Podaruj.me</span>
          </Link>
          {user?.email && <UserMenu email={user.email} />}
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-landing-text">
          {t("welcome")}
        </h1>
        {user?.email && (
          <p className="mt-2 text-landing-text-muted">{user.email}</p>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/dashboard/
git commit -m "feat(auth): add protected dashboard page"
```

---

## Chunk 3: Landing Page Updates

### Task 10: Update navigation to be auth-aware

**Files:**
- Modify: `src/components/landing/navigation.tsx`

- [ ] **Step 1: Add `userEmail` prop and update imports**

Add to existing imports:

```tsx
import { UserMenu } from "@/components/auth/user-menu";
```

Change the component signature:

```tsx
export function Navigation({ locale, userEmail }: { locale: string; userEmail?: string }) {
```

- [ ] **Step 2: Update desktop nav — replace "Create List" button**

Replace the existing desktop "Create List" button with:

```tsx
{userEmail ? (
  <div className="lg:ml-4">
    <UserMenu email={userEmail} />
  </div>
) : (
  <Link
    href="/auth/sign-in"
    className="hidden rounded-xl bg-landing-coral-dark px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-landing-coral-hover hover:shadow-lg lg:block lg:ml-4"
  >
    {t("createList")}
  </Link>
)}
```

- [ ] **Step 3: Update mobile menu — auth-aware bottom section**

Replace the mobile menu bottom section (`<div className="pb-8">...</div>`) with:

```tsx
<div className="pb-8">
  {userEmail ? (
    <div className="space-y-3">
      <p className="truncate text-sm text-landing-text-muted">{userEmail}</p>
      <Link
        href="/dashboard"
        onClick={() => setIsMobileMenuOpen(false)}
        className="block w-full rounded-xl bg-landing-coral-dark px-6 py-4 text-center text-lg font-semibold text-white transition-all hover:bg-landing-coral-hover"
      >
        {t("createList")}
      </Link>
    </div>
  ) : (
    <Link
      href="/auth/sign-in"
      onClick={() => setIsMobileMenuOpen(false)}
      className="block w-full rounded-xl bg-landing-coral-dark px-6 py-4 text-center text-lg font-semibold text-white transition-all hover:bg-landing-coral-hover"
    >
      {t("createList")}
    </Link>
  )}
</div>
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/navigation.tsx
git commit -m "feat(auth): make navigation auth-aware with user menu"
```

---

### Task 11: Update hero section

**Files:**
- Modify: `src/components/landing/hero.tsx`

- [ ] **Step 1: Add `userEmail` prop, `useRouter`, and form state**

Add to imports:

```tsx
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
```

Change the component signature:

```tsx
export function Hero({ userEmail }: { userEmail?: string }) {
```

Inside the component, add:

```tsx
const router = useRouter();
const [heroEmail, setHeroEmail] = useState("");
```

(Add `useState` to the existing react import.)

- [ ] **Step 2: Replace the email input + CTA block**

Replace the `{/* Email input + CTA */}` section with:

```tsx
{/* Email input + CTA */}
<div className="scroll-reveal mt-8">
  {userEmail ? (
    <Link
      href="/dashboard"
      className="inline-block rounded-xl bg-landing-coral-dark px-8 py-3.5 font-semibold text-white transition-all hover:scale-105 hover:bg-landing-coral-hover hover:shadow-lg"
    >
      {t("goToDashboard")}
    </Link>
  ) : (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (heroEmail) {
          router.push(
            `/auth/sign-in?email=${encodeURIComponent(heroEmail)}`
          );
        }
      }}
      className="flex flex-col gap-3 sm:flex-row sm:gap-0"
    >
      <input
        type="email"
        value={heroEmail}
        onChange={(e) => setHeroEmail(e.target.value)}
        placeholder={t("emailPlaceholder")}
        className="w-full rounded-xl border border-landing-text/10 bg-white px-5 py-3.5 text-landing-text placeholder:text-landing-text-muted/50 focus:border-landing-coral focus:ring-2 focus:ring-landing-coral/20 focus:outline-none sm:rounded-r-none sm:flex-1"
      />
      <button
        type="submit"
        className="rounded-xl bg-landing-coral-dark px-8 py-3.5 font-semibold text-white transition-all hover:scale-105 hover:bg-landing-coral-hover hover:shadow-lg sm:rounded-l-none"
      >
        {t("getStarted")}
      </button>
    </form>
  )}
</div>
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/hero.tsx
git commit -m "feat(auth): make hero section auth-aware with functional email input"
```

---

### Task 12: Update CTA section and landing page

**Files:**
- Modify: `src/components/landing/cta-section.tsx`
- Modify: `src/app/[locale]/page.tsx`

- [ ] **Step 1: Update CTA section**

Add `userEmail` prop. Replace the button with a `<Link>`:

```tsx
import { Link } from "@/i18n/navigation";

export function CtaSection({ userEmail }: { userEmail?: string }) {
```

Replace the button:

```tsx
<Link
  href={userEmail ? "/dashboard" : "/auth/sign-in"}
  className="animate-pulse-soft inline-block rounded-xl bg-landing-coral-dark px-10 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:bg-landing-coral-hover hover:shadow-lg"
>
  {t("button")}
</Link>
```

- [ ] **Step 2: Update landing page to read session and pass auth state**

```tsx
// src/app/[locale]/page.tsx
import { Navigation } from "@/components/landing/navigation";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { Testimonials } from "@/components/landing/testimonials";
import { Faq } from "@/components/landing/faq";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing.metadata" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: "Podaruj.me",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userEmail = user?.email;

  return (
    <>
      <Navigation locale={locale} userEmail={userEmail} />
      <main>
        <Hero userEmail={userEmail} />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Faq />
        <CtaSection userEmail={userEmail} />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/cta-section.tsx src/app/[locale]/page.tsx
git commit -m "feat(auth): make CTA auth-aware, pass user to landing components"
```

---

### Task 13: Configure Supabase auth settings

- [ ] **Step 1: Configure redirect URLs in Supabase**

Via Supabase dashboard or MCP, ensure the following redirect URLs are allowed:
- `http://localhost:3000/en/auth/callback`
- `http://localhost:3000/pl/auth/callback`
- `https://podaruj.me/en/auth/callback` (production, when deployed)
- `https://podaruj.me/pl/auth/callback` (production, when deployed)

- [ ] **Step 2: Configure custom email template**

In Supabase dashboard (Authentication > Email Templates > Magic Link), set a custom HTML template with:
- Podaruj.me logo
- Warm color palette (coral #C13A30 accents, cream #FFFBF7 background)
- English copy (v1 — global template)
- "Sign in to Podaruj.me" CTA button
- Footer: "You received this email because someone used your email to sign in to Podaruj.me"

- [ ] **Step 3: Commit (documentation only)**

```bash
git commit -m "docs(auth): note Supabase email template configuration" --allow-empty
```

---

## Chunk 4: E2E Tests

### Task 14: E2E tests for auth flows

**Files:**
- Create: `e2e/auth.spec.ts`

- [ ] **Step 1: Write E2E tests**

Test the following flows:
1. **Sign-in page renders** — visit `/en/auth/sign-in`, verify form elements are visible
2. **Sign-in page shows error states** — visit with `?error=expired`, verify error message
3. **Protected route redirect** — visit `/en/dashboard` without auth, verify redirect to sign-in with `?next` param
4. **Navigation shows "Create list" when logged out** — visit landing, verify button links to sign-in
5. **Hero email input navigates to sign-in** — fill email, submit, verify navigation to sign-in page with email param
6. **Landing page loads for logged-out users** — existing tests still pass

```ts
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Auth - Sign in page", () => {
  test("renders sign-in form", async ({ page }) => {
    await page.goto("/en/auth/sign-in");
    await expect(page.getByText("Sign in to your account")).toBeVisible();
    await expect(page.getByPlaceholder("your@email.com")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Send magic link" })
    ).toBeVisible();
    // Logo links back to home
    await expect(page.getByText("Podaruj.me")).toBeVisible();
  });

  test("shows expired link error from callback", async ({ page }) => {
    await page.goto("/en/auth/sign-in?error=expired");
    await expect(
      page.getByText("Your link has expired. Please request a new one.")
    ).toBeVisible();
  });

  test("shows invalid link error from callback", async ({ page }) => {
    await page.goto("/en/auth/sign-in?error=invalid");
    await expect(
      page.getByText("This link is no longer valid.")
    ).toBeVisible();
  });

  test("pre-fills email from URL param", async ({ page }) => {
    await page.goto("/en/auth/sign-in?email=test@example.com");
    await expect(page.getByPlaceholder("your@email.com")).toHaveValue(
      "test@example.com"
    );
  });

  test("works in Polish", async ({ page }) => {
    await page.goto("/pl/auth/sign-in");
    await expect(page.getByText("Zaloguj się na swoje konto")).toBeVisible();
    await expect(page.getByPlaceholder("twoj@email.com")).toBeVisible();
  });
});

test.describe("Auth - Protected routes", () => {
  test("dashboard redirects to sign-in when not authenticated", async ({
    page,
  }) => {
    await page.goto("/en/dashboard");
    await expect(page).toHaveURL(/\/en\/auth\/sign-in/);
    // Should include next param for redirect back
    await expect(page).toHaveURL(/next=/);
  });
});

test.describe("Auth - Landing page integration", () => {
  test("Create list button links to sign-in when logged out (desktop)", async ({
    page,
  }) => {
    test.skip(test.info().project.name === "mobile", "Desktop-only test");
    await page.goto("/en");
    const createListLink = page
      .locator("nav")
      .getByText("Create list", { exact: true });
    await createListLink.click();
    await expect(page).toHaveURL(/\/en\/auth\/sign-in/);
  });

  test("Create list button links to sign-in when logged out (mobile)", async ({
    page,
  }) => {
    test.skip(test.info().project.name !== "mobile", "Mobile-only test");
    await page.goto("/en");
    await page.getByLabel("Open menu").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const createListLink = page
      .getByRole("dialog")
      .getByText("Create list", { exact: true });
    await createListLink.click();
    await expect(page).toHaveURL(/\/en\/auth\/sign-in/);
  });

  test("hero email input navigates to sign-in with email", async ({
    page,
  }) => {
    await page.goto("/en");
    await page.getByPlaceholder("Enter your email").fill("test@example.com");
    await page.getByRole("button", { name: "Get Started" }).click();
    await expect(page).toHaveURL(/\/en\/auth\/sign-in/);
    await expect(page).toHaveURL(/email=test%40example\.com/);
  });

  test("CTA button links to sign-in when logged out", async ({ page }) => {
    await page.goto("/en");
    const ctaButton = page.getByRole("link", {
      name: "Create your list",
    });
    await ctaButton.scrollIntoViewIfNeeded();
    await expect(ctaButton).toHaveAttribute("href", /\/auth\/sign-in/);
  });
});

// Note: Authenticated flow tests (dashboard content, user menu, sign-out)
// require seeding a Supabase session. These will be added when we have
// test user helpers or Supabase test utilities set up.
```

- [ ] **Step 2: Run E2E tests**

Run: `npx playwright test`
Expected: All tests pass

- [ ] **Step 3: Also run existing landing page tests to verify no regressions**

Run: `npx playwright test e2e/landing.spec.ts`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add e2e/auth.spec.ts
git commit -m "test(auth): add E2E tests for auth flows"
```

---

## Final Verification

After all tasks are complete:

1. Run linter: `npm run lint`
2. Run type check: `npx tsc --noEmit`
3. Run all E2E tests: `npx playwright test`
4. Manual smoke test: open `http://localhost:3000`, try the full auth flow
