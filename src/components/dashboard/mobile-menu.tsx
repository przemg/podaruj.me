"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { signOut } from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  LogOut,
  User,
  List,
  Gift,
  Plus,
  Settings,
} from "lucide-react";

export function MobileMenu({
  email,
  displayName,
}: {
  email: string;
  displayName?: string | null;
}) {
  const t = useTranslations("dashboard.mobile");
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  async function handleSignOut() {
    setIsOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  }

  const navItems = [
    {
      href: "/dashboard" as const,
      label: t("myLists"),
      icon: List,
      isActive:
        pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/lists"),
    },
    {
      href: "/dashboard/reservations" as const,
      label: t("myReservations"),
      icon: Gift,
      isActive: pathname.startsWith("/dashboard/reservations"),
    },
  ];

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-landing-text-muted transition-colors hover:bg-landing-peach-wash hover:text-landing-text"
        aria-label={t("menu")}
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-white"
          style={{ animation: "slide-in-overlay 0.3s ease-out" }}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex h-full flex-col px-6 pt-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold text-landing-text"
                onClick={() => setIsOpen(false)}
              >
                <Gift className="h-6 w-6 text-landing-coral" />
                <span>Podaruj.me</span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-landing-text transition-colors hover:bg-landing-peach-wash"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* User info */}
            <div className="mt-6 flex items-center gap-3 rounded-xl bg-landing-peach-wash/50 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-landing-coral/10">
                <User className="h-4 w-4 text-landing-coral" />
              </div>
              <span className="truncate text-sm font-medium text-landing-text">
                {displayName || email}
              </span>
            </div>

            {/* Navigation */}
            <nav className="mt-8 flex flex-col gap-2">
              {navItems.map(({ href, label, icon: Icon, isActive }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition-all",
                    isActive
                      ? "bg-landing-coral/10 text-landing-coral-dark"
                      : "text-landing-text hover:bg-landing-peach-wash"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isActive
                        ? "text-landing-coral"
                        : "text-landing-text-muted"
                    )}
                  />
                  {label}
                </Link>
              ))}
              <div className="my-2 h-px bg-landing-text/5" />
              <Link
                href="/dashboard/lists/new"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-landing-coral-dark transition-all hover:bg-landing-peach-wash"
              >
                <Plus className="h-5 w-5 text-landing-coral" />
                {t("createList")}
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-landing-text hover:bg-landing-peach-wash"
              >
                <Settings className="h-5 w-5 text-landing-text-muted" />
                {t("settings")}
              </Link>
            </nav>

            {/* Sign out at bottom */}
            <div className="mt-auto pb-8">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-landing-text-muted transition-all hover:bg-landing-peach-wash hover:text-landing-text"
              >
                <LogOut className="h-5 w-5" />
                {t("signOut")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
