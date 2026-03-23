import { Crown, Shuffle, Users } from "lucide-react";

export function UserList({ users, hostId, currentParticipantId, canTransferHost, onTransferHost }) {
  return (
    <div className="glass-panel p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Presence</p>
          <h3 className="mt-1 font-display text-2xl font-bold text-white">Active viewers</h3>
        </div>
        <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300">
          <Users className="mr-1 inline h-4 w-4 text-sky-400" />
          {users.length}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {users.map((user) => {
          const isHost = user.participantId === hostId;
          const isSelf = user.participantId === currentParticipantId;
          return (
            <div
              key={user.participantId}
              className={`rounded-[1.35rem] border px-4 py-3 ${
                isHost ? "border-amber-300/25 bg-amber-500/10" : "border-white/10 bg-slate-950/35"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/15 font-semibold text-sky-100">
                    {user.avatarSeed || "AV"}
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {user.username} {isSelf ? <span className="text-slate-400">(You)</span> : null}
                    </p>
                    <p className="text-xs text-slate-400">{isHost ? "Host controls playback" : "Following host sync"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isHost ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-200">
                      <Crown className="h-4 w-4" />
                      Host
                    </span>
                  ) : null}
                  {canTransferHost && !isSelf ? (
                    <button
                      type="button"
                      onClick={() => onTransferHost(user.participantId)}
                      className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200"
                    >
                      <Shuffle className="h-4 w-4" />
                      Make host
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
