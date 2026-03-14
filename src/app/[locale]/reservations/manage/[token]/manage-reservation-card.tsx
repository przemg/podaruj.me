"use client";

import { useState } from "react";
import { cancelGuestReservation } from "@/app/[locale]/lists/[slug]/reservation-actions";
import { useTranslations } from "next-intl";
import { CheckCircle, Clock, Gift, List, Tag, Trash2 } from "lucide-react";

type Props = {
  token: string;
  itemName: string;
  listName: string;
  status: string;
};

export default function ManageReservationCard({
  token,
  itemName,
  listName,
  status,
}: Props) {
  const t = useTranslations("reservations.manage");
  const [cancelled, setCancelled] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  async function handleCancel() {
    setCancelling(true);
    await cancelGuestReservation(token);
    setCancelling(false);
    setCancelled(true);
  }

  if (cancelled) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center shadow-sm">
        <div className="mb-4 flex justify-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <h1 className="mb-2 text-xl font-semibold text-landing-text">
          {t("cancelledTitle")}
        </h1>
        <p className="text-sm text-landing-text-muted">{t("cancelledMessage")}</p>
      </div>
    );
  }

  const isConfirmed = status === "confirmed";

  return (
    <div className="rounded-2xl border border-landing-text/10 bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-xl font-semibold text-landing-text">
        {t("title")}
      </h1>

      <dl className="mb-8 space-y-4">
        <div className="flex items-start gap-3">
          <Gift className="mt-0.5 h-4 w-4 shrink-0 text-landing-coral" />
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-landing-text-muted">
              {t("itemLabel")}
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-landing-text">
              {itemName}
            </dd>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <List className="mt-0.5 h-4 w-4 shrink-0 text-landing-coral" />
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-landing-text-muted">
              {t("listLabel")}
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-landing-text">
              {listName}
            </dd>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Tag className="mt-0.5 h-4 w-4 shrink-0 text-landing-coral" />
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-landing-text-muted">
              {t("statusLabel")}
            </dt>
            <dd className="mt-0.5">
              {isConfirmed ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  <CheckCircle className="h-3 w-3" />
                  {t("statusConfirmed")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  <Clock className="h-3 w-3" />
                  {t("statusPending")}
                </span>
              )}
            </dd>
          </div>
        </div>
      </dl>

      <button
        onClick={handleCancel}
        disabled={cancelling}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Trash2 className="h-4 w-4" />
        {cancelling ? t("cancelling") : t("cancelButton")}
      </button>
    </div>
  );
}
