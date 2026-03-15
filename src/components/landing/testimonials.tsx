"use client";

import { useTranslations } from "next-intl";
import { Quote } from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

const TESTIMONIALS = [
  { key: "t1", initials: "AK", color: "bg-landing-coral text-white" },
  { key: "t2", initials: "TR", color: "bg-landing-lavender text-white" },
  { key: "t3", initials: "MW", color: "bg-landing-mint text-white" },
  { key: "t4", initials: "KP", color: "bg-landing-coral text-white" },
  { key: "t5", initials: "MD", color: "bg-landing-lavender text-white" },
] as const;

export function Testimonials() {
  const t = useTranslations("landing.testimonials");
  const leftRef = useScrollReveal<HTMLDivElement>();
  const rightRef = useScrollReveal<HTMLDivElement>({ staggerDelay: 120 });

  return (
    <section id="testimonials" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* Left column — sticky on desktop */}
          <div className="lg:sticky lg:top-28 lg:w-2/5 lg:self-start lg:py-8" ref={leftRef}>
            <h2 className="scroll-reveal text-3xl font-bold text-landing-text sm:text-4xl">
              {t("title")}
            </h2>
            <p className="scroll-reveal mt-4 text-lg text-landing-text-muted">
              {t("subtitle")}
            </p>
          </div>

          {/* Right column — cards */}
          <div className="flex flex-1 flex-col gap-4" ref={rightRef}>
            {TESTIMONIALS.map((item) => (
              <div
                key={item.key}
                className="scroll-reveal-right rounded-2xl bg-landing-cream p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <Quote className="mb-3 h-6 w-6 text-landing-lavender/40" />
                <p className="text-landing-text-muted leading-relaxed">
                  &ldquo;{t(`${item.key}Quote`)}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${item.color}`}
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
      </div>
    </section>
  );
}
