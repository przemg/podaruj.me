import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/auth/user-menu";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { MobileMenu } from "@/components/dashboard/mobile-menu";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-landing-cream via-landing-cream to-landing-peach-wash">
      <header className="border-b border-landing-text/5 bg-white/80 backdrop-blur-sm">
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
                  <UserMenu email={user.email} />
                </div>
                <MobileMenu email={user.email} />
              </>
            )}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
