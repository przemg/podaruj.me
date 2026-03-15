import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ListForm } from "@/components/lists/list-form";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lists.edit" });
  return { title: t("pageTitle") };
}

export default async function EditListPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id: slug } = await params;
  const supabase = await createClient();

  const { data: list } = await supabase
    .from("lists")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!list) notFound();

  const t = await getTranslations("lists.edit");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href={`/dashboard/lists/${list.slug}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-landing-text-muted transition-colors hover:text-landing-text"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("title")}
        </Link>

        <h1 className="mb-2 text-2xl font-bold text-landing-text">
          {t("title")}
        </h1>
        <p className="mb-8 text-landing-text-muted">{t("subtitle")}</p>

        <ListForm
          mode="edit"
          locale={locale}
          listId={list.slug}
          defaultValues={{
            name: list.name,
            description: list.description ?? "",
            occasion: list.occasion,
            eventDate: list.event_date ?? "",
            eventTime: list.event_time ?? "",
            privacyMode: list.privacy_mode,
          }}
        />
    </div>
  );
}
