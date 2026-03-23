import { useState } from "react";
import { Brain, Drama, MoonStar, Zap } from "lucide-react";
import { getMoodSuggestions } from "../../services/recommendation";
import { SectionPanel } from "../ui/SectionPanel";

const MOODS = [
  { id: "uplifting", label: "Uplifting", icon: Drama, description: "Bright, warm, rewatchable energy." },
  { id: "intense", label: "Intense", icon: Zap, description: "Adrenaline, suspense, and edge." },
  { id: "dreamy", label: "Dreamy", icon: MoonStar, description: "Lush visuals and emotional drift." },
  { id: "thoughtful", label: "Thoughtful", icon: Brain, description: "Ideas, tension, and reflection." }
];

export function MoodBoard({ onResults, activeMoodLabel, resultCount }) {
  const [activeMood, setActiveMood] = useState("uplifting");
  const [loading, setLoading] = useState(false);

  async function handleMoodSelect(mood) {
    setActiveMood(mood);
    setLoading(true);
    try {
      const suggestions = await getMoodSuggestions(mood);
      const selectedMood = MOODS.find((item) => item.id === mood);
      onResults(suggestions, selectedMood?.label || mood);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionPanel title="Mood-based Movie Finder" eyebrow="Unique Feature">
      <div className="grid gap-3">
        {MOODS.map((mood) => {
          const Icon = mood.icon;
          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => handleMoodSelect(mood.id)}
              className={`neo-panel flex items-center gap-4 p-4 text-left transition ${
                activeMood === mood.id ? "ring-2 ring-sky-400/70" : ""
              }`}
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold">{mood.label}</p>
                <p className="text-sm text-slate-500 dark:text-slate-300">{mood.description}</p>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-300">
        <p>{loading ? "Mapping your mood to a live recommendation lane..." : "Choose how you feel and the discovery feed reshapes itself."}</p>
        {activeMoodLabel ? (
          <p className="rounded-2xl bg-sky-500/10 px-3 py-2 font-medium text-sky-700 dark:text-sky-300">
            Active mood: {activeMoodLabel} with {resultCount} movies loaded into the discovery section.
          </p>
        ) : null}
      </div>
    </SectionPanel>
  );
}
