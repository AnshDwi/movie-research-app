import { SendHorizonal, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function formatTimestamp(value) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatPanel({ messages, typingUsers, onSendMessage, onTyping, chatPending }) {
  const endRef = useRef(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;

    try {
      await onSendMessage(message.trim());
      setMessage("");
      setError("");
      onTyping(false);
    } catch (sendError) {
      setError(sendError.message || "Unable to send your message.");
    }
  };

  return (
    <div className="glass-panel flex h-full min-h-[520px] flex-col overflow-hidden p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Room chat</p>
          <h3 className="mt-1 font-display text-2xl font-bold text-white">Live conversation</h3>
        </div>
        <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300">
          {messages.length} messages
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.map((entry) => (
          <div key={entry.id} className="rounded-[1.35rem] border border-white/10 bg-slate-950/35 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/15 font-semibold text-sky-200">
                  {entry.author?.avatarSeed || "AV"}
                </div>
                <div>
                  <p className="font-semibold text-white">{entry.author?.username}</p>
                  <p className="text-xs text-slate-400">{formatTimestamp(entry.timestamp)}</p>
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-200">{entry.text}</p>
          </div>
        ))}
        {typingUsers.length ? (
          <div className="rounded-[1.35rem] border border-sky-400/15 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
            {typingUsers.map((user) => user.username).join(", ")} typing...
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 px-4 py-3">
          <textarea
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              onTyping(Boolean(event.target.value.trim()));
            }}
            rows={3}
            placeholder="Drop reactions, thoughts, or what to queue next..."
            className="w-full resize-none bg-transparent text-sm text-white placeholder:text-slate-500"
          />
        </div>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs text-slate-300">
            <Sparkles className="h-4 w-4 text-sky-400" />
            Auto-scroll enabled
          </div>
          <button
            type="submit"
            disabled={chatPending}
            className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
          >
            <SendHorizonal className="h-4 w-4" />
            {chatPending ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
