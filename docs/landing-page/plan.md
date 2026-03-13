# Landing Page Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static landing page for Podaruj.me with 8 sections, warm pastel aesthetic, scroll animations, and full EN+PL i18n support.

**Architecture:** Component-per-section in `src/components/landing/`. Page.tsx composes all sections. CSS animations + Intersection Observer for scroll reveals. `"use client"` only for interactive parts (nav, FAQ accordion, scroll-reveal wrapper). All text via next-intl.

**Tech Stack:** Next.js 16 (App Router), TypeScript strict, Tailwind v4, shadcn/ui, next-intl, lucide-react

**Spec:** `docs/landing-page/spec.md`

---

## Chunk 1: Foundation

### Task 1: Add landing page colors and animations to globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add custom landing page CSS variables to `:root`**

Add after the existing `:root` block's `--ring` variable:

```css
  --landing-coral: #F97066;
  --landing-coral-hover: #E7635A;
  --landing-lavender: #A78BFA;
  --landing-lavender-hover: #9175E0;
  --landing-mint: #6EE7B7;
  --landing-mint-hover: #4ADE9E;
  --landing-cream: #FFFBF7;
  --landing-peach-wash: #FFF5F0;
  --landing-lavender-wash: #F5F0FF;
  --landing-text: #1F1717;
  --landing-text-muted: #6B5E5E;
  --landing-footer-bg: #2A2020;
  --landing-footer-text: #E8E0E0;
```

- [ ] **Step 2: Register custom colors in `@theme inline` block**

Add inside the `@theme inline` block:

```css
  --color-landing-coral: var(--landing-coral);
  --color-landing-coral-hover: var(--landing-coral-hover);
  --color-landing-lavender: var(--landing-lavender);
  --color-landing-lavender-hover: var(--landing-lavender-hover);
  --color-landing-mint: var(--landing-mint);
  --color-landing-mint-hover: var(--landing-mint-hover);
  --color-landing-cream: var(--landing-cream);
  --color-landing-peach-wash: var(--landing-peach-wash);
  --color-landing-lavender-wash: var(--landing-lavender-wash);
  --color-landing-text: var(--landing-text);
  --color-landing-text-muted: var(--landing-text-muted);
  --color-landing-footer-bg: var(--landing-footer-bg);
  --color-landing-footer-text: var(--landing-footer-text);
```

- [ ] **Step 3: Add animation keyframes after `@layer base`**

```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes float-slow {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(3deg); }
}

@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 1; }
}

@keyframes pulse-soft {
  0%, 100% { box-shadow: 0 0 0 0 rgba(249, 112, 102, 0.4); }
  50% { box-shadow: 0 0 0 12px rgba(249, 112, 102, 0); }
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in-right {
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes slide-in-overlay {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-float { animation: float 3s ease-in-out infinite; }
.animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
.animate-breathe { animation: breathe 3s ease-in-out infinite; }
.animate-pulse-soft { animation: pulse-soft 2.5s ease-in-out infinite; }

.scroll-reveal {
  opacity: 0;
  transform: translateY(24px);
}

.scroll-reveal.revealed {
  animation: fade-in-up 0.6s ease-out forwards;
}

.scroll-reveal-right {
  opacity: 0;
  transform: translateX(24px);
}

.scroll-reveal-right.revealed {
  animation: fade-in-right 0.6s ease-out forwards;
}

.scroll-reveal-scale {
  opacity: 0;
  transform: scale(0.95);
}

.scroll-reveal-scale.revealed {
  animation: scale-in 0.6s ease-out forwards;
}

@media (prefers-reduced-motion: reduce) {
  .animate-float,
  .animate-float-slow,
  .animate-breathe,
  .animate-pulse-soft {
    animation: none;
  }

  .scroll-reveal,
  .scroll-reveal-right,
  .scroll-reveal-scale {
    opacity: 1;
    transform: none;
  }

  .scroll-reveal.revealed,
  .scroll-reveal-right.revealed,
  .scroll-reveal-scale.revealed {
    animation: none;
  }
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Builds successfully with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(landing): add custom color palette and animation keyframes"
```

---

### Task 2: Create scroll reveal hook

**Files:**
- Create: `src/lib/use-scroll-reveal.ts`

- [ ] **Step 1: Create the hook**

```typescript
"use client";

import { useEffect, useRef } from "react";

export function useScrollReveal<T extends HTMLElement>(
  options: { threshold?: number; staggerDelay?: number } = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      const children = element.querySelectorAll(
        ".scroll-reveal, .scroll-reveal-right, .scroll-reveal-scale"
      );
      children.forEach((child) => {
        child.classList.add("revealed");
      });
      if (
        element.classList.contains("scroll-reveal") ||
        element.classList.contains("scroll-reveal-right") ||
        element.classList.contains("scroll-reveal-scale")
      ) {
        element.classList.add("revealed");
      }
      return;
    }

    const { threshold = 0.15, staggerDelay = 100 } = options;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;

            const children = target.querySelectorAll(
              ".scroll-reveal, .scroll-reveal-right, .scroll-reveal-scale"
            );

            if (children.length > 0) {
              children.forEach((child, index) => {
                setTimeout(() => {
                  child.classList.add("revealed");
                }, index * staggerDelay);
              });
            }

            if (
              target.classList.contains("scroll-reveal") ||
              target.classList.contains("scroll-reveal-right") ||
              target.classList.contains("scroll-reveal-scale")
            ) {
              target.classList.add("revealed");
            }

            observer.unobserve(target);
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options.threshold, options.staggerDelay]);

  return ref;
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/use-scroll-reveal.ts
git commit -m "feat(landing): add useScrollReveal hook for scroll-triggered animations"
```

---

### Task 3: Add all i18n translations

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/pl.json`

- [ ] **Step 1: Write English translations**

Replace `messages/en.json` with full landing page translations:

```json
{
  "common": {
    "appName": "Podaruj.me"
  },
  "landing": {
    "nav": {
      "howItWorks": "How it works",
      "features": "Features",
      "testimonials": "Testimonials",
      "faq": "FAQ",
      "createList": "Create list"
    },
    "hero": {
      "tagline": "The perfect gift, every time",
      "subtitle": "Create a wish list, share it with friends and family, and never get a duplicate gift again.",
      "emailPlaceholder": "Enter your email",
      "getStarted": "Get Started",
      "badgeFree": "Free",
      "badgeSecure": "Secure",
      "badgeEasy": "Easy to use",
      "badgeNoAccount": "No account needed to browse"
    },
    "howItWorks": {
      "title": "How it works",
      "step1Title": "Create your list",
      "step1Description": "Add gifts you'd love to receive. Set your privacy preferences.",
      "step2Title": "Share the link",
      "step2Description": "Send your list via link, email, or QR code to friends and family.",
      "step3Title": "Friends reserve gifts",
      "step3Description": "No duplicates, no spoiled surprises. Everyone picks something unique."
    },
    "features": {
      "title": "Everything you need",
      "privacyTitle": "Privacy modes",
      "privacyDescription": "Control who sees what. Full surprise or open coordination — you decide how reservations work.",
      "qrTitle": "QR code sharing",
      "qrDescription": "Print or share a QR code. One scan takes your friends straight to your list.",
      "privacyBuyersChoice": "Buyer's Choice",
      "privacyVisible": "Visible",
      "privacyFullSurprise": "Full Surprise",
      "importTitle": "Import from URL",
      "importDescription": "Paste a product link, we grab the details.",
      "noAccountTitle": "No account needed",
      "noAccountDescription": "Guests browse and reserve without signing up.",
      "countdownTitle": "Event countdown",
      "countdownDescription": "See how many days until the big occasion."
    },
    "testimonials": {
      "title": "People love Podaruj.me",
      "subtitle": "See what our users say about sharing gift lists with friends and family.",
      "t1Name": "Anna K.",
      "t1Occasion": "Birthday list",
      "t1Quote": "I shared my list in our family group chat and everyone picked something I actually wanted!",
      "t2Name": "Tomek R.",
      "t2Occasion": "Wedding registry",
      "t2Quote": "The surprise mode was perfect. We had no idea who bought what until the big day.",
      "t3Name": "Marta W.",
      "t3Occasion": "Christmas",
      "t3Quote": "Finally no more duplicate gifts. My kids each got their own list and it just worked."
    },
    "faq": {
      "title": "Frequently asked questions",
      "q1": "Is Podaruj.me free?",
      "a1": "Yes, completely free. Create unlimited lists and share them with anyone.",
      "q2": "Do my friends need an account?",
      "a2": "No. Anyone with the link can browse your list and reserve gifts without signing up.",
      "q3": "How does privacy work?",
      "a3": "You choose one of three modes: Buyer's Choice (guests decide if they reveal themselves), Visible (everyone sees who reserved what), or Full Surprise (you see nothing until the big day).",
      "q4": "Can I share my list on social media?",
      "a4": "Yes. Share via link, QR code, or email. Works in any messenger or social platform.",
      "q5": "What happens after the event?",
      "a5": "Your list is archived automatically. You can revisit it anytime or reuse it for next year."
    },
    "cta": {
      "title": "Ready to create your first gift list?",
      "subtitle": "It's free, takes 30 seconds, and your friends will thank you.",
      "button": "Create your list"
    },
    "footer": {
      "tagline": "Gift lists made simple",
      "madeWith": "Made with love in Poland",
      "copyright": "© {year} Podaruj.me. All rights reserved."
    },
    "metadata": {
      "title": "Podaruj.me — Gift Lists Made Simple",
      "description": "Create wish lists for any occasion and share them with friends and family. Free, no account needed to browse."
    }
  }
}
```

- [ ] **Step 2: Write Polish translations**

Replace `messages/pl.json`:

```json
{
  "common": {
    "appName": "Podaruj.me"
  },
  "landing": {
    "nav": {
      "howItWorks": "Jak to działa",
      "features": "Funkcje",
      "testimonials": "Opinie",
      "faq": "FAQ",
      "createList": "Stwórz listę"
    },
    "hero": {
      "tagline": "Idealny prezent, za każdym razem",
      "subtitle": "Stwórz listę życzeń, udostępnij ją bliskim i nigdy więcej nie dostaniesz podwójnego prezentu.",
      "emailPlaceholder": "Wpisz swój email",
      "getStarted": "Zacznij",
      "badgeFree": "Za darmo",
      "badgeSecure": "Bezpieczne",
      "badgeEasy": "Łatwe w użyciu",
      "badgeNoAccount": "Bez konta do przeglądania"
    },
    "howItWorks": {
      "title": "Jak to działa",
      "step1Title": "Stwórz listę",
      "step1Description": "Dodaj prezenty, które chcesz dostać. Ustaw preferencje prywatności.",
      "step2Title": "Udostępnij link",
      "step2Description": "Wyślij listę przez link, email lub kod QR do rodziny i znajomych.",
      "step3Title": "Bliscy rezerwują prezenty",
      "step3Description": "Bez duplikatów, bez psutych niespodzianek. Każdy wybiera coś wyjątkowego."
    },
    "features": {
      "title": "Wszystko, czego potrzebujesz",
      "privacyTitle": "Tryby prywatności",
      "privacyDescription": "Kontroluj, kto co widzi. Pełna niespodzianka lub otwarta koordynacja — Ty decydujesz, jak działają rezerwacje.",
      "privacyBuyersChoice": "Wybór Kupującego",
      "privacyVisible": "Widoczny",
      "privacyFullSurprise": "Pełna Niespodzianka",
      "qrTitle": "Udostępnianie kodem QR",
      "qrDescription": "Wydrukuj lub udostępnij kod QR. Jedno skanowanie przenosi znajomych do Twojej listy.",
      "importTitle": "Import z URL",
      "importDescription": "Wklej link do produktu, a my pobierzemy szczegóły.",
      "noAccountTitle": "Bez konta",
      "noAccountDescription": "Goście przeglądają i rezerwują bez rejestracji.",
      "countdownTitle": "Odliczanie do wydarzenia",
      "countdownDescription": "Zobacz, ile dni pozostało do wielkiej okazji."
    },
    "testimonials": {
      "title": "Ludzie kochają Podaruj.me",
      "subtitle": "Zobacz, co mówią nasi użytkownicy o dzieleniu się listami prezentów z bliskimi.",
      "t1Name": "Anna K.",
      "t1Occasion": "Lista urodzinowa",
      "t1Quote": "Udostępniłam listę w rodzinnej grupie na czacie i każdy wybrał coś, czego naprawdę chciałam!",
      "t2Name": "Tomek R.",
      "t2Occasion": "Lista ślubna",
      "t2Quote": "Tryb niespodzianki był idealny. Nie mieliśmy pojęcia, kto co kupił, aż do wielkiego dnia.",
      "t3Name": "Marta W.",
      "t3Occasion": "Święta",
      "t3Quote": "Koniec z podwójnymi prezentami. Moje dzieci miały własne listy i to po prostu działało."
    },
    "faq": {
      "title": "Często zadawane pytania",
      "q1": "Czy Podaruj.me jest darmowe?",
      "a1": "Tak, całkowicie za darmo. Tworzenie nieograniczonej liczby list i dzielenie się nimi z każdym.",
      "q2": "Czy moi znajomi potrzebują konta?",
      "a2": "Nie. Każdy, kto ma link, może przeglądać listę i rezerwować prezenty bez rejestracji.",
      "q3": "Jak działa prywatność?",
      "a3": "Wybierasz jeden z trzech trybów: Wybór Kupującego (goście decydują, czy się ujawnią), Widoczny (każdy widzi, kto co zarezerwował) lub Pełna Niespodzianka (nie widzisz żadnych rezerwacji aż do wielkiego dnia).",
      "q4": "Czy mogę udostępnić listę w mediach społecznościowych?",
      "a4": "Tak. Udostępnij przez link, kod QR lub email. Działa w każdym komunikatorze i platformie społecznościowej.",
      "q5": "Co się dzieje po wydarzeniu?",
      "a5": "Lista jest automatycznie archiwizowana. Możesz do niej wrócić w dowolnym momencie lub użyć jej ponownie w następnym roku."
    },
    "cta": {
      "title": "Gotowy, by stworzyć swoją pierwszą listę prezentów?",
      "subtitle": "To darmowe, zajmuje 30 sekund, a Twoi bliscy będą wdzięczni.",
      "button": "Stwórz listę"
    },
    "footer": {
      "tagline": "Listy prezentów w prosty sposób",
      "madeWith": "Stworzone z miłością w Polsce",
      "copyright": "© {year} Podaruj.me. Wszelkie prawa zastrzeżone."
    },
    "metadata": {
      "title": "Podaruj.me — Listy Prezentów w Prosty Sposób",
      "description": "Tworzenie list życzeń na każdą okazję i dzielenie się nimi z rodziną i znajomymi. Za darmo, bez konta do przeglądania."
    }
  }
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Builds successfully.

- [ ] **Step 4: Commit**

```bash
git add messages/en.json messages/pl.json
git commit -m "feat(landing): add EN and PL translations for all landing page sections"
```

---

### Task 4: Install shadcn/ui Accordion component

**Files:**
- Creates: `src/components/ui/accordion.tsx` (auto-generated by shadcn CLI)

- [ ] **Step 1: Install accordion**

Run: `npx shadcn@latest add accordion`
Expected: Component added to `src/components/ui/accordion.tsx`.

Note: This will also install `@radix-ui/react-accordion` as a dependency.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Builds successfully.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/accordion.tsx package.json package-lock.json
git commit -m "feat(landing): install shadcn/ui accordion component"
```

---

## Chunk 2: Navigation Utilities + Navigation + Hero

### Task 5: Create next-intl navigation utilities

**Files:**
- Create: `src/i18n/navigation.ts`

The Navigation component needs `Link` and `usePathname` from next-intl. These must be created from the routing config before any component uses them.

- [ ] **Step 1: Create navigation utilities**

```typescript
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, usePathname, useRouter, redirect } =
  createNavigation(routing);
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/navigation.ts
git commit -m "feat(i18n): add navigation utilities for locale-aware links"
```

---

### Task 6: Create Navigation component

**Files:**
- Create: `src/components/landing/navigation.tsx`

- [ ] **Step 1: Create the navigation component**

This is a `"use client"` component (needs scroll listener, state for mobile menu, event handlers).

```typescript
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Gift, Menu, X } from "lucide-react";

const NAV_SECTIONS = [
  { id: "how-it-works", key: "howItWorks" },
  { id: "features", key: "features" },
  { id: "testimonials", key: "testimonials" },
  { id: "faq", key: "faq" },
] as const;

export function Navigation({ locale }: { locale: string }) {
  const t = useTranslations("landing.nav");
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const otherLocale = locale === "en" ? "pl" : "en";

  return (
    <>
      <nav
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 shadow-md backdrop-blur-sm"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Left: Logo + Language Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollToSection("hero")}
              className="flex items-center gap-2 text-xl font-bold text-landing-text"
            >
              <Gift className="h-6 w-6 text-landing-coral" />
              <span>Podaruj.me</span>
            </button>
            <Link
              href={pathname}
              locale={otherLocale}
              className="rounded-full border border-landing-text/10 px-2.5 py-1 text-xs font-medium text-landing-text-muted transition-colors hover:bg-landing-peach-wash"
            >
              {otherLocale.toUpperCase()}
            </Link>
          </div>

          {/* Center: Section Links (desktop) */}
          <div className="hidden items-center gap-8 lg:flex">
            {NAV_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="text-sm font-medium text-landing-text-muted transition-colors hover:text-landing-coral"
              >
                {t(section.key)}
              </button>
            ))}
          </div>

          {/* Right: CTA (desktop) + Hamburger (mobile) */}
          <div className="flex items-center gap-3">
            <button className="hidden rounded-xl bg-landing-coral px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-landing-coral-hover hover:shadow-lg lg:block">
              {t("createList")}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-lg p-2 text-landing-text transition-colors hover:bg-landing-peach-wash lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-white"
          style={{ animation: "slide-in-overlay 0.3s ease-out" }}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex h-full flex-col px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xl font-bold text-landing-text">
                <Gift className="h-6 w-6 text-landing-coral" />
                <span>Podaruj.me</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg p-2 text-landing-text transition-colors hover:bg-landing-peach-wash"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-12 flex flex-1 flex-col gap-6">
              {NAV_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="text-left text-2xl font-medium text-landing-text transition-colors hover:text-landing-coral"
                >
                  {t(section.key)}
                </button>
              ))}
            </div>

            <div className="pb-8">
              <button className="w-full rounded-xl bg-landing-coral px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-landing-coral-hover">
                {t("createList")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: No errors. (Note: may need to check if `@/i18n/routing` exports `Link` — if not, use `next-intl`'s `Link` directly.)

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/navigation.tsx
git commit -m "feat(landing): add navigation with sticky header and full-screen mobile menu"
```

---

### Task 7: Create Hero component with SVG illustration

**Files:**
- Create: `src/components/landing/hero-illustration.tsx`
- Create: `src/components/landing/hero.tsx`

- [ ] **Step 1: Create the SVG illustration component**

A decorative SVG with a checklist, gift boxes, floating shapes. Server component (pure SVG, no interactivity).

```typescript
export function HeroIllustration() {
  return (
    <div className="relative h-[350px] w-full sm:h-[400px] lg:h-[450px]">
      {/* Decorative blobs */}
      <div className="animate-float-slow absolute top-4 right-8 h-20 w-20 rounded-full bg-landing-lavender/20" />
      <div className="animate-float absolute bottom-8 left-4 h-16 w-16 rounded-full bg-landing-coral/20" />
      <div className="animate-breathe absolute top-1/3 right-1/4 h-12 w-12 rounded-full bg-landing-mint/20" />

      {/* Main checklist SVG */}
      <svg
        viewBox="0 0 320 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-float mx-auto h-full"
        aria-hidden="true"
      >
        {/* Card background */}
        <rect x="40" y="30" width="240" height="320" rx="20" fill="white" />
        <rect
          x="40"
          y="30"
          width="240"
          height="320"
          rx="20"
          stroke="#F5F0FF"
          strokeWidth="2"
        />

        {/* Header bar */}
        <rect x="40" y="30" width="240" height="60" rx="20" fill="#FFF5F0" />
        <rect x="60" y="50" width="80" height="8" rx="4" fill="#F97066" />
        <rect
          x="60"
          y="64"
          width="120"
          height="6"
          rx="3"
          fill="#F97066"
          opacity="0.3"
        />

        {/* Checklist items */}
        {/* Item 1 - checked */}
        <rect x="60" y="110" width="200" height="50" rx="12" fill="#F5F0FF" />
        <rect
          x="72"
          y="124"
          width="22"
          height="22"
          rx="6"
          fill="#6EE7B7"
        />
        <path
          d="M78 135L82 139L90 131"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="104"
          y="128"
          width="90"
          height="7"
          rx="3.5"
          fill="#1F1717"
          opacity="0.15"
        />
        <rect
          x="104"
          y="140"
          width="60"
          height="5"
          rx="2.5"
          fill="#1F1717"
          opacity="0.08"
        />

        {/* Item 2 - checked */}
        <rect x="60" y="172" width="200" height="50" rx="12" fill="#FFF5F0" />
        <rect
          x="72"
          y="186"
          width="22"
          height="22"
          rx="6"
          fill="#6EE7B7"
        />
        <path
          d="M78 197L82 201L90 193"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="104"
          y="190"
          width="110"
          height="7"
          rx="3.5"
          fill="#1F1717"
          opacity="0.15"
        />
        <rect
          x="104"
          y="202"
          width="70"
          height="5"
          rx="2.5"
          fill="#1F1717"
          opacity="0.08"
        />

        {/* Item 3 - unchecked */}
        <rect x="60" y="234" width="200" height="50" rx="12" fill="white" />
        <rect
          x="60"
          y="234"
          width="200"
          height="50"
          rx="12"
          stroke="#E8E0E0"
          strokeWidth="1.5"
        />
        <rect
          x="72"
          y="248"
          width="22"
          height="22"
          rx="6"
          stroke="#E8E0E0"
          strokeWidth="1.5"
          fill="none"
        />
        <rect
          x="104"
          y="252"
          width="80"
          height="7"
          rx="3.5"
          fill="#1F1717"
          opacity="0.15"
        />
        <rect
          x="104"
          y="264"
          width="50"
          height="5"
          rx="2.5"
          fill="#1F1717"
          opacity="0.08"
        />

        {/* Item 4 - unchecked */}
        <rect x="60" y="296" width="200" height="50" rx="12" fill="white" />
        <rect
          x="60"
          y="296"
          width="200"
          height="50"
          rx="12"
          stroke="#E8E0E0"
          strokeWidth="1.5"
        />
        <rect
          x="72"
          y="310"
          width="22"
          height="22"
          rx="6"
          stroke="#E8E0E0"
          strokeWidth="1.5"
          fill="none"
        />
        <rect
          x="104"
          y="314"
          width="100"
          height="7"
          rx="3.5"
          fill="#1F1717"
          opacity="0.15"
        />
        <rect
          x="104"
          y="326"
          width="65"
          height="5"
          rx="2.5"
          fill="#1F1717"
          opacity="0.08"
        />

        {/* Floating gift box */}
        <g transform="translate(250, 10)">
          <rect width="36" height="30" y="6" rx="4" fill="#F97066" />
          <rect width="36" height="8" rx="4" fill="#E7635A" />
          <rect x="15" width="6" height="36" rx="2" fill="#FFF5F0" />
          <path
            d="M18 0C18 0 12 -6 8 -4C4 -2 6 2 10 4"
            stroke="#F97066"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M18 0C18 0 24 -6 28 -4C32 -2 30 2 26 4"
            stroke="#F97066"
            strokeWidth="2"
            fill="none"
          />
        </g>

        {/* Star decorations */}
        <circle cx="30" cy="180" r="4" fill="#A78BFA" opacity="0.4" />
        <circle cx="295" cy="250" r="3" fill="#F97066" opacity="0.4" />
        <circle cx="25" cy="300" r="3" fill="#6EE7B7" opacity="0.4" />
      </svg>

      {/* Small floating gift */}
      <div className="animate-float-slow absolute right-4 bottom-12">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          aria-hidden="true"
        >
          <rect y="12" width="40" height="28" rx="6" fill="#A78BFA" />
          <rect width="40" height="10" y="10" rx="5" fill="#9175E0" />
          <rect x="17" y="10" width="6" height="30" rx="2" fill="#F5F0FF" />
        </svg>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the Hero section component**

`"use client"` component — uses the scroll reveal hook and handles input.

```typescript
"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { HeroIllustration } from "./hero-illustration";

const BADGE_KEYS = [
  "badgeFree",
  "badgeSecure",
  "badgeEasy",
  "badgeNoAccount",
] as const;

export function Hero() {
  const t = useTranslations("landing.hero");
  const revealRef = useScrollReveal<HTMLElement>({ staggerDelay: 150 });

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-br from-landing-cream via-landing-cream to-landing-peach-wash pt-24 pb-16 sm:pt-32 sm:pb-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          {/* Text content */}
          <div className="flex-1 text-center lg:text-left" ref={revealRef}>
            <h1 className="scroll-reveal text-4xl font-bold tracking-tight text-landing-text sm:text-5xl lg:text-6xl">
              {t("tagline")}
            </h1>
            <p className="scroll-reveal mt-6 text-lg leading-relaxed text-landing-text-muted sm:text-xl">
              {t("subtitle")}
            </p>

            {/* Email input + CTA */}
            <div className="scroll-reveal mt-8 flex flex-col gap-3 sm:flex-row sm:gap-0">
              <input
                type="email"
                placeholder={t("emailPlaceholder")}
                className="w-full rounded-xl border border-landing-text/10 bg-white px-5 py-3.5 text-landing-text placeholder:text-landing-text-muted/50 focus:border-landing-coral focus:ring-2 focus:ring-landing-coral/20 focus:outline-none sm:rounded-r-none sm:flex-1"
              />
              <button className="rounded-xl bg-landing-coral px-8 py-3.5 font-semibold text-white transition-all hover:scale-105 hover:bg-landing-coral-hover hover:shadow-lg sm:rounded-l-none">
                {t("getStarted")}
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 lg:justify-start">
              {BADGE_KEYS.map((key) => (
                <div
                  key={key}
                  className="scroll-reveal flex items-center gap-2 text-sm text-landing-text-muted"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-landing-mint/20">
                    <Check className="h-3 w-3 text-landing-mint" />
                  </div>
                  {t(key)}
                </div>
              ))}
            </div>
          </div>

          {/* Illustration */}
          <div className="flex-1">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/hero-illustration.tsx src/components/landing/hero.tsx
git commit -m "feat(landing): add hero section with SVG illustration, email input, and trust badges"
```

---

## Chunk 3: How It Works + Features

### Task 8: Create How It Works component

**Files:**
- Create: `src/components/landing/how-it-works.tsx`

- [ ] **Step 1: Create the component**

`"use client"` — uses scroll reveal.

```typescript
"use client";

import { useTranslations } from "next-intl";
import { ClipboardList, Share2, Gift } from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

const STEPS = [
  { key: "step1", icon: ClipboardList, color: "bg-landing-coral/10 text-landing-coral" },
  { key: "step2", icon: Share2, color: "bg-landing-lavender/10 text-landing-lavender" },
  { key: "step3", icon: Gift, color: "bg-landing-mint/10 text-landing-mint" },
] as const;

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");
  const revealRef = useScrollReveal<HTMLElement>({ staggerDelay: 200 });

  return (
    <section id="how-it-works" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-landing-text sm:text-4xl">
          {t("title")}
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3" ref={revealRef}>
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.key} className="scroll-reveal relative text-center">
                {/* Connecting dashed line (desktop only, not on last item) */}
                {index < STEPS.length - 1 && (
                  <div className="absolute top-10 left-[calc(50%+40px)] hidden h-[2px] w-[calc(100%-80px)] border-t-2 border-dashed border-landing-text/10 md:block" />
                )}

                {/* Number badge */}
                <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-landing-peach-wash text-sm font-bold text-landing-coral">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl ${step.color}`}>
                  <Icon className="h-9 w-9" />
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

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/how-it-works.tsx
git commit -m "feat(landing): add how-it-works section with 3 steps and connecting lines"
```

---

### Task 9: Create Features bento grid component

**Files:**
- Create: `src/components/landing/features.tsx`

- [ ] **Step 1: Create the component**

`"use client"` — uses scroll reveal. Bento grid with 2 large + 3 small cards.

```typescript
"use client";

import { useTranslations } from "next-intl";
import { Shield, QrCode, Link2, UserX, Clock } from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

export function Features() {
  const t = useTranslations("landing.features");
  const revealRef = useScrollReveal<HTMLElement>({ staggerDelay: 120 });

  return (
    <section id="features" className="bg-landing-lavender-wash py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-landing-text sm:text-4xl">
          {t("title")}
        </h2>

        <div
          ref={revealRef}
          className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {/* Privacy modes — large card: 2 cols on desktop */}
          <div className="scroll-reveal-scale flex flex-col rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:col-span-2 lg:col-span-2 lg:row-span-2">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-landing-lavender/10">
              <Shield className="h-6 w-6 text-landing-lavender" />
            </div>
            <h3 className="text-xl font-semibold text-landing-text">
              {t("privacyTitle")}
            </h3>
            <p className="mt-2 text-landing-text-muted">
              {t("privacyDescription")}
            </p>
            {/* Mini UI mockup of privacy modes */}
            <div className="mt-6 flex flex-1 flex-col justify-end gap-3">
              {[
                { key: "privacyBuyersChoice", color: "bg-landing-coral/10 border-landing-coral/30" },
                { key: "privacyVisible", color: "bg-landing-mint/10 border-landing-mint/30" },
                { key: "privacyFullSurprise", color: "bg-landing-lavender/10 border-landing-lavender/30" },
              ].map((mode) => (
                <div
                  key={mode.key}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium text-landing-text ${mode.color}`}
                >
                  {t(mode.key)}
                </div>
              ))}
            </div>
          </div>

          {/* QR code — tall card: 1 col, 2 rows on desktop */}
          <div className="scroll-reveal-scale flex flex-col rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md lg:row-span-2">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-landing-coral/10">
              <QrCode className="h-6 w-6 text-landing-coral" />
            </div>
            <h3 className="text-xl font-semibold text-landing-text">
              {t("qrTitle")}
            </h3>
            <p className="mt-2 text-landing-text-muted">
              {t("qrDescription")}
            </p>
            {/* Decorative QR code SVG */}
            <div className="mt-6 flex flex-1 items-end justify-center">
              <svg
                width="140"
                height="160"
                viewBox="0 0 140 160"
                fill="none"
                aria-hidden="true"
              >
                {/* Phone outline */}
                <rect x="20" y="0" width="100" height="160" rx="16" stroke="#E8E0E0" strokeWidth="2" fill="white" />
                <rect x="55" y="6" width="30" height="4" rx="2" fill="#E8E0E0" />
                {/* QR code pattern */}
                <rect x="40" y="35" width="60" height="60" rx="4" fill="#F5F0FF" />
                <rect x="46" y="41" width="16" height="16" rx="2" fill="#A78BFA" />
                <rect x="78" y="41" width="16" height="16" rx="2" fill="#A78BFA" />
                <rect x="46" y="73" width="16" height="16" rx="2" fill="#A78BFA" />
                <rect x="66" y="61" width="8" height="8" rx="1" fill="#A78BFA" opacity="0.5" />
                <rect x="78" y="73" width="8" height="8" rx="1" fill="#A78BFA" opacity="0.5" />
                <rect x="66" y="73" width="8" height="8" rx="1" fill="#A78BFA" opacity="0.3" />
                {/* Scan line */}
                <rect x="35" y="110" width="70" height="3" rx="1.5" fill="#F97066" opacity="0.5" />
                {/* Label */}
                <rect x="45" y="125" width="50" height="6" rx="3" fill="#E8E0E0" />
                <rect x="55" y="135" width="30" height="4" rx="2" fill="#E8E0E0" />
              </svg>
            </div>
          </div>

          {/* Small cards: Import from URL */}
          <div className="scroll-reveal-scale flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-landing-mint/10">
              <Link2 className="h-5 w-5 text-landing-mint" />
            </div>
            <div>
              <h3 className="font-semibold text-landing-text">
                {t("importTitle")}
              </h3>
              <p className="mt-1 text-sm text-landing-text-muted">
                {t("importDescription")}
              </p>
            </div>
          </div>

          {/* Small cards: No account needed */}
          <div className="scroll-reveal-scale flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-landing-coral/10">
              <UserX className="h-5 w-5 text-landing-coral" />
            </div>
            <div>
              <h3 className="font-semibold text-landing-text">
                {t("noAccountTitle")}
              </h3>
              <p className="mt-1 text-sm text-landing-text-muted">
                {t("noAccountDescription")}
              </p>
            </div>
          </div>

          {/* Small cards: Event countdown */}
          <div className="scroll-reveal-scale flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-landing-lavender/10">
              <Clock className="h-5 w-5 text-landing-lavender" />
            </div>
            <div>
              <h3 className="font-semibold text-landing-text">
                {t("countdownTitle")}
              </h3>
              <p className="mt-1 text-sm text-landing-text-muted">
                {t("countdownDescription")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/features.tsx
git commit -m "feat(landing): add features section with bento grid layout"
```

---

## Chunk 4: Testimonials + FAQ + CTA + Footer

### Task 10: Create Testimonials component

**Files:**
- Create: `src/components/landing/testimonials.tsx`

- [ ] **Step 1: Create the component**

`"use client"` — uses scroll reveal.

```typescript
"use client";

import { useTranslations } from "next-intl";
import { Quote } from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

const TESTIMONIALS = [
  { key: "t1", initials: "AK", color: "bg-landing-coral text-white" },
  { key: "t2", initials: "TR", color: "bg-landing-lavender text-white" },
  { key: "t3", initials: "MW", color: "bg-landing-mint text-white" },
] as const;

export function Testimonials() {
  const t = useTranslations("landing.testimonials");
  const leftRef = useScrollReveal<HTMLDivElement>();
  const rightRef = useScrollReveal<HTMLDivElement>({ staggerDelay: 150 });

  return (
    <section id="testimonials" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* Left column */}
          <div className="lg:w-2/5 lg:py-8" ref={leftRef}>
            <h2 className="scroll-reveal text-3xl font-bold text-landing-text sm:text-4xl">
              {t("title")}
            </h2>
            <p className="scroll-reveal mt-4 text-lg text-landing-text-muted">
              {t("subtitle")}
            </p>
          </div>

          {/* Right column — cards */}
          <div className="flex flex-1 flex-col gap-4" ref={rightRef}>
            {TESTIMONIALS.map((item) => (
              <div
                key={item.key}
                className="scroll-reveal-right rounded-2xl bg-landing-cream p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <Quote className="mb-3 h-6 w-6 text-landing-lavender/40" />
                <p className="text-landing-text-muted leading-relaxed">
                  &ldquo;{t(`${item.key}Quote`)}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${item.color}`}
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
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/testimonials.tsx
git commit -m "feat(landing): add testimonials section with two-column layout"
```

---

### Task 11: Create FAQ accordion component

**Files:**
- Create: `src/components/landing/faq.tsx`

- [ ] **Step 1: Create the component**

`"use client"` — uses shadcn Accordion + scroll reveal.

```typescript
"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5"] as const;

export function Faq() {
  const t = useTranslations("landing.faq");
  const revealRef = useScrollReveal<HTMLElement>({ staggerDelay: 100 });

  return (
    <section id="faq" className="bg-landing-peach-wash py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-landing-text sm:text-4xl">
          {t("title")}
        </h2>

        <div className="mt-12" ref={revealRef}>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_KEYS.map((key) => (
              <AccordionItem
                key={key}
                value={key}
                className="scroll-reveal rounded-xl border-none bg-white px-6 shadow-sm"
              >
                <AccordionTrigger className="py-5 text-left text-base font-semibold text-landing-text hover:no-underline">
                  {t(key)}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-landing-text-muted">
                  {t(key.replace("q", "a") as `a${string}`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/faq.tsx
git commit -m "feat(landing): add FAQ section with accordion"
```

---

### Task 12: Create CTA section component

**Files:**
- Create: `src/components/landing/cta-section.tsx`

- [ ] **Step 1: Create the component**

`"use client"` — uses scroll reveal.

```typescript
"use client";

import { useTranslations } from "next-intl";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

export function CtaSection() {
  const t = useTranslations("landing.cta");
  const revealRef = useScrollReveal<HTMLElement>();

  return (
    <section className="bg-gradient-to-br from-landing-peach-wash via-white to-landing-lavender-wash py-20 sm:py-28">
      <div
        className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8"
        ref={revealRef}
      >
        <h2 className="scroll-reveal text-3xl font-bold text-landing-text sm:text-4xl">
          {t("title")}
        </h2>
        <p className="scroll-reveal mt-4 text-lg text-landing-text-muted">
          {t("subtitle")}
        </p>
        <div className="scroll-reveal mt-8">
          <button className="animate-pulse-soft rounded-xl bg-landing-coral px-10 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:bg-landing-coral-hover hover:shadow-lg">
            {t("button")}
          </button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/cta-section.tsx
git commit -m "feat(landing): add CTA section with breathing button animation"
```

---

### Task 13: Create Footer component

**Files:**
- Create: `src/components/landing/footer.tsx`

- [ ] **Step 1: Create the component**

Server component — no interactivity needed (scroll links will use `<a>` with `href="#section"`).

```typescript
import { useTranslations } from "next-intl";
import { Gift } from "lucide-react";

const FOOTER_LINKS = [
  { id: "how-it-works", key: "howItWorks" },
  { id: "features", key: "features" },
  { id: "faq", key: "faq" },
] as const;

export function Footer() {
  const t = useTranslations("landing");

  return (
    <footer className="bg-landing-footer-bg py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Logo + tagline */}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <Gift className="h-5 w-5 text-landing-coral" />
              <span className="text-lg font-bold text-landing-footer-text">
                Podaruj.me
              </span>
            </div>
            <p className="mt-2 text-sm text-landing-footer-text/60">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-8">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="text-sm text-landing-footer-text/60 transition-colors hover:text-landing-footer-text"
              >
                {t(`nav.${link.key}`)}
              </a>
            ))}
          </div>

          {/* Made with love */}
          <div className="text-center sm:text-right">
            <p className="text-sm text-landing-footer-text/60">
              {t("footer.madeWith")}
            </p>
            <p className="mt-1 text-sm text-landing-footer-text/40">
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/footer.tsx
git commit -m "feat(landing): add footer with logo, links, and copyright"
```

---

## Chunk 5: Page Composition + SEO + E2E Tests

### Task 14: Compose the landing page and add SEO metadata

**Files:**
- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/app/[locale]/layout.tsx`

- [ ] **Step 1: Rewrite page.tsx to compose all sections**

```typescript
import { Navigation } from "@/components/landing/navigation";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { Testimonials } from "@/components/landing/testimonials";
import { Faq } from "@/components/landing/faq";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { getTranslations } from "next-intl/server";

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

  return (
    <>
      <Navigation locale={locale} />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Faq />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Update layout.tsx — remove hardcoded metadata**

Remove the static `metadata` export from `layout.tsx` since `page.tsx` now handles it via `generateMetadata`.

Delete these lines from layout.tsx:
```typescript
export const metadata: Metadata = {
  title: 'Podaruj.me',
  description: 'Gift list sharing platform',
};
```

Also remove the unused `import type { Metadata } from 'next';`.

- [ ] **Step 3: Verify full build**

Run: `npm run build`
Expected: Builds successfully with no errors.

- [ ] **Step 4: Verify dev server renders**

Run: `npm run dev`
Navigate to `http://localhost:3000/en` and `http://localhost:3000/pl`.
Expected: All 8 sections render. Language switcher works.

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/page.tsx src/app/[locale]/layout.tsx
git commit -m "feat(landing): compose all sections with SEO metadata"
```

---

### Task 14: Install Playwright and write E2E tests

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/landing.spec.ts`

- [ ] **Step 1: Install Playwright**

Run: `npm init playwright@latest -- --quiet`

If prompted, accept defaults (TypeScript, e2e folder, no GitHub Actions).

Or manually:
```bash
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Create Playwright config**

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 3: Write E2E tests**

Create `e2e/landing.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en");
  });

  test("renders all main sections", async ({ page }) => {
    // Navigation
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.getByText("Podaruj.me").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Create list" }).first()).toBeVisible();

    // Hero
    await expect(page.getByText("The perfect gift, every time")).toBeVisible();
    await expect(page.getByPlaceholder("Enter your email")).toBeVisible();
    await expect(page.getByRole("button", { name: "Get Started" })).toBeVisible();

    // How it works
    await expect(page.getByText("How it works")).toBeVisible();
    await expect(page.getByText("Create your list")).toBeVisible();
    await expect(page.getByText("Share the link")).toBeVisible();
    await expect(page.getByText("Friends reserve gifts")).toBeVisible();

    // Features
    await expect(page.getByText("Everything you need")).toBeVisible();
    await expect(page.getByText("Privacy modes")).toBeVisible();
    await expect(page.getByText("QR code sharing")).toBeVisible();

    // Testimonials
    await expect(page.getByText("People love Podaruj.me")).toBeVisible();

    // FAQ
    await expect(page.getByText("Frequently asked questions")).toBeVisible();

    // CTA
    await expect(page.getByText("Ready to create your first gift list?")).toBeVisible();

    // Footer
    await expect(page.getByText("Gift lists made simple")).toBeVisible();
    await expect(page.getByText(/Made with love in Poland/)).toBeVisible();
  });

  test("language switcher navigates to PL", async ({ page }) => {
    await page.getByRole("link", { name: "PL" }).click();
    await expect(page).toHaveURL(/\/pl/);
    await expect(page.getByText("Idealny prezent, za kazdym razem")).toBeVisible();
  });

  test("FAQ accordion opens and closes", async ({ page }) => {
    const faqSection = page.locator("#faq");
    await faqSection.scrollIntoViewIfNeeded();

    const firstQuestion = page.getByText("Is Podaruj.me free?");
    await firstQuestion.click();
    await expect(page.getByText("Yes, completely free")).toBeVisible();

    // Click a different question — first should close
    await page.getByText("Do my friends need an account?").click();
    await expect(page.getByText("Anyone with the link")).toBeVisible();
  });

  test("trust badges are visible in hero", async ({ page }) => {
    await expect(page.getByText("Free")).toBeVisible();
    await expect(page.getByText("Secure")).toBeVisible();
    await expect(page.getByText("Easy to use")).toBeVisible();
    await expect(page.getByText("No account needed to browse")).toBeVisible();
  });

  test("mobile menu opens and closes", async ({ page }) => {
    test.skip(test.info().project.name !== "mobile", "Mobile-only test");

    await page.getByLabel("Open menu").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("How it works")).toBeVisible();

    await page.getByLabel("Close menu").click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
```

- [ ] **Step 4: Run tests**

Run: `npx playwright test`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts e2e/landing.spec.ts package.json package-lock.json
git commit -m "test(landing): add Playwright E2E tests for landing page"
```

---

### Task 15: Run linter, type check, and final verification

- [ ] **Step 1: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 3: Run full build**

Run: `npm run build`
Expected: Builds successfully.

- [ ] **Step 4: Run E2E tests**

Run: `npx playwright test`
Expected: All tests pass.

- [ ] **Step 5: Commit any fixes if needed**

```bash
git add -A
git commit -m "chore(landing): fix lint and type errors"
```
