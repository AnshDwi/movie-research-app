import { useQuery } from "@tanstack/react-query";
import {
  getNowPlayingMovies,
  getTrendingMovies,
  getUpcomingMovies,
  searchMovies
} from "../services/tmdb";

const REFRESH_INTERVAL = Number(import.meta.env.VITE_NOTIFICATION_POLL_INTERVAL_MS || 180000);

export function useMovieCollection(query) {
  const trending = useQuery({
    queryKey: ["movies", "trending"],
    queryFn: () => getTrendingMovies(1),
    refetchInterval: REFRESH_INTERVAL
  });

  const nowPlaying = useQuery({
    queryKey: ["movies", "now-playing"],
    queryFn: () => getNowPlayingMovies(1),
    refetchInterval: REFRESH_INTERVAL
  });

  const upcoming = useQuery({
    queryKey: ["movies", "upcoming"],
    queryFn: () => getUpcomingMovies(1),
    staleTime: 1000 * 60 * 5
  });

  const search = useQuery({
    queryKey: ["movies", "search", query],
    queryFn: () => searchMovies(query, 1),
    enabled: Boolean(query)
  });

  return {
    trending,
    nowPlaying,
    upcoming,
    search
  };
}
