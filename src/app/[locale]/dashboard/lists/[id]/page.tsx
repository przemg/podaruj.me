import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
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

type ReservationBadge = {
  reserverName: string | null;
};

async function getReservationsForOwner(
  listId: string,
  privacyMode: string
): Promise<Record<string, ReservationBadge>> {
  // Full Surprise: owner sees nothing
  if (privacyMode === "full_surprise") return {};

  const supabase = createServiceClient();

  const { data: reservations } = await supabase
    .from("reservations")
    .select("item_id, user_id, guest_nickname, show_name")
    .eq("list_id", listId);

  if (!reservations || reservations.length === 0) return {};

  const map: Record<string, ReservationBadge> = {};

  for (const r of reservations) {
    let reserverName: string | null = null;

    if (privacyMode === "visible") {
      // Owner always sees names in visible mode
      reserverName = r.guest_nickname || null;
      if (r.user_id && !r.guest_nickname) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", r.user_id)
          .single();
        reserverName = profile?.display_name || null;
      }
    } else if (privacyMode === "buyers_choice" && r.show_name) {
      // Owner sees name only if reserver opted in
      reserverName = r.guest_nickname || null;
      if (r.user_id && !r.guest_nickname) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", r.user_id)
          .single();
        reserverName = profile?.display_name || null;
      }
    }

    map[r.item_id] = { reserverName };
  }

  return map;
}

export default async function ListDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id: slug } = await params;
  const supabase = await createClient();

  // Fetch list by slug (RLS ensures ownership)
  const { data: list } = await supabase
    .from("lists")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!list) notFound();

  // Fetch items ordered by position
  const { data: items } = await supabase
    .from("items")
    .select("*")
    .eq("list_id", list.id)
    .order("position", { ascending: true });

  // Fetch reservation info for this list (owner view)
  const reservations = await getReservationsForOwner(list.id, list.privacy_mode);

  // For Full Surprise: get reserved item IDs (without names) for delete warning only
  let reservedItemIds: string[] = [];
  if (list.privacy_mode === "full_surprise") {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("reservations")
      .select("item_id")
      .eq("list_id", list.id);
    reservedItemIds = data?.map((r: { item_id: string }) => r.item_id) ?? [];
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <ListHeader list={list} locale={locale} />
      <GiftList
        items={items ?? []}
        listId={list.id}
        listSlug={list.slug}
        locale={locale}
        reservations={reservations}
        privacyMode={list.privacy_mode}
        reservedItemIds={reservedItemIds}
      />
    </div>
  );
}
