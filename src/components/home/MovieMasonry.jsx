import { motion } from "framer-motion";
import { Bookmark, GitCompareArrows, Sparkles, Star } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { getPosterUrl, getYear } from "../../utils/movie";

export function MovieMasonry({ movies, loading, onSelectMovie }) {
  const { bookmarks, toggleBookmark, toggleComparison, recordInteraction, setFeaturedMovie } = useAppContext();

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="glass-panel shimmer p-4">
            <div className="aspect-[2/3] rounded-[1.5rem] bg-slate-200 dark:bg-white/10" />
            <div className="mt-4 h-4 rounded-full bg-slate-200 dark:bg-white/10" />
            <div className="mt-2 h-4 w-2/3 rounded-full bg-slate-200 dark:bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
      {movies.slice(0, 4).map((movie, index) => {
        const isBookmarked = bookmarks.some((item) => item.id === movie.id);
        return (
          <motion.article
            key={movie.id}
            whileHover={{ rotateX: 5, rotateY: index % 2 === 0 ? -5 : 5, y: -6 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="glass-panel overflow-hidden p-4 transition hover:border-sky-400/40"
            style={{ transformStyle: "preserve-3d" }}
            onMouseEnter={() => setFeaturedMovie(movie)}
          >
            <div className="grid gap-4 md:grid-cols-[140px,1fr] xl:grid-cols-[110px,1fr]">
              <img src={getPosterUrl(movie.poster_path)} alt={movie.title} className="aspect-[2/3] rounded-[1.4rem] object-cover" loading="lazy" />
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{getYear(movie.release_date)}</p>
                    <h3 className="mt-1 font-display text-lg font-semibold">{movie.title}</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-600 dark:text-amber-300">
                    <Star className="h-3 w-3 fill-current" />
                    {movie.vote_average?.toFixed(1)}
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{movie.overview}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      recordInteraction("open", movie);
                      onSelectMovie(movie.id);
                    }}
                    className="rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-950"
                  >
                    Open details
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(movie)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-xs font-semibold"
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                    {isBookmarked ? "Saved" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleComparison(movie)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-xs font-semibold"
                  >
                    <GitCompareArrows className="h-4 w-4" />
                    Compare
                  </button>
                </div>
              </div>
            </div>
          </motion.article>
        );
      })}
      {!movies.length ? (
        <div className="glass-panel p-8 text-sm text-slate-500 dark:text-slate-300">
          <Sparkles className="mb-3 h-5 w-5 text-sky-500" />
          Start with trending movies or search a title to populate the immersive workspace.
        </div>
      ) : null}
    </div>
  );
}
