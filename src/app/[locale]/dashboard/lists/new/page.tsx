import { getTranslations } from "next-intl/server";
import { ListForm } from "@/components/lists/list-form";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lists.create" });
  return { title: t("pageTitle") };
}

export default async function CreateListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("lists.create");

  return (
    <div className="min-h-screen bg-gradient-to-br from-landing-cream via-landing-cream to-landing-peach-wash">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-landing-text-muted transition-colors hover:text-landing-text"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("title")}
        </Link>

        <h1 className="mb-2 text-2xl font-bold text-landing-text">
          {t("title")}
        </h1>
        <p className="mb-8 text-landing-text-muted">{t("subtitle")}</p>

        <ListForm mode="create" locale={locale} />
      </div>
    </div>
  );
}
