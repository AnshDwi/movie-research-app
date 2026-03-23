import { Search, Sparkles } from "lucide-react";

export function SearchBar({ value, onChange, loading, onTrending }) {
  return (
    <div className="glass-panel p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Search by title, franchise, or release year..."
            className="w-full rounded-2xl border border-slate-200 bg-white/80 py-4 pl-12 pr-4 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-sky-400 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
          />
        </label>
        <button
          type="button"
          onClick={onTrending}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-4 text-sm font-semibold text-white transition hover:scale-[1.01]"
        >
          <Sparkles className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Searching..." : "Load Trending"}
        </button>
      </div>
    </div>
  );
}
