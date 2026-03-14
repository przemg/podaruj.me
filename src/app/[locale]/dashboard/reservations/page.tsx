import { getTranslations } from "next-intl/server";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
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

export default async function ReservationsPage() {
  const t = await getTranslations("dashboard.reservations");

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
