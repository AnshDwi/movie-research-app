import { Suspense, lazy, useState } from "react";
import { Box, LayoutGrid, Orbit } from "lucide-react";
import { getPosterUrl } from "../../utils/movie";
import { SectionPanel } from "../ui/SectionPanel";
import { MovieMasonry } from "./MovieMasonry";
import { ErrorBoundary } from "../ui/ErrorBoundary";

const ThreeCarousel = lazy(() => import("../three/ThreeCarousel").then((module) => ({ default: module.ThreeCarousel })));
const MovieGalaxy = lazy(() => import("../three/MovieGalaxy").then((module) => ({ default: module.MovieGalaxy })));

export function ImmersiveHub({ movies, loading, onSelectMovie, contextLabel = "Trending" }) {
  const [mode, setMode] = useState("wall");
  const canUse3D =
    typeof window !== "undefined" &&
    import.meta.env.VITE_ENABLE_3D !== "false" &&
    (() => {
      try {
        const canvas = document.createElement("canvas");
        return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
      } catch {
        return false;
      }
    })();

  return (
    <SectionPanel
      title="Immersive Discovery"
      eyebrow={canUse3D ? "Interactive View" : "Poster Wall"}
      action={
        <div className="inline-flex rounded-full bg-slate-950/5 p-1 dark:bg-white/5">
          <button
            type="button"
            onClick={() => setMode("wall")}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
              mode === "wall" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : ""
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Poster Wall
          </button>
          <button
            type="button"
            onClick={() => setMode("carousel")}
            disabled={!canUse3D}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
              mode === "carousel" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : ""
            }`}
          >
            <Orbit className="h-4 w-4" />
            Carousel
          </button>
          <button
            type="button"
            onClick={() => setMode("galaxy")}
            disabled={!canUse3D}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
              mode === "galaxy" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : ""
            }`}
          >
            <Box className="h-4 w-4" />
            Galaxy
          </button>
        </div>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="glass-panel overflow-hidden p-2">
          {mode === "wall" ? (
            <div className="flex h-[420px] flex-col justify-between rounded-[1.6rem] bg-gradient-to-br from-slate-100 to-slate-200 p-6 text-sm text-slate-500 dark:from-slate-900 dark:to-slate-800 dark:text-slate-300">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-sky-500 dark:text-sky-300">
                  {canUse3D ? "Poster wall" : "Recommended mode"}
                </p>
                <p className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-white">{contextLabel} discovery wall</p>
                <p className="mt-2 max-w-lg">
                  Browse a clean visual wall of posters, then open details or add two movies to comparison.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {movies.slice(0, 6).map((movie) => (
                  <button
                    key={movie.id}
                    type="button"
                    onClick={() => onSelectMovie(movie.id)}
                    className="group overflow-hidden rounded-2xl border border-white/20 bg-black/10"
                  >
                    <img src={getPosterUrl(movie.poster_path)} alt={movie.title} className="aspect-[3/4] w-full object-cover transition duration-300 group-hover:scale-105" />
                  </button>
                ))}
              </div>
            </div>
          ) : canUse3D ? (
            <ErrorBoundary
              fallback={
                <div className="flex h-[420px] flex-col justify-between rounded-[1.6rem] bg-gradient-to-br from-slate-100 to-slate-200 p-6 text-sm text-slate-500 dark:from-slate-900 dark:to-slate-800 dark:text-slate-300">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-sky-500 dark:text-sky-300">Poster wall</p>
                    <p className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-white">{contextLabel} discovery wall</p>
                    <p className="mt-2 max-w-lg">3D rendering is unavailable right now, so the poster wall stays active instead.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {movies.slice(0, 6).map((movie) => (
                    <button
                      key={movie.id}
                      type="button"
                      onClick={() => onSelectMovie(movie.id)}
                      className="group overflow-hidden rounded-2xl border border-white/20 bg-black/10"
                    >
                        <img src={getPosterUrl(movie.poster_path)} alt={movie.title} className="aspect-[3/4] w-full object-cover transition duration-300 group-hover:scale-105" />
                      </button>
                    ))}
                  </div>
                </div>
              }
            >
              <Suspense fallback={<div className="shimmer h-[420px] rounded-[1.6rem] bg-slate-200 dark:bg-white/10" />}>
                {mode === "carousel" ? (
                  <ThreeCarousel movies={movies} onSelectMovie={onSelectMovie} />
                ) : (
                  <MovieGalaxy movies={movies} onSelectMovie={onSelectMovie} />
                )}
              </Suspense>
            </ErrorBoundary>
          ) : (
            <div className="flex h-[420px] items-center justify-center text-sm text-slate-500 dark:text-slate-300">
              Poster Wall mode is active.
            </div>
          )}
        </div>
        <MovieMasonry movies={movies} loading={loading} onSelectMovie={onSelectMovie} />
      </div>
    </SectionPanel>
  );
}
