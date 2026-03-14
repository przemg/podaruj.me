# Shareable Links Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add public shareable links so anyone with a URL can view a gift list without logging in.

**Architecture:** New public route `/[locale]/lists/[slug]` outside the dashboard, using a Supabase service-role client for server-side data access (no RLS changes). Read-only guest view with warm, inviting design reusing existing landing page tokens.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase service client, Tailwind CSS, shadcn/ui, next-intl, Lucide icons

---

## Chunk 1: Foundation & Data Layer

### Task 1: Supabase Service Client

**Files:**
- Create: `src/lib/supabase/service.ts`

- [ ] **Step 1: Create the service client utility**

```typescript
// src/lib/supabase/service.ts
import { createClient } from "@supabase/supabase-js";

// Server-only client that bypasses RLS using the service role key.
// NEVER import this in client components or expose the key to the browser.
// Currently all lists are publicly viewable — if a "draft" or "private"
// mode is added in the future, queries using this client must filter accordingly.
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

This client bypasses RLS and must only be used in server components/actions. The `SUPABASE_SERVICE_ROLE_KEY` env var must exist in `.env.local` and Vercel (Settings → API → service_role key). It is NOT prefixed with `NEXT_PUBLIC_` — server-only.

- [ ] **Step 2: Verify env var exists**

Run: `grep SUPABASE_SERVICE_ROLE_KEY .env.local`

If missing, add `SUPABASE_SERVICE_ROLE_KEY=<value>` to `.env.local`. Get the key from the Supabase dashboard → Settings → API → service_role key.

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase/service.ts
git commit -m "feat: add Supabase service-role client for public reads"
```

### Task 2: Extract Countdown Utility

**Files:**
- Create: `src/lib/countdown.ts`
- Modify: `src/components/lists/list-header.tsx` (remove local `getCountdown`, import shared one)

- [ ] **Step 1: Create shared countdown utility**

```typescript
// src/lib/countdown.ts
export type CountdownResult = {
  type: "days" | "today" | "past";
  days: number;
};

export function getCountdown(eventDate: string): CountdownResult {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const event = new Date(eventDate);
  event.setHours(0, 0, 0, 0);
  const diffTime = event.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { type: "today", days: 0 };
  if (diffDays < 0) return { type: "past", days: diffDays };
  return { type: "days", days: diffDays };
}
```

- [ ] **Step 2: Update list-header.tsx to use shared utility**

In `src/components/lists/list-header.tsx`:

1. Remove the local `getCountdown` function (lines 52-66).
2. Add import: `import { getCountdown } from "@/lib/countdown";`
3. Compute the countdown label above the JSX return in the component body (not as an IIFE):

```typescript
// Inside ListHeader component, before the return:
const countdownLabel = list.event_date
  ? (() => {
      const cd = getCountdown(list.event_date);
      return cd.type === "today"
        ? t("today")
        : cd.type === "past"
          ? t("pastEvent")
          : t("daysLeft", { count: cd.days });
    })()
  : null;
```

4. Replace the countdown badge at the existing location:

```tsx
{countdownLabel && (
  <div className="flex items-center gap-1.5 rounded-full bg-landing-mint/10 px-3 py-1 text-xs font-medium text-landing-text">
    <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
    {countdownLabel}
  </div>
)}
```

- [ ] **Step 3: Verify build compiles**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/lib/countdown.ts src/components/lists/list-header.tsx
git commit -m "refactor: extract countdown logic to shared utility"
```

### Task 3: Add i18n Translations

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/pl.json`

- [ ] **Step 1: Add `public` namespace to en.json**

Add after the `"items"` section (before the closing `}`):

```json
"public": {
  "pageTitle": "{name} — Podaruj.me",
  "defaultDescription": "Gift list on Podaruj.me",
  "listNotFound": "List not found",
  "listNotFoundDescription": "This list doesn't exist or has been removed.",
  "backToHome": "Back to home",
  "eventCountdown": "{count, plural, one {# day left} other {# days left}}",
  "eventToday": "Today!",
  "eventPassed": "Event has passed",
  "reserveButton": "Reserve",
  "reserveComingSoon": "Coming soon",
  "ownerBanner": "This is your list",
  "ownerBannerLink": "Manage in dashboard",
  "ownerBannerDismiss": "Dismiss",
  "emptyList": "No gifts added to this list yet",
  "poweredBy": "Powered by Podaruj.me",
  "createYourOwn": "Create your own gift list",
  "gifts": "Gifts",
  "errorTitle": "Something went wrong",
  "errorDescription": "We couldn't load this list. Please try again.",
  "errorRetry": "Try again"
}
```

Also add `"shareCopied": "Link copied!"` inside `"lists.detail"` (next to existing keys).

- [ ] **Step 2: Add `public` namespace to pl.json**

```json
"public": {
  "pageTitle": "{name} — Podaruj.me",
  "defaultDescription": "Lista prezentów na Podaruj.me",
  "listNotFound": "Lista nie znaleziona",
  "listNotFoundDescription": "Ta lista nie istnieje lub została usunięta.",
  "backToHome": "Wróć na stronę główną",
  "eventCountdown": "{count, plural, one {# dzień} few {# dni} many {# dni} other {# dni}}",
  "eventToday": "Dziś!",
  "eventPassed": "Wydarzenie minęło",
  "reserveButton": "Zarezerwuj",
  "reserveComingSoon": "Wkrótce",
  "ownerBanner": "To jest Twoja lista",
  "ownerBannerLink": "Zarządzaj w panelu",
  "ownerBannerDismiss": "Zamknij",
  "emptyList": "Nie dodano jeszcze prezentów do tej listy",
  "poweredBy": "Stworzone przez Podaruj.me",
  "createYourOwn": "Stwórz swoją listę prezentów",
  "gifts": "Prezenty",
  "errorTitle": "Coś poszło nie tak",
  "errorDescription": "Nie udało się załadować listy. Spróbuj ponownie.",
  "errorRetry": "Spróbuj ponownie"
}
```

Also add `"shareCopied": "Link skopiowany!"` inside `"lists.detail"`.

- [ ] **Step 3: Commit**

```bash
git add messages/en.json messages/pl.json
git commit -m "feat: add i18n translations for public list view"
```

---

## Chunk 2: Public Page Components

### Task 4: Public Layout

**Files:**
- Create: `src/app/[locale]/lists/layout.tsx`

- [ ] **Step 1: Create the public lists layout**

Uses `getTranslations` (server-side) consistent with existing codebase pattern.

```typescript
// src/app/[locale]/lists/layout.tsx
import { Link } from "@/i18n/navigation";
import { Gift } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function PublicListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("public");

  return (
    <div className="min-h-dvh bg-landing-cream">
      {/* Header */}
      <header className="border-b border-landing-text/5 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-landing-text"
          >
            <Gift className="h-6 w-6 text-landing-coral" />
            <span>Podaruj.me</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="mt-16 border-t border-landing-text/5 bg-white/40">
        <div className="mx-auto max-w-3xl px-4 py-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-landing-text-muted transition-colors hover:text-landing-coral"
          >
            <Gift className="h-3.5 w-3.5" />
            {t("poweredBy")}
          </Link>
        </div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/lists/layout.tsx
git commit -m "feat: add public list layout with logo and footer"
```

### Task 5: Public List Header Component

**Files:**
- Create: `src/components/public/public-list-header.tsx`

- [ ] **Step 1: Create the public list header**

This is a pure presentational component that receives pre-translated strings as props. The parent server component handles translations.

```typescript
// src/components/public/public-list-header.tsx
import {
  Cake,
  Snowflake,
  Heart,
  Gift,
  CalendarDays,
} from "lucide-react";

type PublicListHeaderProps = {
  name: string;
  description: string | null;
  occasionLabel: string;
  occasionKey: string;
  countdownLabel: string | null;
  countdownType: "days" | "today" | "past" | null;
};

const OCCASION_ICONS: Record<string, typeof Cake> = {
  birthday: Cake,
  holiday: Snowflake,
  wedding: Heart,
  other: Gift,
};

export function PublicListHeader({
  name,
  description,
  occasionLabel,
  occasionKey,
  countdownLabel,
  countdownType,
}: PublicListHeaderProps) {
  const OccasionIcon = OCCASION_ICONS[occasionKey] ?? Gift;

  return (
    <div
      className="mb-8 text-center"
      style={{ animation: "fade-in-up 0.4s ease-out" }}
    >
      {/* Badges row */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full bg-landing-peach-wash/80 px-3 py-1.5 text-sm font-medium text-landing-text">
          <OccasionIcon className="h-4 w-4 text-landing-coral" />
          {occasionLabel}
        </div>
        {countdownLabel && (
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
              countdownType === "past"
                ? "bg-landing-text/5 text-landing-text-muted"
                : "bg-landing-mint/15 text-emerald-700"
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            {countdownLabel}
          </div>
        )}
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight text-landing-text md:text-4xl">
        {name}
      </h1>

      {/* Description */}
      {description && (
        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-landing-text-muted">
          {description}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/public/public-list-header.tsx
git commit -m "feat: add public list header component"
```

### Task 6: Public Gift Card Component

**Files:**
- Create: `src/components/public/public-gift-card.tsx`

- [ ] **Step 1: Create the read-only gift card**

This component needs `"use client"` because of the `onError` handler on the `<img>` tag.

```typescript
// src/components/public/public-gift-card.tsx
"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShoppingCart } from "lucide-react";

type PublicGiftCardProps = {
  item: {
    id: string;
    name: string;
    description: string | null;
    url: string | null;
    price: number | null;
    image_url: string | null;
    priority: string;
  };
  locale: string;
  index: number;
};

const PRIORITY_CONFIG: Record<string, { dot: string; text: string }> = {
  nice_to_have: { dot: "bg-gray-300", text: "text-landing-text-muted" },
  would_love: { dot: "bg-landing-lavender", text: "text-landing-lavender" },
  must_have: { dot: "bg-landing-coral", text: "text-landing-coral-dark" },
};

function formatPrice(price: number, locale: string): string {
  return new Intl.NumberFormat(locale === "pl" ? "pl-PL" : "en-US", {
    style: "currency",
    currency: locale === "pl" ? "PLN" : "USD",
  }).format(price);
}

export function PublicGiftCard({ item, locale, index }: PublicGiftCardProps) {
  const t = useTranslations("public");
  const tPriority = useTranslations("items.priority");

  const priority =
    PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.nice_to_have;

  return (
    <div
      className="group rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-landing-text/[0.04] backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:ring-landing-text/[0.08]"
      style={{
        animation: `fade-in-up 0.4s ease-out ${index * 0.06}s both`,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Image thumbnail */}
        {item.image_url && (
          <div className="hidden h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-landing-text/5 sm:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url}
              alt={item.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Top row: name + priority */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold leading-snug text-landing-text">
              {item.name}
            </h3>
            <div
              className={`flex shrink-0 items-center gap-1.5 text-xs font-medium ${priority.text}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${priority.dot}`}
              />
              {tPriority(item.priority)}
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-landing-text-muted">
              {item.description}
            </p>
          )}

          {/* Meta row: price, link, reserve button */}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {item.price != null && (
              <span className="text-sm font-semibold text-landing-text">
                {formatPrice(item.price, locale)}
              </span>
            )}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-landing-coral transition-colors hover:bg-landing-coral/5 hover:text-landing-coral-dark"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="hidden sm:inline">Link</span>
              </a>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Reserve button — disabled, coming soon */}
            <Button
              variant="outline"
              size="sm"
              disabled
              className="h-8 gap-1.5 text-xs"
              title={t("reserveComingSoon")}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {t("reserveButton")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/public/public-gift-card.tsx
git commit -m "feat: add read-only public gift card component"
```

### Task 7: Owner Banner Component

**Files:**
- Create: `src/components/public/owner-banner.tsx`

- [ ] **Step 1: Create the owner banner**

```typescript
// src/components/public/owner-banner.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { X, ArrowRight } from "lucide-react";

type OwnerBannerProps = {
  listSlug: string;
};

export function OwnerBanner({ listSlug }: OwnerBannerProps) {
  const t = useTranslations("public");
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="border-b border-landing-lavender/20 bg-landing-lavender-wash/60">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2.5">
        <p className="flex-1 text-sm text-landing-text">
          {t("ownerBanner")}
          {" — "}
          <Link
            href={`/dashboard/lists/${listSlug}`}
            className="inline-flex items-center gap-1 font-medium text-landing-lavender-hover underline-offset-2 hover:underline"
          >
            {t("ownerBannerLink")}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-landing-text-muted transition-colors hover:bg-landing-text/5 hover:text-landing-text"
          aria-label={t("ownerBannerDismiss")}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/public/owner-banner.tsx
git commit -m "feat: add owner banner for public list page"
```

---

## Chunk 3: Public Page & Routing

### Task 8: Public List Page (Server Component)

**Files:**
- Create: `src/app/[locale]/lists/[slug]/page.tsx`

- [ ] **Step 1: Create the public list page with generateMetadata**

The page fetches `user_id` server-side for owner detection but NEVER passes it to client components. Only safe fields are forwarded to child components via props.

```typescript
// src/app/[locale]/lists/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";
import { getCountdown } from "@/lib/countdown";
import { PublicListHeader } from "@/components/public/public-list-header";
import { PublicGiftCard } from "@/components/public/public-gift-card";
import { OwnerBanner } from "@/components/public/owner-banner";
import { Gift } from "lucide-react";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

async function getListBySlug(slug: string) {
  const supabase = createServiceClient();

  // user_id is fetched for server-side owner check only — never sent to the client
  const { data: list } = await supabase
    .from("lists")
    .select("id, slug, name, description, occasion, event_date, privacy_mode, user_id")
    .eq("slug", slug)
    .single();

  if (!list) return null;

  const { data: items } = await supabase
    .from("items")
    .select("id, name, description, url, price, image_url, priority, position")
    .eq("list_id", list.id)
    .order("position", { ascending: true });

  return { list, items: items ?? [] };
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "public" });

  const data = await getListBySlug(slug);
  if (!data) {
    return { title: t("listNotFound") };
  }

  const title = t("pageTitle", { name: data.list.name });
  const description = data.list.description || t("defaultDescription");

  return {
    title,
    description,
    openGraph: {
      title: data.list.name,
      description,
      url: `/${locale}/lists/${slug}`,
      type: "website",
    },
  };
}

export default async function PublicListPage({ params }: PageProps) {
  const { locale, slug } = await params;

  const data = await getListBySlug(slug);
  if (!data) notFound();

  const { list, items } = data;

  // Check if the current user is the list owner (server-side only)
  let isOwner = false;
  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();
    if (user && user.id === list.user_id) {
      isOwner = true;
    }
  } catch {
    // Not authenticated — that's fine, guest view
  }

  // Prepare translated strings for the header (server-side)
  const t = await getTranslations({ locale, namespace: "public" });
  const tOccasions = await getTranslations({ locale, namespace: "lists.occasions" });

  let countdownLabel: string | null = null;
  let countdownType: "days" | "today" | "past" | null = null;
  if (list.event_date) {
    const cd = getCountdown(list.event_date);
    countdownType = cd.type;
    countdownLabel =
      cd.type === "today"
        ? t("eventToday")
        : cd.type === "past"
          ? t("eventPassed")
          : t("eventCountdown", { count: cd.days });
  }

  return (
    <>
      {isOwner && <OwnerBanner listSlug={list.slug} />}

      <div className="mx-auto max-w-3xl px-4 py-8">
        <PublicListHeader
          name={list.name}
          description={list.description}
          occasionLabel={tOccasions(list.occasion)}
          occasionKey={list.occasion}
          countdownLabel={countdownLabel}
          countdownType={countdownType}
        />

        {/* Gifts section */}
        {items.length > 0 ? (
          <div>
            <h2 className="mb-4 text-center text-sm font-medium uppercase tracking-wider text-landing-text-muted">
              {t("gifts")} · {items.length}
            </h2>
            <div className="space-y-3">
              {items.map((item, index) => (
                <PublicGiftCard
                  key={item.id}
                  item={item}
                  locale={locale}
                  index={index}
                />
              ))}
            </div>
          </div>
        ) : (
          <div
            className="py-16 text-center"
            style={{ animation: "fade-in-up 0.4s ease-out" }}
          >
            <Gift className="mx-auto mb-3 h-12 w-12 text-landing-text-muted/30" />
            <p className="text-landing-text-muted">{t("emptyList")}</p>
          </div>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/lists/[slug]/page.tsx
git commit -m "feat: add public list page with metadata and owner detection"
```

### Task 9: Loading, Not-Found & Error Pages

**Files:**
- Create: `src/app/[locale]/lists/[slug]/loading.tsx`
- Create: `src/app/[locale]/lists/[slug]/not-found.tsx`
- Create: `src/app/[locale]/lists/[slug]/error.tsx`

- [ ] **Step 1: Create loading skeleton**

```typescript
// src/app/[locale]/lists/[slug]/loading.tsx
export default function PublicListLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header skeleton — centered */}
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center gap-2">
          <div className="h-7 w-24 animate-pulse rounded-full bg-landing-text/10" />
          <div className="h-7 w-28 animate-pulse rounded-full bg-landing-text/10" />
        </div>
        <div className="mx-auto h-9 w-2/3 animate-pulse rounded-lg bg-landing-text/10" />
        <div className="mx-auto mt-3 h-5 w-1/2 animate-pulse rounded-lg bg-landing-text/5" />
      </div>

      {/* Gifts label skeleton */}
      <div className="mb-4 flex justify-center">
        <div className="h-4 w-20 animate-pulse rounded bg-landing-text/10" />
      </div>

      {/* Gift cards skeleton */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="mb-3 h-24 animate-pulse rounded-2xl bg-white/60 shadow-sm"
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create not-found page**

```typescript
// src/app/[locale]/lists/[slug]/not-found.tsx
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, SearchX } from "lucide-react";

export default async function PublicListNotFound() {
  const t = await getTranslations("public");

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        className="px-4 text-center"
        style={{ animation: "fade-in-up 0.4s ease-out" }}
      >
        <SearchX className="mx-auto mb-4 h-16 w-16 text-landing-text-muted/40" />
        <h1 className="mb-2 text-2xl font-bold text-landing-text">
          {t("listNotFound")}
        </h1>
        <p className="mb-6 text-landing-text-muted">
          {t("listNotFoundDescription")}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-landing-coral transition-colors hover:text-landing-coral-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToHome")}
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create error boundary with retry**

```typescript
// src/app/[locale]/lists/[slug]/error.tsx
"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function PublicListError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("public");

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        className="px-4 text-center"
        style={{ animation: "fade-in-up 0.4s ease-out" }}
      >
        <AlertCircle className="mx-auto mb-4 h-16 w-16 text-landing-coral/50" />
        <h1 className="mb-2 text-2xl font-bold text-landing-text">
          {t("errorTitle")}
        </h1>
        <p className="mb-6 text-landing-text-muted">
          {t("errorDescription")}
        </p>
        <Button
          onClick={reset}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {t("errorRetry")}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/lists/[slug]/loading.tsx src/app/[locale]/lists/[slug]/not-found.tsx src/app/[locale]/lists/[slug]/error.tsx
git commit -m "feat: add loading skeleton, 404 page, and error boundary for public list"
```

---

## Chunk 4: Dashboard Updates & Cache Invalidation

### Task 10: Update Share Button

**Files:**
- Modify: `src/components/lists/list-header.tsx`

- [ ] **Step 1: Replace share placeholder with clipboard copy**

In `src/components/lists/list-header.tsx`:

1. Add `Check` to the lucide-react import
2. Add state: `const [shareCopied, setShareCopied] = useState(false);`
3. Replace the share section (the `<div>` with `shareComingSoon` text) with:

```tsx
{/* Share button — copies public link */}
<button
  onClick={async () => {
    const url = `${window.location.origin}/${locale}/lists/${list.slug}`;
    await navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  }}
  className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-full bg-landing-coral/10 px-3 py-1 text-xs font-medium text-landing-coral transition-colors hover:bg-landing-coral/20"
>
  {shareCopied ? (
    <>
      <Check className="h-3.5 w-3.5" />
      {t("shareCopied")}
    </>
  ) : (
    <>
      <Share2 className="h-3.5 w-3.5" />
      {t("shareButton")}
    </>
  )}
</button>
```

- [ ] **Step 2: Verify build compiles**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/components/lists/list-header.tsx
git commit -m "feat: share button copies public link to clipboard"
```

### Task 11: Add Cache Invalidation for Public Route

**Files:**
- Modify: `src/app/[locale]/dashboard/lists/actions.ts`

- [ ] **Step 1: Add revalidatePath for public route**

In each server action that calls `revalidatePath`, add a second call for the public path right after the existing one:

**In `createItem`** — add after the existing `revalidatePath` call:
```typescript
revalidatePath(`/${locale}/lists/${listSlug}`);
```

**In `updateItem`** — add after the existing `revalidatePath` call:
```typescript
revalidatePath(`/${locale}/lists/${listSlug}`);
```

**In `deleteItem`** — add after the existing `revalidatePath` call:
```typescript
revalidatePath(`/${locale}/lists/${listSlug}`);
```

**In `reorderItems`** — add after the existing `revalidatePath` call:
```typescript
revalidatePath(`/${locale}/lists/${listSlug}`);
```

**In `updateList`** — add BEFORE the `redirect()` call (since redirect throws and never returns). Invalidate both old and new slugs:
```typescript
revalidatePath(`/${locale}/lists/${slug}`);
revalidatePath(`/${locale}/lists/${newSlug}`);
```

**In `deleteList`** — add BEFORE the `redirect()` call:
```typescript
revalidatePath(`/${locale}/lists/${slug}`);
```

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/dashboard/lists/actions.ts
git commit -m "feat: add cache invalidation for public list route"
```

---

## Chunk 5: E2E Tests

### Task 12: Write E2E Tests

**Files:**
- Create: `e2e/public-list.spec.ts`

**Important:** Before writing tests, check `e2e/` directory for existing auth patterns and test setup. The tests below assume authenticated access to the dashboard. If no auth setup exists yet, the tests that require creating lists will need auth fixtures first — create them based on the project's auth flow (Google OAuth / magic link). At minimum, the 404 test works without auth.

- [ ] **Step 1: Create E2E test file**

```typescript
// e2e/public-list.spec.ts
import { test, expect } from "@playwright/test";

// Helper: Create a list via the dashboard and return its slug.
// IMPORTANT: This assumes the page is authenticated. If auth setup
// doesn't exist yet, create auth fixtures first (see existing e2e/ patterns).
async function createTestList(page: import("@playwright/test").Page) {
  await page.goto("/en/dashboard/lists/new");
  await page.waitForLoadState("networkidle");

  await page.fill('input[name="name"]', "Test Public List");
  await page.fill('textarea[name="description"]', "A test list for E2E");
  await page.click('button[type="submit"]');

  await page.waitForURL(/\/en\/dashboard\/lists\//);

  const url = page.url();
  const slug = url.split("/dashboard/lists/")[1]?.split("?")[0];
  return slug;
}

test.describe("Public List Page", () => {
  test("guest can view a public list with all details", async ({ page }) => {
    const slug = await createTestList(page);
    expect(slug).toBeTruthy();

    // Visit public URL in a new context (no auth cookies)
    const context = await page.context().browser()!.newContext();
    const guestPage = await context.newPage();
    await guestPage.goto(`/en/lists/${slug}`);
    await guestPage.waitForLoadState("networkidle");

    // List details visible
    await expect(guestPage.locator("h1")).toContainText("Test Public List");
    await expect(guestPage.locator("text=A test list for E2E")).toBeVisible();

    // No edit/delete controls
    await expect(guestPage.locator("text=Edit")).not.toBeVisible();
    await expect(guestPage.locator("text=Delete list")).not.toBeVisible();

    // Header present
    await expect(guestPage.locator("text=Podaruj.me")).toBeVisible();

    await context.close();
  });

  test("public page shows 404 for non-existent slug", async ({ page }) => {
    await page.goto("/en/lists/this-slug-does-not-exist-xxxxx");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=List not found")).toBeVisible();
    await expect(page.locator("text=Back to home")).toBeVisible();
  });

  test("owner visiting public link sees owner banner", async ({ page }) => {
    const slug = await createTestList(page);

    await page.goto(`/en/lists/${slug}`);
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=This is your list")).toBeVisible();
    await expect(page.locator("text=Manage in dashboard")).toBeVisible();

    // Dismiss banner
    await page.click('[aria-label="Dismiss"]');
    await expect(page.locator("text=This is your list")).not.toBeVisible();
  });

  test("share button copies public URL to clipboard", async ({ page }) => {
    const slug = await createTestList(page);

    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.click("text=Share");

    await expect(page.locator("text=Link copied!")).toBeVisible();

    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText()
    );
    expect(clipboardText).toContain(`/en/lists/${slug}`);
  });

  test("reserve buttons are visible but disabled", async ({ page }) => {
    const slug = await createTestList(page);

    // Add an item
    await page.click("text=Add gift");
    await page.fill('input[name="name"]', "Test Gift");
    await page.click('button:has-text("Add gift"):not([type="button"])');
    await page.waitForTimeout(500);

    // Visit public page as guest
    const context = await page.context().browser()!.newContext();
    const guestPage = await context.newPage();
    await guestPage.goto(`/en/lists/${slug}`);
    await guestPage.waitForLoadState("networkidle");

    const reserveButton = guestPage.locator("button:has-text('Reserve')");
    await expect(reserveButton).toBeVisible();
    await expect(reserveButton).toBeDisabled();

    await context.close();
  });

  test("public page has correct Open Graph metadata", async ({ page }) => {
    const slug = await createTestList(page);

    await page.goto(`/en/lists/${slug}`);
    await page.waitForLoadState("networkidle");

    const ogTitle = await page.getAttribute('meta[property="og:title"]', "content");
    expect(ogTitle).toContain("Test Public List");

    const ogDescription = await page.getAttribute('meta[property="og:description"]', "content");
    expect(ogDescription).toBeTruthy();
  });
});
```

**Design spec test coverage notes:**
- Tests 1-6, 9 from the spec are covered above
- Test 7 ("works without auth / incognito") is effectively covered by the guest context tests which create a fresh browser context with no cookies
- Test 8 ("loading skeleton") is not easily testable in Playwright without network interception — this is acknowledged as a gap; manual verification recommended

- [ ] **Step 2: Run the tests**

Run: `npx playwright test e2e/public-list.spec.ts`

Adjust tests based on any failures (auth setup, selectors, timing).

- [ ] **Step 3: Run all tests to verify no regressions**

Run: `npx playwright test`

- [ ] **Step 4: Commit**

```bash
git add e2e/public-list.spec.ts
git commit -m "test: add E2E tests for public list page and share button"
```

---

## Chunk 6: Final Verification

### Task 13: Build Verification & Cleanup

- [ ] **Step 1: Run type check**

Run: `npx tsc --noEmit`

Fix any type errors.

- [ ] **Step 2: Run linter**

Run: `npm run lint`

Fix any lint errors.

- [ ] **Step 3: Run full build**

Run: `npm run build`

Verify no build errors.

- [ ] **Step 4: Run all E2E tests**

Run: `npx playwright test`

Verify all tests pass.

- [ ] **Step 5: Run `/simplify` on modified files**

Files to check:
- `src/lib/supabase/service.ts`
- `src/lib/countdown.ts`
- `src/app/[locale]/lists/layout.tsx`
- `src/app/[locale]/lists/[slug]/page.tsx`
- `src/app/[locale]/lists/[slug]/loading.tsx`
- `src/app/[locale]/lists/[slug]/not-found.tsx`
- `src/app/[locale]/lists/[slug]/error.tsx`
- `src/components/public/public-list-header.tsx`
- `src/components/public/public-gift-card.tsx`
- `src/components/public/owner-banner.tsx`
- `src/components/lists/list-header.tsx`
- `src/app/[locale]/dashboard/lists/actions.ts`

- [ ] **Step 6: Run `/review` on all changes**

- [ ] **Step 7: Push and update PR**

```bash
git push origin feature/shareable-links
```

Update PR #11 description with implementation details.
