const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || "https://api.themoviedb.org/3";

function buildUrl(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("api_key", API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

async function request(path, params = {}) {
  if (!API_KEY) {
    throw new Error("Missing VITE_TMDB_API_KEY");
  }

  const response = await fetch(buildUrl(path, params));
  if (!response.ok) {
    throw new Error(`TMDB request failed with status ${response.status}`);
  }
  return response.json();
}

export async function searchMovies(query, page = 1) {
  return request("/search/movie", { query, page, include_adult: false });
}

export async function getTrendingMovies(page = 1) {
  return request("/trending/movie/week", { page });
}

export async function getNowPlayingMovies(page = 1) {
  return request("/movie/now_playing", { page, region: "US" });
}

export async function getUpcomingMovies(page = 1) {
  return request("/movie/upcoming", { page, region: "US" });
}

export async function getMovieDetails(movieId) {
  return request(`/movie/${movieId}`, {
    append_to_response: "credits,videos,reviews,similar,images,watch/providers"
  });
}

export async function getMoviePreview(movieId) {
  const data = await request(`/movie/${movieId}/videos`);
  return data.results?.find((item) => item.type === "Trailer" && item.site === "YouTube") || null;
}

export async function discoverMoviesByGenres(genres, page = 1, options = {}) {
  return request("/discover/movie", {
    page,
    sort_by: options.sort_by || "popularity.desc",
    with_genres: genres.join(","),
    vote_count_gte: options.vote_count_gte || 150,
    primary_release_date_gte: options.primary_release_date_gte,
    primary_release_date_lte: options.primary_release_date_lte,
    with_original_language: options.with_original_language
  });
}

export async function getMovieGenres() {
  const data = await request("/genre/movie/list");
  return data.genres || [];
}
