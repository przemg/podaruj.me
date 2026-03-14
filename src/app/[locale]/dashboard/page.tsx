import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ListCard } from "@/components/dashboard/list-card";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { Plus, ClipboardList } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return { title: t("pageTitle") };
}

function getCountdown(eventDate: string, t: Awaited<ReturnType<typeof getTranslations>>) {
  const now = new Date();
  const nowUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const eventUtc = new Date(eventDate + "T00:00:00Z").getTime();
  const diffDays = Math.ceil((eventUtc - nowUtc) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return t("today");
  if (diffDays < 0) return t("pastEvent");
  return t("daysLeft", { count: diffDays });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const t = await getTranslations("dashboard.myLists");
  const tOccasions = await getTranslations("lists.occasions");

  const { data: lists, error } = await supabase
    .from("lists")
    .select("id, slug, name, occasion, event_date, created_at, items(count)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch lists:", error);
  }

  const hasLists = lists && lists.length > 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
                  t={{
                    occasion: tOccasions(list.occasion),
                    itemCount: t("itemCount", { count: itemCount }),
                    countdown: list.event_date
                      ? getCountdown(list.event_date, t)
                      : "",
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
