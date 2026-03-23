import { Clock3, Lock, Share2, UserRound } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { getYear } from "../../utils/movie";
import { SectionPanel } from "../ui/SectionPanel";

function TasteBar({ label, value }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10">
        <div className="h-2 rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-orange-400" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function ProfilePanel() {
  const { authUser, watchHistory, bookmarks } = useAppContext();

  return (
    <SectionPanel title="Profile & Watchlists" eyebrow="Social Layer">
      <div className="neo-panel p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <UserRound className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-xl font-semibold">{authUser.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{authUser.handle}</p>
          </div>
        </div>
        <div className="mt-5 space-y-4">
          <TasteBar label="Sci-fi affinity" value={82} />
          <TasteBar label="Drama affinity" value={68} />
          <TasteBar label="Thriller affinity" value={74} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="glass-panel p-4">
          <Clock3 className="h-5 w-5 text-sky-500" />
          <p className="mt-3 text-2xl font-bold">{watchHistory.length}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Timeline entries</p>
        </div>
        <div className="glass-panel p-4">
          <Share2 className="h-5 w-5 text-emerald-500" />
          <p className="mt-3 text-2xl font-bold">{bookmarks.length}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Sharable watchlist items</p>
        </div>
        <div className="glass-panel p-4">
          <Lock className="h-5 w-5 text-orange-500" />
          <p className="mt-3 text-2xl font-bold">{authUser.visibility}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Public or private mode</p>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="font-display text-lg font-semibold">Watch history timeline</h3>
        <div className="mt-3 space-y-3">
          {watchHistory.slice(0, 5).map((movie) => (
            <div key={movie.id} className="glass-panel flex items-center justify-between p-4">
              <div>
                <p className="font-semibold">{movie.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{movie.release_date || "Unknown date"}</p>
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{getYear(movie.release_date)}</p>
            </div>
          ))}
          {!watchHistory.length ? (
            <p className="text-sm text-slate-500 dark:text-slate-300">Open a few movies to populate your timeline and taste graph.</p>
          ) : null}
        </div>
      </div>
    </SectionPanel>
  );
}
