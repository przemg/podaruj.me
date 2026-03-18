import { Navigation } from "@/components/landing/navigation";
import { Hero } from "@/components/landing/hero";
import { DemoVideoSection } from "@/components/landing/demo-video-section";
import { Features } from "@/components/landing/features";
import { FeaturesDark } from "@/components/landing/features-dark";
import { FeaturesColored } from "@/components/landing/features-colored";
import { Testimonials } from "@/components/landing/testimonials";
import { Faq } from "@/components/landing/faq";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing.metadata" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: "Podaruj.me",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userEmail = user?.email;

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
    <>
      <Navigation locale={locale} userEmail={userEmail} displayName={displayName} />
      <main>
        <Hero userEmail={userEmail} />
        <DemoVideoSection locale={locale} />
        <FeaturesDark />
        <Features />
        <FeaturesColored />
        <Testimonials />
        <Faq />
        <CtaSection userEmail={userEmail} />
      </main>
      <Footer />
    </>
  );
}
