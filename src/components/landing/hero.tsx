"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Zap } from "lucide-react";
import { useRouter, Link } from "@/i18n/navigation";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { HeroIllustration } from "./hero-illustration";
import { LANDING_MAX_WIDTH } from "@/lib/layout";

const TRUST_BADGES = ["trustFree", "trustNoAccount", "trustMobile"] as const;

const AVATAR_STYLES = [
  { initials: "A", className: "bg-landing-coral text-white" },
  { initials: "K", className: "bg-landing-lavender text-white" },
  { initials: "M", className: "bg-emerald-400 text-emerald-950" },
  { initials: "J", className: "bg-amber-400 text-amber-950" },
  { initials: "P", className: "bg-sky-400 text-sky-950" },
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
      className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-20"
      style={{
        background: [
          "radial-gradient(ellipse at 0% 0%, rgba(249,112,102,0.25) 0%, transparent 55%)",
          "radial-gradient(ellipse at 100% 100%, rgba(110,231,183,0.18) 0%, transparent 55%)",
          "#131015",
        ].join(", "),
      }}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: LANDING_MAX_WIDTH }}>
        <div className="flex flex-col items-center gap-12 min-[850px]:flex-row min-[850px]:gap-16">
          {/* Text content */}
          <div className="flex-1 text-center min-[850px]:text-left" ref={revealRef}>
            {/* Badge pill */}
            <div className="scroll-reveal mb-6 inline-flex items-center gap-1.5 rounded-full border border-landing-coral/20 bg-landing-coral/10 px-4 py-1.5 text-sm font-medium text-landing-coral">
              <Zap className="h-3.5 w-3.5" />
              {t("badge")}
            </div>

            {/* Headline */}
            <h1 className="scroll-reveal text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("taglineTop")}
              <br />
              <span className="bg-gradient-to-r from-landing-coral to-landing-coral-light bg-clip-text text-transparent">{t("taglineBottom")}</span>
            </h1>

            <p className="scroll-reveal mt-6 text-lg leading-relaxed text-white/60 sm:text-xl">
              {t("subtitle")}
            </p>

            {/* Email input + CTA */}
            <div className="scroll-reveal mt-8">
              {userEmail ? (
                <Link
                  href="/dashboard"
                  className="inline-block rounded-xl bg-landing-coral/15 px-8 py-3.5 font-semibold text-landing-coral transition-all hover:bg-landing-coral/25 hover:shadow-md"
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
                      id="hero-email"
                      type="email"
                      aria-label="Email address"
                      aria-describedby={emailError ? "hero-email-error" : undefined}
                      aria-invalid={emailError}
                      value={heroEmail}
                      onChange={(e) => {
                        setHeroEmail(e.target.value);
                        if (emailError) setEmailError(false);
                      }}
                      placeholder={t("emailPlaceholder")}
                      className={`w-full rounded-xl border bg-white/10 px-5 py-3.5 text-white placeholder:text-white/30 focus:ring-2 focus:outline-none sm:rounded-r-none sm:flex-1 ${
                        emailError
                          ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                          : "border-white/10 focus:border-landing-coral focus:ring-landing-coral/20"
                      }`}
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-landing-coral px-8 py-3.5 font-semibold text-white transition-all hover:scale-105 hover:bg-landing-coral-dark hover:shadow-lg sm:rounded-l-none"
                    >
                      {t("getStarted")}
                    </button>
                  </form>
                  {emailError && (
                    <p id="hero-email-error" className="mt-2 text-sm text-red-400">{t("emailRequired")}</p>
                  )}
                </>
              )}
            </div>

            {/* Social proof */}
            <div className="scroll-reveal mt-8 flex flex-wrap items-center justify-center gap-3 min-[850px]:justify-start">
              <div className="flex -space-x-2">
                {AVATAR_STYLES.map((avatar) => (
                  <div
                    key={avatar.initials}
                    aria-hidden="true"
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ring-2 ring-[#151015] ${avatar.className}`}
                  >
                    {avatar.initials}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-0.5">
                <span
                  className="text-amber-400 leading-none"
                  aria-label="5 out of 5 stars"
                >
                  ★★★★★
                </span>
                <span className="text-sm text-white/50">
                  {t.rich("socialProof", {
                    count: "2,500",
                    bold: (chunks) => <span className="font-semibold text-white">{chunks}</span>,
                  })}
                </span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 min-[850px]:justify-start">
              {TRUST_BADGES.map((key) => (
                <div
                  key={key}
                  className="scroll-reveal flex items-center gap-1.5 text-sm text-white/70"
                >
                  <span className="text-emerald-400">✓</span>
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
