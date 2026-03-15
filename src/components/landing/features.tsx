"use client";

import { useTranslations } from "next-intl";
import { Shield, QrCode, Mail, UserX, Clock, Eye, EyeOff, HelpCircle } from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

export function Features() {
  const t = useTranslations("landing.features");
  const revealRef = useScrollReveal<HTMLDivElement>({ staggerDelay: 120 });

  return (
    <section id="features" className="relative overflow-hidden bg-[#2D2545] py-20 sm:py-28">
      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-80 w-80 rounded-full bg-landing-lavender/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-72 w-72 rounded-full bg-landing-coral/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-white/50">
          {t("subtitle")}
        </p>

        {/*
          Desktop (>=900px): Row 1: Privacy + QR side by side / Row 2: 3 small cards
          Tablet  (sm-899):  Privacy full width / QR left + 3 cards stacked right
          Mobile  (<sm):     All stacked
        */}
        <div ref={revealRef} className="mt-16 space-y-4">

          {/* === Row 1: Privacy + QR === */}
          {/* Mobile: stacked. Tablet: stacked. Desktop: side by side */}
          <div className="flex flex-col gap-4 min-[900px]:flex-row">

            {/* Card 1: Privacy modes */}
            <div className="scroll-reveal-scale flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 min-[900px]:flex-[2] min-[900px]:flex-row">
              {/* Left: text content */}
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-landing-lavender/20">
                  <Shield className="h-6 w-6 text-landing-lavender" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {t("privacyTitle")}
                </h3>
                <p className="mt-2 text-white/50">
                  {t("privacyDescription")}
                </p>
                <ul className="mt-5 space-y-3">
                  {[
                    { key: "privacyBuyersChoice", descKey: "privacyBuyersChoiceDesc", icon: HelpCircle, color: "text-landing-coral", bg: "bg-landing-coral/20" },
                    { key: "privacyVisible", descKey: "privacyVisibleDesc", icon: Eye, color: "text-landing-mint", bg: "bg-landing-mint/20" },
                    { key: "privacyFullSurprise", descKey: "privacyFullSurpriseDesc", icon: EyeOff, color: "text-landing-lavender", bg: "bg-landing-lavender/20" },
                  ].map((mode) => (
                    <li key={mode.key} className="flex items-start gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${mode.bg}`}>
                        <mode.icon className={`h-4 w-4 ${mode.color}`} />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white">{t(mode.key)}</span>
                        <p className="text-xs text-white/40">{t(mode.descKey)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Right: illustration panel */}
              <div className="flex items-center justify-center border-t border-white/10 bg-white/[0.05] px-8 py-6 sm:px-6 min-[900px]:w-[280px] min-[900px]:shrink-0 min-[900px]:border-t-0 min-[900px]:border-l">
                <div className="flex w-full gap-3 min-[900px]:flex-col">
                  <div className="flex min-w-0 flex-1 flex-col items-center rounded-xl border border-landing-coral/30 bg-white/10 px-3 py-3 sm:w-24 sm:flex-none min-[900px]:w-full min-[900px]:flex-row min-[900px]:gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-landing-coral/20">
                      <HelpCircle className="h-4 w-4 text-landing-coral" />
                    </div>
                    <div className="mt-2 space-y-1 min-[900px]:mt-0">
                      <div className="h-1.5 w-12 rounded-full bg-landing-coral/30 min-[900px]:w-20" />
                      <div className="h-1 w-8 rounded-full bg-white/10 min-[900px]:w-14" />
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col items-center rounded-xl border-2 border-landing-mint/50 bg-white/15 px-3 py-3 shadow-lg shadow-landing-mint/10 sm:w-24 sm:flex-none min-[900px]:w-full min-[900px]:flex-row min-[900px]:gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-landing-mint/20">
                      <Eye className="h-4 w-4 text-landing-mint" />
                    </div>
                    <div className="mt-2 space-y-1 min-[900px]:mt-0 min-[900px]:flex-1">
                      <div className="h-1.5 w-12 rounded-full bg-landing-mint/40 min-[900px]:w-20" />
                      <div className="h-4 w-14 rounded-full bg-landing-mint text-center text-[8px] leading-4 font-bold text-white min-[900px]:w-16">Active</div>
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col items-center rounded-xl border border-landing-lavender/30 bg-white/10 px-3 py-3 sm:w-24 sm:flex-none min-[900px]:w-full min-[900px]:flex-row min-[900px]:gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-landing-lavender/20">
                      <EyeOff className="h-4 w-4 text-landing-lavender" />
                    </div>
                    <div className="mt-2 space-y-1 min-[900px]:mt-0">
                      <div className="h-1.5 w-12 rounded-full bg-landing-lavender/30 min-[900px]:w-20" />
                      <div className="h-1 w-8 rounded-full bg-white/10 min-[900px]:w-14" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: QR code */}
            <div className="scroll-reveal-scale flex flex-col min-[500px]:flex-row sm:flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 min-[900px]:flex-1">
              <div className="min-[500px]:flex-1 sm:flex-none">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-landing-coral/20">
                  <QrCode className="h-6 w-6 text-landing-coral" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {t("qrTitle")}
                </h3>
                <p className="mt-2 text-white/50">
                  {t("qrDescription")}
                </p>
              </div>
              <div className="mt-6 flex flex-1 items-center justify-center min-[500px]:mt-0 sm:mt-6 sm:items-end">
                <svg width="140" height="160" viewBox="0 0 140 160" fill="none" aria-hidden="true">
                  <rect x="20" y="0" width="100" height="160" rx="16" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="rgba(255,255,255,0.05)" />
                  <rect x="55" y="6" width="30" height="4" rx="2" fill="rgba(255,255,255,0.1)" />
                  <rect x="40" y="35" width="60" height="60" rx="4" fill="rgba(167,139,250,0.1)" />
                  <rect x="46" y="41" width="16" height="16" rx="2" fill="#A78BFA" opacity="0.6" />
                  <rect x="78" y="41" width="16" height="16" rx="2" fill="#A78BFA" opacity="0.6" />
                  <rect x="46" y="73" width="16" height="16" rx="2" fill="#A78BFA" opacity="0.6" />
                  <rect x="66" y="61" width="8" height="8" rx="1" fill="#A78BFA" opacity="0.3" />
                  <rect x="78" y="73" width="8" height="8" rx="1" fill="#A78BFA" opacity="0.3" />
                  <rect x="66" y="73" width="8" height="8" rx="1" fill="#A78BFA" opacity="0.2" />
                  <rect x="35" y="110" width="70" height="3" rx="1.5" fill="#F97066" opacity="0.4" />
                  <rect x="45" y="125" width="50" height="6" rx="3" fill="rgba(255,255,255,0.1)" />
                  <rect x="55" y="135" width="30" height="4" rx="2" fill="rgba(255,255,255,0.08)" />
                </svg>
              </div>
            </div>
          </div>

          {/* === Row 2: 3 small cards === */}
          {/* Mobile: stacked. Tablet: 2-col grid. Desktop: 3-col row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { titleKey: "emailShareTitle", descKey: "emailShareDescription", icon: Mail, color: "text-landing-mint", bg: "bg-landing-mint/20" },
              { titleKey: "noAccountTitle", descKey: "noAccountDescription", icon: UserX, color: "text-landing-coral", bg: "bg-landing-coral/20" },
              { titleKey: "countdownTitle", descKey: "countdownDescription", icon: Clock, color: "text-landing-lavender", bg: "bg-landing-lavender/20" },
            ].map((card) => (
              <div key={card.titleKey} className="scroll-reveal-scale flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.07] p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.bg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{t(card.titleKey)}</h3>
                  <p className="mt-1 text-sm text-white/40">{t(card.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
