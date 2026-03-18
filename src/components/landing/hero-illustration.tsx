import { QrCode, Gift, Lock } from "lucide-react";

/**
 * Decorative product mockup — intentionally hardcoded English demo content.
 * The entire element is aria-hidden="true" so it does not affect screen readers.
 * Strings are illustrative and not translated (by design per landing-redesign spec).
 */
export function HeroIllustration() {
  return (
    <div className="animate-float relative mx-auto w-full max-w-md px-8" aria-hidden="true">
      {/* Notification badge — bounces in from above, then nudges periodically */}
      <div className="animate-badge-entrance absolute -top-4 right-4 z-20 flex items-center gap-1.5 rounded-full bg-landing-coral px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
        <span>+</span>
        <span>Anna just reserved!</span>
      </div>

      {/* Floating glass card — Privacy (left side, overlaps item 1) */}
      <div
        className="animate-item-fade-in absolute -left-2 z-20 flex items-center gap-2 rounded-xl border border-landing-lavender/20 bg-white/80 px-3 py-2 shadow-lg backdrop-blur-sm"
        style={{ top: "154px", animationDelay: "1.4s" }}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-landing-lavender/15">
          <Lock className="h-3.5 w-3.5 text-landing-lavender" />
        </div>
        <div>
          <p className="text-xs leading-none text-landing-text-muted">Privacy</p>
          <p className="mt-0.5 text-sm font-semibold leading-none text-landing-text">Protected</p>
        </div>
      </div>

      {/* Floating glass card — QR Code (right side, overlaps item 3) */}
      <div
        className="animate-item-fade-in absolute -right-2 z-20 flex items-center gap-2 rounded-xl border border-landing-coral/20 bg-white/80 px-3 py-2 shadow-lg backdrop-blur-sm"
        style={{ top: "248px", animationDelay: "1.55s" }}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-landing-coral/10">
          <QrCode className="h-3.5 w-3.5 text-landing-coral" />
        </div>
        <div>
          <p className="text-xs leading-none text-landing-text-muted">Share via</p>
          <p className="mt-0.5 text-sm font-semibold leading-none text-landing-text">QR Code</p>
        </div>
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

        {/* Progress bar — fills from 0 → 50% on load */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between text-xs text-landing-text-muted mb-1.5">
            <span>2 of 4 gifts reserved</span>
            <span className="font-semibold text-landing-coral">50%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-landing-peach-wash">
            <div className="animate-progress-fill-half h-1.5 rounded-full bg-landing-coral" />
          </div>
        </div>

        {/* Gift items — staggered fade-in */}
        <div className="divide-y divide-landing-text/5 border-t border-landing-text/5">
          {/* Item 1 — reserved */}
          <div className="animate-item-fade-in flex items-center gap-3 px-5 py-3" style={{ animationDelay: "0.9s" }}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-landing-mint/20">
              <svg aria-hidden="true" className="h-3.5 w-3.5 text-landing-mint" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium text-landing-text">Wireless Headphones</p>
                <p className="shrink-0 text-xs font-medium text-landing-text-muted">299 PLN</p>
              </div>
              <p className="text-xs text-landing-coral/80">Reserved by Anna K.</p>
            </div>
          </div>

          {/* Item 2 — unreserved */}
          <div className="animate-item-fade-in flex items-center gap-3 px-5 py-3" style={{ animationDelay: "1.05s" }}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-landing-peach-wash text-xs font-bold text-landing-text-muted">
              2
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium text-landing-text">Coffee Table Book</p>
                <p className="shrink-0 text-xs font-medium text-landing-text-muted">89 PLN</p>
              </div>
            </div>
          </div>

          {/* Item 3 — reserved */}
          <div className="animate-item-fade-in flex items-center gap-3 px-5 py-3" style={{ animationDelay: "1.2s" }}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-landing-mint/20">
              <svg aria-hidden="true" className="h-3.5 w-3.5 text-landing-mint" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium text-landing-text">Perfume Set</p>
                <p className="shrink-0 text-xs font-medium text-landing-text-muted">159 PLN</p>
              </div>
              <p className="text-xs text-landing-coral/80">Reserved by Marcin T.</p>
            </div>
          </div>

          {/* Item 4 — unreserved */}
          <div className="animate-item-fade-in flex items-center gap-3 px-5 py-3" style={{ animationDelay: "1.35s" }}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-landing-peach-wash text-xs font-bold text-landing-text-muted">
              4
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium text-landing-text">Smart Watch</p>
                <p className="shrink-0 text-xs font-medium text-landing-text-muted">599 PLN</p>
              </div>
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
