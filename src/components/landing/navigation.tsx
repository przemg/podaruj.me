"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Gift, Menu, X, Globe, Check, ChevronDown } from "lucide-react";

const NAV_SECTIONS = [
  { id: "how-it-works", key: "howItWorks" },
  { id: "features", key: "features" },
  { id: "testimonials", key: "testimonials" },
  { id: "faq", key: "faq" },
] as const;

const LOCALES = [
  { code: "en", label: "English", short: "EN" },
  { code: "pl", label: "Polski", short: "PL" },
] as const;

export function Navigation({ locale }: { locale: string }) {
  const t = useTranslations("landing.nav");
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLocaleOpen, setIsLocaleOpen] = useState(false);
  const localeRef = useRef<HTMLDivElement>(null);

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
      if (e.key === "Escape") {
        if (isLocaleOpen) setIsLocaleOpen(false);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (localeRef.current && !localeRef.current.contains(e.target as Node)) {
        setIsLocaleOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen, isLocaleOpen]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const currentLocale = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <>
      <nav
        className={`safe-area-top fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 shadow-sm backdrop-blur-sm"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Left: Logo + Language Switcher */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-landing-text"
            >
              <Gift className="h-6 w-6 text-landing-coral" />
              <span>Podaruj.me</span>
            </Link>

            {/* Locale selector */}
            <div className="relative" ref={localeRef}>
              <button
                onClick={() => setIsLocaleOpen(!isLocaleOpen)}
                className="flex items-center gap-1 rounded-lg border border-landing-text/10 py-1.5 pr-1.5 pl-2.5 text-xs text-landing-text-muted transition-colors hover:border-landing-text/20 hover:bg-landing-peach-wash"
                aria-expanded={isLocaleOpen}
                aria-haspopup="listbox"
              >
                <Globe className="mr-1 h-3.5 w-3.5 opacity-50" />
                <span className="font-medium">{currentLocale.label}</span>
                <ChevronDown className={`h-3 w-3 opacity-40 transition-transform ${isLocaleOpen ? "rotate-180" : ""}`} />
              </button>
              {isLocaleOpen && (
                <div className="absolute top-full left-0 z-50 mt-1 min-w-[160px] overflow-hidden rounded-lg border border-landing-text/10 bg-white py-1 shadow-lg">
                  {LOCALES.map((l) => (
                    <Link
                      key={l.code}
                      href={pathname}
                      locale={l.code}
                      onClick={() => setIsLocaleOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-landing-peach-wash ${
                        l.code === locale
                          ? "font-medium text-landing-text"
                          : "text-landing-text-muted"
                      }`}
                    >
                      <span className="flex h-5 w-5 items-center justify-center">
                        {l.code === locale && (
                          <Check className="h-3.5 w-3.5 text-landing-coral" />
                        )}
                      </span>
                      {l.label}
                      <span className="ml-auto text-xs opacity-40">{l.short}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Section Links + CTA (desktop) + Hamburger (mobile) */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-6 lg:flex">
              {NAV_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="py-2 text-sm font-medium text-landing-text-muted transition-colors hover:text-landing-coral"
                >
                  {t(section.key)}
                </button>
              ))}
            </div>
            <button className="hidden rounded-xl bg-landing-coral-dark px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-landing-coral-hover hover:shadow-lg lg:block lg:ml-4">
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
          className="safe-area-top fixed inset-0 z-50 bg-white"
          style={{ animation: "slide-in-overlay 0.3s ease-out" }}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex h-full flex-col px-6 pt-4">
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
              <button className="w-full rounded-xl bg-landing-coral-dark px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-landing-coral-hover">
                {t("createList")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
