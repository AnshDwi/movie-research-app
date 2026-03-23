import { Bookmark } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { getPosterUrl } from "../utils/movie";
import { SectionPanel } from "./SectionPanel";

export function BookmarksPanel() {
  const { bookmarks, setSelectedMovieId } = useAppContext();

  return (
    <SectionPanel title="Bookmarks" eyebrow="Library">
      {bookmarks.length ? (
        <div className="space-y-3">
          {bookmarks.slice(0, 5).map((movie) => (
            <button
              key={movie.id}
              type="button"
              onClick={() => setSelectedMovieId(movie.id)}
              className="flex w-full items-center gap-3 rounded-2xl bg-slate-100/80 p-3 text-left transition hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <img src={getPosterUrl(movie.poster_path)} alt={movie.title} className="h-16 w-12 rounded-xl object-cover" />
              <div className="min-w-0">
                <p className="truncate font-semibold">{movie.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{movie.release_date || "No release date"}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
          <Bookmark className="mb-3 h-5 w-5" />
          Save a few movies and this becomes your quick-access research shelf.
        </div>
      )}
    </SectionPanel>
  );
}
