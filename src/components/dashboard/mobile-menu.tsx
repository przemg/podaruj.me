"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { signOut } from "@/lib/supabase/auth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, List, Gift, LogOut, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard" as const, labelKey: "myLists" as const, icon: List },
  { href: "/dashboard/reservations" as const, labelKey: "myReservations" as const, icon: Gift },
];

export function MobileMenu({ email }: { email: string }) {
  const t = useTranslations("dashboard");
  const tNav = useTranslations("dashboard.nav");
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-landing-text-muted hover:bg-landing-peach-wash hover:text-landing-text"
            aria-label={t("mobile.menu")}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="flex w-72 flex-col bg-landing-cream">
          <SheetHeader className="border-b border-landing-text/5 pb-4">
            <SheetTitle className="flex items-center gap-2 text-sm font-normal text-landing-text-muted">
              <User className="h-4 w-4" />
              <span className="truncate">{email}</span>
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col gap-1 pt-4">
            {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "bg-landing-coral/10 text-landing-coral-dark"
                      : "text-landing-text-muted hover:bg-landing-peach-wash hover:text-landing-text"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tNav(labelKey)}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-landing-text/5 pt-4">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-landing-text-muted transition-all hover:bg-landing-peach-wash hover:text-landing-text"
            >
              <LogOut className="h-4 w-4" />
              {t("mobile.signOut")}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
