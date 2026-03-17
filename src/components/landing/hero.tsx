"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Zap } from "lucide-react";
import { useRouter, Link } from "@/i18n/navigation";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { HeroIllustration } from "./hero-illustration";
import { LANDING_MAX_WIDTH } from "@/lib/layout";

const TRUST_BADGES = ["trustFree", "trustNoAccount", "trustMobile"] as const;

const AVATAR_STYLES = [
  { initials: "A", className: "bg-landing-coral text-white" },
  { initials: "K", className: "bg-landing-lavender text-white" },
  { initials: "M", className: "bg-landing-mint text-landing-text" },
  { initials: "P", className: "bg-landing-coral-dark text-white" },
] as const;

export function Hero({ userEmail }: { userEmail?: string }) {
  const t = useTranslations("landing.hero");
  const router = useRouter();
  const [heroEmail, setHeroEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const revealRef = useScrollReveal<HTMLDivElement>({ staggerDelay: 150 });

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-br from-landing-cream via-landing-cream to-landing-peach-wash pt-24 pb-16 sm:pt-32 sm:pb-20"
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: LANDING_MAX_WIDTH }}>
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          {/* Text content */}
          <div className="flex-1 text-center lg:text-left" ref={revealRef}>
            {/* Badge pill */}
            <div className="scroll-reveal mb-6 inline-flex items-center gap-1.5 rounded-full border border-landing-coral/30 bg-landing-peach-wash px-4 py-1.5 text-sm font-medium text-landing-coral-dark">
              <Zap className="h-3.5 w-3.5" />
              {t("badge")}
            </div>

            {/* Headline */}
            <h1 className="scroll-reveal text-4xl font-bold tracking-tight text-landing-text sm:text-5xl lg:text-6xl">
              {t("taglineTop")}
              <br />
              <span className="text-landing-coral">{t("taglineBottom")}</span>
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
                <>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!heroEmail.trim()) {
                        setEmailError(true);
                        return;
                      }
                      setEmailError(false);
                      router.push(
                        `/auth/sign-in?email=${encodeURIComponent(heroEmail)}`
                      );
                    }}
                    className="flex flex-col gap-3 sm:flex-row sm:gap-0"
                  >
                    <input
                      type="email"
                      value={heroEmail}
                      onChange={(e) => {
                        setHeroEmail(e.target.value);
                        if (emailError) setEmailError(false);
                      }}
                      placeholder={t("emailPlaceholder")}
                      className={`w-full rounded-xl border bg-white px-5 py-3.5 text-landing-text placeholder:text-landing-text-muted/50 focus:ring-2 focus:outline-none sm:rounded-r-none sm:flex-1 ${
                        emailError
                          ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                          : "border-landing-text/10 focus:border-landing-coral focus:ring-landing-coral/20"
                      }`}
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-landing-coral-dark px-8 py-3.5 font-semibold text-white transition-all hover:scale-105 hover:bg-landing-coral-hover hover:shadow-lg sm:rounded-l-none"
                    >
                      {t("getStarted")}
                    </button>
                  </form>
                  {emailError && (
                    <p className="mt-2 text-sm text-red-500">{t("emailRequired")}</p>
                  )}
                </>
              )}
            </div>

            {/* Social proof */}
            <div className="scroll-reveal mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <div className="flex -space-x-2">
                {AVATAR_STYLES.map((avatar) => (
                  <div
                    key={avatar.initials}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ring-2 ring-white ${avatar.className}`}
                  >
                    {avatar.initials}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-amber-400"
                  aria-label="5 out of 5 stars"
                >
                  ★★★★★
                </span>
                <span className="text-sm text-landing-text-muted">
                  {t("socialProof", { count: "2,500" })}
                </span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 lg:justify-start">
              {TRUST_BADGES.map((key) => (
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

          {/* Product mockup */}
          <div className="flex-1">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
