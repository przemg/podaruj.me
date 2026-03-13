// src/components/auth/user-menu.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";

export function UserMenu({ email }: { email: string }) {
  const t = useTranslations("auth.userMenu");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-landing-text/10 px-3 py-2 text-sm text-landing-text transition-colors hover:bg-landing-peach-wash"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <User className="h-4 w-4 opacity-60" />
        <span className="max-w-[150px] truncate">{email}</span>
        <ChevronDown
          className={`h-3 w-3 opacity-40 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-xl border border-landing-text/10 bg-white py-1 shadow-lg"
          role="menu"
        >
          <button
            onClick={() => {
              router.push("/dashboard");
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-landing-text-muted transition-colors hover:bg-landing-peach-wash hover:text-landing-text"
            role="menuitem"
          >
            <LayoutDashboard className="h-4 w-4" />
            {t("dashboard")}
          </button>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-landing-text-muted transition-colors hover:bg-landing-peach-wash hover:text-landing-text"
            role="menuitem"
          >
            <LogOut className="h-4 w-4" />
            {t("signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
