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
      className="flex flex-col items-center justify-center rounded-2xl bg-white/70 px-6 py-16 text-center shadow-sm backdrop-blur-sm ring-1 ring-landing-text/[0.04]"
      style={{ animation: "fade-in-up 0.4s ease-out" }}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-landing-peach-wash">
        <Icon className="h-8 w-8 text-landing-coral" />
      </div>
      <h2 className="text-lg font-semibold text-landing-text">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-landing-text-muted">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Button
          asChild
          className="mt-6 rounded-xl bg-landing-coral-dark px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-landing-coral-hover"
        >
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
