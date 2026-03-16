import { Link } from "@/i18n/navigation";
import { Gift, LayoutDashboard } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { AuthorCredit } from "@/components/author-credit";

export default async function PublicListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("public");

  let isAuthenticated = false;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    isAuthenticated = !!user;
  } catch {
    // Not authenticated
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-landing-cream via-landing-cream to-landing-peach-wash/30">
      <header className="border-b border-landing-text/5 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full items-center justify-between px-4 py-4" style={{ maxWidth: "1024px" }}>
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-landing-text"
          >
            <Gift className="h-6 w-6 text-landing-coral" />
            <span>Podaruj.me</span>
          </Link>
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full bg-landing-text/[0.04] px-3.5 py-1.5 text-sm font-medium text-landing-text-muted transition-colors hover:bg-landing-text/[0.08] hover:text-landing-text"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              {t("dashboardButton")}
            </Link>
          )}
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-16 border-t border-landing-text/5 bg-white/40">
        <div className="mx-auto w-full px-4 py-8 text-center" style={{ maxWidth: "1024px" }}>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-landing-text-muted transition-colors hover:text-landing-coral"
          >
            <Gift className="h-3.5 w-3.5" />
            {t("poweredBy")}
          </Link>
          <div className="mt-4 text-landing-text-muted/50">
            <AuthorCredit label={t("builtBy")} />
          </div>
        </div>
      </footer>
    </div>
  );
}
