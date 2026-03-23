import { scoreToHeat } from "../utils/movie";
import { SectionPanel } from "./SectionPanel";

export function PopularityHeatmap({ movies }) {
  const topMovies = movies.slice(0, 12);

  return (
    <SectionPanel title="Popularity Heatmap" eyebrow="Unique Add-on">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {topMovies.map((movie) => {
          const normalizedPopularity = Math.min(100, Math.round(movie.popularity || 0));
          return (
            <div key={movie.id} className="space-y-2 rounded-2xl bg-slate-100/80 p-3 dark:bg-white/5">
              <div className={`h-16 rounded-2xl ${scoreToHeat(normalizedPopularity)} opacity-90`} />
              <p className="line-clamp-2 text-sm font-semibold">{movie.title}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{normalizedPopularity} heat</p>
            </div>
          );
        })}
      </div>
    </SectionPanel>
  );
}
