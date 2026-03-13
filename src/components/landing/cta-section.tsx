"use client";

import { useTranslations } from "next-intl";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

export function CtaSection() {
  const t = useTranslations("landing.cta");
  const revealRef = useScrollReveal<HTMLDivElement>();

  return (
    <section className="bg-gradient-to-br from-landing-peach-wash via-white to-landing-lavender-wash py-20 sm:py-28">
      <div
        className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8"
        ref={revealRef}
      >
        <h2 className="scroll-reveal text-3xl font-bold text-landing-text sm:text-4xl">
          {t("title")}
        </h2>
        <p className="scroll-reveal mt-4 text-lg text-landing-text-muted">
          {t("subtitle")}
        </p>
        <div className="scroll-reveal mt-8">
          <button className="animate-pulse-soft rounded-xl bg-landing-coral px-10 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:bg-landing-coral-hover hover:shadow-lg">
            {t("button")}
          </button>
        </div>
      </div>
    </section>
  );
}
