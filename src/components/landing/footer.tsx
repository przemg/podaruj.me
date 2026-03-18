"use client";

import { useTranslations } from "next-intl";
import { Gift, Heart } from "lucide-react";
import { AuthorCredit } from "@/components/author-credit";
import { LANDING_MAX_WIDTH } from "@/lib/layout";

const FOOTER_LINKS = [
  { id: "how-it-works", key: "howItWorks" },
  { id: "features", key: "features" },
  { id: "faq", key: "faq" },
] as const;

export function Footer() {
  const t = useTranslations("landing");

  return (
    <footer
      className="py-12 sm:py-16"
      style={{
        background: [
          "radial-gradient(ellipse at 0% 100%, rgba(249,112,102,0.08) 0%, transparent 50%)",
          "radial-gradient(ellipse at 100% 100%, rgba(110,231,183,0.06) 0%, transparent 50%)",
          "#151015",
        ].join(", "),
      }}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: LANDING_MAX_WIDTH }}>
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Logo + tagline */}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <Gift className="h-5 w-5 text-landing-coral" />
              <span className="text-lg font-bold text-white">
                Podaruj.me
              </span>
            </div>
            <p className="mt-2 text-sm text-white/40">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-8">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="py-2 text-sm text-white/50 transition-colors hover:text-white"
              >
                {t(`nav.${link.key}`)}
              </a>
            ))}
          </div>

          {/* Made with love */}
          <div className="text-center sm:text-right">
            <p className="flex items-center justify-center gap-1 text-sm text-white/40 sm:justify-end">
              {t.rich("footer.madeWith", {
                heart: () => <Heart className="inline h-3.5 w-3.5 fill-landing-coral text-landing-coral" />,
              })}
            </p>
            <p className="mt-1 text-sm text-white/40">
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-white/30">
          <AuthorCredit label={t("footer.builtBy")} />
        </div>
      </div>
    </footer>
  );
}
