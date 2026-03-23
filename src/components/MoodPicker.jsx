import { useState } from "react";
import { getMoodSuggestions } from "../services/recommendation";
import { SectionPanel } from "./SectionPanel";

const MOODS = [
  { id: "uplifting", label: "Need a lift" },
  { id: "intense", label: "Want intensity" },
  { id: "dreamy", label: "Feel dreamy" },
  { id: "thoughtful", label: "Think deeply" },
  { id: "spooky", label: "Crave suspense" }
];

export function MoodPicker({ onResults }) {
  const [activeMood, setActiveMood] = useState("uplifting");
  const [loading, setLoading] = useState(false);

  async function handleMoodSelect(mood) {
    setActiveMood(mood);
    setLoading(true);
    try {
      const suggestions = await getMoodSuggestions(mood);
      onResults(suggestions);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionPanel title="Mood Matcher" eyebrow="Unique Add-on">
      <div className="flex flex-wrap gap-2">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            type="button"
            onClick={() => handleMoodSelect(mood.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeMood === mood.id
                ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                : "bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-200"
            }`}
          >
            {mood.label}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-300">
        {loading ? "Pulling mood-aligned suggestions..." : "Pick a mood to remix the discovery grid around your current energy."}
      </p>
    </SectionPanel>
  );
}
