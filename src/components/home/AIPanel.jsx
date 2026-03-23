import { BrainCircuit, Users } from "lucide-react";
import { getPosterUrl } from "../../utils/movie";
import { SectionPanel } from "../ui/SectionPanel";

export function AIPanel({ recommendations, explanation, similarUsers, onSelectMovie }) {
  return (
    <SectionPanel title="AI Intelligence" eyebrow="Recommendation Engine">
      <div className="rounded-[1.6rem] bg-gradient-to-br from-sky-500/15 via-cyan-400/10 to-orange-500/15 p-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700 dark:bg-white/10 dark:text-sky-300">
          <BrainCircuit className="h-4 w-4" />
          Explainable picks
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{explanation}</p>
      </div>

      <div className="mt-5 grid gap-3">
        {recommendations.slice(0, 4).map((movie) => (
          <button
            key={movie.id}
            type="button"
            onClick={() => onSelectMovie(movie.id)}
            className="glass-panel flex items-center gap-3 p-3 text-left transition hover:scale-[1.01]"
          >
            <img src={getPosterUrl(movie.poster_path)} alt={movie.title} className="h-20 w-14 rounded-xl object-cover" />
            <div className="min-w-0">
              <p className="truncate font-display text-base font-semibold">{movie.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{movie.overview}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
          <Users className="h-4 w-4" />
          Users with similar taste
        </div>
        <div className="space-y-3">
          {similarUsers.length ? (
            similarUsers.map((user) => (
              <div key={user.name} className="neo-panel p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-lg font-semibold">{user.name}</p>
                  <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-semibold dark:bg-white/10">
                    {user.compatibility}% match
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{user.affinity}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                  Overlap: {user.overlapTitles.join(" • ")}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Your collaborative filtering panel appears after a bit more interaction history.
            </p>
          )}
        </div>
      </div>
    </SectionPanel>
  );
}
