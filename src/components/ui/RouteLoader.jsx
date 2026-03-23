export function RouteLoader() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="glass-panel w-full max-w-xl p-8">
        <div className="mb-4 h-3 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="mb-6 h-12 animate-pulse rounded-3xl bg-slate-200 dark:bg-white/10" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-[1.75rem] border border-white/20 bg-white/50 p-4 dark:bg-white/5">
              <div className="mb-4 aspect-[2/3] animate-pulse rounded-[1.25rem] bg-slate-200 dark:bg-white/10" />
              <div className="mb-3 h-4 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
