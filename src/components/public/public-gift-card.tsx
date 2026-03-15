"use client";

import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import type { ReservationInfo } from "@/app/[locale]/lists/[slug]/page";
import { ReserveButton } from "@/components/public/reserve-button";

type PublicGiftCardProps = {
  item: {
    id: string;
    name: string;
    description: string | null;
    url: string | null;
    price: number | null;
    image_url: string | null;
    priority: string;
  };
  locale: string;
  index: number;
  // Reservation props
  reservation: ReservationInfo;
  privacyMode: string;
  isOwner: boolean;
  listSlug: string;
  isAuthenticated: boolean;
  itemId: string;
  isClosed?: boolean;
};

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

export function PublicGiftCard({
  item,
  locale,
  index,
  reservation,
  privacyMode,
  isOwner,
  listSlug,
  isAuthenticated,
  itemId,
  isClosed,
}: PublicGiftCardProps) {
  const tPriority = useTranslations("items.priority");

  const priority =
    PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.nice_to_have;

  return (
    <div
      className={`group overflow-hidden rounded-2xl border-l-[3px] ${priority.accent} ${priority.bg} p-4 shadow-sm ring-1 ring-landing-text/[0.04] backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:ring-landing-text/[0.08]`}
      style={{
        animation: `fade-in-up 0.4s ease-out ${index * 0.06}s both`,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Image — visible on all screens */}
        {item.image_url && (
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-landing-text/5 ring-1 ring-landing-text/[0.06]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url}
              alt={item.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Top row: name + priority */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold leading-snug text-landing-text">
              {item.name}
            </h3>
            <div
              className={`flex shrink-0 items-center gap-1.5 rounded-full bg-white/60 px-2 py-0.5 text-xs font-medium ring-1 ring-landing-text/[0.04] ${priority.text}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${priority.dot}`}
              />
              {tPriority(item.priority)}
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-landing-text-muted">
              {item.description}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
            {item.price != null && (
              <span className="rounded-md bg-landing-text/[0.04] px-2 py-0.5 text-sm font-semibold text-landing-text">
                {formatPrice(item.price, locale)}
              </span>
            )}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-landing-coral transition-colors hover:bg-landing-coral/5 hover:text-landing-coral-dark"
              >
                <ExternalLink className="h-3 w-3" />
                Link
              </a>
            )}

            <div className="flex-1" />

            {/* Reserve button — hidden when list is closed */}
            {!isClosed && (
              <ReserveButton
                itemId={itemId}
                listSlug={listSlug}
                privacyMode={privacyMode}
                reservation={reservation}
                isAuthenticated={isAuthenticated}
                isOwner={isOwner}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
