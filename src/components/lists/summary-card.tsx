"use client";

import { useEffect, useRef } from "react";
import { Gift, PartyPopper, User, UserX } from "lucide-react";
import { useTranslations } from "next-intl";
import { markConfettiShown } from "@/app/[locale]/dashboard/lists/actions";

type ReservationSummaryItem = {
  itemName: string;
  reservedBy: string | null;
};

type SummaryCardProps = {
  listId: string;
  listSlug: string;
  closedAt: string;
  totalItems: number;
  reservedCount: number;
  reservations: ReservationSummaryItem[];
  confettiShown: boolean;
  locale: string;
};

export function SummaryCard({ listId, listSlug, closedAt, totalItems, reservedCount, reservations, confettiShown, locale }: SummaryCardProps) {
  const t = useTranslations("lists.summary");
  const confettiFired = useRef(false);

  useEffect(() => {
    if (confettiFired.current || confettiShown) return;
    confettiFired.current = true;

    // Mark as shown in DB
    markConfettiShown(locale, listSlug);

    import("canvas-confetti").then((confettiModule) => {
      const confetti = confettiModule.default;
      const colors = ["#f97316", "#fbbf24", "#fb923c", "#f472b6", "#a855f7", "#ec4899"];

      confetti({ particleCount: 120, spread: 80, origin: { x: 0.1, y: 0.6 }, colors });
      confetti({ particleCount: 120, spread: 80, origin: { x: 0.9, y: 0.6 }, colors });

      setTimeout(() => {
        confetti({ particleCount: 100, spread: 90, origin: { x: 0.3, y: 0.5 }, colors });
        confetti({ particleCount: 100, spread: 90, origin: { x: 0.7, y: 0.5 }, colors });
      }, 400);

      setTimeout(() => {
        confetti({ particleCount: 80, spread: 100, origin: { x: 0.5, y: 0.4 }, colors });
      }, 800);

      setTimeout(() => {
        confetti({ particleCount: 60, spread: 120, origin: { x: 0.2, y: 0.7 }, colors });
        confetti({ particleCount: 60, spread: 120, origin: { x: 0.8, y: 0.7 }, colors });
      }, 1200);
    });
  }, [listId, closedAt, confettiShown, locale, listSlug]);

  const percentage = totalItems > 0 ? Math.round((reservedCount / totalItems) * 100) : 0;

  return (
    <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-center gap-2 mb-4">
        <PartyPopper className="h-6 w-6 text-orange-500" />
        <h3 className="text-lg font-bold text-orange-700">{t("title")}</h3>
        <PartyPopper className="h-6 w-6 text-orange-500 scale-x-[-1]" />
      </div>

      <div className="text-center mb-6">
        <p className="text-3xl font-bold text-orange-600">
          {reservedCount} / {totalItems}
        </p>
        <p className="text-sm text-orange-600/70 mt-1">
          {t("giftsReserved", { percentage })}
        </p>
        <div className="mt-3 h-2 rounded-full bg-orange-100 overflow-hidden max-w-xs mx-auto">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400 transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {reservations.length > 0 && (
        <div className="space-y-2">
          {reservations.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl bg-white/60 px-4 py-2.5 text-sm animate-in fade-in duration-500"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <Gift className="h-4 w-4 text-orange-400 shrink-0" />
              <span className="font-medium text-gray-700 flex-1 truncate">{item.itemName}</span>
              <span className="flex items-center gap-1 text-gray-500 shrink-0">
                {item.reservedBy ? (
                  <>
                    <User className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[120px]">{item.reservedBy}</span>
                  </>
                ) : (
                  <>
                    <UserX className="h-3.5 w-3.5" />
                    <span>{t("anonymous")}</span>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
