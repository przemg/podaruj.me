"use client";

import { useTranslations } from "next-intl";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { LANDING_MAX_WIDTH } from "@/lib/layout";

const TESTIMONIALS = [
  { key: "t1", initials: "KW", color: "bg-landing-coral text-white" },
  { key: "t2", initials: "MT", color: "bg-landing-lavender text-white" },
  { key: "t3", initials: "AB", color: "bg-landing-mint text-landing-text" },
  { key: "t4", initials: "PK", color: "bg-landing-coral text-white" },
] as const;

export function Testimonials() {
  const t = useTranslations("landing.testimonials");
  const revealRef = useScrollReveal<HTMLDivElement>({ staggerDelay: 120 });

  return (
    <section id="testimonials" className="bg-white py-20 sm:py-28">
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: LANDING_MAX_WIDTH }}>
        {/* Section header */}
        <p className="mb-3 text-center text-sm font-semibold uppercase tracking-widest text-landing-coral">
          {t("label")}
        </p>
        <h2 className="text-center text-3xl font-bold text-landing-text sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-landing-text-muted">
          {t("subtitle")}
        </p>

        {/* 2×2 card grid */}
        <div
          className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2"
          ref={revealRef}
        >
          {TESTIMONIALS.map((item) => (
            <div
              key={item.key}
              className="scroll-reveal rounded-2xl bg-landing-cream p-6 transition-shadow hover:shadow-md"
            >
              {/* Stars */}
              <div aria-label="5 out of 5 stars">
                <span aria-hidden="true" className="mb-3 block text-xl text-amber-400">★★★★★</span>
              </div>
              {/* Quote */}
              <p className="leading-relaxed text-landing-text-muted">
                &ldquo;{t(`${item.key}Quote`)}&rdquo;
              </p>
              {/* Author */}
              <div className="mt-4 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${item.color}`}
                >
                  {item.initials}
                </div>
                <div>
                  <p className="font-semibold text-landing-text">
                    {t(`${item.key}Name`)}
                  </p>
                  <p className="text-sm text-landing-text-muted">
                    {t(`${item.key}Occasion`)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
