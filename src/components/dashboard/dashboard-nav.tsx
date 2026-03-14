"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

export function DashboardNav() {
  const t = useTranslations("dashboard.nav");
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-1">
      {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
        const isActive =
          href === "/dashboard"
            ? pathname === "/dashboard" || pathname.startsWith("/dashboard/lists")
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
              isActive
                ? "bg-landing-coral/8 text-landing-coral-dark"
                : "text-landing-text-muted hover:bg-landing-peach-wash/60 hover:text-landing-text"
            )}
          >
            <Icon className={cn("h-4 w-4", isActive && "text-landing-coral")} />
            {t(labelKey)}
            {isActive && (
              <span className="absolute -bottom-[9px] left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-landing-coral" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
