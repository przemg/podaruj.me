"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";

type ItemData = {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  price: number | null;
  image_url: string | null;
  priority: string;
  position: number;
};

type GiftCardProps = {
  item: ItemData;
  isFirst: boolean;
  isLast: boolean;
  locale: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

const PRIORITY_STYLES: Record<string, string> = {
  nice_to_have: "bg-gray-100 text-gray-600",
  would_love: "bg-landing-lavender-wash text-landing-lavender",
  must_have: "bg-landing-coral/10 text-landing-coral-dark",
};

function formatPrice(price: number, locale: string): string {
  return new Intl.NumberFormat(locale === "pl" ? "pl-PL" : "en-US", {
    style: "currency",
    currency: locale === "pl" ? "PLN" : "USD",
  }).format(price);
}

export function GiftCard({
  item,
  isFirst,
  isLast,
  locale,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: GiftCardProps) {
  const t = useTranslations("items");
  const tPriority = useTranslations("items.priority");

  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-landing-text/5 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md"
      style={{ animation: "fade-in-up 0.3s ease-out" }}
    >
      {/* Reorder buttons */}
      <div className="flex flex-col gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMoveUp}
          disabled={isFirst}
          className="h-8 w-8 cursor-pointer text-landing-text-muted hover:text-landing-text disabled:opacity-30"
          aria-label={t("moveUp")}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onMoveDown}
          disabled={isLast}
          className="h-8 w-8 cursor-pointer text-landing-text-muted hover:text-landing-text disabled:opacity-30"
          aria-label={t("moveDown")}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Image thumbnail */}
      {item.image_url && (
        <div className="hidden h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-landing-text/10 sm:block">
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
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-medium text-landing-text">{item.name}</h3>
            {item.description && (
              <p className="mt-0.5 line-clamp-2 text-sm text-landing-text-muted">
                {item.description}
              </p>
            )}
          </div>
          <Badge
            variant="secondary"
            className={`flex-shrink-0 text-xs ${PRIORITY_STYLES[item.priority] ?? PRIORITY_STYLES.nice_to_have}`}
          >
            {tPriority(item.priority)}
          </Badge>
        </div>

        {/* Meta row */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {item.price != null && (
            <span className="text-sm font-medium text-landing-text">
              {formatPrice(item.price, locale)}
            </span>
          )}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-landing-coral hover:text-landing-coral-dark"
              aria-label={t("openLink")}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t("openLink")}
            </a>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-2 flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 cursor-pointer text-xs text-landing-text-muted hover:text-landing-text"
          >
            <Pencil className="mr-1 h-3.5 w-3.5" />
            {t("edit")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 cursor-pointer text-xs text-red-400 hover:text-red-600"
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            {t("delete")}
          </Button>
        </div>
      </div>
    </div>
  );
}
