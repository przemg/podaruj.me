import { createServiceClient } from "@/lib/supabase/service";
import { getTranslations } from "next-intl/server";
import { XCircle } from "lucide-react";
import ManageReservationCard from "./manage-reservation-card";

type Props = {
  params: Promise<{ locale: string; token: string }>;
};

export default async function ManageReservationPage({ params }: Props) {
  const { locale, token } = await params;
  const t = await getTranslations({ locale, namespace: "reservations.manage" });

  const supabase = createServiceClient();
  const { data: reservation } = await supabase
    .from("reservations")
    .select(
      "id, guest_nickname, status, created_at, items!inner(name), lists!inner(name)"
    )
    .eq("guest_token", token)
    .single();

  if (!reservation) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <div className="mb-4 flex justify-center">
            <XCircle className="h-12 w-12 text-red-400" />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-landing-text">
            {t("notFoundTitle")}
          </h1>
          <p className="text-sm text-landing-text-muted">{t("notFoundMessage")}</p>
        </div>
      </div>
    );
  }

  const item = reservation.items as unknown as { name: string };
  const list = reservation.lists as unknown as { name: string };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <ManageReservationCard
        token={token}
        itemName={item.name}
        listName={list.name}
        status={reservation.status}
      />
    </div>
  );
}
