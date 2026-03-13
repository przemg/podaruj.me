import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Gift, ArrowLeft } from "lucide-react";
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect({ href: "/dashboard", locale });
  }

  const t = await getTranslations({ locale, namespace: "auth.signIn" });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-landing-cream via-landing-peach-wash to-landing-lavender-wash px-4 py-12">
      {/* Decorative floating shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float absolute -top-20 -right-20 h-72 w-72 rounded-full bg-landing-coral/5 blur-3xl" />
        <div className="animate-float-slow absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-landing-lavender/8 blur-3xl" />
        <div className="animate-breathe absolute top-1/4 left-1/4 h-48 w-48 rounded-full bg-landing-mint/6 blur-2xl" />
        <div className="animate-float absolute bottom-1/4 right-1/3 h-36 w-36 rounded-full bg-landing-coral/4 blur-2xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back to home */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-landing-text-muted transition-colors hover:text-landing-coral-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToHome")}
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-white/60 bg-white/70 p-8 shadow-xl shadow-landing-text/[0.03] backdrop-blur-xl sm:p-10">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl font-bold text-landing-text transition-opacity hover:opacity-80"
            >
              <Gift className="h-7 w-7 text-landing-coral" />
              <span>Podaruj.me</span>
            </Link>
          </div>

          {/* Form (includes title, hides it on success) */}
          <Suspense>
            <SignInForm locale={locale} />
          </Suspense>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-landing-text-muted/60">
          {t("footerNote")}
        </p>
      </div>
    </div>
  );
}
