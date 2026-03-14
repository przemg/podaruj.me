import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileSettings } from "@/components/settings/profile-settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "settings" });
  return { title: t("pageTitle") };
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .single();

  // Check if Google identity is linked
  const googleIdentity = user.identities?.find(
    (identity) => identity.provider === "google"
  );
  const googleEmail = googleIdentity?.identity_data?.email as string | null ?? null;

  const t = await getTranslations("settings");

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-landing-text">{t("title")}</h1>
        <p className="mt-2 text-landing-text-muted">{t("subtitle")}</p>
      </div>
      <ProfileSettings
        profile={profile ?? { display_name: null, avatar_url: null }}
        email={user.email ?? ""}
        googleEmail={googleEmail}
      />
    </main>
  );
}
