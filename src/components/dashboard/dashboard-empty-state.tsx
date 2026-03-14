import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { type LucideIcon } from "lucide-react";

type DashboardEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export function DashboardEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: DashboardEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-landing-text/[0.06] bg-white/50 px-6 py-20 text-center backdrop-blur-sm"
      style={{ animation: "fade-in-up 0.4s ease-out" }}
    >
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-landing-peach-wash to-landing-coral/10">
        <Icon className="h-9 w-9 text-landing-coral/80" />
      </div>
      <h2 className="text-xl font-semibold text-landing-text">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-landing-text-muted">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Button
          asChild
          className="mt-8 rounded-xl bg-landing-coral-dark px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-landing-coral-hover hover:shadow-lg hover:-translate-y-0.5"
        >
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
