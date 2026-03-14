"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
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

  const priority = PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.nice_to_have;

  return (
    <div className="group relative rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-landing-text/[0.04] backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:ring-landing-text/[0.08]">
      <div className="flex items-start gap-3">
        {/* Reorder — compact vertical strip */}
        <div className="flex flex-col items-center gap-px pt-0.5">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-landing-text-muted/40 transition-colors hover:bg-landing-text/5 hover:text-landing-text disabled:invisible"
            aria-label={t("moveUp")}
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-landing-text-muted/40 transition-colors hover:bg-landing-text/5 hover:text-landing-text disabled:invisible"
            aria-label={t("moveDown")}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* Image thumbnail */}
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

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Top row: name + priority */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-landing-text leading-snug">
              {item.name}
            </h3>
            <div className={`flex shrink-0 items-center gap-1.5 text-xs font-medium ${priority.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
              {tPriority(item.priority)}
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <p className="mt-0.5 line-clamp-1 text-sm text-landing-text-muted">
              {item.description}
            </p>
          )}

          {/* Meta row: price, link, actions */}
          <div className="mt-2 flex items-center gap-3">
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
                {t("openLink")}
              </a>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Actions — subtle, right-aligned */}
            <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="h-8 w-8 cursor-pointer text-landing-text-muted/50 hover:bg-landing-text/5 hover:text-landing-text"
                aria-label={t("edit")}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-8 w-8 cursor-pointer text-landing-text-muted/50 hover:bg-red-50 hover:text-red-500"
                aria-label={t("delete")}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
