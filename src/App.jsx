import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AppShell } from "./components/layout/AppShell";
import { RouteLoader } from "./components/ui/RouteLoader";
import { useAppContext } from "./context/AppContext";

const HomePage = lazy(() => import("./pages/HomePage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const WatchPartyPage = lazy(() => import("./pages/WatchPartyPage"));

export default function App() {
  const { isAuthenticated } = useAppContext();

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route
              path="/auth"
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <AuthPage />
                  </motion.div>
                )
              }
            />
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <HomePage />
                  </motion.div>
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route
              path="/watch-party"
              element={
                isAuthenticated ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <WatchPartyPage />
                  </motion.div>
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route
              path="/watch-party/:roomId"
              element={
                isAuthenticated ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <WatchPartyPage />
                  </motion.div>
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/auth"} replace />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </AppShell>
  );
}
