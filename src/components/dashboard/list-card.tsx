import { Link } from "@/i18n/navigation";
import {
  Cake,
  Snowflake,
  Heart,
  Gift,
  CalendarDays,
  Package,
} from "lucide-react";

type ListCardProps = {
  slug: string;
  name: string;
  occasion: string;
  eventDate: string | null;
  itemCount: number;
  t: {
    occasion: string;
    itemCount: string;
    countdown: string;
  };
};

const OCCASION_CONFIG: Record<
  string,
  { icon: typeof Cake; bgClass: string; textClass: string }
> = {
  birthday: {
    icon: Cake,
    bgClass: "bg-landing-peach-wash/80",
    textClass: "text-landing-coral",
  },
  holiday: {
    icon: Snowflake,
    bgClass: "bg-landing-mint/10",
    textClass: "text-emerald-600",
  },
  wedding: {
    icon: Heart,
    bgClass: "bg-landing-lavender-wash/80",
    textClass: "text-landing-lavender",
  },
  other: {
    icon: Gift,
    bgClass: "bg-landing-text/5",
    textClass: "text-landing-text-muted",
  },
};

export function ListCard({
  slug,
  name,
  occasion,
  eventDate,
  itemCount,
  t,
}: ListCardProps) {
  const config = OCCASION_CONFIG[occasion] ?? OCCASION_CONFIG.other;
  const OccasionIcon = config.icon;

  return (
    <Link
      href={`/dashboard/lists/${slug}`}
      className="group block rounded-2xl bg-white/70 p-5 shadow-sm backdrop-blur-sm ring-1 ring-landing-text/[0.04] transition-all hover:shadow-md hover:ring-landing-text/[0.08]"
    >
      <h3 className="text-base font-semibold text-landing-text group-hover:text-landing-coral-dark transition-colors line-clamp-2">
        {name}
      </h3>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bgClass} text-landing-text`}
        >
          <OccasionIcon className={`h-3 w-3 ${config.textClass}`} />
          {t.occasion}
        </span>

        {eventDate && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-landing-mint/10 px-2.5 py-0.5 text-xs font-medium text-landing-text">
            <CalendarDays className="h-3 w-3 text-emerald-600" />
            {t.countdown}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-xs text-landing-text-muted">
        <Package className="h-3.5 w-3.5" />
        {t.itemCount}
      </div>
    </Link>
  );
}
