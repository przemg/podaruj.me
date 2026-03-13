import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ListHeader } from "@/components/lists/list-header";
import { GiftList } from "@/components/lists/gift-list";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lists.detail" });
  return { title: t("pageTitle") };
}

export default async function ListDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const supabase = await createClient();

  // Fetch list (RLS ensures ownership)
  const { data: list } = await supabase
    .from("lists")
    .select("*")
    .eq("id", id)
    .single();

  if (!list) notFound();

  // Fetch items ordered by position
  const { data: items } = await supabase
    .from("items")
    .select("*")
    .eq("list_id", id)
    .order("position", { ascending: true });

  return (
    <div className="min-h-screen bg-gradient-to-br from-landing-cream via-landing-cream to-landing-peach-wash">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ListHeader list={list} locale={locale} />
        <GiftList items={items ?? []} listId={id} locale={locale} />
      </div>
    </div>
  );
}
