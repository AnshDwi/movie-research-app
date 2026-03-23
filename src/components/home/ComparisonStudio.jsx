import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from "recharts";
import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { getMovieDetails } from "../../services/tmdb";
import { buildRadarMetrics, getPosterUrl } from "../../utils/movie";
import { SectionPanel } from "../ui/SectionPanel";

export function ComparisonStudio() {
  const { comparison, clearComparison } = useAppContext();
  const [details, setDetails] = useState([]);

  useEffect(() => {
    if (comparison.length !== 2) {
      setDetails([]);
      return;
    }
    Promise.all(comparison.map((movie) => getMovieDetails(movie.id)))
      .then(setDetails)
      .catch(() => setDetails([]));
  }, [comparison]);

  const radarData = details.length === 2
    ? buildRadarMetrics(details[0]).map((metric, index) => ({
        metric: metric.metric,
        first: metric.value,
        second: buildRadarMetrics(details[1])[index].value
      }))
    : [];

  const movieLabels = {
    first: details[0]?.title || "Movie 1",
    second: details[1]?.title || "Movie 2"
  };

  return (
    <SectionPanel
      title="Comparison Studio"
      eyebrow="Radar View"
      action={
        comparison.length ? (
          <button type="button" onClick={clearComparison} className="rounded-full border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
            Clear
          </button>
        ) : null
      }
    >
      {comparison.length ? (
        <div className="mb-5 flex flex-wrap gap-3">
          {comparison.map((movie) => (
            <div key={movie.id} className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/40 px-4 py-2 text-sm dark:bg-white/5">
              <img src={getPosterUrl(movie.poster_path)} alt={movie.title} className="h-10 w-10 rounded-full object-cover" />
              <span className="font-medium">{movie.title}</span>
            </div>
          ))}
        </div>
      ) : null}
      {details.length === 2 ? (
        <div className="grid gap-5 xl:grid-cols-[0.95fr,1.05fr]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
            {details.map((movie) => (
              <div key={movie.id} className="neo-panel p-4">
                <img src={getPosterUrl(movie.poster_path)} alt={movie.title} className="aspect-[2/3] rounded-[1.5rem] object-cover" />
                <h3 className="mt-4 font-display text-xl font-semibold">{movie.title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{movie.overview}</p>
              </div>
            ))}
          </div>
          <div className="neo-panel p-5">
            <p className="mb-3 font-display text-lg font-semibold">Movie comparison radar</p>
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <Radar name={movieLabels.first} dataKey="first" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.32} />
                  <Radar name={movieLabels.second} dataKey="second" stroke="#f97316" fill="#f97316" fillOpacity={0.24} />
                  <Tooltip formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-2 text-sky-700 dark:text-sky-300">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                {movieLabels.first}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-2 text-orange-700 dark:text-orange-300">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                {movieLabels.second}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-white/20 bg-white/30 p-5 text-sm text-slate-500 dark:bg-white/5 dark:text-slate-300">
          {comparison.length === 1
            ? "One movie selected. Add one more using any Compare button to unlock the radar chart."
            : "Add two movies using the Compare button on any movie card to unlock the radar chart and side-by-side comparison."}
        </div>
      )}
    </SectionPanel>
  );
}
