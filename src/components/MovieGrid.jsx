import { MovieCard } from "./MovieCard";

export function MovieGrid({ movies }) {
  if (!movies.length) {
    return (
      <div className="glass-panel flex min-h-64 items-center justify-center p-8 text-center text-sm text-slate-500 dark:text-slate-300">
        No movies found yet. Try a different keyword or load the trending feed.
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
