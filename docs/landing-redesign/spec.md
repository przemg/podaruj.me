# Landing Page Redesign — Design Spec

Date: 2026-03-18
Branch: `feature/landing-redesign-experiment`
Status: Approved by user

## Goal

Redesign 4 landing page sections (Hero, How It Works, Testimonials, CTA) taking layout/structure from a dark-theme inspiration but adapting everything to Podaruj.me's existing warm, light pastel color scheme. The demo-video-section and all other sections (Features, FAQ, Navigation, Footer) remain unchanged.

## Color Palette (unchanged)

All existing CSS variables reused — all confirmed in `globals.css` @theme inline block:
- `landing-coral` (#F97066) — accent, highlights
- `landing-coral-dark` (#C13A30) — CTA buttons, "P" avatar
- `landing-lavender` (#A78BFA) — secondary accent
- `landing-mint` (#6EE7B7) — tertiary accent
- `landing-cream` (#FFFBF7) — warm background
- `landing-peach-wash` (#FFF5F0) — card backgrounds
- `landing-lavender-wash` (#F5F0FF) — card backgrounds
- `landing-text` (#1F1717) — headings
- `landing-text-muted` (#6B5E5E) — body text

---

## Section 1: Hero

### Layout
Two-column on desktop (text left, product mockup right). Single column stacked on mobile (text first, mockup below).

### Left column
1. **Badge pill** (always shown, including when logged in):
   - ⚡ icon + text from `hero.badge`
   - Style: coral border, peach-wash background, small rounded-full pill

2. **Headline** — two separate i18n keys rendered as two lines:
   - `hero.taglineTop` — first line, normal weight
   - `hero.taglineBottom` — second line, coral + bold
   - Old `hero.tagline` key **removed**

3. **Subtitle**: `hero.subtitle` (updated content — see i18n table)

4. **Email form / Go to Dashboard**: unchanged conditional logic (`userEmail`). Badge pill, social proof row, and trust badges are rendered **outside** this conditional — always visible regardless of auth state.

5. **Social proof row** (always shown):
   - 4 overlapping colored avatar circles: A (coral), K (lavender), M (mint), P (coral-dark)
   - 5 gold stars with `aria-label="5 out of 5 stars"`
   - `t("socialProof", { count: "2,500" })` — count passed as formatted string

6. **Trust badges row** (replaces `BADGE_KEYS` array — old keys removed):
   - ✓ `hero.trustFree` · ✓ `hero.trustNoAccount` · ✓ `hero.trustMobile`
   - Checkmark in mint circle (same style as current badges)

### Right column — Product mockup (HTML/JSX)
`hero-illustration.tsx` is **replaced in-place** — `HeroIllustration` export rewritten as HTML/JSX mockup. Import in `hero.tsx` unchanged.

**Card structure** (white card, rounded-2xl, shadow-xl, max-w-sm):
- **Notification badge** (absolute, top-right, outside card): "+ Anna just reserved!" — coral bg, white text, rounded-full pill, shadow-md
- **Card header**: "BIRTHDAY WISHLIST" label (small, muted) + "Karolina, 30 🎂" (bold) + 🎁 icon top-right
- **Progress bar**: "2 of 4 gifts reserved" + "50%" + coral filled bar on peach-wash track
- **4 gift items** (hardcoded illustrative content, not translated):
  1. Wireless Headphones — 299 PLN — reserved: "Reserved by Anna K." + privacy pill "🔒 Protected"
  2. Coffee Table Book — 89 PLN — unreserved, number "2"
  3. Perfume Set — 159 PLN — reserved: "Reserved by Marcin T." + QR code chip (inline pill, QrCode lucide icon + "QR Code" text, peach-wash bg)
  4. Smart Watch — 599 PLN — unreserved, number "4"
- **Share button**: "Share this list →" full-width coral button at bottom

---

## Section 2: How It Works

### Changes

1. **Section label**: "HOW IT WORKS" — small uppercase, coral, letter-spacing-wider — key: `howItWorks.label`

2. **Heading** — two separate i18n keys:
   - `howItWorks.titleTop` — first line, normal weight
   - `howItWorks.titleBottom` — second line, coral + bold
   - Old `howItWorks.title` key **kept with updated value** for any other potential use, but component renders the two-key version

3. **Icon boxes**: 80×80px with solid colored backgrounds (same as current sizes, confirm in code):
   - Step 1: `bg-landing-coral/10`, icon `text-landing-coral`
   - Step 2: `bg-landing-lavender/10`, icon `text-landing-lavender`
   - Step 3: `bg-landing-mint/10`, icon `text-landing-mint`

4. **Number badge**: repositioned to top-right corner of icon box:
   - Icon box gets `relative` class
   - Badge: `absolute -top-2 -right-2 h-7 w-7 rounded-full flex items-center justify-center text-sm font-bold`
   - Step 1: coral bg/white text; Step 2: lavender bg/white text; Step 3: mint bg/landing-text

5. **Connecting line**: remove `border-dashed` → solid `border-t-2 border-landing-text/10`
   - Mobile: hidden (current `md:block` class preserved)

---

## Section 3: Testimonials

### Layout change
**From:** Sticky left + scrolling right card stack
**To:** Centered heading + 2×2 card grid

### Header
- Label: `testimonials.label` — uppercase, coral
- Heading: `testimonials.title`
- Subtitle: `testimonials.subtitle`

### Card grid
- `grid-cols-1 md:grid-cols-2 gap-4`
- 4 cards, t5 removed from component array and i18n files

**Component const — all 4 entries:**
| Key | Initials | Avatar color | Name key | Occasion key |
|-----|----------|-------------|----------|--------------|
| t1 | KW | coral | t1Name → "Karolina W." | t1Occasion → "Birthday, 30th" |
| t2 | MT | lavender | t2Name → "Marcin T." | t2Occasion → "Wedding" |
| t3 | AB | mint | t3Name → "Aleksandra B." | t3Occasion → "Birthday" |
| t4 | PK | coral | t4Name → "Piotr K." | t4Occasion → "Christmas" |

**t5 removal:** Remove `{ key: "t5", … }` from component const. Delete `t5Name`, `t5Occasion`, `t5Quote` from both `en.json` and `pl.json`.

### Each card
- White bg, `rounded-2xl`, `border border-landing-text/5`, `shadow-sm hover:shadow-md`
- 5 amber stars (`text-amber-400`), `aria-label="5 out of 5 stars"`
- Quote in `text-landing-text-muted leading-relaxed`
- Avatar circle + name (`font-semibold`) + occasion (`text-sm text-landing-text-muted`)

---

## Section 4: CTA

### Changes

1. **Heading** — two separate i18n keys:
   - `cta.titleTop` — first line, normal weight
   - `cta.titleBottom` — second line, coral + bold
   - Old `cta.title` key updated value (kept)

2. **Subtitle**: `cta.subtitle` (updated)

3. **CTA button**: unchanged (`cta.button`, pulse animation)

4. **Trust badge row** (new, below button, centered):
   - ✓ `cta.trustFree` · ✓ `cta.trustGuests` · ✓ `cta.trustSetup`
   - `text-sm text-landing-text-muted`, checkmark in mint

---

## i18n — Full String Tables

### EN

| Key | Value |
|-----|-------|
| `landing.hero.tagline` | _(removed)_ |
| `landing.hero.taglineTop` | "Gift lists that" |
| `landing.hero.taglineBottom` | "everyone loves" |
| `landing.hero.subtitle` | "Create a shareable wish list in seconds. Share before any occasion — friends reserve gifts without duplicates or spoilers." |
| `landing.hero.badge` | "Free forever · No credit card needed" |
| `landing.hero.socialProof` | "Loved by {count}+ happy users" |
| `landing.hero.trustFree` | "Free forever" |
| `landing.hero.trustNoAccount` | "No account for guests" |
| `landing.hero.trustMobile` | "Works on mobile" |
| `landing.hero.badgeFree` | _(removed)_ |
| `landing.hero.badgeSecure` | _(removed)_ |
| `landing.hero.badgeEasy` | _(removed)_ |
| `landing.hero.badgeNoAccount` | _(removed)_ |
| `landing.howItWorks.label` | "HOW IT WORKS" |
| `landing.howItWorks.titleTop` | "Three steps to" |
| `landing.howItWorks.titleBottom` | "perfect gifting" |
| `landing.howItWorks.title` | "Three steps to perfect gifting" _(updated, kept)_ |
| `landing.howItWorks.subtitle` | _(unchanged)_ |
| `landing.testimonials.label` | "TESTIMONIALS" |
| `landing.testimonials.title` | "People actually love it" |
| `landing.testimonials.subtitle` | "Join thousands of happy users who made their special occasions unforgettable." |
| `landing.testimonials.t1Name` | "Karolina W." |
| `landing.testimonials.t1Occasion` | "Birthday, 30th" |
| `landing.testimonials.t2Name` | "Marcin T." |
| `landing.testimonials.t2Occasion` | "Wedding" |
| `landing.testimonials.t3Name` | "Aleksandra B." |
| `landing.testimonials.t3Occasion` | "Birthday" |
| `landing.testimonials.t3Quote` | "Full Surprise mode was a game changer. For the first time in years I had no idea what I was getting!" |
| `landing.testimonials.t4Name` | "Piotr K." |
| `landing.testimonials.t4Occasion` | "Christmas" |
| `landing.testimonials.t4Quote` | "We used it for Christmas and for the first time nobody received a duplicate present. Absolute magic." |
| `landing.testimonials.t5Name` | _(removed)_ |
| `landing.testimonials.t5Occasion` | _(removed)_ |
| `landing.testimonials.t5Quote` | _(removed)_ |
| `landing.cta.titleTop` | "Start your first list" |
| `landing.cta.titleBottom` | "in 2 minutes" |
| `landing.cta.title` | "Start your first list in 2 minutes" _(updated, kept)_ |
| `landing.cta.subtitle` | "Free forever. No credit card. Works for birthdays, weddings, Christmas — any occasion." |
| `landing.cta.trustFree` | "Free forever" |
| `landing.cta.trustGuests` | "Guests don't need an account" |
| `landing.cta.trustSetup` | "Set up in 2 minutes" |

### PL

| Key | Value |
|-----|-------|
| `landing.hero.tagline` | _(removed)_ |
| `landing.hero.taglineTop` | "Listy prezentów," |
| `landing.hero.taglineBottom` | "które wszyscy kochają" |
| `landing.hero.subtitle` | "Stwórz listę życzeń w kilka sekund. Udostępnij przed każdą okazją — znajomi rezerwują prezenty bez duplikatów i spoilerów." |
| `landing.hero.badge` | "Zawsze za darmo · Bez karty kredytowej" |
| `landing.hero.socialProof` | "Używa już {count}+ zadowolonych użytkowników" |
| `landing.hero.trustFree` | "Zawsze za darmo" |
| `landing.hero.trustNoAccount` | "Goście bez konta" |
| `landing.hero.trustMobile` | "Działa na telefonie" |
| `landing.hero.badgeFree` | _(removed)_ |
| `landing.hero.badgeSecure` | _(removed)_ |
| `landing.hero.badgeEasy` | _(removed)_ |
| `landing.hero.badgeNoAccount` | _(removed)_ |
| `landing.howItWorks.label` | "JAK TO DZIAŁA" |
| `landing.howItWorks.titleTop` | "Trzy kroki do" |
| `landing.howItWorks.titleBottom` | "idealnych prezentów" |
| `landing.howItWorks.title` | "Trzy kroki do idealnych prezentów" _(updated, kept)_ |
| `landing.howItWorks.subtitle` | _(unchanged)_ |
| `landing.testimonials.label` | "OPINIE" |
| `landing.testimonials.title` | "Ludzie naprawdę to kochają" |
| `landing.testimonials.subtitle` | "Dołącz do tysięcy zadowolonych użytkowników, którzy sprawili, że ich wyjątkowe okazje stały się niezapomniane." |
| `landing.testimonials.t1Name` | "Karolina W." |
| `landing.testimonials.t1Occasion` | "Urodziny, 30. urodziny" |
| `landing.testimonials.t2Name` | "Marcin T." |
| `landing.testimonials.t2Occasion` | "Ślub" |
| `landing.testimonials.t3Name` | "Aleksandra B." |
| `landing.testimonials.t3Occasion` | "Urodziny" |
| `landing.testimonials.t3Quote` | "Tryb Pełna Niespodzianka był przełomem. Po raz pierwszy od lat nie wiedziałam, co dostanę!" |
| `landing.testimonials.t4Name` | "Piotr K." |
| `landing.testimonials.t4Occasion` | "Święta Bożego Narodzenia" |
| `landing.testimonials.t4Quote` | "Użyliśmy tego na Święta i po raz pierwszy nikt nie dostał zduplikowanego prezentu. Absolutna magia." |
| `landing.testimonials.t5Name` | _(removed)_ |
| `landing.testimonials.t5Occasion` | _(removed)_ |
| `landing.testimonials.t5Quote` | _(removed)_ |
| `landing.cta.titleTop` | "Stwórz swoją pierwszą listę" |
| `landing.cta.titleBottom` | "w 2 minuty" |
| `landing.cta.title` | "Stwórz swoją pierwszą listę w 2 minuty" _(updated, kept)_ |
| `landing.cta.subtitle` | "Zawsze za darmo. Bez karty kredytowej. Działa na urodziny, wesela, Święta — każdą okazję." |
| `landing.cta.trustFree` | "Zawsze za darmo" |
| `landing.cta.trustGuests` | "Goście bez konta" |
| `landing.cta.trustSetup` | "Gotowe w 2 minuty" |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/landing/hero.tsx` | Full rebuild |
| `src/components/landing/hero-illustration.tsx` | Replace SVG with HTML/JSX mockup (same export name) |
| `src/components/landing/how-it-works.tsx` | Label, 2-line heading, solid line, repositioned number badge |
| `src/components/landing/testimonials.tsx` | 2×2 grid layout, star ratings |
| `src/components/landing/cta-section.tsx` | 2-line heading, updated subtitle, trust badge row |
| `messages/en.json` | Per table above |
| `messages/pl.json` | Per table above |

## Files NOT Changed

- `src/components/landing/demo-video-section.tsx`
- `src/components/landing/features.tsx`
- `src/components/landing/faq.tsx`
- `src/components/landing/navigation.tsx`
- `src/components/landing/footer.tsx`
- All app pages (`/dashboard`, `/lists`, `/auth`)

## Constraints

- No dark backgrounds
- Existing CSS variables only (all tokens confirmed valid)
- User-facing text via `next-intl` — mockup card content hardcoded (illustrative)
- Scroll reveal animations preserved (`.scroll-reveal` classes reused)
- Mobile-first responsive
- No new npm packages
- Badge pill, social proof, trust badges: always visible regardless of auth state
