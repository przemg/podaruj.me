export default function ListDetailLoading() {
  return (
    <div className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8" style={{ maxWidth: "1024px" }}>
        {/* Back link skeleton */}
        <div className="mb-4 h-4 w-32 animate-pulse rounded bg-landing-text/10" />

        {/* Header skeleton */}
        <div className="mb-8 space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-landing-text/10" />
          <div className="h-4 w-1/2 animate-pulse rounded-lg bg-landing-text/5" />
          <div className="flex gap-2">
            <div className="h-6 w-20 animate-pulse rounded-full bg-landing-text/10" />
            <div className="h-6 w-24 animate-pulse rounded-full bg-landing-text/10" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-20 animate-pulse rounded-lg bg-landing-text/5" />
            <div className="h-9 w-24 animate-pulse rounded-lg bg-landing-text/5" />
            <div className="h-9 w-20 animate-pulse rounded-lg bg-landing-text/5" />
          </div>
        </div>

        {/* Section header skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded-lg bg-landing-text/10" />
          <div className="h-9 w-28 animate-pulse rounded-lg bg-landing-text/10" />
        </div>

        {/* Gift cards skeleton */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="mb-3 h-28 animate-pulse rounded-xl bg-white/60 shadow-sm"
          />
        ))}
    </div>
  );
}
