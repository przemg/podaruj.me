"use client";

import { useTranslations } from "next-intl";
import { Shield, QrCode, Link2, UserX, Clock, Eye, EyeOff, HelpCircle } from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

export function Features() {
  const t = useTranslations("landing.features");
  const revealRef = useScrollReveal<HTMLDivElement>({ staggerDelay: 120 });

  return (
    <section id="features" className="bg-landing-text py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-white/60">
          {t("subtitle")}
        </p>

        <div
          ref={revealRef}
          className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {/* Privacy modes — large card: 2 cols, horizontal layout on desktop */}
          <div className="scroll-reveal-scale flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md sm:col-span-2 lg:col-span-2 lg:row-span-2 lg:flex-row">
            {/* Left: text content */}
            <div className="flex flex-1 flex-col p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-landing-lavender/10">
                <Shield className="h-6 w-6 text-landing-lavender" />
              </div>
              <h3 className="text-xl font-semibold text-landing-text">
                {t("privacyTitle")}
              </h3>
              <p className="mt-2 text-landing-text-muted">
                {t("privacyDescription")}
              </p>

              {/* Privacy modes list */}
              <ul className="mt-5 space-y-3">
                {[
                  { key: "privacyBuyersChoice", descKey: "privacyBuyersChoiceDesc", icon: HelpCircle, color: "text-landing-coral", bg: "bg-landing-coral/10" },
                  { key: "privacyVisible", descKey: "privacyVisibleDesc", icon: Eye, color: "text-landing-mint", bg: "bg-landing-mint/10" },
                  { key: "privacyFullSurprise", descKey: "privacyFullSurpriseDesc", icon: EyeOff, color: "text-landing-lavender", bg: "bg-landing-lavender/10" },
                ].map((mode) => (
                  <li key={mode.key} className="flex items-start gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${mode.bg}`}>
                      <mode.icon className={`h-4 w-4 ${mode.color}`} />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-landing-text">{t(mode.key)}</span>
                      <p className="text-xs text-landing-text-muted">{t(mode.descKey)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: decorative illustration — 3 mode cards mockup */}
            <div className="flex items-center justify-center border-t border-landing-lavender/15 bg-gradient-to-br from-landing-peach-wash to-landing-lavender-wash px-6 py-6 lg:w-[280px] lg:shrink-0 lg:border-t-0 lg:border-l">
              <div className="flex gap-3 lg:flex-col">
                {/* Mini card: Buyer's Choice */}
                <div className="flex w-24 flex-col items-center rounded-xl border border-landing-coral/20 bg-white px-3 py-3 shadow-sm lg:w-full lg:flex-row lg:gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-landing-coral/10">
                    <HelpCircle className="h-4 w-4 text-landing-coral" />
                  </div>
                  <div className="mt-2 space-y-1 lg:mt-0">
                    <div className="h-1.5 w-12 rounded-full bg-landing-coral/20 lg:w-20" />
                    <div className="h-1 w-8 rounded-full bg-landing-text/5 lg:w-14" />
                  </div>
                </div>
                {/* Mini card: Visible — highlighted/active */}
                <div className="flex w-24 flex-col items-center rounded-xl border-2 border-landing-mint/40 bg-white px-3 py-3 shadow-md lg:w-full lg:flex-row lg:gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-landing-mint/15">
                    <Eye className="h-4 w-4 text-landing-mint" />
                  </div>
                  <div className="mt-2 space-y-1 lg:mt-0 lg:flex-1">
                    <div className="h-1.5 w-12 rounded-full bg-landing-mint/30 lg:w-20" />
                    <div className="h-4 w-14 rounded-full bg-landing-mint text-center text-[8px] leading-4 font-bold text-white lg:w-16">Active</div>
                  </div>
                </div>
                {/* Mini card: Full Surprise */}
                <div className="flex w-24 flex-col items-center rounded-xl border border-landing-lavender/20 bg-white px-3 py-3 shadow-sm lg:w-full lg:flex-row lg:gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-landing-lavender/10">
                    <EyeOff className="h-4 w-4 text-landing-lavender" />
                  </div>
                  <div className="mt-2 space-y-1 lg:mt-0">
                    <div className="h-1.5 w-12 rounded-full bg-landing-lavender/20 lg:w-20" />
                    <div className="h-1 w-8 rounded-full bg-landing-text/5 lg:w-14" />
                  </div>
                </div>
              </div>
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
              <svg width="140" height="160" viewBox="0 0 140 160" fill="none" aria-hidden="true">
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

          {/* Small cards */}
          <div className="scroll-reveal-scale flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-landing-mint/10">
              <Link2 className="h-5 w-5 text-landing-mint" />
            </div>
            <div>
              <h3 className="font-semibold text-landing-text">{t("importTitle")}</h3>
              <p className="mt-1 text-sm text-landing-text-muted">{t("importDescription")}</p>
            </div>
          </div>

          <div className="scroll-reveal-scale flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-landing-coral/10">
              <UserX className="h-5 w-5 text-landing-coral" />
            </div>
            <div>
              <h3 className="font-semibold text-landing-text">{t("noAccountTitle")}</h3>
              <p className="mt-1 text-sm text-landing-text-muted">{t("noAccountDescription")}</p>
            </div>
          </div>

          <div className="scroll-reveal-scale flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-landing-lavender/10">
              <Clock className="h-5 w-5 text-landing-lavender" />
            </div>
            <div>
              <h3 className="font-semibold text-landing-text">{t("countdownTitle")}</h3>
              <p className="mt-1 text-sm text-landing-text-muted">{t("countdownDescription")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
