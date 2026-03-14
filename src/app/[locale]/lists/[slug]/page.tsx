import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";
import { getCountdown } from "@/lib/countdown";
import { PublicListHeader } from "@/components/public/public-list-header";
import { PublicGiftCard } from "@/components/public/public-gift-card";
import { OwnerBanner } from "@/components/public/owner-banner";
import { Gift } from "lucide-react";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

async function getListBySlug(slug: string) {
  const supabase = createServiceClient();

  // user_id is fetched for server-side owner check only — never sent to the client
  const { data: list } = await supabase
    .from("lists")
    .select("id, slug, name, description, occasion, event_date, privacy_mode, user_id")
    .eq("slug", slug)
    .single();

  if (!list) return null;

  const { data: items } = await supabase
    .from("items")
    .select("id, name, description, url, price, image_url, priority, position")
    .eq("list_id", list.id)
    .order("position", { ascending: true });

  return { list, items: items ?? [] };
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "public" });

  const data = await getListBySlug(slug);
  if (!data) {
    return { title: t("listNotFound") };
  }

  const title = t("pageTitle", { name: data.list.name });
  const description = data.list.description || t("defaultDescription");

  return {
    title,
    description,
    openGraph: {
      title: data.list.name,
      description,
      url: `/${locale}/lists/${slug}`,
      type: "website",
    },
  };
}

export default async function PublicListPage({ params }: PageProps) {
  const { locale, slug } = await params;

  const data = await getListBySlug(slug);
  if (!data) notFound();

  const { list, items } = data;

  // Check if the current user is the list owner (server-side only)
  let isOwner = false;
  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();
    if (user && user.id === list.user_id) {
      isOwner = true;
    }
  } catch {
    // Not authenticated — that's fine, guest view
  }

  // Prepare translated strings for the header (server-side)
  const t = await getTranslations({ locale, namespace: "public" });
  const tOccasions = await getTranslations({ locale, namespace: "lists.occasions" });

  let countdownLabel: string | null = null;
  let countdownType: "days" | "today" | "past" | null = null;
  if (list.event_date) {
    const cd = getCountdown(list.event_date);
    countdownType = cd.type;
    countdownLabel =
      cd.type === "today"
        ? t("eventToday")
        : cd.type === "past"
          ? t("eventPassed")
          : t("eventCountdown", { count: cd.days });
  }

  return (
    <>
      {isOwner && <OwnerBanner listSlug={list.slug} />}

      <div className="mx-auto max-w-3xl px-4 py-8">
        <PublicListHeader
          name={list.name}
          description={list.description}
          occasionLabel={tOccasions(list.occasion)}
          occasionKey={list.occasion}
          countdownLabel={countdownLabel}
          countdownType={countdownType}
        />

        {items.length > 0 ? (
          <div>
            <h2 className="mb-4 text-center text-sm font-medium uppercase tracking-wider text-landing-text-muted">
              {t("gifts")} · {items.length}
            </h2>
            <div className="space-y-3">
              {items.map((item, index) => (
                <PublicGiftCard
                  key={item.id}
                  item={item}
                  locale={locale}
                  index={index}
                />
              ))}
            </div>
          </div>
        ) : (
          <div
            className="py-16 text-center"
            style={{ animation: "fade-in-up 0.4s ease-out" }}
          >
            <Gift className="mx-auto mb-3 h-12 w-12 text-landing-text-muted/30" />
            <p className="text-landing-text-muted">{t("emptyList")}</p>
          </div>
        )}
      </div>
    </>
  );
}
