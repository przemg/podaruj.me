"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

const TRUST_BADGES = ["trustFree", "trustGuests", "trustSetup"] as const;

export function CtaSection({ userEmail }: { userEmail?: string }) {
  const t = useTranslations("landing.cta");
  const revealRef = useScrollReveal<HTMLDivElement>({});

  return (
    <section id="cta" className="bg-gradient-to-br from-landing-peach-wash via-white to-landing-lavender-wash py-20 sm:py-28">
      <div
        className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8"
        ref={revealRef}
      >
        <h2 className="scroll-reveal text-3xl font-bold text-landing-text sm:text-4xl">
          {t("titleTop")}
          <br />
          <span className="text-landing-coral">{t("titleBottom")}</span>
        </h2>
        <p className="scroll-reveal mt-4 text-lg text-landing-text-muted">
          {t("subtitle")}
        </p>
        <div className="scroll-reveal mt-8">
          <Link
            href={userEmail ? "/dashboard" : "/auth/sign-in"}
            className="animate-pulse-soft inline-block rounded-xl bg-landing-coral-dark px-10 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:bg-landing-coral-hover hover:shadow-lg"
          >
            {t("button")}
          </Link>
        </div>
        {/* Trust badges */}
        <div className="scroll-reveal mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {TRUST_BADGES.map((key) => (
            <div
              key={key}
              className="flex items-center gap-1.5 text-sm text-landing-text-muted"
            >
              <Check className="h-3.5 w-3.5 text-landing-mint" strokeWidth={3} />
              {t(key)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
