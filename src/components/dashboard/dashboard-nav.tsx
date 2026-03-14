"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { List, Gift } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard" as const, labelKey: "myLists" as const, icon: List },
  { href: "/dashboard/reservations" as const, labelKey: "myReservations" as const, icon: Gift },
];

export function DashboardNav() {
  const t = useTranslations("dashboard.nav");
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-1">
      {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
              isActive
                ? "bg-landing-coral/10 text-landing-coral-dark"
                : "text-landing-text-muted hover:bg-landing-peach-wash hover:text-landing-text"
            )}
          >
            <Icon className="h-4 w-4" />
            {t(labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
