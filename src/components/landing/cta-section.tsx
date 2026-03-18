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
    <section id="cta" className="bg-white py-16 sm:py-20">
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: LANDING_MAX_WIDTH }}>
        <div
          className="relative overflow-hidden rounded-3xl px-8 py-20 text-center sm:px-16"
          style={{
            background: [
              "radial-gradient(ellipse at 5% 50%, rgba(249,112,102,0.3) 0%, transparent 55%)",
              "radial-gradient(ellipse at 95% 50%, rgba(56,189,248,0.15) 0%, transparent 55%)",
              "#151015",
            ].join(", "),
          }}
          ref={revealRef}
        >
          <h2 className="scroll-reveal text-3xl font-bold text-white sm:text-4xl">
            {t("titleTop")}
            <br />
            <span className="bg-gradient-to-r from-landing-coral to-amber-400 bg-clip-text text-transparent">
              {t("titleBottom")}
            </span>
          </h2>
          <p className="scroll-reveal mt-4 text-lg text-white/60">
            {t("subtitle")}
          </p>
          <div className="scroll-reveal mt-8">
            <Link
              href={userEmail ? "/dashboard" : "/auth/sign-in"}
              className="inline-block rounded-xl px-10 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
              style={{ background: "linear-gradient(to right, #F97066, #F59E0B)" }}
            >
              {t("button")}
            </Link>
          </div>
          {/* Trust badges */}
          <div className="scroll-reveal mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {TRUST_BADGES.map((key) => (
              <div
                key={key}
                className="flex items-center gap-1.5 text-sm text-white/50"
              >
                <span className="text-emerald-400">✓</span>
                {t(key)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
