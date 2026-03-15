import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/auth/user-menu";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { MobileMenu } from "@/components/dashboard/mobile-menu";
import { AuthorCredit } from "@/components/author-credit";
import { Gift } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    displayName = profile?.display_name
      ?? user.user_metadata?.full_name
      ?? user.user_metadata?.name
      ?? null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-landing-cream via-landing-cream to-landing-peach-wash">
      <header className="relative z-20 border-b border-landing-text/5 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-landing-text"
          >
            <Gift className="h-6 w-6 text-landing-coral" />
            <span>Podaruj.me</span>
          </Link>
          <div className="flex items-center gap-3">
            <DashboardNav />
            {user?.email && (
              <>
                <div className="hidden md:block">
                  <UserMenu email={user.email} displayName={displayName} />
                </div>
                <MobileMenu email={user.email} displayName={displayName} />
              </>
            )}
          </div>
        </div>
      </header>
      {children}
      <footer className="mt-auto border-t border-landing-text/5 bg-white/30 py-4">
        <div className="mx-auto max-w-7xl px-4 text-landing-text-muted/50 sm:px-6 lg:px-8">
          <AuthorCredit />
        </div>
      </footer>
    </div>
  );
}
