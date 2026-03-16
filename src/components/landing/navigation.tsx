"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Gift, Menu, X, Globe, Check, ChevronDown, User, LayoutList, Plus, LogOut } from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";
import { signOut } from "@/lib/supabase/auth";
import { LANDING_MAX_WIDTH } from "@/lib/layout";

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

export function Navigation({ locale, userEmail, displayName }: { locale: string; userEmail?: string; displayName?: string | null }) {
  const t = useTranslations("landing.nav");
  const tHero = useTranslations("landing.hero");
  const tAuth = useTranslations("auth.userMenu");
  const pathname = usePathname();
  const router = useRouter();
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
        <div className="mx-auto flex items-center justify-between px-4 py-5 sm:px-6 sm:py-6 lg:px-8" style={{ maxWidth: LANDING_MAX_WIDTH }}>
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
          <div className="flex items-center">
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
            {userEmail ? (
              <div className="hidden lg:block lg:ml-4">
                <UserMenu email={userEmail} displayName={displayName} />
              </div>
            ) : (
              <Link
                href="/auth/sign-in"
                className="hidden rounded-xl bg-landing-coral-dark px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-landing-coral-hover hover:shadow-lg lg:block lg:ml-4"
              >
                {t("createList")}
              </Link>
            )}
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
          <div className="flex min-h-dvh flex-col px-6 pt-4 pb-safe">
            {/* Header */}
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

            {/* User info card (logged in) */}
            {userEmail && (
              <div className="mt-6 flex items-center gap-3 rounded-xl bg-landing-peach-wash/50 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-landing-coral/10">
                  <User className="h-4 w-4 text-landing-coral" />
                </div>
                <span className="truncate text-sm font-medium text-landing-text">
                  {displayName || userEmail}
                </span>
              </div>
            )}

            {/* Quick actions (logged in) */}
            {userEmail && (
              <div className="mt-6 flex flex-col gap-2">
                <Link
                  href="/dashboard/lists/new"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-landing-coral-dark transition-all hover:bg-landing-peach-wash"
                >
                  <Plus className="h-5 w-5 text-landing-coral" />
                  {tAuth("createList")}
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-landing-text transition-all hover:bg-landing-peach-wash"
                >
                  <LayoutList className="h-5 w-5 text-landing-text-muted" />
                  {tHero("goToDashboard")}
                </Link>
                <div className="my-1 h-px bg-landing-text/5" />
              </div>
            )}

            {/* Section links */}
            <nav className={`flex flex-col gap-1 ${userEmail ? "mt-2" : "mt-10"}`}>
              {NAV_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="rounded-xl px-4 py-3 text-left text-lg font-medium text-landing-text transition-colors hover:bg-landing-peach-wash hover:text-landing-coral"
                >
                  {t(section.key)}
                </button>
              ))}
            </nav>

            {/* Bottom area */}
            <div className="mt-auto pb-8">
              {userEmail ? (
                <button
                  onClick={async () => {
                    setIsMobileMenuOpen(false);
                    await signOut();
                    router.push("/");
                    router.refresh();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-landing-text-muted transition-all hover:bg-landing-peach-wash hover:text-landing-text"
                >
                  <LogOut className="h-5 w-5" />
                  {tAuth("signOut")}
                </button>
              ) : (
                <Link
                  href="/auth/sign-in"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full rounded-xl bg-landing-coral-dark px-6 py-4 text-center text-lg font-semibold text-white transition-all hover:bg-landing-coral-hover"
                >
                  {t("createList")}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
