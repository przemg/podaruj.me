import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ListCard } from "@/components/dashboard/list-card";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { Plus, ClipboardList } from "lucide-react";
import { getCountdown, isListClosed } from "@/lib/countdown";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return { title: t("pageTitle") };
}

function formatCountdown(eventDate: string, t: Awaited<ReturnType<typeof getTranslations>>) {
  const cd = getCountdown(eventDate);
  if (cd.type === "today") return t("today");
  if (cd.type === "past") return t("pastEvent");
  return t("daysLeft", { count: cd.days });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const t = await getTranslations("dashboard.myLists");
  const tOccasions = await getTranslations("lists.occasions");

  const { data: lists, error } = await supabase
    .from("lists")
    .select("id, slug, name, occasion, event_date, event_time, created_at, privacy_mode, is_published, is_closed, items(count)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch lists:", error);
  }

  const hasLists = lists && lists.length > 0;

  return (
    <main className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8" style={{ maxWidth: "1280px" }}>
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-landing-text">{t("title")}</h1>
        {hasLists && (
          <Button
            asChild
            className="hidden sm:inline-flex rounded-xl bg-landing-coral-dark px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-landing-coral-hover"
          >
            <Link href="/dashboard/lists/new">
              <Plus className="mr-1.5 h-4 w-4" />
              {t("createButton")}
            </Link>
          </Button>
        )}
      </div>

      {/* List grid or empty state */}
      {hasLists ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list, index) => {
            const itemCount =
              (list.items as unknown as { count: number }[])?.[0]?.count ?? 0;
            return (
              <div
                key={list.id}
                style={{
                  animation: `fade-in-up 0.4s ease-out ${index * 0.05}s both`,
                }}
              >
                <ListCard
                  slug={list.slug}
                  name={list.name}
                  occasion={list.occasion}
                  eventDate={list.event_date}
                  isDraft={list.privacy_mode === "full_surprise" && !list.is_published}
                  isClosed={isListClosed({ is_closed: list.is_closed, event_date: list.event_date, event_time: list.event_time })}
                  t={{
                    occasion: tOccasions(list.occasion),
                    itemCount: t("itemCount", { count: itemCount }),
                    countdown: list.event_date
                      ? formatCountdown(list.event_date, t)
                      : "",
                    draft: t("draft"),
                    closed: t("closed"),
                  }}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <DashboardEmptyState
          icon={ClipboardList}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          actionLabel={t("emptyAction")}
          actionHref="/dashboard/lists/new"
        />
      )}

      {/* Mobile FAB */}
      {hasLists && (
        <div className="fixed bottom-6 right-6 sm:hidden">
          <Button
            asChild
            className="h-14 w-14 rounded-full bg-landing-coral-dark p-0 shadow-lg hover:bg-landing-coral-hover"
          >
            <Link href="/dashboard/lists/new" aria-label={t("createButton")}>
              <Plus className="h-6 w-6 text-white" />
            </Link>
          </Button>
        </div>
      )}
    </main>
  );
}
