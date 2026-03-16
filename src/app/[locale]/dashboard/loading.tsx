import { DASHBOARD_MAX_WIDTH } from "@/lib/layout";

export default function DashboardLoading() {
  return (
    <main className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8" style={{ maxWidth: DASHBOARD_MAX_WIDTH }}>
      <div className="mb-8 flex items-center justify-between">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-landing-text/5" />
        <div className="h-10 w-28 animate-pulse rounded-xl bg-landing-text/5" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white/70 p-5 shadow-sm ring-1 ring-landing-text/[0.04]"
          >
            <div className="h-5 w-3/4 animate-pulse rounded bg-landing-text/5" />
            <div className="mt-3 flex gap-2">
              <div className="h-5 w-20 animate-pulse rounded-full bg-landing-text/5" />
              <div className="h-5 w-24 animate-pulse rounded-full bg-landing-text/5" />
            </div>
            <div className="mt-4 h-4 w-16 animate-pulse rounded bg-landing-text/5" />
          </div>
        ))}
      </div>
    </main>
  );
}
