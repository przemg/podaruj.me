# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign 4 landing page sections (Hero, How It Works, Testimonials, CTA) to match a richer, more structured layout adapted from dark-theme inspiration, keeping Podaruj.me's warm light pastel colors.

**Architecture:** Each section is an independent component file — modify them one at a time. i18n changes go first (foundation). E2E tests updated to match new content before/alongside implementation. No new dependencies.

**Tech Stack:** Next.js 16 App Router, React Server Components (hero is client due to form state), Tailwind CSS, next-intl, Playwright (E2E)

**Spec:** `docs/landing-redesign/spec.md`

---

## Chunk 1: i18n Updates

### Task 1: Update EN translations

**Files:**
- Modify: `messages/en.json`

- [ ] **Step 1: Remove old hero keys and add new ones**

In `messages/en.json`, inside `"landing"."hero"`:
- Remove keys: `tagline`, `badgeFree`, `badgeSecure`, `badgeEasy`, `badgeNoAccount`
- Add/update keys:

```json
"taglineTop": "Gift lists that",
"taglineBottom": "everyone loves",
"subtitle": "Create a shareable wish list in seconds. Share before any occasion — friends reserve gifts without duplicates or spoilers.",
"badge": "Free forever · No credit card needed",
"socialProof": "Loved by {count}+ happy users",
"trustFree": "Free forever",
"trustNoAccount": "No account for guests",
"trustMobile": "Works on mobile"
```

Keep unchanged: `emailPlaceholder`, `getStarted`, `emailRequired`, `goToDashboard`

- [ ] **Step 2: Update How It Works keys**

In `messages/en.json`, inside `"landing"."howItWorks"`:
- Add new keys (keep existing `title`, `subtitle`, `step1*`, `step2*`, `step3*`):

```json
"label": "HOW IT WORKS",
"titleTop": "Three steps to",
"titleBottom": "perfect gifting",
"title": "Three steps to perfect gifting"
```

- [ ] **Step 3: Update Testimonials keys**

In `messages/en.json`, inside `"landing"."testimonials"`:
- Remove keys: `t5Name`, `t5Occasion`, `t5Quote`
- Add/update:

```json
"label": "TESTIMONIALS",
"title": "People actually love it",
"subtitle": "Join thousands of happy users who made their special occasions unforgettable.",
"t1Name": "Karolina W.",
"t1Occasion": "Birthday, 30th",
"t2Name": "Marcin T.",
"t2Occasion": "Wedding",
"t3Name": "Aleksandra B.",
"t3Occasion": "Birthday",
"t3Quote": "Full Surprise mode was a game changer. For the first time in years I had no idea what I was getting!",
"t4Name": "Piotr K.",
"t4Occasion": "Christmas",
"t4Quote": "We used it for Christmas and for the first time nobody received a duplicate present. Absolute magic."
```

Keep unchanged: `t1Quote`, `t2Quote`

- [ ] **Step 4: Update CTA keys**

In `messages/en.json`, inside `"landing"."cta"`:
- Add/update:

```json
"titleTop": "Start your first list",
"titleBottom": "in 2 minutes",
"title": "Start your first list in 2 minutes",
"subtitle": "Free forever. No credit card. Works for birthdays, weddings, Christmas — any occasion.",
"trustFree": "Free forever",
"trustGuests": "Guests don't need an account",
"trustSetup": "Set up in 2 minutes"
```

Keep unchanged: `button`

- [ ] **Step 5: Type-check to catch any JSON errors**

```bash
cd "D:\Praca\Prywatne\podaruj.me" && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors (or only pre-existing ones unrelated to i18n)

- [ ] **Step 6: Commit**

```bash
git add messages/en.json
git commit -m "i18n(en): update landing page strings for redesign"
```

---

### Task 2: Update PL translations

**Files:**
- Modify: `messages/pl.json`

- [ ] **Step 1: Remove old hero keys and add new ones**

In `messages/pl.json`, inside `"landing"."hero"`:
- Remove keys: `tagline`, `badgeFree`, `badgeSecure`, `badgeEasy`, `badgeNoAccount`
- Add/update:

```json
"taglineTop": "Listy prezentów,",
"taglineBottom": "które wszyscy kochają",
"subtitle": "Stwórz listę życzeń w kilka sekund. Udostępnij przed każdą okazją — znajomi rezerwują prezenty bez duplikatów i spoilerów.",
"badge": "Zawsze za darmo · Bez karty kredytowej",
"socialProof": "Używa już {count}+ zadowolonych użytkowników",
"trustFree": "Zawsze za darmo",
"trustNoAccount": "Goście bez konta",
"trustMobile": "Działa na telefonie"
```

Keep unchanged: `emailPlaceholder`, `getStarted`, `emailRequired`, `goToDashboard`

- [ ] **Step 2: Update How It Works keys**

In `messages/pl.json`, inside `"landing"."howItWorks"`:

```json
"label": "JAK TO DZIAŁA",
"titleTop": "Trzy kroki do",
"titleBottom": "idealnych prezentów",
"title": "Trzy kroki do idealnych prezentów"
```

- [ ] **Step 3: Update Testimonials keys**

In `messages/pl.json`, inside `"landing"."testimonials"`:
- Remove keys: `t5Name`, `t5Occasion`, `t5Quote`
- Add/update:

```json
"label": "OPINIE",
"title": "Ludzie naprawdę to kochają",
"subtitle": "Dołącz do tysięcy zadowolonych użytkowników, którzy sprawili, że ich wyjątkowe okazje stały się niezapomniane.",
"t1Name": "Karolina W.",
"t1Occasion": "Urodziny, 30. urodziny",
"t2Name": "Marcin T.",
"t2Occasion": "Ślub",
"t3Name": "Aleksandra B.",
"t3Occasion": "Urodziny",
"t3Quote": "Tryb Pełna Niespodzianka był przełomem. Po raz pierwszy od lat nie wiedziałam, co dostanę!",
"t4Name": "Piotr K.",
"t4Occasion": "Święta Bożego Narodzenia",
"t4Quote": "Użyliśmy tego na Święta i po raz pierwszy nikt nie dostał zduplikowanego prezentu. Absolutna magia."
```

- [ ] **Step 4: Update CTA keys**

In `messages/pl.json`, inside `"landing"."cta"`:

```json
"titleTop": "Stwórz swoją pierwszą listę",
"titleBottom": "w 2 minuty",
"title": "Stwórz swoją pierwszą listę w 2 minuty",
"subtitle": "Zawsze za darmo. Bez karty kredytowej. Działa na urodziny, wesela, Święta — każdą okazję.",
"trustFree": "Zawsze za darmo",
"trustGuests": "Goście bez konta",
"trustSetup": "Gotowe w 2 minuty"
```

- [ ] **Step 5: Commit**

```bash
git add messages/pl.json
git commit -m "i18n(pl): update landing page strings for redesign"
```

---

## Chunk 2: E2E Test Updates

### Task 3: Update landing.spec.ts for new content

The existing `e2e/landing.spec.ts` checks for old strings and structure. Update it to match the redesigned sections.

**Files:**
- Modify: `e2e/landing.spec.ts`

- [ ] **Step 1: Update the main sections test**

Replace the test `"renders all main sections"` with:

```typescript
test("renders all main sections", async ({ page }) => {
  // Navigation
  await expect(page.locator("nav")).toBeVisible();
  await expect(page.getByText("Podaruj.me").first()).toBeVisible();

  // Hero — new headline
  await expect(page.getByText("Gift lists that")).toBeVisible();
  await expect(page.getByText("everyone loves")).toBeVisible();
  await expect(page.getByPlaceholder("Enter your email")).toBeVisible();
  await expect(page.getByRole("button", { name: "Get Started" })).toBeVisible();

  // Hero badge pill
  await expect(page.getByText("Free forever · No credit card needed")).toBeVisible();

  // Hero social proof
  await expect(page.getByText(/Loved by.*happy users/)).toBeVisible();

  // How it works
  await expect(page.getByText("HOW IT WORKS")).toBeVisible();
  await expect(page.getByText("Three steps to")).toBeVisible();
  await expect(page.getByText("perfect gifting")).toBeVisible();
  await expect(page.getByText("Create your list").first()).toBeVisible();

  // Demo video (unchanged)
  await expect(page.getByRole("heading", { name: "See it in action" })).toBeVisible();

  // Features (unchanged)
  await expect(page.getByText("Everything you need")).toBeVisible();

  // Testimonials — new layout
  await expect(page.getByText("TESTIMONIALS")).toBeVisible();
  await expect(page.getByText("People actually love it")).toBeVisible();
  await expect(page.getByText("Karolina W.")).toBeVisible();
  await expect(page.getByText("Marcin T.")).toBeVisible();

  // FAQ (unchanged)
  await expect(page.getByText("Frequently asked questions")).toBeVisible();

  // CTA — new headline
  await expect(page.getByText("Start your first list")).toBeVisible();
  await expect(page.getByText("in 2 minutes")).toBeVisible();
  await expect(page.getByText("Guests don't need an account")).toBeVisible();

  // Footer (unchanged)
  await expect(page.getByText("Gift lists made simple")).toBeVisible();
});
```

- [ ] **Step 2: Update trust badges test**

Replace `"trust badges are visible in hero"` with:

```typescript
test("trust badges are visible in hero", async ({ page }) => {
  const hero = page.locator("#hero");
  await expect(hero.getByText("Free forever").first()).toBeVisible();
  await expect(hero.getByText("No account for guests")).toBeVisible();
  await expect(hero.getByText("Works on mobile")).toBeVisible();
});
```

- [ ] **Step 3: Update language switcher test**

In `"language switcher navigates to PL"`, replace the old PL headline assertion:

```typescript
// Old (remove):
await expect(page.getByText("Idealny prezent, za każdym razem")).toBeVisible();

// New (add):
await expect(page.getByText("Listy prezentów,")).toBeVisible();
await expect(page.getByText("które wszyscy kochają")).toBeVisible();
```

- [ ] **Step 4: Add product mockup test**

```typescript
test("hero product mockup is visible", async ({ page }) => {
  const hero = page.locator("#hero");
  await expect(hero.getByText("Birthday Wishlist")).toBeVisible();
  await expect(hero.getByText("Karolina, 30")).toBeVisible();
  await expect(hero.getByText("Anna just reserved")).toBeVisible();
  await expect(hero.getByText("Wireless Headphones")).toBeVisible();
});
```

- [ ] **Step 5: Add testimonials grid test**

```typescript
test("testimonials render as 2x2 grid with star ratings", async ({ page }) => {
  const testimonials = page.locator("#testimonials");
  await testimonials.scrollIntoViewIfNeeded();
  await expect(testimonials.getByText("People actually love it")).toBeVisible();
  await expect(testimonials.getByText("Karolina W.")).toBeVisible();
  await expect(testimonials.getByText("Marcin T.")).toBeVisible();
  await expect(testimonials.getByText("Aleksandra B.")).toBeVisible();
  await expect(testimonials.getByText("Piotr K.")).toBeVisible();
  // Stars present (5 per card = at least 20 star characters)
  const stars = testimonials.locator('[aria-label="5 out of 5 stars"]');
  await expect(stars).toHaveCount(4);
});
```

- [ ] **Step 6: Run tests to confirm they fail (pre-implementation)**

```bash
cd "D:\Praca\Prywatne\podaruj.me" && npx playwright test e2e/landing.spec.ts --reporter=line 2>&1 | tail -20
```

Expected: several tests fail on new content checks (old strings still in components)

- [ ] **Step 7: Commit updated tests**

```bash
git add e2e/landing.spec.ts
git commit -m "test: update landing E2E tests for redesign"
```

---

## Chunk 3: Hero Section

### Task 4: Rewrite hero-illustration.tsx (Product Mockup)

**Files:**
- Modify: `src/components/landing/hero-illustration.tsx`

Replace the entire file content. Keep the same export name `HeroIllustration`.

- [ ] **Step 1: Rewrite hero-illustration.tsx**

```tsx
import { QrCode, Gift } from "lucide-react";

export function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      {/* Notification badge */}
      <div className="absolute -top-4 -right-2 z-10 flex items-center gap-1.5 rounded-full bg-landing-coral px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
        <span>+</span>
        <span>Anna just reserved!</span>
      </div>

      {/* Main card */}
      <div className="rounded-2xl bg-white shadow-xl ring-1 ring-landing-text/5 overflow-hidden">
        {/* Card header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-landing-text-muted">
              Birthday Wishlist
            </p>
            <p className="mt-0.5 text-lg font-bold text-landing-text">
              Karolina, 30 🎂
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-landing-peach-wash">
            <Gift className="h-5 w-5 text-landing-coral" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between text-xs text-landing-text-muted mb-1.5">
            <span>2 of 4 gifts reserved</span>
            <span className="font-semibold text-landing-coral">50%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-landing-peach-wash">
            <div className="h-1.5 w-1/2 rounded-full bg-landing-coral" />
          </div>
        </div>

        {/* Gift items */}
        <div className="divide-y divide-landing-text/5 border-t border-landing-text/5">
          {/* Item 1 — reserved with privacy badge */}
          <div className="flex items-center gap-3 px-5 py-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-landing-mint/20">
              <svg className="h-3.5 w-3.5 text-landing-mint" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-landing-text">Wireless Headphones</p>
              <p className="text-xs text-landing-text-muted">Reserved by Anna K.</p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-landing-lavender-wash px-2 py-0.5 text-xs text-landing-lavender">
              <span>🔒</span>
              <span className="font-medium">Protected</span>
            </div>
          </div>

          {/* Item 2 — unreserved */}
          <div className="flex items-center gap-3 px-5 py-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-landing-peach-wash text-xs font-bold text-landing-text-muted">
              2
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-landing-text">Coffee Table Book</p>
              <p className="text-xs text-landing-text-muted">89 PLN</p>
            </div>
          </div>

          {/* Item 3 — reserved with QR chip */}
          <div className="flex items-center gap-3 px-5 py-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-landing-mint/20">
              <svg className="h-3.5 w-3.5 text-landing-mint" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-landing-text">Perfume Set</p>
              <p className="text-xs text-landing-text-muted">Reserved by Marcin T.</p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-landing-peach-wash px-2 py-0.5 text-xs text-landing-coral">
              <QrCode className="h-3 w-3" />
              <span className="font-medium">QR Code</span>
            </div>
          </div>

          {/* Item 4 — unreserved */}
          <div className="flex items-center gap-3 px-5 py-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-landing-peach-wash text-xs font-bold text-landing-text-muted">
              4
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-landing-text">Smart Watch</p>
              <p className="text-xs text-landing-text-muted">599 PLN</p>
            </div>
          </div>
        </div>

        {/* Share button */}
        <div className="p-4">
          <div className="w-full rounded-xl bg-landing-coral py-2.5 text-center text-sm font-semibold text-white">
            Share this list →
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/hero-illustration.tsx
git commit -m "feat: replace hero SVG with HTML product mockup"
```

---

### Task 5: Rebuild hero.tsx

**Files:**
- Modify: `src/components/landing/hero.tsx`

- [ ] **Step 1: Rewrite hero.tsx**

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Zap } from "lucide-react";
import { useRouter, Link } from "@/i18n/navigation";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { HeroIllustration } from "./hero-illustration";
import { LANDING_MAX_WIDTH } from "@/lib/layout";

const TRUST_BADGES = ["trustFree", "trustNoAccount", "trustMobile"] as const;

const AVATAR_STYLES = [
  { initials: "A", className: "bg-landing-coral text-white" },
  { initials: "K", className: "bg-landing-lavender text-white" },
  { initials: "M", className: "bg-landing-mint text-landing-text" },
  { initials: "P", className: "bg-landing-coral-dark text-white" },
] as const;

export function Hero({ userEmail }: { userEmail?: string }) {
  const t = useTranslations("landing.hero");
  const router = useRouter();
  const [heroEmail, setHeroEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const revealRef = useScrollReveal<HTMLDivElement>({ staggerDelay: 150 });

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-br from-landing-cream via-landing-cream to-landing-peach-wash pt-24 pb-16 sm:pt-32 sm:pb-20"
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: LANDING_MAX_WIDTH }}>
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          {/* Text content */}
          <div className="flex-1 text-center lg:text-left" ref={revealRef}>
            {/* Badge pill */}
            <div className="scroll-reveal mb-6 inline-flex items-center gap-1.5 rounded-full border border-landing-coral/30 bg-landing-peach-wash px-4 py-1.5 text-sm font-medium text-landing-coral-dark">
              <Zap className="h-3.5 w-3.5" />
              {t("badge")}
            </div>

            {/* Headline */}
            <h1 className="scroll-reveal text-4xl font-bold tracking-tight text-landing-text sm:text-5xl lg:text-6xl">
              {t("taglineTop")}
              <br />
              <span className="text-landing-coral">{t("taglineBottom")}</span>
            </h1>

            <p className="scroll-reveal mt-6 text-lg leading-relaxed text-landing-text-muted sm:text-xl">
              {t("subtitle")}
            </p>

            {/* Email input + CTA */}
            <div className="scroll-reveal mt-8">
              {userEmail ? (
                <Link
                  href="/dashboard"
                  className="inline-block rounded-xl bg-landing-peach-wash px-8 py-3.5 font-semibold text-landing-coral-dark transition-all hover:bg-landing-coral/10 hover:shadow-md"
                >
                  {t("goToDashboard")}
                </Link>
              ) : (
                <>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!heroEmail.trim()) {
                        setEmailError(true);
                        return;
                      }
                      setEmailError(false);
                      router.push(
                        `/auth/sign-in?email=${encodeURIComponent(heroEmail)}`
                      );
                    }}
                    className="flex flex-col gap-3 sm:flex-row sm:gap-0"
                  >
                    <input
                      type="email"
                      value={heroEmail}
                      onChange={(e) => {
                        setHeroEmail(e.target.value);
                        if (emailError) setEmailError(false);
                      }}
                      placeholder={t("emailPlaceholder")}
                      className={`w-full rounded-xl border bg-white px-5 py-3.5 text-landing-text placeholder:text-landing-text-muted/50 focus:ring-2 focus:outline-none sm:rounded-r-none sm:flex-1 ${
                        emailError
                          ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                          : "border-landing-text/10 focus:border-landing-coral focus:ring-landing-coral/20"
                      }`}
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-landing-coral-dark px-8 py-3.5 font-semibold text-white transition-all hover:scale-105 hover:bg-landing-coral-hover hover:shadow-lg sm:rounded-l-none"
                    >
                      {t("getStarted")}
                    </button>
                  </form>
                  {emailError && (
                    <p className="mt-2 text-sm text-red-500">{t("emailRequired")}</p>
                  )}
                </>
              )}
            </div>

            {/* Social proof */}
            <div className="scroll-reveal mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <div className="flex -space-x-2">
                {AVATAR_STYLES.map((avatar) => (
                  <div
                    key={avatar.initials}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ring-2 ring-white ${avatar.className}`}
                  >
                    {avatar.initials}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-amber-400"
                  aria-label="5 out of 5 stars"
                >
                  ★★★★★
                </span>
                <span className="text-sm text-landing-text-muted">
                  {t("socialProof", { count: "2,500" })}
                </span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 lg:justify-start">
              {TRUST_BADGES.map((key) => (
                <div
                  key={key}
                  className="scroll-reveal flex items-center gap-2 text-sm font-medium text-landing-text"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-landing-mint">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </div>
                  {t(key)}
                </div>
              ))}
            </div>
          </div>

          {/* Product mockup */}
          <div className="flex-1">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run type check**

```bash
cd "D:\Praca\Prywatne\podaruj.me" && npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/hero.tsx
git commit -m "feat: rebuild hero section with badge, social proof, product mockup"
```

---

## Chunk 4: How It Works + Testimonials

### Task 6: Update how-it-works.tsx

**Files:**
- Modify: `src/components/landing/how-it-works.tsx`

- [ ] **Step 1: Rewrite how-it-works.tsx**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { ClipboardList, Share2, Gift } from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { LANDING_MAX_WIDTH } from "@/lib/layout";

const STEPS = [
  {
    key: "step1",
    icon: ClipboardList,
    iconClass: "bg-landing-coral/10 text-landing-coral",
    badgeClass: "bg-landing-coral text-white",
  },
  {
    key: "step2",
    icon: Share2,
    iconClass: "bg-landing-lavender/10 text-landing-lavender",
    badgeClass: "bg-landing-lavender text-white",
  },
  {
    key: "step3",
    icon: Gift,
    iconClass: "bg-landing-mint/10 text-landing-mint",
    badgeClass: "bg-landing-mint text-landing-text",
  },
] as const;

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");
  const revealRef = useScrollReveal<HTMLDivElement>({ staggerDelay: 200 });

  return (
    <section id="how-it-works" className="bg-white py-20 sm:py-28">
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: LANDING_MAX_WIDTH }}>
        {/* Section label */}
        <p className="mb-3 text-center text-sm font-semibold uppercase tracking-widest text-landing-coral">
          {t("label")}
        </p>
        <h2 className="text-center text-3xl font-bold text-landing-text sm:text-4xl">
          {t("titleTop")}
          <br />
          <span className="text-landing-coral">{t("titleBottom")}</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-landing-text-muted">
          {t("subtitle")}
        </p>

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3" ref={revealRef}>
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.key} className="scroll-reveal relative text-center">
                {/* Connecting solid line (desktop only, not on last item) */}
                {index < STEPS.length - 1 && (
                  <div className="absolute top-10 left-[calc(50%+40px)] hidden h-[2px] w-[calc(100%-80px)] border-t-2 border-landing-text/10 md:block" />
                )}

                {/* Icon box with number badge */}
                <div className="relative mb-5 inline-flex">
                  <div className={`flex h-20 w-20 items-center justify-center rounded-2xl ${step.iconClass}`}>
                    <Icon className="h-9 w-9" />
                  </div>
                  <div
                    className={`absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${step.badgeClass}`}
                  >
                    {index + 1}
                  </div>
                </div>

                {/* Text */}
                <h3 className="text-xl font-semibold text-landing-text">
                  {t(`${step.key}Title`)}
                </h3>
                <p className="mx-auto mt-3 max-w-xs text-landing-text-muted">
                  {t(`${step.key}Description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/how-it-works.tsx
git commit -m "feat: update How It Works with label, 2-line heading, repositioned number badge"
```

---

### Task 7: Rebuild testimonials.tsx

**Files:**
- Modify: `src/components/landing/testimonials.tsx`

- [ ] **Step 1: Rewrite testimonials.tsx**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { LANDING_MAX_WIDTH } from "@/lib/layout";

const TESTIMONIALS = [
  { key: "t1", initials: "KW", color: "bg-landing-coral text-white" },
  { key: "t2", initials: "MT", color: "bg-landing-lavender text-white" },
  { key: "t3", initials: "AB", color: "bg-landing-mint text-landing-text" },
  { key: "t4", initials: "PK", color: "bg-landing-coral text-white" },
] as const;

export function Testimonials() {
  const t = useTranslations("landing.testimonials");
  const revealRef = useScrollReveal<HTMLDivElement>({ staggerDelay: 120 });

  return (
    <section id="testimonials" className="bg-white py-20 sm:py-28">
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: LANDING_MAX_WIDTH }}>
        {/* Section header */}
        <p className="mb-3 text-center text-sm font-semibold uppercase tracking-widest text-landing-coral">
          {t("label")}
        </p>
        <h2 className="text-center text-3xl font-bold text-landing-text sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-landing-text-muted">
          {t("subtitle")}
        </p>

        {/* 2×2 card grid */}
        <div
          className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2"
          ref={revealRef}
        >
          {TESTIMONIALS.map((item) => (
            <div
              key={item.key}
              className="scroll-reveal rounded-2xl border border-landing-text/5 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Stars */}
              <div
                className="mb-3 text-xl text-amber-400"
                aria-label="5 out of 5 stars"
              >
                ★★★★★
              </div>
              {/* Quote */}
              <p className="leading-relaxed text-landing-text-muted">
                &ldquo;{t(`${item.key}Quote`)}&rdquo;
              </p>
              {/* Author */}
              <div className="mt-4 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${item.color}`}
                >
                  {item.initials}
                </div>
                <div>
                  <p className="font-semibold text-landing-text">
                    {t(`${item.key}Name`)}
                  </p>
                  <p className="text-sm text-landing-text-muted">
                    {t(`${item.key}Occasion`)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/testimonials.tsx
git commit -m "feat: rebuild testimonials as 2x2 grid with star ratings"
```

---

## Chunk 5: CTA + Verification

### Task 8: Update cta-section.tsx

**Files:**
- Modify: `src/components/landing/cta-section.tsx`

- [ ] **Step 1: Rewrite cta-section.tsx**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

const TRUST_BADGES = ["trustFree", "trustGuests", "trustSetup"] as const;

export function CtaSection({ userEmail }: { userEmail?: string }) {
  const t = useTranslations("landing.cta");
  const revealRef = useScrollReveal<HTMLDivElement>({});

  return (
    <section className="bg-gradient-to-br from-landing-peach-wash via-white to-landing-lavender-wash py-20 sm:py-28">
      <div
        className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8"
        ref={revealRef}
      >
        <h2 className="scroll-reveal text-3xl font-bold text-landing-text sm:text-4xl">
          {t("titleTop")}
          <br />
          <span className="text-landing-coral">{t("titleBottom")}</span>
        </h2>
        <p className="scroll-reveal mt-4 text-lg text-landing-text-muted">
          {t("subtitle")}
        </p>
        <div className="scroll-reveal mt-8">
          <Link
            href={userEmail ? "/dashboard" : "/auth/sign-in"}
            className="animate-pulse-soft inline-block rounded-xl bg-landing-coral-dark px-10 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:bg-landing-coral-hover hover:shadow-lg"
          >
            {t("button")}
          </Link>
        </div>
        {/* Trust badges */}
        <div className="scroll-reveal mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {TRUST_BADGES.map((key) => (
            <div
              key={key}
              className="flex items-center gap-1.5 text-sm text-landing-text-muted"
            >
              <Check className="h-3.5 w-3.5 text-landing-mint" strokeWidth={3} />
              {t(key)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/cta-section.tsx
git commit -m "feat: update CTA with 2-line heading and trust badge row"
```

---

### Task 9: Run All Tests and Verify

- [ ] **Step 1: Run type check**

```bash
cd "D:\Praca\Prywatne\podaruj.me" && npx tsc --noEmit 2>&1
```

Expected: 0 errors

- [ ] **Step 2: Run linter**

```bash
cd "D:\Praca\Prywatne\podaruj.me" && npx eslint src/components/landing/ --max-warnings=0 2>&1
```

Expected: no warnings or errors in modified files

- [ ] **Step 3: Start dev server for manual visual check (background)**

```bash
cd "D:\Praca\Prywatne\podaruj.me" && npx next dev 2>&1 &
```

Wait ~10 seconds, then continue.

- [ ] **Step 4: Run all landing E2E tests**

```bash
cd "D:\Praca\Prywatne\podaruj.me" && npx playwright test e2e/landing.spec.ts --reporter=line 2>&1
```

Expected: all tests pass

- [ ] **Step 5: Run full E2E suite**

```bash
cd "D:\Praca\Prywatne\podaruj.me" && npx playwright test --reporter=line 2>&1 | tail -30
```

Expected: all existing tests pass (no regressions in auth, lists, dashboard etc.)

- [ ] **Step 6: Run /review on modified files**

Review all changed landing components for quality, accessibility, and correctness.

- [ ] **Step 7: Final commit if any fixes applied**

```bash
git add -p
git commit -m "fix: address review findings in landing redesign"
```
