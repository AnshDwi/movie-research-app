import { discoverMoviesByGenres } from "./tmdb";

const MOOD_GENRE_MAP = {
  uplifting: [35, 10751, 10402],
  intense: [28, 53, 80],
  dreamy: [14, 878, 10749],
  thoughtful: [18, 9648, 36],
  spooky: [27, 9648, 53]
};

const COMMUNITY_PROFILES = [
  { name: "Noir Oracle", genres: [53, 80, 9648], affinity: "Chases twists, moody framing, and tension spikes.", overlapTitles: ["Se7en", "Prisoners", "Gone Girl"] },
  { name: "Sunset Dreamer", genres: [10749, 18, 14], affinity: "Falls for lush emotion, longing, and visual poetry.", overlapTitles: ["Her", "La La Land", "Past Lives"] },
  { name: "Cosmic Pulse", genres: [878, 12, 28], affinity: "Optimizes for propulsion, scale, and world-building.", overlapTitles: ["Dune", "Interstellar", "Mad Max: Fury Road"] },
  { name: "Velvet Laughs", genres: [35, 10751, 16], affinity: "Curates comfort watches and endlessly rewatchable fun.", overlapTitles: ["Paddington 2", "Barbie", "Spider-Verse"] }
];

function getGenres(movie) {
  return movie.genre_ids || movie.genres?.map((genre) => genre.id) || [];
}

function countGenres(items) {
  return items.reduce((map, movie) => {
    getGenres(movie).forEach((genreId) => {
      map[genreId] = (map[genreId] || 0) + 1;
    });
    return map;
  }, {});
}

function topGenres(items) {
  return Object.entries(countGenres(items))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([genreId]) => Number(genreId));
}

function interactionWeight(interactionType) {
  if (interactionType === "favorite") return 3;
  if (interactionType === "compare") return 2;
  if (interactionType === "open") return 1;
  return 1;
}

function deriveTasteVector({ watchHistory, bookmarks, interactions }) {
  const scores = {};
  [...watchHistory, ...bookmarks].forEach((movie) => {
    getGenres(movie).forEach((genreId) => {
      scores[genreId] = (scores[genreId] || 0) + 2;
    });
  });

  interactions.forEach((interaction) => {
    interaction.genre_ids?.forEach((genreId) => {
      scores[genreId] = (scores[genreId] || 0) + interactionWeight(interaction.type);
    });
  });

  return scores;
}

export async function getRecommendations({ watchHistory, bookmarks, interactions }) {
  const apiUrl = import.meta.env.VITE_RECOMMENDER_API_URL;
  const tasteVector = deriveTasteVector({ watchHistory, bookmarks, interactions });
  const profileGenres = Object.entries(tasteVector)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genreId]) => Number(genreId));

  if (apiUrl && profileGenres.length) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchHistory, bookmarks, interactions, genres: profileGenres })
      });
      if (response.ok) {
        return response.json();
      }
    } catch {
      // local fallback
    }
  }

  if (!profileGenres.length) {
    return {
      picks: [],
      explanation: "Interact with a few titles and the hybrid recommender will blend favorites, opens, and comparison behavior."
    };
  }

  const data = await discoverMoviesByGenres(profileGenres, 1);
  const seedTitle = bookmarks[0]?.title || watchHistory[0]?.title || "your recent picks";
  return {
    picks: data.results || [],
    explanation: `If you liked ${seedTitle}, you'll love this lane because it combines your top content signals with collaborative taste patterns in genres ${profileGenres.join(", ")}.`
  };
}

export async function getMoodSuggestions(mood) {
  const genres = MOOD_GENRE_MAP[mood] || MOOD_GENRE_MAP.uplifting;
  const moodOptions = {
    uplifting: { sort_by: "vote_average.desc", vote_count_gte: 400 },
    intense: { sort_by: "popularity.desc", vote_count_gte: 250 },
    dreamy: { sort_by: "primary_release_date.desc", vote_count_gte: 120 },
    thoughtful: { sort_by: "vote_count.desc", vote_count_gte: 300 },
    spooky: { sort_by: "revenue.desc", vote_count_gte: 180 }
  };
  const pageMap = {
    uplifting: 1,
    intense: 2,
    dreamy: 3,
    thoughtful: 4,
    spooky: 5
  };
  const data = await discoverMoviesByGenres(genres, pageMap[mood] || 1, moodOptions[mood] || {});
  return data.results || [];
}

export function getSimilarTasteUsers({ watchHistory, bookmarks, interactions }) {
  const profileGenres = topGenres([
    ...watchHistory,
    ...bookmarks,
    ...interactions.map((item) => ({ genre_ids: item.genre_ids || [] }))
  ]);
  if (!profileGenres.length) return [];

  return COMMUNITY_PROFILES.map((profile) => {
    const overlap = profile.genres.filter((genreId) => profileGenres.includes(genreId)).length;
    return {
      ...profile,
      overlap,
      compatibility: Math.min(98, 58 + overlap * 16)
    };
  })
    .filter((profile) => profile.overlap > 0)
    .sort((a, b) => b.compatibility - a.compatibility);
}
