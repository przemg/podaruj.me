import {
  Cake,
  Snowflake,
  Heart,
  Gift,
  CalendarDays,
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
} from "lucide-react";

type PublicListHeaderProps = {
  name: string;
  description: string | null;
  occasionLabel: string;
  occasionKey: string;
  countdownLabel: string | null;
  countdownType: "days" | "today" | "past" | null;
  privacyLabel?: string;
  privacyHint?: string;
  privacyMode?: string;
};

const OCCASION_ICONS: Record<string, typeof Cake> = {
  birthday: Cake,
  holiday: Snowflake,
  wedding: Heart,
  other: Gift,
};

const PRIVACY_ICONS: Record<string, typeof Eye> = {
  buyers_choice: HelpCircle,
  visible: Eye,
  full_surprise: EyeOff,
};

export function PublicListHeader({
  name,
  description,
  occasionLabel,
  occasionKey,
  countdownLabel,
  countdownType,
  privacyLabel,
  privacyHint,
  privacyMode,
}: PublicListHeaderProps) {
  const OccasionIcon = OCCASION_ICONS[occasionKey] ?? Gift;
  const PrivacyIcon = privacyMode ? (PRIVACY_ICONS[privacyMode] ?? HelpCircle) : null;

  return (
    <div
      className="mb-10 text-center"
      style={{ animation: "fade-in-up 0.4s ease-out" }}
    >
      {/* Decorative icon */}
      <div className="mb-5 flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-landing-coral/15 to-landing-lavender/15 shadow-sm ring-1 ring-landing-coral/10">
          <OccasionIcon className="h-7 w-7 text-landing-coral" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight text-landing-text md:text-4xl lg:text-[2.75rem]">
        {name}
      </h1>

      {/* Description */}
      {description && (
        <p className="mx-auto mt-3 max-w-lg text-[0.95rem] leading-relaxed text-landing-text-muted">
          {description}
        </p>
      )}

      {/* Badges */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full bg-landing-peach-wash px-3.5 py-1.5 text-sm font-medium text-landing-text shadow-sm ring-1 ring-landing-coral/10">
          <Sparkles className="h-3.5 w-3.5 text-landing-coral" />
          {occasionLabel}
        </div>
        {countdownLabel && (
          <div
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium shadow-sm ring-1 ${
              countdownType === "past"
                ? "bg-landing-text/5 text-landing-text-muted ring-landing-text/5"
                : countdownType === "today"
                  ? "bg-landing-coral/10 text-landing-coral-dark ring-landing-coral/15"
                  : "bg-landing-mint/15 text-emerald-700 ring-emerald-500/10"
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            {countdownLabel}
          </div>
        )}
        {privacyLabel && PrivacyIcon && (
          <div className="group/privacy relative">
            <div className="flex cursor-help items-center gap-1.5 rounded-full bg-landing-lavender-wash px-3.5 py-1.5 text-sm font-medium text-landing-text shadow-sm ring-1 ring-landing-lavender/10">
              <PrivacyIcon className="h-3.5 w-3.5 text-landing-lavender" />
              {privacyLabel}
            </div>
            {privacyHint && (
              <div className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 rounded-lg bg-landing-text/90 px-3 py-1.5 text-xs leading-relaxed text-white opacity-0 shadow-lg backdrop-blur-sm transition-opacity group-hover/privacy:opacity-100 whitespace-nowrap">
                {privacyHint}
                <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-landing-text/90" />
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
