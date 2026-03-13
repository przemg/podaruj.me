import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Gift } from "lucide-react";
import { Link, redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignInForm } from "@/components/auth/sign-in-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.signIn" });
  return { title: t("pageTitle") };
}

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Redirect if already logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect({ href: "/dashboard", locale });
  }

  const t = await getTranslations({ locale, namespace: "auth.signIn" });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-landing-cream via-landing-cream to-landing-peach-wash px-4">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-2xl font-bold text-landing-text"
      >
        <Gift className="h-8 w-8 text-landing-coral" />
        <span>Podaruj.me</span>
      </Link>
      <h1 className="mb-2 text-3xl font-bold text-landing-text">
        {t("title")}
      </h1>
      <p className="mb-8 text-center text-landing-text-muted">
        {t("subtitle")}
      </p>
      <Suspense>
        <SignInForm locale={locale} />
      </Suspense>
    </div>
  );
}
