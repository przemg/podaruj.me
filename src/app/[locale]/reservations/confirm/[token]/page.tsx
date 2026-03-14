import { confirmGuestReservation } from "@/app/[locale]/lists/[slug]/reservation-actions";
import type { ConfirmStatus } from "@/app/[locale]/lists/[slug]/reservation-actions";
import { Link } from "@/i18n/navigation";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string; token: string }>;
};

export default async function ConfirmReservationPage({ params }: Props) {
  const { locale, token } = await params;
  const t = await getTranslations({ locale, namespace: "reservations.confirm" });

  const result = await confirmGuestReservation(token);
  const state: ConfirmStatus = result.confirmStatus ?? "not_found";

  const stateConfig = {
    confirmed: {
      icon: <CheckCircle className="h-12 w-12 text-green-500" />,
      title: t("successTitle"),
      message: t("successMessage"),
      bg: "bg-green-50",
      border: "border-green-200",
    },
    already_confirmed: {
      icon: <CheckCircle className="h-12 w-12 text-blue-400" />,
      title: t("alreadyConfirmedTitle"),
      message: t("alreadyConfirmedMessage"),
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    expired: {
      icon: <Clock className="h-12 w-12 text-amber-500" />,
      title: t("expiredTitle"),
      message: t("expiredMessage"),
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    not_found: {
      icon: <XCircle className="h-12 w-12 text-red-400" />,
      title: t("errorTitle"),
      message: t("errorMessage"),
      bg: "bg-red-50",
      border: "border-red-200",
    },
  } as const;

  const config = stateConfig[state];

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div
        className={`rounded-2xl border ${config.border} ${config.bg} p-8 text-center shadow-sm`}
      >
        <div className="mb-4 flex justify-center">{config.icon}</div>
        <h1 className="mb-2 text-xl font-semibold text-landing-text">
          {config.title}
        </h1>
        <p className="mb-6 text-sm text-landing-text-muted">{config.message}</p>
        {(state === "confirmed" || state === "already_confirmed") && (
          <Link
            href={`/reservations/manage/${token}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-landing-coral px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-landing-coral/90"
          >
            {t("manageLink")}
          </Link>
        )}
      </div>
    </div>
  );
}
