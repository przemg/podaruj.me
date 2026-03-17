"use client";

import { useTranslations } from "next-intl";
import { ClipboardList, Share2, Gift } from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { LANDING_MAX_WIDTH } from "@/lib/layout";

const STEPS = [
  {
    key: "step1",
    icon: ClipboardList,
    iconClass: "bg-landing-coral/10 text-landing-coral",
    badgeClass: "bg-landing-coral text-white",
  },
  {
    key: "step2",
    icon: Share2,
    iconClass: "bg-landing-lavender/10 text-landing-lavender",
    badgeClass: "bg-landing-lavender text-white",
  },
  {
    key: "step3",
    icon: Gift,
    iconClass: "bg-landing-mint/10 text-landing-mint",
    badgeClass: "bg-landing-mint text-landing-text",
  },
] as const;

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");
  const revealRef = useScrollReveal<HTMLDivElement>({ staggerDelay: 200 });

  return (
    <section id="how-it-works" className="bg-white py-20 sm:py-28">
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: LANDING_MAX_WIDTH }}>
        {/* Section label */}
        <p className="mb-3 text-center text-sm font-semibold uppercase tracking-widest text-landing-coral">
          {t("label")}
        </p>
        <h2 className="text-center text-3xl font-bold text-landing-text sm:text-4xl">
          {t("titleTop")}
          <br />
          <span className="text-landing-coral">{t("titleBottom")}</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-landing-text-muted">
          {t("subtitle")}
        </p>

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3" ref={revealRef}>
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.key} className="scroll-reveal relative text-center">
                {/* Connecting solid line (desktop only, not on last item) */}
                {index < STEPS.length - 1 && (
                  <div className="absolute top-10 left-[calc(50%+40px)] hidden h-[2px] w-[calc(100%-80px)] border-t-2 border-landing-text/10 md:block" />
                )}

                {/* Icon box with number badge */}
                <div className="relative mb-5 inline-flex">
                  <div className={`flex h-20 w-20 items-center justify-center rounded-2xl ${step.iconClass}`}>
                    <Icon className="h-9 w-9" />
                  </div>
                  <div
                    aria-label={`Step ${index + 1}`}
                    className={`absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${step.badgeClass}`}
                  >
                    {index + 1}
                  </div>
                </div>

                {/* Text */}
                <h3 className="text-xl font-semibold text-landing-text">
                  {t(`${step.key}Title`)}
                </h3>
                <p className="mx-auto mt-3 max-w-xs text-landing-text-muted">
                  {t(`${step.key}Description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
