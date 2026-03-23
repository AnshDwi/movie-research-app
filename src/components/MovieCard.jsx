import { Bookmark, Eye, GitCompareArrows, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { getMoviePreview } from "../services/tmdb";
import { getPosterUrl, getYear } from "../utils/movie";

export function MovieCard({ movie }) {
  const { bookmarks, toggleBookmark, toggleComparison, setSelectedMovieId } = useAppContext();
  const [preview, setPreview] = useState(null);
  const [isHovering, setIsHovering] = useState(false);

  const isBookmarked = bookmarks.some((item) => item.id === movie.id);

  useEffect(() => {
    if (!isHovering || preview !== null) return;

    let active = true;
    getMoviePreview(movie.id)
      .then((data) => {
        if (active) setPreview(data || false);
      })
      .catch(() => {
        if (active) setPreview(false);
      });

    return () => {
      active = false;
    };
  }, [isHovering, movie.id, preview]);

  return (
    <article
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="group relative overflow-hidden rounded-[1.75rem] border border-white/30 bg-white/80 shadow-soft transition duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-slate-900/80"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        {isHovering && preview?.key ? (
          <iframe
            title={`${movie.title} trailer preview`}
            src={`https://www.youtube.com/embed/${preview.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${preview.key}`}
            className="h-full w-full"
            allow="autoplay"
          />
        ) : (
          <img
            src={getPosterUrl(movie.poster_path)}
            alt={movie.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent p-4 text-white">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-300">{getYear(movie.release_date)}</p>
          <h3 className="mt-2 font-display text-lg font-semibold leading-tight">{movie.title}</h3>
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-300">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-amber-600 dark:text-amber-300">
            <Star className="h-4 w-4 fill-current" />
            {movie.vote_average?.toFixed(1) || "N/A"}
          </span>
          <span>{movie.popularity?.toFixed(0)} buzz</span>
        </div>
        <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {movie.overview || "No overview available yet."}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedMovieId(movie.id)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-600 dark:border-white/10 dark:text-slate-200"
          >
            <Eye className="h-4 w-4" />
            Details
          </button>
          <button
            type="button"
            onClick={() => toggleBookmark(movie)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-amber-400 hover:text-amber-600 dark:border-white/10 dark:text-slate-200"
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
            {isBookmarked ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => toggleComparison(movie)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-white/10 dark:text-slate-200"
          >
            <GitCompareArrows className="h-4 w-4" />
            Compare
          </button>
        </div>
      </div>
    </article>
  );
}
