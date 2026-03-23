import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Film, Lock, Mail, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppContext } from "../context/AppContext";

export default function AuthPage() {
  const navigate = useNavigate();
  const { register, login } = useAppContext();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    try {
      if (mode === "register") {
        register(form);
      } else {
        login(form);
      }
      navigate("/", { replace: true });
    } catch (authError) {
      setError(authError.message || "Unable to continue.");
    }
  }

  return (
    <>
      <Helmet>
        <title>Afterglow | Login</title>
      </Helmet>
      <div className="grid min-h-[84vh] place-items-center">
        <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr,0.95fr]">
          <section className="glass-panel relative overflow-hidden p-8 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.35),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.3),transparent_28%),linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.98))]" />
            <div className="relative">
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm">
                <Film className="h-4 w-4 text-sky-300" />
                Sign in to access the full movie research platform
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight">Afterglow starts with your own movie space.</h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                Register once, then browse releases, save watchlists, compare films, and build your taste profile across the app.
              </p>
            </div>
          </section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="neo-panel p-8"
          >
            <div className="mb-6 inline-flex rounded-full bg-slate-950/5 p-1 dark:bg-white/5">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === "login" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : ""}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === "register" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : ""}`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" ? (
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-medium"><UserRound className="h-4 w-4" /> Name</span>
                  <input
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    className="w-full rounded-2xl border border-white/20 bg-white/55 px-4 py-3 dark:bg-white/5"
                    placeholder="Your name"
                    required
                  />
                </label>
              ) : null}
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium"><Mail className="h-4 w-4" /> Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="w-full rounded-2xl border border-white/20 bg-white/55 px-4 py-3 dark:bg-white/5"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium"><Lock className="h-4 w-4" /> Password</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  className="w-full rounded-2xl border border-white/20 bg-white/55 px-4 py-3 dark:bg-white/5"
                  placeholder="Enter password"
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  required
                />
              </label>
              {error ? <p className="text-sm text-rose-500">{error}</p> : null}
              <button type="submit" className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
                {mode === "register" ? "Create account" : "Login"}
              </button>
            </form>

            {mode === "login" ? (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-300">
                New here? Switch to Register and create your account first.
              </p>
            ) : (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-300">
                Already registered? Switch back to Login and use the same email/password.
              </p>
            )}
          </motion.section>
        </div>
      </div>
    </>
  );
}
