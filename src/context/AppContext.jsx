import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  loadBookmarks,
  loadComparison,
  loadAuthUser,
  loadAuthUsers,
  loadInteractions,
  loadTheme,
  loadWatchHistory,
  saveBookmarks,
  saveComparison,
  saveAuthUser,
  saveAuthUsers,
  saveInteractions,
  saveTheme,
  saveWatchHistory
} from "../utils/storage";
import { getBackdropUrl } from "../utils/movie";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(loadTheme);
  const [bookmarks, setBookmarks] = useState(loadBookmarks);
  const [watchHistory, setWatchHistory] = useState(loadWatchHistory);
  const [comparison, setComparison] = useState(loadComparison);
  const [interactions, setInteractions] = useState(loadInteractions);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [authUser, setAuthUser] = useState(loadAuthUser);
  const [authUsers, setAuthUsers] = useState(loadAuthUsers);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    saveTheme(theme);
  }, [theme]);

  useEffect(() => saveBookmarks(bookmarks), [bookmarks]);
  useEffect(() => saveWatchHistory(watchHistory), [watchHistory]);
  useEffect(() => saveComparison(comparison), [comparison]);
  useEffect(() => saveInteractions(interactions), [interactions]);
  useEffect(() => saveAuthUser(authUser), [authUser]);
  useEffect(() => saveAuthUsers(authUsers), [authUsers]);

  const recordInteraction = useCallback((type, movie, metadata = {}) => {
    if (!movie?.id) return;
    setInteractions((current) => {
      const next = [
        {
          id: `${movie.id}-${type}-${Date.now()}`,
          movieId: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          genre_ids: movie.genre_ids || movie.genres?.map((genre) => genre.id) || [],
          type,
          timestamp: new Date().toISOString(),
          ...metadata
        },
        ...current
      ];
      return next.slice(0, 120);
    });
  }, []);

  const toggleBookmark = useCallback((movie) => {
    setBookmarks((current) => {
      const exists = current.some((item) => item.id === movie.id);
      return exists
        ? current.filter((item) => item.id !== movie.id)
        : [movie, ...current].slice(0, 60);
    });
    recordInteraction("favorite", movie);
  }, [recordInteraction]);

  const addToWatchHistory = useCallback((movie) => {
    setWatchHistory((current) => {
      const next = [movie, ...current.filter((item) => item.id !== movie.id)];
      return next.slice(0, 50);
    });
    recordInteraction("open", movie, { dwellSeconds: 24 });
    setFeaturedMovie(movie);
  }, [recordInteraction]);

  const toggleComparison = useCallback((movie) => {
    setComparison((current) => {
      const exists = current.some((item) => item.id === movie.id);
      return exists
        ? current.filter((item) => item.id !== movie.id)
        : [...current, movie].slice(-2);
    });
    recordInteraction("compare", movie);
  }, [recordInteraction]);

  const clearComparison = useCallback(() => setComparison([]), []);

  const register = useCallback(({ name, email, password }) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (authUsers.some((user) => user.email === normalizedEmail)) {
      throw new Error("An account with this email already exists. Please log in instead.");
    }
    const safeHandle = `@${String(name || email || "afterglow").toLowerCase().replace(/[^a-z0-9]+/g, "")}`;
    const user = {
      id: `user-${Date.now()}`,
      name,
      email: normalizedEmail,
      handle: safeHandle,
      visibility: "public",
      password
    };
    setAuthUsers((current) => [user, ...current]);
    setAuthUser(user);
    return user;
  }, [authUsers]);

  const login = useCallback(({ email, password }) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const existing = authUsers.find((user) => user.email === normalizedEmail);
    if (!existing) {
      throw new Error("No account found. Please register first.");
    }
    if (existing.password !== password) {
      throw new Error("Incorrect email or password.");
    }
    setAuthUser(existing);
    return existing;
  }, [authUsers]);

  const logout = useCallback(() => {
    setAuthUser(null);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      bookmarks,
      watchHistory,
      comparison,
      interactions,
      selectedMovieId,
      featuredMovie,
      featuredBackdrop: getBackdropUrl(featuredMovie?.backdrop_path || featuredMovie?.poster_path),
      authUser,
      authUsers,
      isAuthenticated: Boolean(authUser),
      setAuthUser,
      setFeaturedMovie,
      setSelectedMovieId,
      toggleBookmark,
      addToWatchHistory,
      toggleComparison,
      clearComparison,
      recordInteraction,
      register,
      login,
      logout
    }),
    [
      theme,
      bookmarks,
      watchHistory,
      comparison,
      interactions,
      selectedMovieId,
      featuredMovie,
      authUser,
      authUsers,
      toggleBookmark,
      addToWatchHistory,
      toggleComparison,
      clearComparison,
      recordInteraction,
      register,
      login,
      logout
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
