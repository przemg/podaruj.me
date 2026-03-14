"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShoppingCart } from "lucide-react";

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
};

const PRIORITY_CONFIG: Record<string, { dot: string; text: string }> = {
  nice_to_have: { dot: "bg-gray-300", text: "text-landing-text-muted" },
  would_love: { dot: "bg-landing-lavender", text: "text-landing-lavender" },
  must_have: { dot: "bg-landing-coral", text: "text-landing-coral-dark" },
};

function formatPrice(price: number, locale: string): string {
  return new Intl.NumberFormat(locale === "pl" ? "pl-PL" : "en-US", {
    style: "currency",
    currency: locale === "pl" ? "PLN" : "USD",
  }).format(price);
}

export function PublicGiftCard({ item, locale, index }: PublicGiftCardProps) {
  const t = useTranslations("public");
  const tPriority = useTranslations("items.priority");

  const priority =
    PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.nice_to_have;

  return (
    <div
      className="group rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-landing-text/[0.04] backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:ring-landing-text/[0.08]"
      style={{
        animation: `fade-in-up 0.4s ease-out ${index * 0.06}s both`,
      }}
    >
      <div className="flex items-start gap-3">
        {item.image_url && (
          <div className="hidden h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-landing-text/5 sm:block">
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
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold leading-snug text-landing-text">
              {item.name}
            </h3>
            <div
              className={`flex shrink-0 items-center gap-1.5 text-xs font-medium ${priority.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
              {tPriority(item.priority)}
            </div>
          </div>
          {item.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-landing-text-muted">
              {item.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {item.price != null && (
              <span className="text-sm font-semibold text-landing-text">
                {formatPrice(item.price, locale)}
              </span>
            )}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-landing-coral transition-colors hover:bg-landing-coral/5 hover:text-landing-coral-dark"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="hidden sm:inline">Link</span>
              </a>
            )}
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              disabled
              className="h-8 gap-1.5 text-xs"
              title={t("reserveComingSoon")}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {t("reserveButton")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
