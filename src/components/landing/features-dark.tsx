"use client";

import { useTranslations } from "next-intl";
import { Shield, QrCode, Mail, UserX, Clock, Eye, EyeOff, HelpCircle } from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { LANDING_MAX_WIDTH } from "@/lib/layout";

export function FeaturesDark() {
  const t = useTranslations("landing.features");
  const revealRef = useScrollReveal<HTMLDivElement>({ staggerDelay: 120 });

  return (
    <section
      id="features-dark"
      className="relative overflow-hidden py-20 sm:py-28"
      style={{
        background: [
          "radial-gradient(ellipse at 0% 0%, rgba(56,189,248,0.1) 0%, transparent 50%)",
          "radial-gradient(ellipse at 100% 100%, rgba(249,112,102,0.08) 0%, transparent 50%)",
          "#151015",
        ].join(", "),
      }}
    >

      <div className="relative mx-auto px-6 lg:px-8" style={{ maxWidth: LANDING_MAX_WIDTH }}>
        <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-sky-500">
          {t("label")}
        </p>
        <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
          {t("titleTop")}
          <br />
          <span className="bg-gradient-to-r from-sky-500 to-landing-lavender bg-clip-text text-transparent">
            {t("titleBottom")}
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-white/50">
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
            <div className="scroll-reveal-scale col-span-2 flex flex-row overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] from-10% to-landing-lavender/[0.08] backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-landing-lavender/20">
                  <Shield className="h-6 w-6 text-landing-lavender" />
                </div>
                <h3 className="text-xl font-semibold text-white">{t("privacyTitle")}</h3>
                <p className="mt-2 text-white/50">{t("privacyDescription")}</p>
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
              <div className="flex w-[280px] shrink-0 items-center justify-center border-l border-white/10 bg-white/[0.05] px-6">
                <div className="flex w-full flex-col gap-3">
                  <div className="flex w-full items-center gap-3 rounded-xl border border-landing-coral/30 bg-white/10 px-3 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-landing-coral/20"><HelpCircle className="h-4 w-4 text-landing-coral" /></div>
                    <div className="space-y-1"><div className="h-1.5 w-20 rounded-full bg-landing-coral/30" /><div className="h-1 w-14 rounded-full bg-white/10" /></div>
                  </div>
                  <div className="flex w-full items-center gap-3 rounded-xl border-2 border-landing-mint/50 bg-white/15 px-3 py-3 shadow-lg shadow-landing-mint/10">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-landing-mint/20"><Eye className="h-4 w-4 text-landing-mint" /></div>
                    <div className="flex-1 space-y-1"><div className="h-1.5 w-20 rounded-full bg-landing-mint/40" /><div className="h-4 w-16 rounded-full bg-landing-mint text-center text-[8px] leading-4 font-bold text-white">Active</div></div>
                  </div>
                  <div className="flex w-full items-center gap-3 rounded-xl border border-landing-lavender/30 bg-white/10 px-3 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-landing-lavender/20"><EyeOff className="h-4 w-4 text-landing-lavender" /></div>
                    <div className="space-y-1"><div className="h-1.5 w-20 rounded-full bg-landing-lavender/30" /><div className="h-1 w-14 rounded-full bg-white/10" /></div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR card */}
            <div className="scroll-reveal-scale flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] from-10% to-landing-coral/[0.08] p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-landing-coral/20"><QrCode className="h-6 w-6 text-landing-coral" /></div>
              <h3 className="text-xl font-semibold text-white">{t("qrTitle")}</h3>
              <p className="mt-2 text-white/50">{t("qrDescription")}</p>
              <div className="mt-auto flex items-end justify-center pt-6">
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

            {/* 3 small cards */}
            {[
              { titleKey: "emailShareTitle", descKey: "emailShareDescription", icon: Mail, color: "text-landing-mint", bg: "bg-landing-mint/20", gradient: "from-white/[0.07] from-10% to-landing-mint/[0.08]" },
              { titleKey: "noAccountTitle", descKey: "noAccountDescription", icon: UserX, color: "text-landing-coral", bg: "bg-landing-coral/20", gradient: "from-white via-white to-landing-peach-wash" },
              { titleKey: "countdownTitle", descKey: "countdownDescription", icon: Clock, color: "text-landing-lavender", bg: "bg-landing-lavender/20", gradient: "from-white via-white to-landing-lavender-wash" },
            ].map((card) => (
              <div key={card.titleKey} className={`scroll-reveal-scale flex items-start gap-4 rounded-2xl border border-white/10 bg-gradient-to-br ${card.gradient} p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.bg}`}><card.icon className={`h-5 w-5 ${card.color}`} /></div>
                <div><h3 className="font-semibold text-white">{t(card.titleKey)}</h3><p className="mt-1 text-sm text-white/40">{t(card.descKey)}</p></div>
              </div>
            ))}
          </div>

          {/* === TABLET LAYOUT (768-999px) === */}
          <div className="hidden min-[768px]:flex min-[768px]:flex-col min-[768px]:gap-4 min-[1000px]:hidden">
            {/* Row 1: Privacy card full width, 2-col internal */}
            <div className="scroll-reveal-scale flex flex-row overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] from-10% to-landing-lavender/[0.08] backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-landing-lavender/20"><Shield className="h-6 w-6 text-landing-lavender" /></div>
                <h3 className="text-xl font-semibold text-white">{t("privacyTitle")}</h3>
                <p className="mt-2 text-white/50">{t("privacyDescription")}</p>
                <ul className="mt-5 space-y-3">
                  {[
                    { key: "privacyBuyersChoice", descKey: "privacyBuyersChoiceDesc", icon: HelpCircle, color: "text-landing-coral", bg: "bg-landing-coral/20" },
                    { key: "privacyVisible", descKey: "privacyVisibleDesc", icon: Eye, color: "text-landing-mint", bg: "bg-landing-mint/20" },
                    { key: "privacyFullSurprise", descKey: "privacyFullSurpriseDesc", icon: EyeOff, color: "text-landing-lavender", bg: "bg-landing-lavender/20" },
                  ].map((mode) => (
                    <li key={mode.key} className="flex items-start gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${mode.bg}`}><mode.icon className={`h-4 w-4 ${mode.color}`} /></div>
                      <div><span className="text-sm font-semibold text-white">{t(mode.key)}</span><p className="text-xs text-white/40">{t(mode.descKey)}</p></div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-[240px] shrink-0 items-center justify-center border-l border-white/10 bg-white/[0.05] px-5">
                <div className="flex w-full flex-col gap-3">
                  <div className="flex w-full items-center gap-3 rounded-xl border border-landing-coral/30 bg-white/10 px-3 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-landing-coral/20"><HelpCircle className="h-4 w-4 text-landing-coral" /></div>
                    <div className="space-y-1"><div className="h-1.5 w-16 rounded-full bg-landing-coral/30" /><div className="h-1 w-10 rounded-full bg-white/10" /></div>
                  </div>
                  <div className="flex w-full items-center gap-3 rounded-xl border-2 border-landing-mint/50 bg-white/15 px-3 py-3 shadow-lg shadow-landing-mint/10">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-landing-mint/20"><Eye className="h-4 w-4 text-landing-mint" /></div>
                    <div className="flex-1 space-y-1"><div className="h-1.5 w-16 rounded-full bg-landing-mint/40" /><div className="h-4 w-14 rounded-full bg-landing-mint text-center text-[8px] leading-4 font-bold text-white">Active</div></div>
                  </div>
                  <div className="flex w-full items-center gap-3 rounded-xl border border-landing-lavender/30 bg-white/10 px-3 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-landing-lavender/20"><EyeOff className="h-4 w-4 text-landing-lavender" /></div>
                    <div className="space-y-1"><div className="h-1.5 w-16 rounded-full bg-landing-lavender/30" /><div className="h-1 w-10 rounded-full bg-white/10" /></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: QR left + 3 small cards stacked right */}
            <div className="grid grid-cols-2 gap-4">
              {/* QR card */}
              <div className="scroll-reveal-scale flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] from-10% to-landing-coral/[0.08] p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-landing-coral/20"><QrCode className="h-6 w-6 text-landing-coral" /></div>
                <h3 className="text-xl font-semibold text-white">{t("qrTitle")}</h3>
                <p className="mt-2 text-white/50">{t("qrDescription")}</p>
                <div className="mt-auto flex items-end justify-center pt-6">
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
              {/* 3 small cards stacked */}
              <div className="flex flex-col gap-4">
                {[
                  { titleKey: "emailShareTitle", descKey: "emailShareDescription", icon: Mail, color: "text-landing-mint", bg: "bg-landing-mint/20" },
                  { titleKey: "noAccountTitle", descKey: "noAccountDescription", icon: UserX, color: "text-landing-coral", bg: "bg-landing-coral/20" },
                  { titleKey: "countdownTitle", descKey: "countdownDescription", icon: Clock, color: "text-landing-lavender", bg: "bg-landing-lavender/20" },
                ].map((card) => (
                  <div key={card.titleKey} className="scroll-reveal-scale flex flex-1 items-start gap-4 rounded-2xl border border-gray-200/80 bg-white p-5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.bg}`}><card.icon className={`h-5 w-5 ${card.color}`} /></div>
                    <div><h3 className="font-semibold text-white">{t(card.titleKey)}</h3><p className="mt-1 text-sm text-white/40">{t(card.descKey)}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* === MOBILE LAYOUT (<768px) === */}
          <div className="flex flex-col gap-4 min-[768px]:hidden">
            {/* Privacy card — 2-col internal between 600-768px */}
            <div className="scroll-reveal-scale flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] from-10% to-landing-lavender/[0.08] backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 min-[600px]:flex-row">
              <div className="flex flex-col p-6 min-[600px]:flex-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-landing-lavender/20"><Shield className="h-6 w-6 text-landing-lavender" /></div>
                <h3 className="text-xl font-semibold text-white">{t("privacyTitle")}</h3>
                <p className="mt-2 text-white/50">{t("privacyDescription")}</p>
                <ul className="mt-5 space-y-3">
                  {[
                    { key: "privacyBuyersChoice", descKey: "privacyBuyersChoiceDesc", icon: HelpCircle, color: "text-landing-coral", bg: "bg-landing-coral/20" },
                    { key: "privacyVisible", descKey: "privacyVisibleDesc", icon: Eye, color: "text-landing-mint", bg: "bg-landing-mint/20" },
                    { key: "privacyFullSurprise", descKey: "privacyFullSurpriseDesc", icon: EyeOff, color: "text-landing-lavender", bg: "bg-landing-lavender/20" },
                  ].map((mode) => (
                    <li key={mode.key} className="flex items-start gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${mode.bg}`}><mode.icon className={`h-4 w-4 ${mode.color}`} /></div>
                      <div><span className="text-sm font-semibold text-white">{t(mode.key)}</span><p className="text-xs text-white/40">{t(mode.descKey)}</p></div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-center border-t border-white/10 bg-white/[0.05] px-8 py-6 min-[600px]:w-[200px] min-[600px]:shrink-0 min-[600px]:border-t-0 min-[600px]:border-l">
                <div className="flex gap-3 min-[600px]:flex-col">
                  <div className="flex flex-col items-center rounded-xl border border-landing-coral/30 bg-white/10 px-3 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-landing-coral/20"><HelpCircle className="h-4 w-4 text-landing-coral" /></div>
                    <div className="mt-2 space-y-1"><div className="h-1.5 w-12 rounded-full bg-landing-coral/30" /><div className="h-1 w-8 rounded-full bg-white/10" /></div>
                  </div>
                  <div className="flex flex-col items-center rounded-xl border-2 border-landing-mint/50 bg-white/15 px-3 py-3 shadow-lg shadow-landing-mint/10">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-landing-mint/20"><Eye className="h-4 w-4 text-landing-mint" /></div>
                    <div className="mt-2 space-y-1"><div className="h-1.5 w-12 rounded-full bg-landing-mint/40" /><div className="h-4 w-14 rounded-full bg-landing-mint text-center text-[8px] leading-4 font-bold text-white">Active</div></div>
                  </div>
                  <div className="flex flex-col items-center rounded-xl border border-landing-lavender/30 bg-white/10 px-3 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-landing-lavender/20"><EyeOff className="h-4 w-4 text-landing-lavender" /></div>
                    <div className="mt-2 space-y-1"><div className="h-1.5 w-12 rounded-full bg-landing-lavender/30" /><div className="h-1 w-8 rounded-full bg-white/10" /></div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR card — 2-col internal between 600-768px */}
            <div className="scroll-reveal-scale flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] from-10% to-landing-coral/[0.08] p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 min-[600px]:flex-row min-[600px]:items-center">
              <div className="min-[600px]:flex-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-landing-coral/20"><QrCode className="h-6 w-6 text-landing-coral" /></div>
                <h3 className="text-xl font-semibold text-white">{t("qrTitle")}</h3>
                <p className="mt-2 text-white/50">{t("qrDescription")}</p>
              </div>
              <div className="mt-6 flex items-center justify-center min-[600px]:mt-0 min-[600px]:ml-6">
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

            {/* 3 small cards */}
            {[
              { titleKey: "emailShareTitle", descKey: "emailShareDescription", icon: Mail, color: "text-landing-mint", bg: "bg-landing-mint/20", gradient: "from-white/[0.07] from-10% to-landing-mint/[0.08]" },
              { titleKey: "noAccountTitle", descKey: "noAccountDescription", icon: UserX, color: "text-landing-coral", bg: "bg-landing-coral/20", gradient: "from-white via-white to-landing-peach-wash" },
              { titleKey: "countdownTitle", descKey: "countdownDescription", icon: Clock, color: "text-landing-lavender", bg: "bg-landing-lavender/20", gradient: "from-white via-white to-landing-lavender-wash" },
            ].map((card) => (
              <div key={card.titleKey} className={`scroll-reveal-scale flex items-start gap-4 rounded-2xl border border-white/10 bg-gradient-to-br ${card.gradient} p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.bg}`}><card.icon className={`h-5 w-5 ${card.color}`} /></div>
                <div><h3 className="font-semibold text-white">{t(card.titleKey)}</h3><p className="mt-1 text-sm text-white/40">{t(card.descKey)}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
