import { getTranslations } from "next-intl/server";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { ReservationCard, ReservationGroupHeader } from "@/components/dashboard/reservation-card";
import { getMyReservations } from "@/app/[locale]/lists/[slug]/reservation-actions";
import { getCountdown } from "@/lib/countdown";
import { Gift } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.reservations" });
  return { title: t("pageTitle") };
}

function formatCountdown(
  eventDate: string,
  t: Awaited<ReturnType<typeof getTranslations<"dashboard.myLists">>>
): string {
  const cd = getCountdown(eventDate);
  if (cd.type === "today") return t("today");
  if (cd.type === "past") return t("pastEvent");
  return t("daysLeft", { count: cd.days });
}

export default async function ReservationsPage() {
  const t = await getTranslations("dashboard.reservations");
  const tOccasions = await getTranslations("lists.occasions");
  const tMyLists = await getTranslations("dashboard.myLists");

  const reservations = await getMyReservations();

  if (reservations.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-bold text-landing-text">
          {t("title")}
        </h1>
        <DashboardEmptyState
          icon={Gift}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      </main>
    );
  }

  // Group reservations by list (listSlug as key)
  const groups = new Map<
    string,
    {
      listName: string;
      listSlug: string;
      listOccasion: string;
      listEventDate: string | null;
      items: typeof reservations;
    }
  >();

  for (const r of reservations) {
    const existing = groups.get(r.listSlug);
    if (existing) {
      existing.items.push(r);
    } else {
      groups.set(r.listSlug, {
        listName: r.listName,
        listSlug: r.listSlug,
        listOccasion: r.listOccasion,
        listEventDate: r.listEventDate,
        items: [r],
      });
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-landing-text">
        {t("title")}
      </h1>

      <div className="space-y-8">
        {Array.from(groups.values()).map((group, groupIndex) => (
          <div
            key={group.listSlug}
            style={{
              animation: `fade-in-up 0.4s ease-out ${groupIndex * 0.08}s both`,
            }}
          >
            <ReservationGroupHeader
              listName={group.listName}
              listSlug={group.listSlug}
              occasion={group.listOccasion}
              eventDate={group.listEventDate}
              tOccasion={tOccasions(group.listOccasion)}
              tCountdown={
                group.listEventDate
                  ? formatCountdown(group.listEventDate, tMyLists)
                  : null
              }
            />

            <div className="space-y-3">
              {group.items.map((reservation, itemIndex) => (
                <div
                  key={reservation.id}
                  style={{
                    animation: `fade-in-up 0.4s ease-out ${groupIndex * 0.08 + itemIndex * 0.05}s both`,
                  }}
                >
                  <ReservationCard reservation={reservation} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
