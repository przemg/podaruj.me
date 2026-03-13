"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Gift, Menu, X } from "lucide-react";

const NAV_SECTIONS = [
  { id: "how-it-works", key: "howItWorks" },
  { id: "features", key: "features" },
  { id: "testimonials", key: "testimonials" },
  { id: "faq", key: "faq" },
] as const;

export function Navigation({ locale }: { locale: string }) {
  const t = useTranslations("landing.nav");
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const otherLocale = locale === "en" ? "pl" : "en";

  return (
    <>
      <nav
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 shadow-md backdrop-blur-sm"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Left: Logo + Language Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollToSection("hero")}
              className="flex items-center gap-2 text-xl font-bold text-landing-text"
            >
              <Gift className="h-6 w-6 text-landing-coral" />
              <span>Podaruj.me</span>
            </button>
            <Link
              href={pathname}
              locale={otherLocale}
              className="rounded-full border border-landing-text/10 px-2.5 py-1 text-xs font-medium text-landing-text-muted transition-colors hover:bg-landing-peach-wash"
            >
              {otherLocale.toUpperCase()}
            </Link>
          </div>

          {/* Center: Section Links (desktop) */}
          <div className="hidden items-center gap-8 lg:flex">
            {NAV_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="text-sm font-medium text-landing-text-muted transition-colors hover:text-landing-coral"
              >
                {t(section.key)}
              </button>
            ))}
          </div>

          {/* Right: CTA (desktop) + Hamburger (mobile) */}
          <div className="flex items-center gap-3">
            <button className="hidden rounded-xl bg-landing-coral px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-landing-coral-hover hover:shadow-lg lg:block">
              {t("createList")}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-lg p-2 text-landing-text transition-colors hover:bg-landing-peach-wash lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-white"
          style={{ animation: "slide-in-overlay 0.3s ease-out" }}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex h-full flex-col px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xl font-bold text-landing-text">
                <Gift className="h-6 w-6 text-landing-coral" />
                <span>Podaruj.me</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg p-2 text-landing-text transition-colors hover:bg-landing-peach-wash"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-12 flex flex-1 flex-col gap-6">
              {NAV_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="text-left text-2xl font-medium text-landing-text transition-colors hover:text-landing-coral"
                >
                  {t(section.key)}
                </button>
              ))}
            </div>

            <div className="pb-8">
              <button className="w-full rounded-xl bg-landing-coral px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-landing-coral-hover">
                {t("createList")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
