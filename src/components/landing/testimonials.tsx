"use client";

import { useTranslations } from "next-intl";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { LANDING_MAX_WIDTH } from "@/lib/layout";

const TESTIMONIALS = [
  { key: "t1", initials: "KW", color: "bg-landing-coral text-white" },
  { key: "t2", initials: "MT", color: "bg-landing-lavender text-white" },
  { key: "t3", initials: "AB", color: "bg-emerald-400 text-emerald-950" },
  { key: "t4", initials: "PK", color: "bg-sky-400 text-sky-950" },
] as const;

export function Testimonials() {
  const t = useTranslations("landing.testimonials");
  const revealRef = useScrollReveal<HTMLDivElement>({ staggerDelay: 120 });

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden py-20 sm:py-28"
      style={{
        background: [
          "radial-gradient(ellipse at 100% 0%, rgba(110,231,183,0.1) 0%, transparent 50%)",
          "radial-gradient(ellipse at 0% 100%, rgba(249,112,102,0.08) 0%, transparent 50%)",
          "#151015",
        ].join(", "),
      }}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: LANDING_MAX_WIDTH }}>
        {/* Section header */}
        <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-emerald-400">
          {t("label")}
        </p>
        <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-white/50">
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
              className="scroll-reveal rounded-2xl border border-white/10 bg-white/[0.07] p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
            >
              {/* Stars */}
              <div aria-label="5 out of 5 stars">
                <span aria-hidden="true" className="mb-3 block text-xl text-amber-400">★★★★★</span>
              </div>
              {/* Quote */}
              <p className="leading-relaxed text-white/70">
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
                  <p className="font-semibold text-white">
                    {t(`${item.key}Name`)}
                  </p>
                  <p className="text-sm text-white/40">
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
