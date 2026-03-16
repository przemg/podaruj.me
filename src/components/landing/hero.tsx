"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { useRouter, Link } from "@/i18n/navigation";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { HeroIllustration } from "./hero-illustration";
import { LANDING_MAX_WIDTH } from "@/lib/layout";

const BADGE_KEYS = [
  "badgeFree",
  "badgeSecure",
  "badgeEasy",
  "badgeNoAccount",
] as const;

export function Hero({ userEmail }: { userEmail?: string }) {
  const t = useTranslations("landing.hero");
  const router = useRouter();
  const [heroEmail, setHeroEmail] = useState("");
  const revealRef = useScrollReveal<HTMLDivElement>({ staggerDelay: 80 });

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-br from-landing-cream via-landing-cream to-landing-peach-wash pt-24 pb-16 sm:pt-32 sm:pb-20"
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: LANDING_MAX_WIDTH }}>
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          {/* Text content */}
          <div className="flex-1 text-center lg:text-left" ref={revealRef}>
            <h1 className="scroll-reveal text-4xl font-bold tracking-tight text-landing-text sm:text-5xl lg:text-6xl">
              {t("tagline")}
            </h1>
            <p className="scroll-reveal mt-6 text-lg leading-relaxed text-landing-text-muted sm:text-xl">
              {t("subtitle")}
            </p>

            {/* Email input + CTA */}
            <div className="scroll-reveal mt-8">
              {userEmail ? (
                <Link
                  href="/dashboard"
                  className="inline-block rounded-xl bg-landing-peach-wash px-8 py-3.5 font-semibold text-landing-coral-dark transition-all hover:bg-landing-coral/10 hover:shadow-md"
                >
                  {t("goToDashboard")}
                </Link>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (heroEmail) {
                      router.push(
                        `/auth/sign-in?email=${encodeURIComponent(heroEmail)}`
                      );
                    }
                  }}
                  className="flex flex-col gap-3 sm:flex-row sm:gap-0"
                >
                  <input
                    type="email"
                    value={heroEmail}
                    onChange={(e) => setHeroEmail(e.target.value)}
                    placeholder={t("emailPlaceholder")}
                    className="w-full rounded-xl border border-landing-text/10 bg-white px-5 py-3.5 text-landing-text placeholder:text-landing-text-muted/50 focus:border-landing-coral focus:ring-2 focus:ring-landing-coral/20 focus:outline-none sm:rounded-r-none sm:flex-1"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-landing-coral-dark px-8 py-3.5 font-semibold text-white transition-all hover:scale-105 hover:bg-landing-coral-hover hover:shadow-lg sm:rounded-l-none"
                  >
                    {t("getStarted")}
                  </button>
                </form>
              )}
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 lg:justify-start">
              {BADGE_KEYS.map((key) => (
                <div
                  key={key}
                  className="scroll-reveal flex items-center gap-2 text-sm font-medium text-landing-text"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-landing-mint">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </div>
                  {t(key)}
                </div>
              ))}
            </div>
          </div>

          {/* Illustration */}
          <div className="flex-1">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
