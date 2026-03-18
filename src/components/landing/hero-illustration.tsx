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
      <div className="animate-badge-entrance absolute -top-4 right-4 z-20 flex items-center gap-1.5 rounded-full bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
        <span>✦</span>
        <span>Anna just reserved!</span>
      </div>

      {/* Floating glass card — Privacy (left side, overlaps item 1) */}
      <div
        className="animate-item-fade-in absolute -left-2 z-20 flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.12] px-3 py-2 shadow-xl backdrop-blur-lg"
        style={{ top: "154px", animationDelay: "1.4s" }}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-landing-lavender/20">
          <Lock className="h-3.5 w-3.5 text-landing-lavender" />
        </div>
        <div>
          <p className="text-xs leading-none text-white/50">Privacy</p>
          <p className="mt-0.5 text-sm font-semibold leading-none text-white">Protected</p>
        </div>
      </div>

      {/* Floating glass card — QR Code (right side, overlaps item 3) */}
      <div
        className="animate-item-fade-in absolute -right-2 z-20 flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.12] px-3 py-2 shadow-xl backdrop-blur-lg"
        style={{ top: "248px", animationDelay: "1.55s" }}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-400/15">
          <QrCode className="h-3.5 w-3.5 text-sky-400" />
        </div>
        <div>
          <p className="text-xs leading-none text-white/50">Share via</p>
          <p className="mt-0.5 text-sm font-semibold leading-none text-white">QR Code</p>
        </div>
      </div>

      {/* Main card — glassmorphism with glow */}
      <div
        className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.08] shadow-2xl backdrop-blur-2xl"
        style={{ boxShadow: "0 0 60px rgba(56,189,248,0.06), 0 0 120px rgba(110,231,183,0.05), 0 25px 50px rgba(0,0,0,0.4)" }}
      >
        {/* Card header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
              Birthday Wishlist
            </p>
            <p className="mt-0.5 text-lg font-bold text-white">
              Karolina, 30 🎂
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/15">
            <Gift className="h-5 w-5 text-amber-400" />
          </div>
        </div>

        {/* Progress bar — fills from 0 → 50% on load */}
        <div className="px-5 pb-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-white/40">
            <span>2 of 4 gifts reserved</span>
            <span className="font-semibold text-amber-400">50%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/10">
            <div
              className="animate-progress-fill-half h-1.5 rounded-full"
              style={{ background: "linear-gradient(to right, #F97066, #FBBF24)" }}
            />
          </div>
        </div>

        {/* Gift items — staggered fade-in */}
        <div className="divide-y divide-white/5 border-t border-white/5">
          {/* Item 1 — reserved */}
          <div className="animate-item-fade-in flex items-center gap-3 px-5 py-3" style={{ animationDelay: "0.9s" }}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/20">
              <svg aria-hidden="true" className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium text-white">Wireless Headphones</p>
                <p className="shrink-0 text-xs font-medium text-white/40">299 PLN</p>
              </div>
              <p className="text-xs text-sky-400/80">Reserved by Anna K.</p>
            </div>
          </div>

          {/* Item 2 — unreserved */}
          <div className="animate-item-fade-in flex items-center gap-3 px-5 py-3" style={{ animationDelay: "1.05s" }}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/40">
              2
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium text-white">Coffee Table Book</p>
                <p className="shrink-0 text-xs font-medium text-white/40">89 PLN</p>
              </div>
            </div>
          </div>

          {/* Item 3 — reserved */}
          <div className="animate-item-fade-in flex items-center gap-3 px-5 py-3" style={{ animationDelay: "1.2s" }}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/20">
              <svg aria-hidden="true" className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium text-white">Perfume Set</p>
                <p className="shrink-0 text-xs font-medium text-white/40">159 PLN</p>
              </div>
              <p className="text-xs text-emerald-400/80">Reserved by Marcin T.</p>
            </div>
          </div>

          {/* Item 4 — unreserved */}
          <div className="animate-item-fade-in flex items-center gap-3 px-5 py-3" style={{ animationDelay: "1.35s" }}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/40">
              4
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium text-white">Smart Watch</p>
                <p className="shrink-0 text-xs font-medium text-white/40">599 PLN</p>
              </div>
            </div>
          </div>
        </div>

        {/* Share button — gradient */}
        <div className="p-4">
          <div
            className="w-full rounded-xl py-2.5 text-center text-sm font-semibold text-white"
            style={{ background: "linear-gradient(to right, #F97066, #F59E0B)" }}
          >
            Share this list →
          </div>
        </div>
      </div>
    </div>
  );
}
