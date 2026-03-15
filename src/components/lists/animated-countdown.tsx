"use client";

import { useEffect, useState } from "react";
import { getDetailedCountdown, type DetailedCountdownResult } from "@/lib/countdown";
import { useTranslations } from "next-intl";
import { Clock, PartyPopper, CalendarOff } from "lucide-react";

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-orange-100 px-3 py-2 sm:px-4 sm:py-3 min-w-[60px] sm:min-w-[72px]">
        <span className="text-2xl sm:text-3xl font-bold text-orange-600 tabular-nums transition-all duration-300">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs sm:text-sm text-muted-foreground mt-1.5 font-medium">
        {label}
      </span>
    </div>
  );
}

export function AnimatedCountdown({ eventDate }: { eventDate: string }) {
  const t = useTranslations("lists.countdown");
  const [countdown, setCountdown] = useState<DetailedCountdownResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => setCountdown(getDetailedCountdown(eventDate));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  if (!mounted || !countdown) {
    return (
      <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-6 animate-pulse h-[140px]" />
    );
  }

  if (countdown.type === "today") {
    return (
      <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 text-center animate-in fade-in duration-500">
        <PartyPopper className="h-8 w-8 text-orange-500 mx-auto mb-2 animate-bounce" />
        <p className="text-xl sm:text-2xl font-bold text-orange-600">
          {t("today")}
        </p>
      </div>
    );
  }

  if (countdown.type === "past") {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-6 text-center">
        <CalendarOff className="h-6 w-6 text-gray-400 mx-auto mb-2" />
        <p className="text-lg text-gray-500 font-medium">
          {t("passed")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-5 sm:p-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-center gap-1.5 mb-4">
        <Clock className="h-4 w-4 text-orange-500" />
        <span className="text-sm font-medium text-orange-600">{t("until")}</span>
      </div>
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <CountdownUnit value={countdown.days} label={t("days")} />
        <span className="text-2xl font-bold text-orange-300 mt-[-20px]">:</span>
        <CountdownUnit value={countdown.hours} label={t("hours")} />
        <span className="text-2xl font-bold text-orange-300 mt-[-20px]">:</span>
        <CountdownUnit value={countdown.minutes} label={t("minutes")} />
        <span className="text-2xl font-bold text-orange-300 mt-[-20px]">:</span>
        <CountdownUnit value={countdown.seconds} label={t("seconds")} />
      </div>
    </div>
  );
}
