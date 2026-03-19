"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { LANDING_MAX_WIDTH } from "@/lib/layout";

const TRUST_BADGES = ["trustFree", "trustGuests", "trustSetup"] as const;

export function CtaSection({ userEmail }: { userEmail?: string }) {
  const t = useTranslations("landing.cta");
  const revealRef = useScrollReveal<HTMLDivElement>({});

  return (
    <section
      id="cta"
      className="relative overflow-hidden py-24 sm:py-32"
      style={{
        background: [
          "radial-gradient(ellipse at 50% 0%, rgba(249,112,102,0.15) 0%, transparent 60%)",
          "radial-gradient(ellipse at 20% 80%, rgba(167,139,250,0.08) 0%, transparent 50%)",
          "radial-gradient(ellipse at 80% 80%, rgba(110,231,183,0.08) 0%, transparent 50%)",
          "#131015",
        ].join(", "),
      }}
    >
      <div
        className="mx-auto px-4 text-center sm:px-6 lg:px-8"
        style={{ maxWidth: LANDING_MAX_WIDTH }}
        ref={revealRef}
      >
        <h2 className="scroll-reveal text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          {t("titleTop")}
          <br />
          <span className="bg-gradient-to-r from-landing-coral to-amber-400 bg-clip-text text-transparent">
            {t("titleBottom")}
          </span>
        </h2>
        <p className="scroll-reveal mx-auto mt-5 max-w-xl text-lg text-white/50">
          {t("subtitle")}
        </p>
        <div className="scroll-reveal mt-10">
          <Link
            href={userEmail ? "/dashboard" : "/auth/sign-in"}
            className="inline-block rounded-xl px-12 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
            style={{
              background: "linear-gradient(to right, #C9403A, #B87308)",
              boxShadow: "0 0 40px rgba(249,112,102,0.3), 0 0 80px rgba(245,158,11,0.15)",
            }}
          >
            {t("button")}
          </Link>
        </div>
        {/* Trust badges */}
        <div className="scroll-reveal mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {TRUST_BADGES.map((key) => (
            <div
              key={key}
              className="flex items-center gap-1.5 text-sm text-white/40"
            >
              <span className="text-emerald-400">✓</span>
              {t(key)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
