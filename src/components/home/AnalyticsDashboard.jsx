import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { getMovieGenres } from "../../services/tmdb";
import { SectionPanel } from "../ui/SectionPanel";

function genreDistribution(items, genreMap) {
  const counts = {};
  items.forEach((movie) => {
    (movie.genre_ids || movie.genres?.map((genre) => genre.id) || []).forEach((genreId) => {
      counts[genreId] = (counts[genreId] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([genre, value]) => ({
      genreId: genre,
      genre: genreMap[genre] || `Genre ${genre}`,
      count: value
    }));
}

function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/20 bg-slate-950/95 px-4 py-3 text-sm text-white shadow-2xl">
      <p className="font-semibold">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="mt-1 text-slate-200">
          {formatter(entry)}
        </p>
      ))}
    </div>
  );
}

export function AnalyticsDashboard({ watchHistory, bookmarks, interactions, recommendations }) {
  const { data: genres = [] } = useQuery({
    queryKey: ["movie-genres"],
    queryFn: getMovieGenres
  });

  const genreMap = genres.reduce((accumulator, genre) => {
    accumulator[genre.id] = genre.name;
    return accumulator;
  }, {});

  const genreData = genreDistribution([...watchHistory, ...bookmarks], genreMap);
  const interactionData = [
    { name: "Opens", count: interactions.filter((item) => item.type === "open").length },
    { name: "Favorites", count: interactions.filter((item) => item.type === "favorite").length },
    { name: "Compares", count: interactions.filter((item) => item.type === "compare").length }
  ];

  const radarData = [
    { metric: "Coverage", score: Math.min(100, watchHistory.length * 8) },
    { metric: "Accuracy", score: Math.min(100, recommendations.length * 18) },
    { metric: "Freshness", score: 84 },
    { metric: "Diversity", score: Math.min(100, genreData.length * 18) }
  ];

  return (
    <SectionPanel title="Analytics Dashboard" eyebrow="Data Visualization">
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="neo-panel p-5">
          <p className="mb-3 font-display text-lg font-semibold">Genre distribution</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genreData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                <XAxis dataKey="genre" />
                <YAxis />
                <Tooltip
                  cursor={{ fill: "rgba(56, 189, 248, 0.10)" }}
                  content={
                    <ChartTooltip
                      formatter={(entry) => `${entry.payload.count} saved/opened movies`}
                    />
                  }
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="neo-panel p-5">
          <p className="mb-3 font-display text-lg font-semibold">Recommendation accuracy</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <Radar dataKey="score" fill="#f97316" fillOpacity={0.38} stroke="#f97316" />
                <Tooltip
                  content={
                    <ChartTooltip
                      formatter={(entry) => `${entry.payload.score}%`}
                    />
                  }
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="mt-5 neo-panel p-5">
        <p className="mb-3 font-display text-lg font-semibold">Watch patterns</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={interactionData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  cursor={{ fill: "rgba(79, 209, 197, 0.10)" }}
                  content={
                    <ChartTooltip
                      formatter={(entry) => `${entry.payload.count} interactions`}
                    />
                  }
                />
                <Bar dataKey="count" fill="#4fd1c5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
      </div>
    </SectionPanel>
  );
}
