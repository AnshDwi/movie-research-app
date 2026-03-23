import { motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, Flame, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { getPosterUrl, getYear } from "../../utils/movie";
import { SectionPanel } from "../ui/SectionPanel";

function ReleaseCard({ movie, onSelectMovie }) {
  return (
    <motion.button
      whileHover={{ y: -6, rotateX: 3, rotateY: -3 }}
      type="button"
      onClick={() => onSelectMovie(movie.id)}
      className="group w-[180px] shrink-0 text-left"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="glass-panel overflow-hidden p-3">
        <div className="relative aspect-[2/3] overflow-hidden rounded-[1.4rem]">
          <img src={getPosterUrl(movie.poster_path)} alt={movie.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
          {movie.isNewRelease ? (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
              <Flame className="h-3 w-3" />
              New
            </span>
          ) : null}
        </div>
        <div className="pt-3">
          <p className="line-clamp-1 font-display text-base font-semibold">{movie.title}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{getYear(movie.release_date)}</p>
        </div>
      </div>
    </motion.button>
  );
}

export function ReleaseRail({ title, eyebrow, movies, loading, onSelectMovie }) {
  const railRef = useRef(null);
  const [expanded, setExpanded] = useState(false);

  function scrollRail(direction) {
    railRef.current?.scrollBy({
      left: direction * 320,
      behavior: "smooth"
    });
  }

  function handleWheelScroll(event) {
    if (!railRef.current) return;
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      railRef.current.scrollBy({
        left: event.deltaY,
        behavior: "auto"
      });
    }
  }

  return (
    <SectionPanel
      title={title}
      eyebrow={eyebrow}
      action={
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-600 dark:text-sky-300">
            <Sparkles className="h-4 w-4" />
            Live feed
          </div>
          <button
            type="button"
            onClick={() => scrollRail(-1)}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-sky-300/30 bg-gradient-to-br from-sky-500 to-cyan-400 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-[0_10px_30px_rgba(56,189,248,0.35)]"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="h-4 w-4" />
            Left
          </button>
          <button
            type="button"
            onClick={() => scrollRail(1)}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-sky-300/30 bg-gradient-to-br from-sky-500 to-cyan-400 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-[0_10px_30px_rgba(56,189,248,0.35)]"
            aria-label={`Scroll ${title} right`}
          >
            Right
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 bg-white/40 px-3 text-xs font-semibold uppercase tracking-[0.16em] dark:bg-white/5"
          >
            {expanded ? "Hide list" : "Show all"}
            <ChevronDown className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      }
    >
      <div className="relative">
        <div
          ref={railRef}
          onWheel={handleWheelScroll}
          className="overflow-x-scroll pb-4 [scrollbar-color:rgba(56,189,248,0.75)_rgba(15,23,42,0.15)] [scrollbar-width:thin]"
          style={{ touchAction: "pan-x" }}
        >
          <div className="flex min-w-max gap-4 pr-4" style={{ scrollSnapType: "x proximity" }}>
            {(loading ? Array.from({ length: 5 }).map((_, index) => ({ id: index, loading: true })) : movies).map((movie) =>
              movie.loading ? (
                <div key={movie.id} className="glass-panel w-[180px] shrink-0 p-3" style={{ scrollSnapAlign: "start" }}>
                  <div className="shimmer aspect-[2/3] rounded-[1.4rem] bg-slate-200 dark:bg-white/10" />
                  <div className="mt-3 h-4 rounded-full bg-slate-200 dark:bg-white/10" />
                  <div className="mt-2 h-3 w-1/2 rounded-full bg-slate-200 dark:bg-white/10" />
                </div>
              ) : (
                <ReleaseCard key={movie.id} movie={movie} onSelectMovie={onSelectMovie} />
              )
            )}
          </div>
        </div>
        <div className="mt-2 text-center text-xs uppercase tracking-[0.2em] text-slate-400">
          Scroll left or right through the movie row
        </div>
        {expanded ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(loading ? [] : movies).map((movie) => (
              <ReleaseCard key={`expanded-${movie.id}`} movie={movie} onSelectMovie={onSelectMovie} />
            ))}
          </div>
        ) : null}
      </div>
    </SectionPanel>
  );
}
