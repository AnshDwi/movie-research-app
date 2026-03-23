import { AnimatePresence, motion } from "framer-motion";
import { Copy, Link2, Lock, PlusCircle, Radio, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useWatchParty } from "../../context/WatchPartyContext";
import { useMovieCollection } from "../../hooks/useMovieData";
import { getMoviePreview } from "../../services/tmdb";
import { getPosterUrl } from "../../utils/movie";

function formatMovieForRoom(movie, trailer) {
  return {
    id: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
    overview: movie.overview,
    year: movie.release_date?.slice(0, 4) || "TBA",
    trailerKey: trailer.key
  };
}

export function WatchPartyLobby() {
  const { createRoomAndEnter, joinRoom, error, roomPreview, status } = useWatchParty();
  const { trending, nowPlaying } = useMovieCollection("");
  const [roomName, setRoomName] = useState("Afterglow Watch Party");
  const [privacy, setPrivacy] = useState("private");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");

  const movies = useMemo(() => {
    const pool = [...(nowPlaying.data?.results || []), ...(trending.data?.results || [])];
    const deduped = new Map();
    pool.forEach((movie) => {
      if (!deduped.has(movie.id)) {
        deduped.set(movie.id, movie);
      }
    });
    return Array.from(deduped.values()).slice(0, 10);
  }, [nowPlaying.data?.results, trending.data?.results]);

  const handleCreateRoom = async () => {
    if (!selectedMovie) {
      setLocalError("Pick a movie trailer before starting the watch party.");
      return;
    }

    setBusy(true);
    setLocalError("");
    try {
      const trailer = await getMoviePreview(selectedMovie.id);
      if (!trailer?.key) {
        throw new Error("This movie does not have a YouTube trailer available right now.");
      }

      await createRoomAndEnter({
        roomName,
        privacy,
        movie: formatMovieForRoom(selectedMovie, trailer)
      });
    } catch (createError) {
      setLocalError(createError.message || "Unable to create the watch party.");
    } finally {
      setBusy(false);
    }
  };

  const handleJoinRoom = async () => {
    setBusy(true);
    setLocalError("");
    try {
      await joinRoom(joinRoomId, inviteToken);
    } catch (joinError) {
      setLocalError(joinError.message || "Unable to join this room.");
    } finally {
      setBusy(false);
    }
  };

  const helperError = localError || error;

  return (
    <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
      <div className="glass-panel overflow-hidden p-5 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-400">Watch Party</p>
            <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-5xl">
              Start a shared trailer room with synced playback and live chat.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Create a party, pick a trailer, and invite your crew into a Netflix-style room with host controls,
              reactions, and live presence.
            </p>
          </div>
          <div className="neo-panel inline-flex items-center gap-3 px-4 py-3 text-sm text-slate-300">
            <Radio className="h-5 w-5 text-emerald-400" />
            {status === "joining" || status === "creating" ? "Preparing room..." : "Real-time sync ready"}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Room name</span>
              <input
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white"
                placeholder="Afterglow Watch Party"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              {["private", "public"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPrivacy(mode)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    privacy === mode
                      ? "border-sky-400 bg-sky-500/15 text-white"
                      : "border-white/10 bg-slate-950/30 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {mode === "private" ? <Lock className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                    <span className="font-semibold capitalize">{mode}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    {mode === "private" ? "Invite-only link with token." : "Easy link sharing for your group."}
                  </p>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCreateRoom}
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"
            >
              <PlusCircle className="h-4 w-4" />
              {busy ? "Creating..." : "Create watch party"}
            </button>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/35 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Pick the opening trailer</p>
                <p className="mt-1 text-sm text-slate-300">The selected movie becomes the shared room video.</p>
              </div>
              {selectedMovie ? (
                <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                  {selectedMovie.title}
                </div>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {movies.map((movie) => {
                const isSelected = selectedMovie?.id === movie.id;
                return (
                  <button
                    key={movie.id}
                    type="button"
                    onClick={() => setSelectedMovie(movie)}
                    className={`overflow-hidden rounded-[1.5rem] border text-left transition ${
                      isSelected
                        ? "border-sky-400 bg-sky-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <img
                      src={getPosterUrl(movie.poster_path)}
                      alt={movie.title}
                      className="aspect-[16/9] w-full object-cover"
                      loading="lazy"
                    />
                    <div className="p-3">
                      <p className="line-clamp-1 font-display text-lg font-semibold text-white">{movie.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                        {movie.release_date?.slice(0, 4) || "Upcoming"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-panel p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <Link2 className="h-5 w-5 text-sky-400" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Join by room ID</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-white">Reconnect or jump into a live room</h2>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <input
              value={joinRoomId}
              onChange={(event) => setJoinRoomId(event.target.value.toUpperCase())}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white"
              placeholder="Room ID"
            />
            <input
              value={inviteToken}
              onChange={(event) => setInviteToken(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white"
              placeholder="Invite token for private rooms"
            />
            <button
              type="button"
              onClick={handleJoinRoom}
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-60"
            >
              <Users className="h-4 w-4" />
              Join room
            </button>
          </div>

          {helperError ? (
            <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {helperError}
            </div>
          ) : null}
        </div>

        <AnimatePresence>
          {roomPreview ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="glass-panel p-5 sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Room preview</p>
                  <h3 className="mt-2 font-display text-2xl font-bold text-white">{roomPreview.name}</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    {roomPreview.users?.length || 0} viewers • {roomPreview.privacy} room
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(roomPreview.shareLink)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white"
                >
                  <Copy className="h-4 w-4" />
                  Copy invite
                </button>
              </div>
              <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Now watching</p>
                <p className="mt-2 font-display text-xl font-semibold text-white">{roomPreview.movie?.title}</p>
                <p className="mt-2 text-sm text-slate-300">{roomPreview.movie?.overview || "Trailer synced and ready."}</p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
