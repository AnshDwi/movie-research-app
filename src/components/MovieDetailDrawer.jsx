import { ExternalLink, Star, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { analyzeReviewSentiment } from "../services/sentiment";
import { getMovieDetails } from "../services/tmdb";
import { formatRuntime, getPosterUrl } from "../utils/movie";

export function MovieDetailDrawer() {
  const { selectedMovieId, setSelectedMovieId, addToWatchHistory, toggleBookmark } = useAppContext();
  const [movie, setMovie] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedMovieId) return;

    let active = true;
    setLoading(true);
    setMovie(null);
    setSentiment(null);

    getMovieDetails(selectedMovieId)
      .then(async (data) => {
        if (!active) return;
        setMovie(data);
        addToWatchHistory(data);
        const mood = await analyzeReviewSentiment(data.reviews?.results || [], data.title);
        if (active) setSentiment(mood);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedMovieId, addToWatchHistory]);

  if (!selectedMovieId) return null;

  const trailer = movie?.videos?.results?.find((item) => item.type === "Trailer" && item.site === "YouTube");

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-sm">
      <button type="button" className="flex-1 cursor-default" onClick={() => setSelectedMovieId(null)} aria-label="Close details" />
      <aside className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl dark:bg-slate-950">
        {loading || !movie ? (
          <div className="animate-pulse space-y-4">
            <div className="h-72 rounded-3xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-8 w-2/3 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500 dark:text-glow">Movie Research</p>
                <h2 className="mt-2 font-display text-3xl font-bold">{movie.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMovieId(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-white/10"
              >
                Close
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-[220px,1fr]">
              <img src={getPosterUrl(movie.poster_path)} alt={movie.title} className="rounded-[1.75rem] object-cover shadow-soft" />
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="rounded-full bg-amber-500/10 px-3 py-1 font-semibold text-amber-600 dark:text-amber-300">
                    <Star className="mr-1 inline h-4 w-4 fill-current" />
                    {movie.vote_average?.toFixed(1)} / 10
                  </span>
                  <span className="rounded-full bg-slate-200/70 px-3 py-1 dark:bg-white/10">{formatRuntime(movie.runtime)}</span>
                  <span className="rounded-full bg-slate-200/70 px-3 py-1 dark:bg-white/10">{movie.release_date}</span>
                </div>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{movie.overview}</p>
                <div className="flex flex-wrap gap-2">
                  {movie.genres?.map((genre) => (
                    <span key={genre.id} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold dark:border-white/10">
                      {genre.name}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => toggleBookmark(movie)}
                    className="rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
                  >
                    Toggle bookmark
                  </button>
                  {trailer ? (
                    <a
                      href={`https://www.youtube.com/watch?v=${trailer.key}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold dark:border-white/10"
                    >
                      Watch trailer
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="glass-panel p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-sky-500" />
                  <h3 className="font-display text-lg font-semibold">Top Cast</h3>
                </div>
                <div className="space-y-3 text-sm">
                  {movie.credits?.cast?.slice(0, 6).map((person) => (
                    <div key={person.cast_id || person.credit_id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-100/80 px-4 py-3 dark:bg-white/5">
                      <span className="font-semibold">{person.name}</span>
                      <span className="text-slate-500 dark:text-slate-400">{person.character}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-5">
                <h3 className="font-display text-lg font-semibold">Review Sentiment</h3>
                <div className="mt-4 rounded-[1.5rem] bg-gradient-to-br from-sky-500/15 to-orange-500/15 p-4">
                  <p className="text-sm text-slate-500 dark:text-slate-300">Audience reaction snapshot</p>
                  <p className="mt-2 text-3xl font-bold">{sentiment?.label || "Analyzing..."}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Confidence {(sentiment?.score || 0).toFixed(2)} based on recent review language.
                  </p>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  {movie.reviews?.results?.slice(0, 2).map((review) => (
                    <article key={review.id} className="rounded-2xl bg-slate-100/80 p-4 dark:bg-white/5">
                      <p className="font-semibold">{review.author}</p>
                      <p className="mt-2 line-clamp-4 text-slate-600 dark:text-slate-300">{review.content}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
