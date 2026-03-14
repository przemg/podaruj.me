export default function ReservationsLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 h-8 w-40 animate-pulse rounded-lg bg-landing-text/5" />
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white/70 px-6 py-16 shadow-sm ring-1 ring-landing-text/[0.04]">
        <div className="h-16 w-16 animate-pulse rounded-2xl bg-landing-text/5" />
        <div className="mt-4 h-5 w-48 animate-pulse rounded bg-landing-text/5" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-landing-text/5" />
      </div>
    </main>
  );
}
