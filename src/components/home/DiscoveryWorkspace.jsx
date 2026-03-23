import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { useDebounce } from "../../hooks/useDebounce";
import { useMovieCollection } from "../../hooks/useMovieData";
import { getRecommendations, getSimilarTasteUsers } from "../../services/recommendation";
import { getDidYouMean } from "../../services/search";
import { isNewRelease } from "../../utils/movie";
import { SearchCommandBar } from "./SearchCommandBar";
import { ReleaseRail } from "./ReleaseRail";
import { ImmersiveHub } from "./ImmersiveHub";
import { AIPanel } from "./AIPanel";
import { ProfilePanel } from "./ProfilePanel";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { ComparisonStudio } from "./ComparisonStudio";
import { MovieDetailModal } from "./MovieDetailModal";
import { NotificationManager } from "./NotificationManager";
import { MoodBoard } from "./MoodBoard";
import { MobileAccordion } from "../ui/MobileAccordion";

export function DiscoveryWorkspace() {
  const { bookmarks, watchHistory, interactions, setSelectedMovieId } = useAppContext();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceSupportMessage, setVoiceSupportMessage] = useState("");
  const [activeMoodResults, setActiveMoodResults] = useState(null);
  const [activeMoodLabel, setActiveMoodLabel] = useState("");

  const debouncedQuery = useDebounce(submittedQuery || query, 350);
  const { trending, nowPlaying, upcoming, search } = useMovieCollection(debouncedQuery);

  const suggestionTitles = useMemo(
    () => [
      ...(trending.data?.results || []).map((movie) => movie.title),
      ...(nowPlaying.data?.results || []).map((movie) => movie.title),
      ...(upcoming.data?.results || []).map((movie) => movie.title)
    ],
    [trending.data, nowPlaying.data, upcoming.data]
  );

  const activeMovies = useMemo(() => {
    if (activeMoodResults) return activeMoodResults;
    if (debouncedQuery) return search.data?.results || [];
    return trending.data?.results || [];
  }, [activeMoodResults, debouncedQuery, search.data, trending.data]);

  const resultLabel = useMemo(() => {
    if (activeMoodLabel) {
      return `${activeMoodLabel} mood is active with ${activeMovies.length} movies`;
    }
    if (debouncedQuery) {
      if (search.isLoading) {
        return `Searching for "${debouncedQuery}"...`;
      }
      return activeMovies.length
        ? `Showing ${activeMovies.length} results for "${debouncedQuery}"`
        : `No results found for "${debouncedQuery}"`;
    }
    return `Showing ${activeMovies.length} trending movies`;
  }, [activeMoodLabel, activeMovies.length, debouncedQuery, search.isLoading]);

  const nowPlayingWithBadges = useMemo(
    () => (nowPlaying.data?.results || []).map((movie) => ({ ...movie, isNewRelease: isNewRelease(movie.release_date) })),
    [nowPlaying.data]
  );

  const similarUsers = useMemo(
    () => getSimilarTasteUsers({ watchHistory, bookmarks, interactions }),
    [watchHistory, bookmarks, interactions]
  );

  const [recommendationState, setRecommendationState] = useState({
    picks: [],
    explanation: "Interact with titles to unlock a hybrid recommendation stream."
  });

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const localOrigins = ["localhost", "127.0.0.1"];
    const isSafeContext = window.isSecureContext || localOrigins.includes(window.location.hostname);

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      setVoiceSupportMessage("Voice search is not supported in this browser. Chrome on desktop or Android works best.");
      return;
    }

    if (!isSafeContext) {
      setVoiceSupported(false);
      setVoiceSupportMessage("Voice search needs HTTPS or localhost. On your phone, use the app over HTTPS for microphone-based search.");
      return;
    }

    setVoiceSupported(true);
    setVoiceSupportMessage("");
  }, []);

  useEffect(() => {
    getRecommendations({ watchHistory, bookmarks, interactions })
      .then(setRecommendationState)
      .catch(() => {
        setRecommendationState({
          picks: [],
          explanation: "Recommendations are waiting on TMDB or the optional backend recommender."
        });
      });
  }, [watchHistory, bookmarks, interactions]);

  const didYouMean = getDidYouMean(debouncedQuery, suggestionTitles);

  return (
    <>
      <NotificationManager nowPlaying={nowPlayingWithBadges} />
      <div className="grid gap-6 2xl:grid-cols-[1.55fr,0.95fr]">
        <div className="space-y-6">
          <SearchCommandBar
            value={query}
            onChange={(value) => {
              setQuery(value);
              setSubmittedQuery("");
              setActiveMoodResults(null);
              setActiveMoodLabel("");
            }}
            didYouMean={didYouMean}
            onApplySuggestion={(value) => {
              setQuery(value);
              setSubmittedQuery(value);
            }}
            voiceSupported={voiceSupported}
            voiceSupportMessage={voiceSupportMessage}
            resultLabel={resultLabel}
            onSubmit={(value) => {
              setActiveMoodResults(null);
              setActiveMoodLabel("");
              setSubmittedQuery(value.trim());
            }}
          />
          <ReleaseRail
            title="Now Playing"
            eyebrow="Real-time"
            movies={nowPlayingWithBadges}
            loading={nowPlaying.isLoading}
            onSelectMovie={setSelectedMovieId}
          />
          <ImmersiveHub
            movies={activeMovies}
            loading={trending.isLoading || search.isLoading}
            onSelectMovie={setSelectedMovieId}
            contextLabel={activeMoodLabel || (debouncedQuery ? `Search: ${debouncedQuery}` : "Trending")}
          />
          <ReleaseRail
            title="Upcoming"
            eyebrow="Release Radar"
            movies={upcoming.data?.results || []}
            loading={upcoming.isLoading}
            onSelectMovie={setSelectedMovieId}
          />
          <div className="hidden md:block">
            <ComparisonStudio />
          </div>
          <MobileAccordion title="Comparison Studio">
            <ComparisonStudio />
          </MobileAccordion>
          <div className="hidden md:block">
            <AnalyticsDashboard
              watchHistory={watchHistory}
              bookmarks={bookmarks}
              interactions={interactions}
              recommendations={recommendationState.picks}
            />
          </div>
          <MobileAccordion title="Analytics Dashboard">
            <AnalyticsDashboard
              watchHistory={watchHistory}
              bookmarks={bookmarks}
              interactions={interactions}
              recommendations={recommendationState.picks}
            />
          </MobileAccordion>
        </div>

        <div className="space-y-6">
          <MoodBoard
            onResults={(results, moodLabel) => {
              setActiveMoodResults(results);
              setActiveMoodLabel(moodLabel);
              setSubmittedQuery("");
              setQuery("");
              window.scrollTo({ top: 420, behavior: "smooth" });
            }}
            activeMoodLabel={activeMoodLabel}
            resultCount={activeMoodResults?.length || 0}
          />
          <div className="hidden md:block">
            <AIPanel
              recommendations={recommendationState.picks}
              explanation={recommendationState.explanation}
              similarUsers={similarUsers}
              onSelectMovie={setSelectedMovieId}
            />
          </div>
          <MobileAccordion title="AI Intelligence">
            <AIPanel
              recommendations={recommendationState.picks}
              explanation={recommendationState.explanation}
              similarUsers={similarUsers}
              onSelectMovie={setSelectedMovieId}
            />
          </MobileAccordion>
          <div className="hidden md:block">
            <ProfilePanel />
          </div>
          <MobileAccordion title="Profile & Watchlists">
            <ProfilePanel />
          </MobileAccordion>
        </div>
      </div>
      <MovieDetailModal />
    </>
  );
}
