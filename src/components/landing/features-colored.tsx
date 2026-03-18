"use client";

import { useTranslations } from "next-intl";
import { Shield, QrCode, Mail, UserX, Clock, Eye, EyeOff, HelpCircle } from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { LANDING_MAX_WIDTH } from "@/lib/layout";

export function FeaturesColored() {
  const t = useTranslations("landing.features");
  const revealRef = useScrollReveal<HTMLDivElement>({ staggerDelay: 120 });

  return (
    <section id="features-colored" className="bg-white py-20 sm:py-28">

      <div className="relative mx-auto px-6 lg:px-8" style={{ maxWidth: LANDING_MAX_WIDTH }}>
        <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-sky-500">
          {t("label")}
        </p>
        <h2 className="text-center text-3xl font-bold text-landing-text sm:text-4xl">
          {t("titleTop")}{" "}
          <span className="bg-gradient-to-r from-sky-500 to-landing-lavender bg-clip-text text-transparent">
            {t("titleBottom")}
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-landing-text-muted">
          {t("subtitle")}
        </p>

        <div ref={revealRef} className="mt-16">
          {/*
            Desktop (>=1000px): 3-col grid
              Row 1: Privacy(col-span-2) + QR
              Row 2: Email + NoAccount + Countdown

            Tablet (768-999px): stacked rows
              Row 1: Privacy full-width (2-col internal: text + illustration)
              Row 2: 2-col: QR left | 3 small cards stacked right

            Mobile (<768px): single column
          */}

          {/* === DESKTOP LAYOUT (>=1000px) === */}
          <div className="hidden min-[1000px]:grid min-[1000px]:grid-cols-3 min-[1000px]:gap-4">
            {/* Privacy — spans 2 cols, side-by-side */}
            <div className="scroll-reveal-scale col-span-2 flex flex-row overflow-hidden rounded-2xl border border-indigo-200/50 bg-gradient-to-br from-indigo-50 to-violet-100 shadow-md transition-all hover:shadow-xl hover:scale-[1.01]">
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-landing-lavender/20">
                  <Shield className="h-6 w-6 text-landing-lavender" />
                </div>
                <h3 className="text-xl font-semibold text-landing-text">{t("privacyTitle")}</h3>
                <p className="mt-2 text-landing-text-muted">{t("privacyDescription")}</p>
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
                        <span className="text-sm font-semibold text-landing-text">{t(mode.key)}</span>
                        <p className="text-xs text-landing-text-muted">{t(mode.descKey)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-[280px] shrink-0 items-center justify-center border-l border-indigo-200/30 bg-indigo-50/50 px-6">
                <div className="flex w-full flex-col gap-3">
                  <div className="flex w-full items-center gap-3 rounded-xl border border-landing-coral/20 bg-landing-coral/5 px-3 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-landing-coral/20"><HelpCircle className="h-4 w-4 text-landing-coral" /></div>
                    <div className="space-y-1"><div className="h-1.5 w-20 rounded-full bg-landing-coral/30" /><div className="h-1 w-14 rounded-full bg-gray-300" /></div>
                  </div>
                  <div className="flex w-full items-center gap-3 rounded-xl border-2 border-landing-mint/40 bg-landing-mint/5 px-3 py-3 shadow-lg shadow-landing-mint/10">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-landing-mint/20"><Eye className="h-4 w-4 text-landing-mint" /></div>
                    <div className="flex-1 space-y-1"><div className="h-1.5 w-20 rounded-full bg-landing-mint/40" /><div className="h-4 w-16 rounded-full bg-landing-mint text-center text-[8px] leading-4 font-bold text-white">Active</div></div>
                  </div>
                  <div className="flex w-full items-center gap-3 rounded-xl border border-landing-lavender/20 bg-landing-lavender/5 px-3 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-landing-lavender/20"><EyeOff className="h-4 w-4 text-landing-lavender" /></div>
                    <div className="space-y-1"><div className="h-1.5 w-20 rounded-full bg-landing-lavender/30" /><div className="h-1 w-14 rounded-full bg-gray-300" /></div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR card */}
            <div className="scroll-reveal-scale flex flex-col overflow-hidden rounded-2xl border border-rose-200/50 bg-gradient-to-br from-rose-50 to-orange-100 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-white/60 backdrop-blur-sm transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:scale-[1.01]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-landing-coral/20"><QrCode className="h-6 w-6 text-landing-coral" /></div>
              <h3 className="text-xl font-semibold text-landing-text">{t("qrTitle")}</h3>
              <p className="mt-2 text-landing-text-muted">{t("qrDescription")}</p>
              <div className="mt-auto flex items-end justify-center pt-6">
                <svg width="140" height="160" viewBox="0 0 140 160" fill="none" aria-hidden="true">
                  <rect x="20" y="0" width="100" height="160" rx="16" stroke="rgba(0,0,0,0.08)" strokeWidth="2" fill="rgba(0,0,0,0.02)" />
                  <rect x="55" y="6" width="30" height="4" rx="2" fill="rgba(0,0,0,0.05)" />
                  <rect x="40" y="35" width="60" height="60" rx="4" fill="rgba(167,139,250,0.1)" />
                  <rect x="46" y="41" width="16" height="16" rx="2" fill="#A78BFA" opacity="0.6" />
                  <rect x="78" y="41" width="16" height="16" rx="2" fill="#A78BFA" opacity="0.6" />
                  <rect x="46" y="73" width="16" height="16" rx="2" fill="#A78BFA" opacity="0.6" />
                  <rect x="66" y="61" width="8" height="8" rx="1" fill="#A78BFA" opacity="0.3" />
                  <rect x="78" y="73" width="8" height="8" rx="1" fill="#A78BFA" opacity="0.3" />
                  <rect x="66" y="73" width="8" height="8" rx="1" fill="#A78BFA" opacity="0.2" />
                  <rect x="35" y="110" width="70" height="3" rx="1.5" fill="#F97066" opacity="0.4" />
                  <rect x="45" y="125" width="50" height="6" rx="3" fill="rgba(0,0,0,0.05)" />
                  <rect x="55" y="135" width="30" height="4" rx="2" fill="rgba(0,0,0,0.03)" />
                </svg>
              </div>
            </div>

            {/* 3 small cards */}
            {[
              { titleKey: "emailShareTitle", descKey: "emailShareDescription", icon: Mail, color: "text-landing-mint", bg: "bg-landing-mint/20", gradient: "from-emerald-50 to-teal-100", borderColor: "border-emerald-200/50" },
              { titleKey: "noAccountTitle", descKey: "noAccountDescription", icon: UserX, color: "text-landing-coral", bg: "bg-landing-coral/20", gradient: "from-amber-50 to-orange-100", borderColor: "border-amber-200/50" },
              { titleKey: "countdownTitle", descKey: "countdownDescription", icon: Clock, color: "text-landing-lavender", bg: "bg-landing-lavender/20", gradient: "from-sky-50 to-indigo-100", borderColor: "border-sky-200/50" },
            ].map((card) => (
              <div key={card.titleKey} className={`scroll-reveal-scale flex items-start gap-4 rounded-2xl border ${card.borderColor} bg-gradient-to-br ${card.gradient} p-6 shadow-md transition-all hover:shadow-xl hover:scale-[1.01]`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.bg}`}><card.icon className={`h-5 w-5 ${card.color}`} /></div>
                <div><h3 className="font-semibold text-landing-text">{t(card.titleKey)}</h3><p className="mt-1 text-sm text-landing-text-muted">{t(card.descKey)}</p></div>
              </div>
            ))}
          </div>

          {/* === TABLET LAYOUT (768-999px) === */}
          <div className="hidden min-[768px]:flex min-[768px]:flex-col min-[768px]:gap-4 min-[1000px]:hidden">
            {/* Row 1: Privacy card full width, 2-col internal */}
            <div className="scroll-reveal-scale flex flex-row overflow-hidden rounded-2xl border border-indigo-200/50 bg-gradient-to-br from-indigo-50 to-violet-100 shadow-md transition-all hover:shadow-xl hover:scale-[1.01]">
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-landing-lavender/20"><Shield className="h-6 w-6 text-landing-lavender" /></div>
                <h3 className="text-xl font-semibold text-landing-text">{t("privacyTitle")}</h3>
                <p className="mt-2 text-landing-text-muted">{t("privacyDescription")}</p>
                <ul className="mt-5 space-y-3">
                  {[
                    { key: "privacyBuyersChoice", descKey: "privacyBuyersChoiceDesc", icon: HelpCircle, color: "text-landing-coral", bg: "bg-landing-coral/20" },
                    { key: "privacyVisible", descKey: "privacyVisibleDesc", icon: Eye, color: "text-landing-mint", bg: "bg-landing-mint/20" },
                    { key: "privacyFullSurprise", descKey: "privacyFullSurpriseDesc", icon: EyeOff, color: "text-landing-lavender", bg: "bg-landing-lavender/20" },
                  ].map((mode) => (
                    <li key={mode.key} className="flex items-start gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${mode.bg}`}><mode.icon className={`h-4 w-4 ${mode.color}`} /></div>
                      <div><span className="text-sm font-semibold text-landing-text">{t(mode.key)}</span><p className="text-xs text-landing-text-muted">{t(mode.descKey)}</p></div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-[240px] shrink-0 items-center justify-center border-l border-indigo-200/30 bg-indigo-50/50 px-5">
                <div className="flex w-full flex-col gap-3">
                  <div className="flex w-full items-center gap-3 rounded-xl border border-landing-coral/20 bg-landing-coral/5 px-3 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-landing-coral/20"><HelpCircle className="h-4 w-4 text-landing-coral" /></div>
                    <div className="space-y-1"><div className="h-1.5 w-16 rounded-full bg-landing-coral/30" /><div className="h-1 w-10 rounded-full bg-gray-300" /></div>
                  </div>
                  <div className="flex w-full items-center gap-3 rounded-xl border-2 border-landing-mint/40 bg-landing-mint/5 px-3 py-3 shadow-lg shadow-landing-mint/10">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-landing-mint/20"><Eye className="h-4 w-4 text-landing-mint" /></div>
                    <div className="flex-1 space-y-1"><div className="h-1.5 w-16 rounded-full bg-landing-mint/40" /><div className="h-4 w-14 rounded-full bg-landing-mint text-center text-[8px] leading-4 font-bold text-white">Active</div></div>
                  </div>
                  <div className="flex w-full items-center gap-3 rounded-xl border border-landing-lavender/20 bg-landing-lavender/5 px-3 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-landing-lavender/20"><EyeOff className="h-4 w-4 text-landing-lavender" /></div>
                    <div className="space-y-1"><div className="h-1.5 w-16 rounded-full bg-landing-lavender/30" /><div className="h-1 w-10 rounded-full bg-gray-300" /></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: QR left + 3 small cards stacked right */}
            <div className="grid grid-cols-2 gap-4">
              {/* QR card */}
              <div className="scroll-reveal-scale flex flex-col overflow-hidden rounded-2xl border border-rose-200/50 bg-gradient-to-br from-rose-50 to-orange-100 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-white/60 backdrop-blur-sm transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:scale-[1.01]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-landing-coral/20"><QrCode className="h-6 w-6 text-landing-coral" /></div>
                <h3 className="text-xl font-semibold text-landing-text">{t("qrTitle")}</h3>
                <p className="mt-2 text-landing-text-muted">{t("qrDescription")}</p>
                <div className="mt-auto flex items-end justify-center pt-6">
                  <svg width="140" height="160" viewBox="0 0 140 160" fill="none" aria-hidden="true">
                    <rect x="20" y="0" width="100" height="160" rx="16" stroke="rgba(0,0,0,0.08)" strokeWidth="2" fill="rgba(0,0,0,0.02)" />
                    <rect x="55" y="6" width="30" height="4" rx="2" fill="rgba(0,0,0,0.05)" />
                    <rect x="40" y="35" width="60" height="60" rx="4" fill="rgba(167,139,250,0.1)" />
                    <rect x="46" y="41" width="16" height="16" rx="2" fill="#A78BFA" opacity="0.6" />
                    <rect x="78" y="41" width="16" height="16" rx="2" fill="#A78BFA" opacity="0.6" />
                    <rect x="46" y="73" width="16" height="16" rx="2" fill="#A78BFA" opacity="0.6" />
                    <rect x="66" y="61" width="8" height="8" rx="1" fill="#A78BFA" opacity="0.3" />
                    <rect x="78" y="73" width="8" height="8" rx="1" fill="#A78BFA" opacity="0.3" />
                    <rect x="66" y="73" width="8" height="8" rx="1" fill="#A78BFA" opacity="0.2" />
                    <rect x="35" y="110" width="70" height="3" rx="1.5" fill="#F97066" opacity="0.4" />
                    <rect x="45" y="125" width="50" height="6" rx="3" fill="rgba(0,0,0,0.05)" />
                    <rect x="55" y="135" width="30" height="4" rx="2" fill="rgba(0,0,0,0.03)" />
                  </svg>
                </div>
              </div>
              {/* 3 small cards stacked */}
              <div className="flex flex-col gap-4">
                {[
                  { titleKey: "emailShareTitle", descKey: "emailShareDescription", icon: Mail, color: "text-landing-mint", bg: "bg-landing-mint/20" },
                  { titleKey: "noAccountTitle", descKey: "noAccountDescription", icon: UserX, color: "text-landing-coral", bg: "bg-landing-coral/20" },
                  { titleKey: "countdownTitle", descKey: "countdownDescription", icon: Clock, color: "text-landing-lavender", bg: "bg-landing-lavender/20" },
                ].map((card) => (
                  <div key={card.titleKey} className={`scroll-reveal-scale flex flex-1 items-start gap-4 rounded-2xl border ${card.borderColor || 'border-gray-200/50'} bg-gradient-to-br ${card.gradient || 'from-gray-50 to-gray-100'} p-5 shadow-md transition-all hover:shadow-xl hover:scale-[1.01]`}>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.bg}`}><card.icon className={`h-5 w-5 ${card.color}`} /></div>
                    <div><h3 className="font-semibold text-landing-text">{t(card.titleKey)}</h3><p className="mt-1 text-sm text-landing-text-muted">{t(card.descKey)}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* === MOBILE LAYOUT (<768px) === */}
          <div className="flex flex-col gap-4 min-[768px]:hidden">
            {/* Privacy card — 2-col internal between 600-768px */}
            <div className="scroll-reveal-scale flex flex-col overflow-hidden rounded-2xl border border-indigo-200/50 bg-gradient-to-br from-indigo-50 to-violet-100 shadow-md transition-all hover:shadow-xl hover:scale-[1.01] min-[600px]:flex-row">
              <div className="flex flex-col p-6 min-[600px]:flex-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-landing-lavender/20"><Shield className="h-6 w-6 text-landing-lavender" /></div>
                <h3 className="text-xl font-semibold text-landing-text">{t("privacyTitle")}</h3>
                <p className="mt-2 text-landing-text-muted">{t("privacyDescription")}</p>
                <ul className="mt-5 space-y-3">
                  {[
                    { key: "privacyBuyersChoice", descKey: "privacyBuyersChoiceDesc", icon: HelpCircle, color: "text-landing-coral", bg: "bg-landing-coral/20" },
                    { key: "privacyVisible", descKey: "privacyVisibleDesc", icon: Eye, color: "text-landing-mint", bg: "bg-landing-mint/20" },
                    { key: "privacyFullSurprise", descKey: "privacyFullSurpriseDesc", icon: EyeOff, color: "text-landing-lavender", bg: "bg-landing-lavender/20" },
                  ].map((mode) => (
                    <li key={mode.key} className="flex items-start gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${mode.bg}`}><mode.icon className={`h-4 w-4 ${mode.color}`} /></div>
                      <div><span className="text-sm font-semibold text-landing-text">{t(mode.key)}</span><p className="text-xs text-landing-text-muted">{t(mode.descKey)}</p></div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-center border-t border-indigo-200/30 bg-indigo-50/50 px-8 py-6 min-[600px]:w-[200px] min-[600px]:shrink-0 min-[600px]:border-t-0 min-[600px]:border-l">
                <div className="flex gap-3 min-[600px]:flex-col">
                  <div className="flex flex-col items-center rounded-xl border border-landing-coral/20 bg-landing-coral/5 px-3 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-landing-coral/20"><HelpCircle className="h-4 w-4 text-landing-coral" /></div>
                    <div className="mt-2 space-y-1"><div className="h-1.5 w-12 rounded-full bg-landing-coral/30" /><div className="h-1 w-8 rounded-full bg-gray-300" /></div>
                  </div>
                  <div className="flex flex-col items-center rounded-xl border-2 border-landing-mint/40 bg-landing-mint/5 px-3 py-3 shadow-lg shadow-landing-mint/10">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-landing-mint/20"><Eye className="h-4 w-4 text-landing-mint" /></div>
                    <div className="mt-2 space-y-1"><div className="h-1.5 w-12 rounded-full bg-landing-mint/40" /><div className="h-4 w-14 rounded-full bg-landing-mint text-center text-[8px] leading-4 font-bold text-white">Active</div></div>
                  </div>
                  <div className="flex flex-col items-center rounded-xl border border-landing-lavender/20 bg-landing-lavender/5 px-3 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-landing-lavender/20"><EyeOff className="h-4 w-4 text-landing-lavender" /></div>
                    <div className="mt-2 space-y-1"><div className="h-1.5 w-12 rounded-full bg-landing-lavender/30" /><div className="h-1 w-8 rounded-full bg-gray-300" /></div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR card — 2-col internal between 600-768px */}
            <div className="scroll-reveal-scale flex flex-col overflow-hidden rounded-2xl border border-rose-200/50 bg-gradient-to-br from-rose-50 to-orange-100 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-white/60 backdrop-blur-sm transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:scale-[1.01] min-[600px]:flex-row min-[600px]:items-center">
              <div className="min-[600px]:flex-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-landing-coral/20"><QrCode className="h-6 w-6 text-landing-coral" /></div>
                <h3 className="text-xl font-semibold text-landing-text">{t("qrTitle")}</h3>
                <p className="mt-2 text-landing-text-muted">{t("qrDescription")}</p>
              </div>
              <div className="mt-6 flex items-center justify-center min-[600px]:mt-0 min-[600px]:ml-6">
                <svg width="140" height="160" viewBox="0 0 140 160" fill="none" aria-hidden="true">
                  <rect x="20" y="0" width="100" height="160" rx="16" stroke="rgba(0,0,0,0.08)" strokeWidth="2" fill="rgba(0,0,0,0.02)" />
                  <rect x="55" y="6" width="30" height="4" rx="2" fill="rgba(0,0,0,0.05)" />
                  <rect x="40" y="35" width="60" height="60" rx="4" fill="rgba(167,139,250,0.1)" />
                  <rect x="46" y="41" width="16" height="16" rx="2" fill="#A78BFA" opacity="0.6" />
                  <rect x="78" y="41" width="16" height="16" rx="2" fill="#A78BFA" opacity="0.6" />
                  <rect x="46" y="73" width="16" height="16" rx="2" fill="#A78BFA" opacity="0.6" />
                  <rect x="66" y="61" width="8" height="8" rx="1" fill="#A78BFA" opacity="0.3" />
                  <rect x="78" y="73" width="8" height="8" rx="1" fill="#A78BFA" opacity="0.3" />
                  <rect x="66" y="73" width="8" height="8" rx="1" fill="#A78BFA" opacity="0.2" />
                  <rect x="35" y="110" width="70" height="3" rx="1.5" fill="#F97066" opacity="0.4" />
                  <rect x="45" y="125" width="50" height="6" rx="3" fill="rgba(0,0,0,0.05)" />
                  <rect x="55" y="135" width="30" height="4" rx="2" fill="rgba(0,0,0,0.03)" />
                </svg>
              </div>
            </div>

            {/* 3 small cards */}
            {[
              { titleKey: "emailShareTitle", descKey: "emailShareDescription", icon: Mail, color: "text-landing-mint", bg: "bg-landing-mint/20", gradient: "from-emerald-50 to-teal-100", borderColor: "border-emerald-200/50" },
              { titleKey: "noAccountTitle", descKey: "noAccountDescription", icon: UserX, color: "text-landing-coral", bg: "bg-landing-coral/20", gradient: "from-amber-50 to-orange-100", borderColor: "border-amber-200/50" },
              { titleKey: "countdownTitle", descKey: "countdownDescription", icon: Clock, color: "text-landing-lavender", bg: "bg-landing-lavender/20", gradient: "from-sky-50 to-indigo-100", borderColor: "border-sky-200/50" },
            ].map((card) => (
              <div key={card.titleKey} className={`scroll-reveal-scale flex items-start gap-4 rounded-2xl border ${card.borderColor} bg-gradient-to-br ${card.gradient} p-6 shadow-md transition-all hover:shadow-xl hover:scale-[1.01]`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.bg}`}><card.icon className={`h-5 w-5 ${card.color}`} /></div>
                <div><h3 className="font-semibold text-landing-text">{t(card.titleKey)}</h3><p className="mt-1 text-sm text-landing-text-muted">{t(card.descKey)}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
