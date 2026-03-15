import { useTranslations } from "next-intl";
import { Gift } from "lucide-react";
import { AuthorCredit } from "@/components/author-credit";

const FOOTER_LINKS = [
  { id: "how-it-works", key: "howItWorks" },
  { id: "features", key: "features" },
  { id: "faq", key: "faq" },
] as const;

export function Footer() {
  const t = useTranslations("landing");

  return (
    <footer className="bg-landing-footer-bg py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Logo + tagline */}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <Gift className="h-5 w-5 text-landing-coral" />
              <span className="text-lg font-bold text-landing-footer-text">
                Podaruj.me
              </span>
            </div>
            <p className="mt-2 text-sm text-landing-footer-text/60">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-8">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="py-2 text-sm text-landing-footer-text/60 transition-colors hover:text-landing-footer-text"
              >
                {t(`nav.${link.key}`)}
              </a>
            ))}
          </div>

          {/* Made with love */}
          <div className="text-center sm:text-right">
            <p className="text-sm text-landing-footer-text/60">
              {t("footer.madeWith")}
            </p>
            <p className="mt-1 text-sm text-landing-footer-text/60">
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-landing-footer-text/10 pt-6 text-landing-footer-text/40">
          <AuthorCredit label={t("footer.builtBy")} />
        </div>
      </div>
    </footer>
  );
}
