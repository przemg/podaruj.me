"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ExternalLink, CalendarDays, Archive } from "lucide-react";
import { cancelReservation } from "@/app/[locale]/lists/[slug]/reservation-actions";
import type { MyReservation } from "@/app/[locale]/lists/[slug]/reservation-actions";

const PRIORITY_CONFIG: Record<
  string,
  { dot: string; text: string; accent: string; bg: string }
> = {
  nice_to_have: {
    dot: "bg-gray-300",
    text: "text-landing-text-muted",
    accent: "border-l-gray-200",
    bg: "bg-white/70",
  },
  would_love: {
    dot: "bg-landing-lavender",
    text: "text-landing-lavender",
    accent: "border-l-landing-lavender/40",
    bg: "bg-white/70",
  },
  must_have: {
    dot: "bg-landing-coral",
    text: "text-landing-coral-dark",
    accent: "border-l-landing-coral/50",
    bg: "bg-white/80",
  },
};

function formatPrice(price: number, locale: string): string {
  return new Intl.NumberFormat(locale === "pl" ? "pl-PL" : "en-US", {
    style: "currency",
    currency: locale === "pl" ? "PLN" : "USD",
  }).format(price);
}

type ReservationCardProps = {
  reservation: MyReservation;
};

export function ReservationCard({ reservation }: ReservationCardProps) {
  const t = useTranslations("dashboard.reservations");
  const tPriority = useTranslations("items.priority");
  const locale = useLocale();
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);

  const priority =
    PRIORITY_CONFIG[reservation.itemPriority] ?? PRIORITY_CONFIG.nice_to_have;

  const reservedDate = new Date(reservation.createdAt).toLocaleDateString(
    locale === "pl" ? "pl-PL" : "en-US",
    { day: "numeric", month: "short", year: "numeric" }
  );

  async function handleCancel() {
    setCancelling(true);
    await cancelReservation(reservation.listSlug, reservation.itemId);
    router.refresh();
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border-l-[3px] ${priority.accent} ${priority.bg} p-4 shadow-sm ring-1 ring-landing-text/[0.04] backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:ring-landing-text/[0.08]`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: item name + priority badge */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold leading-snug text-landing-text">
              {reservation.itemName}
            </h3>
            <div
              className={`flex shrink-0 items-center gap-1.5 rounded-full bg-white/60 px-2 py-0.5 text-xs font-medium ring-1 ring-landing-text/[0.04] ${priority.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
              {tPriority(reservation.itemPriority)}
            </div>
          </div>

          {/* Meta row: price + reserved date */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {reservation.itemPrice != null && (
              <span className="rounded-md bg-landing-text/[0.04] px-2 py-0.5 text-sm font-semibold text-landing-text">
                {formatPrice(reservation.itemPrice, locale)}
              </span>
            )}
            <span className="text-xs text-landing-text-muted">
              {t("reservedOn", { date: reservedDate })}
            </span>
          </div>
        </div>
      </div>

      {/* Footer: view list link + cancel button */}
      <div className="mt-3 flex items-center justify-between border-t border-landing-text/[0.04] pt-3">
        <Link
          href={`/lists/${reservation.listSlug}`}
          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-landing-coral transition-colors hover:bg-landing-coral/5 hover:text-landing-coral-dark"
        >
          <ExternalLink className="h-3 w-3" />
          {t("viewList")}
        </Link>

        {reservation.listIsClosed ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
            <Archive className="h-3 w-3" />
            {t("listClosed")}
          </span>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            disabled={cancelling}
            onClick={handleCancel}
            className="h-7 rounded-lg px-3 text-xs font-medium text-landing-text-muted transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            {cancelling ? t("cancelling") : t("cancelButton")}
          </Button>
        )}
      </div>
    </div>
  );
}

// ── List group header ──────────────────────────────────────────────

type OCCASION_CONFIG_TYPE = Record<
  string,
  { bgClass: string; textClass: string }
>;

const OCCASION_CONFIG: OCCASION_CONFIG_TYPE = {
  birthday: {
    bgClass: "bg-landing-peach-wash/80",
    textClass: "text-landing-coral",
  },
  holiday: {
    bgClass: "bg-landing-mint/10",
    textClass: "text-emerald-600",
  },
  wedding: {
    bgClass: "bg-landing-lavender-wash/80",
    textClass: "text-landing-lavender",
  },
  other: {
    bgClass: "bg-landing-text/5",
    textClass: "text-landing-text-muted",
  },
};

type ReservationGroupHeaderProps = {
  listName: string;
  listSlug: string;
  occasion: string;
  eventDate: string | null;
  isClosed?: boolean;
  tOccasion: string;
  tCountdown: string | null;
  tClosed?: string;
};

export function ReservationGroupHeader({
  listName,
  listSlug,
  occasion,
  eventDate,
  isClosed,
  tOccasion,
  tCountdown,
  tClosed,
}: ReservationGroupHeaderProps) {
  const config = OCCASION_CONFIG[occasion] ?? OCCASION_CONFIG.other;

  return (
    <div className="mb-3 flex items-center gap-2">
      <Link
        href={`/lists/${listSlug}`}
        className="text-base font-bold text-landing-text transition-colors hover:text-landing-coral-dark"
      >
        {listName}
      </Link>
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${config.bgClass} ${config.textClass}`}
      >
        {tOccasion}
      </span>
      {isClosed && tClosed && (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[0.7rem] font-medium text-gray-500">
          <Archive className="h-3 w-3" />
          {tClosed}
        </span>
      )}
      {eventDate && tCountdown && !isClosed && (
        <span className="inline-flex items-center gap-1 rounded-full bg-landing-mint/10 px-2 py-0.5 text-[0.7rem] font-medium text-landing-text">
          <CalendarDays className="h-3 w-3 text-emerald-600" />
          {tCountdown}
        </span>
      )}
    </div>
  );
}
