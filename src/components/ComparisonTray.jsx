import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { getMovieDetails } from "../services/tmdb";
import { formatRuntime, getPosterUrl } from "../utils/movie";
import { SectionPanel } from "./SectionPanel";

export function ComparisonTray() {
  const { comparison, clearComparison } = useAppContext();
  const [details, setDetails] = useState([]);

  useEffect(() => {
    if (comparison.length !== 2) {
      setDetails([]);
      return;
    }

    Promise.all(comparison.map((movie) => getMovieDetails(movie.id)))
      .then(setDetails)
      .catch(() => setDetails([]));
  }, [comparison]);

  return (
    <SectionPanel
      title="Comparison Lab"
      eyebrow="Side by Side"
      action={
        comparison.length ? (
          <button type="button" onClick={clearComparison} className="text-sm font-semibold text-slate-500 dark:text-slate-300">
            Clear
          </button>
        ) : null
      }
    >
      {comparison.length === 2 && details.length === 2 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {details.map((movie) => (
            <article key={movie.id} className="rounded-[1.75rem] bg-slate-100/80 p-4 dark:bg-white/5">
              <div className="flex gap-4">
                <img src={getPosterUrl(movie.poster_path)} alt={movie.title} className="h-32 w-24 rounded-2xl object-cover" />
                <div className="min-w-0">
                  <h3 className="font-display text-xl font-semibold">{movie.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-amber-600 dark:text-amber-300">
                      <Star className="mr-1 inline h-3 w-3 fill-current" />
                      {movie.vote_average?.toFixed(1)}
                    </span>
                    <span className="rounded-full bg-white/70 px-3 py-1 dark:bg-white/10">{formatRuntime(movie.runtime)}</span>
                  </div>
                  <p className="mt-3 line-clamp-4 text-sm text-slate-600 dark:text-slate-300">{movie.overview}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Add two movies from the grid to compare their tone, ratings, runtime, and positioning.
        </p>
      )}
    </SectionPanel>
  );
}
