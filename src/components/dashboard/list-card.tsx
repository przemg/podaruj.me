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
  isDraft?: boolean;
  t: {
    occasion: string;
    itemCount: string;
    countdown: string;
    draft?: string;
  };
};

const OCCASION_CONFIG: Record<
  string,
  { icon: typeof Cake; bgClass: string; textClass: string; accentClass: string }
> = {
  birthday: {
    icon: Cake,
    bgClass: "bg-landing-peach-wash/80",
    textClass: "text-landing-coral",
    accentClass: "from-landing-coral/60 to-landing-coral/20",
  },
  holiday: {
    icon: Snowflake,
    bgClass: "bg-landing-mint/10",
    textClass: "text-emerald-600",
    accentClass: "from-emerald-500/60 to-emerald-500/20",
  },
  wedding: {
    icon: Heart,
    bgClass: "bg-landing-lavender-wash/80",
    textClass: "text-landing-lavender",
    accentClass: "from-landing-lavender/60 to-landing-lavender/20",
  },
  other: {
    icon: Gift,
    bgClass: "bg-landing-text/5",
    textClass: "text-landing-text-muted",
    accentClass: "from-landing-text-muted/40 to-landing-text-muted/10",
  },
};

export function ListCard({
  slug,
  name,
  occasion,
  eventDate,
  isDraft,
  t,
}: ListCardProps) {
  const config = OCCASION_CONFIG[occasion] ?? OCCASION_CONFIG.other;
  const OccasionIcon = config.icon;

  return (
    <Link
      href={`/dashboard/lists/${slug}`}
      className="group relative block overflow-hidden rounded-2xl bg-white/80 p-5 shadow-sm backdrop-blur-sm ring-1 ring-landing-text/[0.04] transition-all duration-200 hover:shadow-lg hover:ring-landing-text/[0.08] hover:-translate-y-0.5 active:scale-[0.98]"
    >
      {/* Colored top accent bar */}
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${config.accentClass}`} />

      <div className="flex items-start gap-3.5">
        {/* Occasion icon circle */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bgClass}`}>
          <OccasionIcon className={`h-5 w-5 ${config.textClass}`} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-[0.95rem] font-semibold leading-snug text-landing-text group-hover:text-landing-coral-dark transition-colors line-clamp-2">
            {name}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {isDraft && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[0.7rem] font-medium text-amber-700">
                {t.draft}
              </span>
            )}
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${config.bgClass} text-landing-text`}>
              {t.occasion}
            </span>

            {eventDate && (
              <span className="inline-flex items-center gap-1 rounded-full bg-landing-mint/10 px-2 py-0.5 text-[0.7rem] font-medium text-landing-text">
                <CalendarDays className="h-3 w-3 text-emerald-600" />
                {t.countdown}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 border-t border-landing-text/[0.04] pt-3 text-xs text-landing-text-muted">
        <Package className="h-3.5 w-3.5" />
        {t.itemCount}
      </div>
    </Link>
  );
}
