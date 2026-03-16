import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { notFound } from "next/navigation";
import { isListClosed } from "@/lib/countdown";
import { DASHBOARD_MAX_WIDTH } from "@/lib/layout";
import { ListHeader } from "@/components/lists/list-header";
import { GiftList } from "@/components/lists/gift-list";
import { SummaryCard } from "@/components/lists/summary-card";
import { RevealButton } from "@/components/lists/reveal-button";

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

  // Summary data for closed lists
  const isClosed = isListClosed({ is_closed: list.is_closed, event_date: list.event_date, event_time: list.event_time });
  let summaryData: { totalItems: number; reservedCount: number; reservations: { itemName: string; reservedBy: string | null }[] } | null = null;

  if (isClosed) {
    const showSummary = list.privacy_mode !== "full_surprise" || list.surprise_revealed;

    if (showSummary) {
      const serviceClient = createServiceClient();
      const { data: summaryReservations } = await serviceClient
        .from("reservations")
        .select("item_id, user_id, guest_nickname, show_name")
        .eq("list_id", list.id);

      const itemList = items ?? [];
      const reservationItems: { itemName: string; reservedBy: string | null }[] = [];

      for (const r of summaryReservations ?? []) {
        const item = itemList.find((i: { id: string }) => i.id === r.item_id);
        let reserverName: string | null = null;

        if (list.privacy_mode === "visible" || list.privacy_mode === "full_surprise") {
          reserverName = r.guest_nickname || null;
          if (r.user_id && !r.guest_nickname) {
            const { data: profile } = await serviceClient
              .from("profiles")
              .select("display_name")
              .eq("id", r.user_id)
              .single();
            reserverName = profile?.display_name || null;
          }
        } else if (list.privacy_mode === "buyers_choice") {
          if (r.show_name) {
            reserverName = r.guest_nickname || null;
            if (r.user_id && !r.guest_nickname) {
              const { data: profile } = await serviceClient
                .from("profiles")
                .select("display_name")
                .eq("id", r.user_id)
                .single();
              reserverName = profile?.display_name || null;
            }
          }
        }

        reservationItems.push({
          itemName: item?.name ?? "Unknown",
          reservedBy: reserverName,
        });
      }

      summaryData = {
        totalItems: itemList.length,
        reservedCount: (summaryReservations ?? []).length,
        reservations: reservationItems,
      };
    }
  }

  return (
    <div className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8" style={{ maxWidth: DASHBOARD_MAX_WIDTH }}>
      <ListHeader list={list} locale={locale} />

      {isClosed && summaryData && (
        <div className="mb-8">
          <SummaryCard
            listId={list.id}
            listSlug={list.slug}
            closedAt={list.closed_at ?? list.event_date ?? ""}
            totalItems={summaryData.totalItems}
            reservedCount={summaryData.reservedCount}
            reservations={summaryData.reservations}
            confettiShown={list.confetti_shown ?? false}
            locale={locale}
          />
        </div>
      )}

      {isClosed && list.privacy_mode === "full_surprise" && !list.surprise_revealed && (
        <div className="mb-8 text-center">
          <RevealButton locale={locale} slug={list.slug} />
        </div>
      )}

      <GiftList
        items={items ?? []}
        listId={list.id}
        listSlug={list.slug}
        locale={locale}
        reservations={reservations}
        privacyMode={list.privacy_mode}
        reservedItemIds={reservedItemIds}
        isPublished={list.is_published}
        publishedAt={list.published_at}
        isClosed={isClosed}
      />
    </div>
  );
}
