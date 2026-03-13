// src/app/[locale]/dashboard/page.tsx
import { getTranslations } from "next-intl/server";
import { Gift } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/auth/user-menu";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return { title: t("pageTitle") };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const t = await getTranslations("dashboard");

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
          {user?.email && <UserMenu email={user.email} />}
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-landing-text">
          {t("welcome")}
        </h1>
        {user?.email && (
          <p className="mt-2 text-landing-text-muted">{user.email}</p>
        )}
      </main>
    </div>
  );
}
