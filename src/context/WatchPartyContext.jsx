import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "./AppContext";
import {
  createWatchPartyRoom,
  createWatchPartySocket,
  getWatchPartyRoom
} from "../services/watchParty";

const WatchPartyContext = createContext(null);
const SESSION_KEY = "afterglow-watch-party-session";

function createSessionId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getParticipantId() {
  if (typeof window === "undefined") return createSessionId();
  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const next = createSessionId();
  window.localStorage.setItem(SESSION_KEY, next);
  return next;
}

function getAvatarSeed(name = "Guest Viewer") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((chunk) => chunk[0] || "")
    .join("")
    .toUpperCase();
}

export function WatchPartyProvider({ children, roomId, inviteToken }) {
  const navigate = useNavigate();
  const { authUser } = useAppContext();
  const socketRef = useRef(null);
  const usersRef = useRef([]);
  const joinPayloadRef = useRef(null);
  const joinAttemptRef = useRef("");
  const [status, setStatus] = useState(roomId ? "joining" : "idle");
  const [error, setError] = useState("");
  const [room, setRoom] = useState(null);
  const [users, setUsers] = useState([]);
  const [hostId, setHostId] = useState("");
  const [messages, setMessages] = useState([]);
  const [playback, setPlayback] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [notices, setNotices] = useState([]);
  const [reactionBurst, setReactionBurst] = useState([]);
  const [roomPreview, setRoomPreview] = useState(null);
  const [chatPending, setChatPending] = useState(false);
  const participantId = useMemo(() => getParticipantId(), []);
  const username = authUser?.name || "Guest Viewer";

  const queueNotice = useCallback((message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setNotices((current) => [...current, { id, message }].slice(-6));
    window.setTimeout(() => {
      setNotices((current) => current.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  const ensureSocket = useCallback(() => {
    if (socketRef.current) return socketRef.current;

    const socket = createWatchPartySocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("connected");
      const payload = joinPayloadRef.current;
      if (!payload) return;
      socket.emit("join-room", payload, (response) => {
        if (!response?.ok) {
          setError(response?.error || "Unable to join this watch party.");
          setStatus("error");
          return;
        }

        setError("");
        setRoom(response.room);
        setUsers(response.room.users || []);
        setHostId(response.room.hostId || "");
        setMessages(response.room.chatHistory || []);
        setPlayback(response.room.playback || null);
        setStatus("joined");
      });
    });

    socket.on("disconnect", () => {
      setStatus((current) => (current === "idle" ? current : "reconnecting"));
    });

    socket.on("presence-update", (payload) => {
      setUsers(payload.users || []);
      setHostId(payload.hostId || "");
    });

    socket.on("user-joined", (payload) => {
      queueNotice(`${payload.username} joined the room.`);
    });

    socket.on("user-left", (payload) => {
      setTypingUsers((current) => current.filter((user) => user.participantId !== payload.participantId));
      queueNotice("A viewer left the room.");
    });

    socket.on("chat-message", (payload) => {
      setMessages((current) => [...current, payload].slice(-120));
      setChatPending(false);
    });

    socket.on("typing-status", (payload) => {
      setTypingUsers((current) => {
        const withoutUser = current.filter((user) => user.participantId !== payload.participantId);
        if (!payload.isTyping) return withoutUser;

        const matchingUser = usersRef.current.find((user) => user.participantId === payload.participantId);
        if (!matchingUser) return withoutUser;
        return [...withoutUser, matchingUser];
      });
    });

    socket.on("reaction", (payload) => {
      const burst = { id: payload.id, emoji: payload.emoji, username: payload.username };
      setReactionBurst((current) => [...current, burst].slice(-8));
      window.setTimeout(() => {
        setReactionBurst((current) => current.filter((item) => item.id !== burst.id));
      }, 1800);
    });

    socket.on("host-transferred", (payload) => {
      setHostId(payload.hostId || "");
      queueNotice("Host controls were transferred.");
    });

    socket.on("movie-selected", (payload) => {
      setRoom((current) => (current ? { ...current, movie: payload.movie } : current));
      setPlayback(payload.playback || null);
      queueNotice(`Now watching: ${payload.movie?.title || "Trailer"}`);
    });

    const applyPlaybackUpdate = (payload) => {
      setPlayback(payload.playback || null);
    };

    socket.on("play", applyPlaybackUpdate);
    socket.on("pause", applyPlaybackUpdate);
    socket.on("seek", applyPlaybackUpdate);
    socket.on("sync-state", applyPlaybackUpdate);

    return socket;
  }, [queueNotice]);

  const joinRoom = useCallback(
    async (nextRoomId, nextInviteToken = inviteToken) => {
      const safeRoomId = String(nextRoomId || "").trim().toUpperCase();
      if (!safeRoomId) {
        setError("Enter a valid room ID to join.");
        return;
      }

      joinAttemptRef.current = `${safeRoomId}:${nextInviteToken}:${username}`;
      setStatus("joining");
      setError("");
      const preview = await getWatchPartyRoom(safeRoomId, nextInviteToken);
      setRoomPreview(preview.room);
      const search = preview.room?.privacy === "private" && nextInviteToken ? `?invite=${nextInviteToken}` : "";
      navigate(`/watch-party/${safeRoomId}${search}`, { replace: true });
      joinPayloadRef.current = {
        roomId: safeRoomId,
        inviteToken: nextInviteToken,
        username,
        participantId,
        avatarSeed: getAvatarSeed(username)
      };

      const socket = ensureSocket();
      if (socket.connected) {
        socket.emit("join-room", joinPayloadRef.current, (response) => {
          if (!response?.ok) {
            setError(response?.error || "Unable to join this watch party.");
            setStatus("error");
            return;
          }

          setRoom(response.room);
          setUsers(response.room.users || []);
          setHostId(response.room.hostId || "");
          setMessages(response.room.chatHistory || []);
          setPlayback(response.room.playback || null);
          setStatus("joined");
        });
      } else {
        socket.connect();
      }
    },
    [ensureSocket, inviteToken, participantId, username]
  );

  useEffect(() => {
    if (!roomId) return;
    const attemptKey = `${roomId}:${inviteToken}:${username}`;
    if (joinAttemptRef.current === attemptKey && room?.id === roomId) return;
    joinAttemptRef.current = attemptKey;
    joinRoom(roomId, inviteToken).catch((joinError) => {
      setError(joinError.message || "Unable to join this watch party.");
      setStatus("error");
    });
  }, [inviteToken, joinRoom, room?.id, roomId, username]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const createRoomAndEnter = useCallback(
    async ({ roomName, privacy, movie }) => {
      setStatus("creating");
      setError("");
      const response = await createWatchPartyRoom({ roomName, privacy, movie });
      const nextRoom = response.room;
      const search = nextRoom.privacy === "private" ? `?invite=${nextRoom.inviteToken}` : "";
      navigate(`/watch-party/${nextRoom.id}${search}`);
      return nextRoom;
    },
    [navigate]
  );

  const leaveRoom = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("leave-room");
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    joinPayloadRef.current = null;
    joinAttemptRef.current = "";
    setRoom(null);
    setUsers([]);
    setHostId("");
    setMessages([]);
    setPlayback(null);
    setTypingUsers([]);
    setStatus("idle");
    navigate("/watch-party");
  }, [navigate]);

  const sendChatMessage = useCallback((text) => {
    const socket = socketRef.current;
    if (!socket?.connected) return Promise.resolve();
    setChatPending(true);
    return new Promise((resolve, reject) => {
      socket.emit("chat-message", { text }, (response) => {
        if (!response?.ok) {
          setChatPending(false);
          reject(new Error(response?.error || "Unable to send message."));
          return;
        }
        resolve();
      });
    });
  }, []);

  const setTyping = useCallback((isTyping) => {
    socketRef.current?.emit("typing-status", { isTyping });
  }, []);

  const emitPlayback = useCallback((eventName, currentTime, isPlaying) => {
    socketRef.current?.emit(eventName, { currentTime, isPlaying });
  }, []);

  const sendReaction = useCallback((emoji) => {
    socketRef.current?.emit("reaction", { emoji });
  }, []);

  const transferHost = useCallback((nextParticipantId) => {
    socketRef.current?.emit("transfer-host", { participantId: nextParticipantId });
  }, []);

  const selectMovie = useCallback((movie) => {
    socketRef.current?.emit("select-movie", movie);
  }, []);

  const value = useMemo(
    () => ({
      status,
      error,
      room,
      roomPreview,
      users,
      hostId,
      messages,
      playback,
      typingUsers,
      notices,
      reactionBurst,
      chatPending,
      username,
      participantId,
      isHost: participantId === hostId,
      createRoomAndEnter,
      joinRoom,
      leaveRoom,
      sendChatMessage,
      setTyping,
      emitPlayback,
      sendReaction,
      transferHost,
      selectMovie
    }),
    [
      status,
      error,
      room,
      roomPreview,
      users,
      hostId,
      messages,
      playback,
      typingUsers,
      notices,
      reactionBurst,
      chatPending,
      username,
      participantId,
      createRoomAndEnter,
      joinRoom,
      leaveRoom,
      sendChatMessage,
      setTyping,
      emitPlayback,
      sendReaction,
      transferHost,
      selectMovie
    ]
  );

  return <WatchPartyContext.Provider value={value}>{children}</WatchPartyContext.Provider>;
}

export function useWatchParty() {
  const context = useContext(WatchPartyContext);
  if (!context) {
    throw new Error("useWatchParty must be used within WatchPartyProvider");
  }
  return context;
}
  useEffect(() => {
    usersRef.current = users;
  }, [users]);
