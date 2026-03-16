export default function PublicListLoading() {
  return (
    <div className="mx-auto w-full px-4 py-8" style={{ maxWidth: "1024px" }}>
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center gap-2">
          <div className="h-7 w-24 animate-pulse rounded-full bg-landing-text/10" />
          <div className="h-7 w-28 animate-pulse rounded-full bg-landing-text/10" />
        </div>
        <div className="mx-auto h-9 w-2/3 animate-pulse rounded-lg bg-landing-text/10" />
        <div className="mx-auto mt-3 h-5 w-1/2 animate-pulse rounded-lg bg-landing-text/5" />
      </div>
      <div className="mb-4 flex justify-center">
        <div className="h-4 w-20 animate-pulse rounded bg-landing-text/10" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="mb-3 h-24 animate-pulse rounded-2xl bg-white/60 shadow-sm"
        />
      ))}
    </div>
  );
}
