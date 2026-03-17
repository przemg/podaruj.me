import { QrCode, Gift } from "lucide-react";

export function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-sm" aria-hidden="true">
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
              <svg aria-hidden="true" className="h-3.5 w-3.5 text-landing-mint" viewBox="0 0 12 12" fill="none">
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
              <svg aria-hidden="true" className="h-3.5 w-3.5 text-landing-mint" viewBox="0 0 12 12" fill="none">
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
