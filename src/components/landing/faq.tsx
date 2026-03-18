"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5"] as const;

export function Faq() {
  const t = useTranslations("landing.faq");
  const revealRef = useScrollReveal<HTMLDivElement>({ staggerDelay: 100 });

  return (
    <section id="faq" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-sky-500">
          {t("label")}
        </p>
        <h2 className="text-center text-3xl font-bold text-landing-text sm:text-4xl">
          {t("title")}
        </h2>

        <div className="mt-12" ref={revealRef}>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_KEYS.map((key) => (
              <AccordionItem
                key={key}
                value={key}
                className="scroll-reveal rounded-xl border-none bg-landing-cream px-6"
              >
                <AccordionTrigger className="py-5 text-left text-base font-semibold text-landing-text hover:no-underline">
                  {t(key)}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-landing-text-muted">
                  {t(key.replace("q", "a") as `a${string}`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
