const THEME_KEY = "afterglow-theme";
const BOOKMARKS_KEY = "afterglow-bookmarks";
const HISTORY_KEY = "afterglow-history";
const COMPARISON_KEY = "afterglow-comparison";
const INTERACTIONS_KEY = "afterglow-interactions";
const AUTH_USER_KEY = "afterglow-auth-user";
const AUTH_USERS_KEY = "afterglow-auth-users";

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function loadTheme() {
  return localStorage.getItem(THEME_KEY) || "dark";
}

export function saveTheme(value) {
  localStorage.setItem(THEME_KEY, value);
}

export function loadBookmarks() {
  return readJson(BOOKMARKS_KEY, []);
}

export function saveBookmarks(value) {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(value));
}

export function loadWatchHistory() {
  return readJson(HISTORY_KEY, []);
}

export function saveWatchHistory(value) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(value));
}

export function loadComparison() {
  return readJson(COMPARISON_KEY, []);
}

export function saveComparison(value) {
  localStorage.setItem(COMPARISON_KEY, JSON.stringify(value));
}

export function loadInteractions() {
  return readJson(INTERACTIONS_KEY, []);
}

export function saveInteractions(value) {
  localStorage.setItem(INTERACTIONS_KEY, JSON.stringify(value));
}

export function loadAuthUser() {
  return readJson(AUTH_USER_KEY, null);
}

export function saveAuthUser(value) {
  if (!value) {
    localStorage.removeItem(AUTH_USER_KEY);
    return;
  }
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(value));
}

export function loadAuthUsers() {
  return readJson(AUTH_USERS_KEY, []);
}

export function saveAuthUsers(value) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(value));
}
