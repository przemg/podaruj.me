"use client";

import { useTranslations } from "next-intl";
import { ClipboardList, Share2, Gift } from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

const STEPS = [
  { key: "step1", icon: ClipboardList, color: "bg-landing-coral/10 text-landing-coral" },
  { key: "step2", icon: Share2, color: "bg-landing-lavender/10 text-landing-lavender" },
  { key: "step3", icon: Gift, color: "bg-landing-mint/10 text-landing-mint" },
] as const;

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");
  const revealRef = useScrollReveal<HTMLDivElement>({ staggerDelay: 200 });

  return (
    <section id="how-it-works" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-landing-text sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-landing-text-muted">
          {t("subtitle")}
        </p>

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3" ref={revealRef}>
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.key} className="scroll-reveal relative text-center">
                {/* Connecting dashed line (desktop only, not on last item) */}
                {index < STEPS.length - 1 && (
                  <div className="absolute top-10 left-[calc(50%+40px)] hidden h-[2px] w-[calc(100%-80px)] border-t-2 border-dashed border-landing-text/10 md:block" />
                )}

                {/* Number badge */}
                <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-landing-peach-wash text-sm font-bold text-landing-coral">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl ${step.color}`}>
                  <Icon className="h-9 w-9" />
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
