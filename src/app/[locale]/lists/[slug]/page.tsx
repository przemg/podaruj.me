import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";
import { getCountdown } from "@/lib/countdown";
import { PublicListHeader } from "@/components/public/public-list-header";
import { PublicGiftCard } from "@/components/public/public-gift-card";
import { OwnerBanner } from "@/components/public/owner-banner";
import { Gift, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";

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
            {/* Section divider */}
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-landing-coral/15 to-transparent" />
              <span className="flex items-center gap-1.5 text-xs font-medium text-landing-text-muted/60">
                <Gift className="h-3.5 w-3.5" />
                {items.length} {t("gifts").toLowerCase()}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-landing-coral/15 to-transparent" />
            </div>

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

            {/* CTA footer */}
            <div
              className="mt-12 text-center"
              style={{ animation: "fade-in-up 0.4s ease-out 0.5s both" }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-5 py-2.5 text-sm text-landing-text-muted shadow-sm ring-1 ring-landing-text/[0.06]">
                <Sparkles className="h-4 w-4 text-landing-coral/60" />
                <span>{t("createYourOwn")}</span>
                <Link
                  href="/"
                  className="font-semibold text-landing-coral transition-colors hover:text-landing-coral-dark"
                >
                  Podaruj.me
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="py-16 text-center"
            style={{ animation: "fade-in-up 0.4s ease-out" }}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-landing-text/[0.03]">
              <Gift className="h-8 w-8 text-landing-text-muted/30" />
            </div>
            <p className="text-landing-text-muted">{t("emptyList")}</p>
          </div>
        )}
      </div>
    </>
  );
}
