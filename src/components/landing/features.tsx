"use client";

import { useTranslations } from "next-intl";
import { Shield, QrCode, Link2, UserX, Clock } from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

export function Features() {
  const t = useTranslations("landing.features");
  const revealRef = useScrollReveal<HTMLDivElement>({ staggerDelay: 120 });

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
