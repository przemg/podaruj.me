import {
  Cake,
  Snowflake,
  Heart,
  Gift,
  CalendarDays,
} from "lucide-react";

type PublicListHeaderProps = {
  name: string;
  description: string | null;
  occasionLabel: string;
  occasionKey: string;
  countdownLabel: string | null;
  countdownType: "days" | "today" | "past" | null;
};

const OCCASION_ICONS: Record<string, typeof Cake> = {
  birthday: Cake,
  holiday: Snowflake,
  wedding: Heart,
  other: Gift,
};

export function PublicListHeader({
  name,
  description,
  occasionLabel,
  occasionKey,
  countdownLabel,
  countdownType,
}: PublicListHeaderProps) {
  const OccasionIcon = OCCASION_ICONS[occasionKey] ?? Gift;

  return (
    <div
      className="mb-8 text-center"
      style={{ animation: "fade-in-up 0.4s ease-out" }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full bg-landing-peach-wash/80 px-3 py-1.5 text-sm font-medium text-landing-text">
          <OccasionIcon className="h-4 w-4 text-landing-coral" />
          {occasionLabel}
        </div>
        {countdownLabel && (
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
              countdownType === "past"
                ? "bg-landing-text/5 text-landing-text-muted"
                : "bg-landing-mint/15 text-emerald-700"
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            {countdownLabel}
          </div>
        )}
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-landing-text md:text-4xl">
        {name}
      </h1>
      {description && (
        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-landing-text-muted">
          {description}
        </p>
      )}
    </div>
  );
}
