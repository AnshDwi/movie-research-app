import { LogOut, Sparkles } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

export function AppShell({ children }) {
  const { featuredBackdrop, isAuthenticated, authUser, logout } = useAppContext();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(249,115,22,0.14),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.94),rgba(227,238,255,0.76))] dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(249,115,22,0.16),transparent_24%),linear-gradient(135deg,rgba(3,7,18,0.96),rgba(15,23,42,0.98))]" />
        {featuredBackdrop ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl saturate-150 dark:opacity-25"
            style={{ backgroundImage: `url(${featuredBackdrop})` }}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/30 dark:via-slate-950/10 dark:to-slate-950/30" />
      </div>

      <div className="relative mx-auto max-w-[1680px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-700 shadow-soft backdrop-blur-xl dark:bg-white/5 dark:text-slate-200">
            <Sparkles className="h-4 w-4 text-sky-500" />
            Production-grade cinematic intelligence platform
          </div>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/40 px-4 py-2 text-sm font-semibold shadow-soft backdrop-blur-xl dark:bg-white/5"
            >
              <LogOut className="h-4 w-4" />
              {authUser?.name || "Logout"}
            </button>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
