import { motion } from "framer-motion";
import { Copy, DoorOpen, Flame, Heart, Laugh, Lock, Radio } from "lucide-react";
import { useMemo } from "react";
import { useWatchParty } from "../../context/WatchPartyContext";
import { useMovieCollection } from "../../hooks/useMovieData";
import { getMoviePreview } from "../../services/tmdb";
import { getPosterUrl } from "../../utils/movie";
import { ChatPanel } from "./ChatPanel";
import { UserList } from "./UserList";
import { VideoPlayer } from "./VideoPlayer";

const REACTIONS = [
  { emoji: "🔥", icon: Flame },
  { emoji: "😂", icon: Laugh },
  { emoji: "❤️", icon: Heart }
];

export function WatchPartyRoom() {
  const {
    room,
    users,
    hostId,
    messages,
    playback,
    typingUsers,
    notices,
    reactionBurst,
    chatPending,
    isHost,
    participantId,
    emitPlayback,
    sendReaction,
    leaveRoom,
    sendChatMessage,
    setTyping,
    transferHost,
    selectMovie
  } = useWatchParty();
  const { trending } = useMovieCollection("");

  const suggestedMovies = useMemo(() => (trending.data?.results || []).slice(0, 6), [trending.data?.results]);

  const handleMovieSelect = async (movie) => {
    const trailer = await getMoviePreview(movie.id);
    if (!trailer?.key) return;
    selectMovie({
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      overview: movie.overview,
      year: movie.release_date?.slice(0, 4) || "TBA",
      trailerKey: trailer.key
    });
  };

  return (
    <section className="space-y-6">
      <div className="glass-panel overflow-hidden p-5 sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-400">Watch Party Room</p>
            <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-5xl">{room?.name}</h1>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="rounded-full bg-white/10 px-3 py-2">Room ID: {room?.id}</span>
              <span className="rounded-full bg-white/10 px-3 py-2 capitalize">
                {room?.privacy === "private" ? <Lock className="mr-1 inline h-4 w-4 text-amber-300" /> : <Radio className="mr-1 inline h-4 w-4 text-emerald-400" />}
                {room?.privacy}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-2">{users.length} active viewers</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(room?.shareLink || "")}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-white"
            >
              <Copy className="h-4 w-4" />
              Copy invite
            </button>
            <button
              type="button"
              onClick={leaveRoom}
              className="inline-flex items-center gap-2 rounded-full bg-rose-500/90 px-4 py-3 text-sm font-semibold text-white"
            >
              <DoorOpen className="h-4 w-4" />
              Leave room
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.4fr_0.7fr]">
        <div className="space-y-6">
          <VideoPlayer
            movie={room?.movie}
            playback={playback}
            isHost={isHost}
            onPlaybackEvent={emitPlayback}
          />

          <div className="glass-panel p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Room pulse</p>
                <p className="mt-1 text-sm text-slate-300">Joined/left notices, emoji reactions, and sync status updates land here.</p>
              </div>
              <div className="flex gap-2">
                {REACTIONS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.emoji}
                      type="button"
                      onClick={() => sendReaction(item.emoji)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white"
                    >
                      <Icon className="h-4 w-4" />
                      {item.emoji}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <div className="space-y-3">
                {notices.length ? notices.map((notice) => (
                  <div key={notice.id} className="rounded-[1.25rem] border border-white/10 bg-slate-950/30 px-4 py-3 text-sm text-slate-200">
                    {notice.message}
                  </div>
                )) : (
                  <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/30 px-4 py-3 text-sm text-slate-400">
                    Room notifications will appear here as viewers join, leave, or swap host controls.
                  </div>
                )}
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/30 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Reaction stream</p>
                <div className="mt-3 flex min-h-16 flex-wrap gap-2">
                  {reactionBurst.length ? reactionBurst.map((reaction) => (
                    <motion.div
                      key={reaction.id}
                      initial={{ opacity: 0, scale: 0.7, y: 12 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="rounded-full bg-white/10 px-3 py-2 text-sm text-white"
                    >
                      {reaction.emoji} {reaction.username}
                    </motion.div>
                  )) : (
                    <p className="text-sm text-slate-400">Reactions float here in real time.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Sync movie selection</p>
                <h3 className="mt-1 font-display text-2xl font-bold text-white">Change the trailer for everyone</h3>
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300">
                {isHost ? "Host enabled" : "Host only"}
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {suggestedMovies.map((movie) => (
                <button
                  key={movie.id}
                  type="button"
                  disabled={!isHost}
                  onClick={() => handleMovieSelect(movie)}
                  className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-slate-950/35 text-left disabled:cursor-not-allowed disabled:opacity-55"
                >
                  <img
                    src={getPosterUrl(movie.poster_path)}
                    alt={movie.title}
                    className="aspect-[16/9] w-full object-cover"
                    loading="lazy"
                  />
                  <div className="p-3">
                    <p className="line-clamp-1 font-semibold text-white">{movie.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                      {movie.release_date?.slice(0, 4) || "Upcoming"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <UserList
            users={users}
            hostId={hostId}
            currentParticipantId={participantId}
            canTransferHost={isHost}
            onTransferHost={transferHost}
          />
          <ChatPanel
            messages={messages}
            typingUsers={typingUsers}
            onSendMessage={sendChatMessage}
            onTyping={setTyping}
            chatPending={chatPending}
          />
        </div>
      </div>
    </section>
  );
}
