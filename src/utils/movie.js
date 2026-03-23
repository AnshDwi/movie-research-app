export function getYear(dateString) {
  return dateString ? new Date(dateString).getFullYear() : "TBA";
}

export function getPosterUrl(path) {
  const baseUrl = import.meta.env.VITE_IMAGE_BASE_URL || "https://image.tmdb.org/t/p/w500";
  return path ? `${baseUrl}${path}` : "https://placehold.co/600x900/0f172a/e2e8f0?text=No+Poster";
}

export function getBackdropUrl(path) {
  const baseUrl = import.meta.env.VITE_IMAGE_BASE_URL || "https://image.tmdb.org/t/p/w500";
  return path ? `${baseUrl}${path}` : "";
}

export function formatRuntime(minutes) {
  if (!minutes) return "Unknown runtime";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function scoreToHeat(score) {
  if (score >= 80) return "bg-lime-400";
  if (score >= 60) return "bg-emerald-400";
  if (score >= 40) return "bg-amber-400";
  return "bg-rose-400";
}

export function isNewRelease(dateString) {
  if (!dateString) return false;
  const releaseDate = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - releaseDate.getTime();
  return diff >= 0 && diff <= 1000 * 60 * 60 * 24 * 30;
}

export function normalizeScore(value, max = 10) {
  return Number((((value || 0) / max) * 100).toFixed(1));
}

export function buildRadarMetrics(movie) {
  return [
    { metric: "Rating", value: normalizeScore(movie.vote_average || 0) },
    { metric: "Popularity", value: Math.min(100, Math.round(movie.popularity || 0)) },
    { metric: "Runtime", value: Math.min(100, Math.round(((movie.runtime || 90) / 180) * 100)) },
    { metric: "Votes", value: Math.min(100, Math.round(((movie.vote_count || 100) / 3000) * 100)) }
  ];
}
