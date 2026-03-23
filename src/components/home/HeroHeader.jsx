import { Mic, Moon, Rocket, SunMedium } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

export function HeroHeader() {
  const { theme, setTheme, authUser } = useAppContext();

  return (
    <section className="glass-panel relative overflow-hidden px-5 py-6 sm:px-8 lg:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.24),transparent_26%),radial-gradient(circle_at_80%_0%,rgba(249,115,22,0.18),transparent_24%),radial-gradient(circle_at_60%_100%,rgba(79,209,197,0.14),transparent_24%)]" />
      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-700 dark:bg-white/5 dark:text-slate-200"
          >
            <Rocket className="h-4 w-4 text-sky-500" />
            3D discovery, AI explainability, real-time releases
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="max-w-4xl font-display text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl xl:text-6xl"
          >
            A cinematic intelligence platform for exploring movies like a living universe.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base"
          >
            Research new releases, move through a 3D movie galaxy, track your taste graph, compare films visually, and get explainable recommendations shaped by mood, watch behavior, and similar viewers.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-5 flex flex-wrap gap-3"
          >
            <Link
              to="/watch-party"
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Open watch party
            </Link>
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/35 px-4 py-3 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-300">
              Shared trailer rooms, host sync, chat, and live presence
            </div>
          </motion.div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:w-[520px]">
          <div className="neo-panel p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Active profile</p>
            <p className="mt-2 font-display text-xl font-semibold">{authUser.name}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{authUser.handle}</p>
          </div>
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="neo-panel flex items-center justify-between p-4 text-left"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Theme</p>
              <p className="mt-2 font-display text-xl font-semibold">{theme === "dark" ? "Dark" : "Light"}</p>
            </div>
            {theme === "dark" ? <SunMedium className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-sky-500" />}
          </button>
          <div className="neo-panel p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Voice search</p>
            <div className="mt-2 flex items-center gap-2">
              <Mic className="h-5 w-5 text-emerald-500" />
              <span className="font-display text-xl font-semibold">Ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
