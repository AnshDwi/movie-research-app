import { Film, Moon, SunMedium } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export function Header() {
  const { theme, setTheme } = useAppContext();

  return (
    <header className="relative overflow-hidden rounded-[2rem] border border-white/30 bg-slate-950 px-6 py-8 text-white shadow-soft sm:px-8">
      <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-sky-400/30 blur-3xl" />
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-orange-500/30 blur-3xl" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm backdrop-blur">
            <Film className="h-4 w-4 text-glow" />
            Research, compare, and discover what to watch next
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Afterglow turns movie browsing into a cinematic research desk.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Search TMDB, inspect reviews and cast, compare titles side by side, and surface recommendations shaped by mood and viewing behavior.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </div>
    </header>
  );
}
