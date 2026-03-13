# Landing Page — Design Spec

## Overview

Static landing page for Podaruj.me — a gift list sharing platform. Presents the product, builds trust, and drives users toward creating their first list. No backend, no auth — all placeholder actions.

## Tech Decisions

- Component-per-section architecture (one file per section)
- CSS animations + Intersection Observer for scroll reveals (no extra libraries)
- Tailwind CSS + shadcn/ui components
- next-intl for EN + PL translations
- SVG illustrations (inline, no external assets)
- Server Components by default, `"use client"` only for interactive parts (accordion, mobile nav, scroll observer)

## Color Palette

Mixed warm pastels:

| Role | Color | Usage |
|------|-------|-------|
| Primary | Coral/peach #F97066, hover #E7635A | CTAs, active states, buttons |
| Secondary | Lavender #A78BFA, hover #9175E0 | Accents, icons, decorative |
| Tertiary | Mint #6EE7B7, hover #4ADE9E | Success states, trust badges |
| Background | Warm cream #FFFBF7 | Main page background |
| Section alt | Peach wash #FFF5F0, lavender wash #F5F0FF | Alternating section backgrounds |
| Text | Dark warm gray #1F1717 | Headings |
| Text muted | #6B5E5E | Body text, descriptions |

## Typography

Geist Sans (already installed). Large bold headlines, relaxed line-height body text. Rounded corners (lg/xl), soft shadows, generous whitespace.

## Sections

### 1. Navigation

**Desktop:**
- Left: Logo (text + gift icon) + language switcher (EN/PL toggle)
- Center: Section links — How it works, Features, Testimonials, FAQ (smooth scroll)
- Right: "Create list" CTA button (coral/peach, rounded)
- Sticky, transparent over hero, white bg + shadow on scroll

**Mobile:**
- Left: Logo + language switcher
- Right: Hamburger icon
- Full-screen overlay nav with section links stacked vertically, "Create list" button at bottom
- Smooth slide-in animation on open

### 2. Hero

**Layout:** Centered text on mobile, two-column on desktop (text left, illustration right).

**Content:**
- Tagline: "The perfect gift, every time"
- Subtitle: "Create a wish list, share it with friends and family, and never get a duplicate gift again."
- Email input + "Get Started" button (no action, placeholder only)
- Trust badges below input (tick list, appearing one by one):
  - Free
  - Secure
  - Easy to use
  - No account needed to browse

**Illustration (right side desktop, below text mobile):**
- SVG: stylized gift list/checklist with checked items
- Surrounded by floating decorative blobs, gift box icons, stars, confetti shapes
- Breathing/floating animation on decorative elements
- Subtle floating animation (no scroll-linked parallax — keep it simple for v1)

**Background:** Warm cream with very subtle peach-to-lavender gradient wash.

### 3. How It Works

**3 steps, horizontal row (desktop), vertical stack (mobile):**

1. **Create your list** — clipboard/list icon — "Add gifts you'd love to receive. Set your privacy preferences."
2. **Share the link** — share/link icon — "Send your list via link, email, or QR code to friends and family."
3. **Friends reserve gifts** — gift/check icon — "No duplicates, no spoiled surprises. Everyone picks something unique."

Each step: number badge, icon in colored circle (peach, lavender, mint), heading, description. Dashed connecting line between steps on desktop.

**Animation:** Steps reveal one by one on scroll, sliding up with stagger delay.

### 4. Features (Bento Grid)

**5 features in a bento-style grid (3 columns desktop):**

```
+---------------------+-----------+
|                     |           |
|   Privacy modes     | QR code   |
|   (2col x 2row)    | (1col x2r)|
|   + illustration    | + image   |
|                     |           |
+-----------+---------+-----------+
| Import    | No acct | Event     |
| from URL  | needed  | countdown |
+-----------+---------+-----------+
```

**Large cards (Privacy modes, QR code):**
- Icon, title, description + decorative SVG illustration
- Privacy modes: mini UI mockup showing three mode options
- QR code: SVG of phone scanning QR code

**Small cards (Import from URL, No account needed, Event countdown):**
- Icon in colored circle + title + one-liner description

**Mobile:** Full-width stacked — large cards first, small cards below.

**Background:** Subtle lavender-tinted section.

**Animation:** Cards fade in + scale up on scroll, staggered.

### 5. Testimonials

**Two-column layout (desktop):**

**Left column:**
- Heading: "People love Podaruj.me"
- Subtitle: "See what our users say about sharing gift lists with friends and family."

**Right column — 3 stacked cards:**

1. **Anna K. — Birthday list** — "I shared my list in our family group chat and everyone picked something I actually wanted!"
2. **Tomek R. — Wedding registry** — "The surprise mode was perfect. We had no idea who bought what until the big day."
3. **Marta W. — Christmas** — "Finally no more duplicate gifts. My kids each got their own list and it just worked."

Each card: quote icon (peach/lavender), quote text, avatar (circle with initials), name, occasion label.

**Mobile:** Left column stacks on top, cards below.

**Background:** Cream/white. Cards have soft shadows and rounded corners.

**Animation:** Left side fades in, cards appear one by one from right with stagger.

### 6. FAQ

**Accordion, centered, max-width container.**

Heading: "Frequently asked questions"

1. **Is Podaruj.me free?** — "Yes, completely free. Create unlimited lists and share them with anyone."
2. **Do my friends need an account?** — "No. Anyone with the link can browse your list and reserve gifts without signing up."
3. **How does privacy work?** — "You choose one of three modes: Buyer's Choice (guests decide if they reveal themselves), Visible (everyone sees who reserved what), or Full Surprise (you see nothing until the big day)."
4. **Can I share my list on social media?** — "Yes. Share via link, QR code, or email. Works in any messenger or social platform."
5. **What happens after the event?** — "Your list is archived automatically. You can revisit it anytime or reuse it for next year."

One open at a time. Smooth height animation. Chevron icon rotates on open/close.

**Background:** Subtle peach-tinted section.

### 7. CTA

- Centered, generous padding
- Heading: "Ready to create your first gift list?"
- Subtitle: "It's free, takes 30 seconds, and your friends will thank you."
- Large "Create your list" button (coral/peach, rounded)
- Button has subtle breathing/pulse animation
- Background: soft peach-to-lavender gradient wash

### 8. Footer

- Dark warm gray background, light text
- Left: Logo + tagline ("Gift lists made simple")
- Center: Links — How it works, Features, FAQ (scroll links)
- Right: "Made with love in Poland" + copyright 2026
- Mobile: Stacks vertically

## Animations Summary

| Animation | Trigger | Technique |
|-----------|---------|-----------|
| Section reveals | Scroll into view | Intersection Observer + CSS fade/slide up |
| Trust badges | Scroll into view | Staggered appear, one by one |
| Hero illustration | Continuous | CSS keyframes floating animation |
| Decorative shapes | Continuous | CSS keyframes floating/breathing |
| Bento cards | Scroll into view | Fade in + scale, staggered |
| Testimonial cards | Scroll into view | Slide in from right, staggered |
| FAQ accordion | Click | Smooth height transition, chevron rotation |
| CTA button | Continuous | Subtle pulse/breathing animation |
| Nav background | Scroll position | Transparent to white + shadow transition |
| Mobile nav | Hamburger click | Full-screen slide-in overlay |
| Button hovers | Hover | Scale up slightly + shadow increase |

## Accessibility

- Respect `prefers-reduced-motion`: disable all scroll/continuous animations, use instant transitions
- FAQ accordion: proper ARIA attributes (`aria-expanded`, `aria-controls`, `role="region"`) and keyboard navigation (Enter/Space to toggle)
- Mobile nav overlay: focus trap when open, Escape to close
- All color combinations must meet WCAG AA contrast (4.5:1 body text, 3:1 large text/UI). Dark text (#1F1717) on cream (#FFFBF7) passes easily; verify coral buttons have sufficient contrast with white text.

## SEO / Metadata

- Page title: "Podaruj.me — Gift Lists Made Simple"
- Meta description: "Create wish lists for any occasion and share them with friends and family. Free, no account needed to browse."
- Open Graph tags: title, description, image (placeholder OG image), site name
- Twitter card: summary_large_image
- Implement via `generateMetadata` in `[locale]/page.tsx`

## i18n

All user-visible text in `messages/en.json` and `messages/pl.json` under a `landing` namespace. No hardcoded strings in components.

Language switcher navigates between `/{locale}` routes using `next-intl`'s `Link` with `locale` param, preserving scroll position.

## File Structure

```
src/
  app/[locale]/
    page.tsx                    # Composes all sections
  components/
    landing/
      navigation.tsx            # Sticky nav + mobile hamburger
      hero.tsx                  # Hero section
      how-it-works.tsx          # 3 steps
      features.tsx              # Bento grid
      testimonials.tsx          # Two-column testimonials
      faq.tsx                   # Accordion
      cta-section.tsx           # Final CTA
      footer.tsx                # Footer
    ui/                         # shadcn/ui components (added as needed)
  lib/
    use-intersection-observer.ts  # Scroll reveal hook
```
