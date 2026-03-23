import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, GitCompareArrows, Star, ThumbsDown, ThumbsUp, Users } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { analyzeReviewSentiment } from "../../services/sentiment";
import { getMovieDetails } from "../../services/tmdb";
import { formatRuntime, getPosterUrl } from "../../utils/movie";

export function MovieDetailModal() {
  const {
    selectedMovieId,
    setSelectedMovieId,
    addToWatchHistory,
    toggleBookmark,
    toggleComparison,
    bookmarks,
    comparison
  } = useAppContext();
  const [movie, setMovie] = useState(null);
  const [sentiment, setSentiment] = useState(null);

  useEffect(() => {
    if (!selectedMovieId) return;
    let active = true;
    setMovie(null);
    setSentiment(null);

    getMovieDetails(selectedMovieId)
      .then(async (data) => {
        if (!active) return;
        setMovie(data);
        addToWatchHistory(data);
        const nextSentiment = await analyzeReviewSentiment(data.reviews?.results || [], data.title);
        if (active) setSentiment(nextSentiment);
      })
      .catch(() => {
        if (active) setMovie({ title: "Unavailable" });
      });

    return () => {
      active = false;
    };
  }, [selectedMovieId, addToWatchHistory]);

  const trailer = movie?.videos?.results?.find((item) => item.type === "Trailer" && item.site === "YouTube");
  const isBookmarked = movie ? bookmarks.some((item) => item.id === movie.id) : false;
  const isCompared = movie ? comparison.some((item) => item.id === movie.id) : false;

  return (
    <AnimatePresence>
      {selectedMovieId ? (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 px-2 backdrop-blur-sm sm:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button type="button" className="flex-1 cursor-default" onClick={() => setSelectedMovieId(null)} aria-label="Close modal" />
          <motion.aside
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 220 }}
            className="my-2 h-[calc(100vh-1rem)] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/10 bg-white/85 p-6 shadow-2xl backdrop-blur-2xl dark:bg-slate-950/90"
          >
            {!movie ? (
              <div className="space-y-4">
                <div className="shimmer h-72 rounded-[1.75rem] bg-slate-200 dark:bg-white/10" />
                <div className="shimmer h-10 rounded-full bg-slate-200 dark:bg-white/10" />
                <div className="shimmer h-40 rounded-[1.75rem] bg-slate-200 dark:bg-white/10" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-5 lg:grid-cols-[240px,1fr]">
                  <img src={getPosterUrl(movie.poster_path)} alt={movie.title} className="rounded-[1.75rem] object-cover shadow-soft" />
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-sky-500 dark:text-sky-300">Research Detail</p>
                        <h2 className="mt-2 font-display text-3xl font-bold">{movie.title}</h2>
                      </div>
                      <button type="button" onClick={() => setSelectedMovieId(null)} className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold">
                        Close
                      </button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-sm">
                      <span className="rounded-full bg-amber-500/10 px-3 py-1 font-semibold text-amber-600 dark:text-amber-300">
                        <Star className="mr-1 inline h-4 w-4 fill-current" />
                        {movie.vote_average?.toFixed(1)}
                      </span>
                      <span className="rounded-full bg-white/60 px-3 py-1 dark:bg-white/10">{formatRuntime(movie.runtime)}</span>
                      <span className="rounded-full bg-white/60 px-3 py-1 dark:bg-white/10">{movie.release_date}</span>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{movie.overview}</p>
                    {comparison.length ? (
                      <div className="mt-4 rounded-2xl bg-sky-500/10 px-4 py-3 text-sm text-sky-700 dark:text-sky-300">
                        Comparison tray: {comparison.length}/2 selected
                      </div>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggleBookmark(movie)}
                        className="rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
                      >
                        {isBookmarked ? "Remove from watchlist" : "Add to watchlist"}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleComparison(movie)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-3 text-sm font-semibold"
                      >
                        <GitCompareArrows className="h-4 w-4" />
                        {isCompared ? "Added to compare" : "Compare movie"}
                      </button>
                      {trailer ? (
                        <a
                          href={`https://www.youtube.com/watch?v=${trailer.key}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-3 text-sm font-semibold"
                        >
                          Watch trailer
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 xl:grid-cols-2">
                  <div className="glass-panel p-5">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                      <ThumbsUp className="h-4 w-4" />
                      AI pros
                    </div>
                    <div className="space-y-3">
                      {(sentiment?.pros || ["Strong lead performances", "High visual polish"]).map((item) => (
                        <div key={item} className="neo-panel p-3 text-sm">{item}</div>
                      ))}
                    </div>
                    <div className="mb-3 mt-5 inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700 dark:text-rose-300">
                      <ThumbsDown className="h-4 w-4" />
                      AI cons
                    </div>
                    <div className="space-y-3">
                      {(sentiment?.cons || ["Some pacing concerns"]).map((item) => (
                        <div key={item} className="neo-panel p-3 text-sm">{item}</div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-panel p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4 text-sky-500" />
                      <h3 className="font-display text-lg font-semibold">Cast & review pulse</h3>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      Sentiment: <span className="font-semibold">{sentiment?.label || "Analyzing"}</span> with confidence {(sentiment?.score || 0).toFixed(2)}
                    </p>
                    <div className="mt-4 space-y-3 text-sm">
                      {movie.credits?.cast?.slice(0, 5).map((person) => (
                        <div key={person.credit_id || person.cast_id} className="neo-panel flex items-center justify-between p-3">
                          <span className="font-semibold">{person.name}</span>
                          <span className="text-slate-500 dark:text-slate-400">{person.character}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
