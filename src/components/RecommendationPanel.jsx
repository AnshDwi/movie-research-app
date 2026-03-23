import { BrainCircuit, Users } from "lucide-react";
import { SectionPanel } from "./SectionPanel";
import { getPosterUrl } from "../utils/movie";

export function RecommendationPanel({ recommendations, similarUsers, onSelectMovie, explanation }) {
  return (
    <SectionPanel title="Recommendation Studio" eyebrow="AI Discovery">
      <div className="grid gap-5 xl:grid-cols-[1.3fr,0.9fr]">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-600 dark:text-glow">
            <BrainCircuit className="h-4 w-4" />
            Smart Picks
          </div>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-300">{explanation}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {recommendations.slice(0, 4).map((movie) => (
              <button
                key={movie.id}
                type="button"
                onClick={() => onSelectMovie(movie.id)}
                className="flex items-center gap-3 rounded-2xl bg-slate-100/80 p-3 text-left transition hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <img src={getPosterUrl(movie.poster_path)} alt={movie.title} className="h-20 w-14 rounded-xl object-cover" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{movie.title}</p>
                  <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{movie.overview}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
            <Users className="h-4 w-4" />
            Similar Taste Users
          </div>
          <div className="space-y-3">
            {similarUsers.length ? (
              similarUsers.map((user) => (
                <div key={user.name} className="rounded-2xl bg-slate-100/80 p-4 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{user.name}</p>
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold dark:bg-white/10">
                      {user.compatibility}% match
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{user.affinity}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Your taste graph appears once you have a little viewing history.
              </p>
            )}
          </div>
        </div>
      </div>
    </SectionPanel>
  );
}
