import { ArrowRight, Mic, Search, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SectionPanel } from "../ui/SectionPanel";

export function SearchCommandBar({
  value,
  onChange,
  didYouMean,
  onApplySuggestion,
  voiceSupported,
  voiceSupportMessage,
  resultLabel,
  onSubmit
}) {
  const [listening, setListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return undefined;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      onChange(transcript);
      setVoiceMessage(transcript ? `Heard: ${transcript}` : "No speech detected.");
      setListening(false);
    };
    recognition.onerror = (event) => {
      setVoiceMessage(`Voice search unavailable: ${event.error}`);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.stop();
      } catch {
        // Ignore stop errors from unsupported or idle recognition instances.
      }
    };
  }, [onChange]);

  return (
    <SectionPanel title="Command Search" eyebrow="Smart Search">
      <div className="grid gap-4 lg:grid-cols-[1fr,auto,auto]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSubmit?.(value);
              }
            }}
            placeholder="Search movies, themes, moods, franchises, release years..."
            className="w-full rounded-[1.5rem] border border-white/20 bg-white/55 py-4 pl-12 pr-4 text-sm text-slate-900 backdrop-blur-xl transition focus:border-sky-400 dark:bg-white/5 dark:text-white"
          />
        </label>
        <button
          type="button"
          onClick={() => onSubmit?.(value)}
          className="neo-panel inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold"
        >
          <Search className="h-4 w-4 text-sky-500" />
          Search now
        </button>
        <button
          type="button"
          onClick={() => onChange("")}
          className="neo-panel inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold"
        >
          <Sparkles className="h-4 w-4 text-sky-500" />
          Trending reset
        </button>
        <button
          type="button"
          disabled={!voiceSupported}
          onClick={() => {
            if (!recognitionRef.current) return;
            const startRecognition = async () => {
              try {
                if (navigator.mediaDevices?.getUserMedia) {
                  await navigator.mediaDevices.getUserMedia({ audio: true });
                }
                setVoiceMessage("Listening for your movie search...");
                setListening(true);
                recognitionRef.current.start();
              } catch {
                setListening(false);
                setVoiceMessage("Microphone permission was denied or unavailable. Please allow mic access and try again.");
              }
            };

            startRecognition();
          }}
          className="neo-panel inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60 lg:col-start-3"
        >
          <Mic className={`h-4 w-4 ${listening ? "text-rose-500" : "text-emerald-500"}`} />
          {listening ? "Listening..." : "Voice search"}
        </button>
      </div>
      {didYouMean && didYouMean.toLowerCase() !== value.toLowerCase() ? (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          type="button"
          onClick={() => onApplySuggestion(didYouMean)}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-600 dark:text-sky-300"
        >
          <Wand2 className="h-4 w-4" />
          Did you mean {didYouMean}?
        </motion.button>
      ) : null}
      {resultLabel ? (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-950/5 px-4 py-2 text-sm font-medium text-slate-600 dark:bg-white/5 dark:text-slate-200">
          <ArrowRight className="h-4 w-4 text-sky-500" />
          {resultLabel}
        </div>
      ) : null}
      {voiceMessage ? <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">{voiceMessage}</p> : null}
      {!voiceSupported ? (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-300">
          {voiceSupportMessage || "Voice search depends on browser speech-recognition support and microphone permission."}
        </p>
      ) : null}
    </SectionPanel>
  );
}
