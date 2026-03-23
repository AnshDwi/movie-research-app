import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import sanitizeHtml from "sanitize-html";
import { Server } from "socket.io";
import winston from "winston";

dotenv.config();

const app = express();
const server = createServer(app);
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()]
});

const refreshTokens = new Map();
const cache = new Map();
const aiQueue = [];
const rooms = new Map();

const corsOrigin = process.env.CORS_ORIGIN || "*";
const publicAppUrl = process.env.PUBLIC_APP_URL || "http://localhost:5173";
const chatRateWindowMs = 10_000;
const chatRateLimitCount = 6;

const io = new Server(server, {
  cors: {
    origin: corsOrigin === "*" ? true : corsOrigin.split(",").map((value) => value.trim()),
    credentials: true
  }
});

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false
  })
);

function sanitizeText(value, fallback = "") {
  return sanitizeHtml(String(value || fallback), {
    allowedTags: [],
    allowedAttributes: {}
  }).trim();
}

function setCache(key, value, ttlMs = 1000 * 60 * 5) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function signTokens(user) {
  const accessToken = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || "dev-secret", {
    expiresIn: "15m"
  });
  const refreshToken = jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET || "dev-refresh", {
    expiresIn: "7d"
  });
  refreshTokens.set(refreshToken, user.id);
  return { accessToken, refreshToken };
}

function authGuard(request, response, next) {
  const authorization = request.headers.authorization || "";
  const token = authorization.replace("Bearer ", "");
  if (!token) {
    response.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    request.user = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    next();
  } catch {
    response.status(401).json({ error: "Invalid token" });
  }
}

function generateRoomId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function createInviteToken() {
  return randomUUID().slice(0, 8);
}

function buildShareLink(room) {
  const url = new URL(`/watch-party/${room.id}`, publicAppUrl);
  if (room.privacy === "private") {
    url.searchParams.set("invite", room.inviteToken);
  }
  return url.toString();
}

function getComputedPlayback(playback) {
  const safePlayback = playback || {
    currentTime: 0,
    isPlaying: false,
    updatedAt: Date.now(),
    videoId: null
  };

  if (!safePlayback.isPlaying) {
    return { ...safePlayback, currentTime: Number(safePlayback.currentTime || 0) };
  }

  const elapsedSeconds = Math.max(0, (Date.now() - safePlayback.updatedAt) / 1000);
  return {
    ...safePlayback,
    currentTime: Number((Number(safePlayback.currentTime || 0) + elapsedSeconds).toFixed(2))
  };
}

function serializeUser(user, hostId) {
  return {
    participantId: user.participantId,
    username: user.username,
    avatarSeed: user.avatarSeed,
    joinedAt: user.joinedAt,
    isHost: user.participantId === hostId
  };
}

function serializeRoom(room) {
  return {
    id: room.id,
    name: room.name,
    privacy: room.privacy,
    inviteToken: room.inviteToken,
    shareLink: buildShareLink(room),
    hostId: room.hostId,
    movie: room.movie,
    playback: getComputedPlayback(room.playback),
    users: Array.from(room.users.values()).map((user) => serializeUser(user, room.hostId)),
    chatHistory: room.chatHistory,
    createdAt: room.createdAt
  };
}

function ensureRoomAccess(room, inviteToken) {
  if (!room) {
    return "Room not found.";
  }
  if (room.privacy === "private" && inviteToken !== room.inviteToken) {
    return "This room is private. Use the full invite link to join.";
  }
  return null;
}

function createRoom({ roomName, privacy, movie }) {
  let id = generateRoomId();
  while (rooms.has(id)) {
    id = generateRoomId();
  }

  const room = {
    id,
    name: roomName,
    privacy,
    inviteToken: createInviteToken(),
    hostId: null,
    users: new Map(),
    typingUsers: new Map(),
    chatHistory: [],
    chatRate: new Map(),
    movie,
    playback: {
      videoId: movie?.trailerKey || null,
      currentTime: 0,
      isPlaying: false,
      updatedAt: Date.now(),
      duration: 0
    },
    createdAt: new Date().toISOString()
  };

  rooms.set(id, room);
  return room;
}

function broadcastPresence(room) {
  io.to(room.id).emit("presence-update", {
    users: Array.from(room.users.values()).map((user) => serializeUser(user, room.hostId)),
    hostId: room.hostId
  });
}

function assignNextHost(room) {
  const nextUser = Array.from(room.users.values())[0];
  room.hostId = nextUser?.participantId || null;
  if (room.hostId) {
    io.to(room.id).emit("host-transferred", { hostId: room.hostId });
  }
}

function updatePlayback(room, patch) {
  room.playback = {
    ...room.playback,
    ...patch,
    updatedAt: Date.now()
  };
}

function canSendChat(room, participantId) {
  const now = Date.now();
  const timestamps = room.chatRate.get(participantId) || [];
  const recent = timestamps.filter((value) => now - value < chatRateWindowMs);
  if (recent.length >= chatRateLimitCount) {
    room.chatRate.set(participantId, recent);
    return false;
  }
  room.chatRate.set(participantId, [...recent, now]);
  return true;
}

function removeParticipant(socket, reason = "left") {
  const roomId = socket.data?.roomId;
  const participantId = socket.data?.participantId;
  if (!roomId || !participantId) return;

  const room = rooms.get(roomId);
  if (!room) return;

  const entry = Array.from(room.users.entries()).find(([, user]) => user.participantId === participantId);
  if (entry) {
    room.users.delete(entry[0]);
  }
  room.typingUsers.delete(participantId);
  room.chatRate.delete(participantId);

  if (!room.users.size) {
    rooms.delete(room.id);
    return;
  }

  if (room.hostId === participantId) {
    assignNextHost(room);
  }

  socket.to(room.id).emit("user-left", {
    participantId,
    reason,
    timestamp: new Date().toISOString()
  });
  broadcastPresence(room);
}

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", queueDepth: aiQueue.length, cacheEntries: cache.size, roomCount: rooms.size });
});

app.post("/api/auth/login", (request, response) => {
  const email = sanitizeText(request.body?.email);
  const tokens = signTokens({ id: "demo-user", role: "user", email });
  response.json({
    user: {
      id: "demo-user",
      name: "Cine Explorer",
      handle: "@afterglow",
      visibility: "public"
    },
    ...tokens
  });
});

app.post("/api/auth/refresh", (request, response) => {
  const refreshToken = request.body?.refreshToken;
  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    response.status(401).json({ error: "Invalid refresh token" });
    return;
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "dev-refresh");
  const tokens = signTokens({ id: decoded.sub, role: "user" });
  response.json(tokens);
});

app.get("/api/profile", (_request, response) => {
  response.json({
    id: "demo-user",
    name: "Cine Explorer",
    handle: "@afterglow",
    visibility: "public",
    watchlists: [
      { id: "wl-1", name: "Weekend queue", isPublic: true },
      { id: "wl-2", name: "Private research list", isPublic: false }
    ]
  });
});

app.post("/api/watchlists/share", authGuard, (request, response) => {
  const name = sanitizeText(request.body?.name, "watchlist");
  response.json({
    url: `${publicAppUrl}/shared/${encodeURIComponent(name)}`
  });
});

app.post("/api/watch-party/rooms", (request, response) => {
  const roomName = sanitizeText(request.body?.roomName, "Afterglow Watch Party").slice(0, 48) || "Afterglow Watch Party";
  const privacy = request.body?.privacy === "private" ? "private" : "public";
  const movie = request.body?.movie && typeof request.body.movie === "object"
    ? {
        id: request.body.movie.id,
        title: sanitizeText(request.body.movie.title, "Trailer Night"),
        posterPath: sanitizeText(request.body.movie.posterPath),
        trailerKey: sanitizeText(request.body.movie.trailerKey),
        year: sanitizeText(request.body.movie.year),
        overview: sanitizeText(request.body.movie.overview)
      }
    : null;

  if (!movie?.trailerKey) {
    response.status(400).json({ error: "Choose a movie trailer before creating a watch party." });
    return;
  }

  const room = createRoom({ roomName, privacy, movie });
  response.status(201).json({
    room: serializeRoom(room)
  });
});

app.get("/api/watch-party/rooms/:roomId", (request, response) => {
  const room = rooms.get(String(request.params.roomId || "").toUpperCase());
  const inviteToken = sanitizeText(request.query.invite);
  const accessError = ensureRoomAccess(room, inviteToken);
  if (accessError) {
    response.status(404).json({ error: accessError });
    return;
  }

  response.json({
    room: serializeRoom(room)
  });
});

app.post("/api/sentiment", (request, response) => {
  const text = sanitizeText(request.body?.text).toLowerCase();
  const score =
    ["great", "love", "smart", "stunning"].filter((word) => text.includes(word)).length -
    ["boring", "weak", "mess", "slow"].filter((word) => text.includes(word)).length;

  const payload =
    score > 1
      ? {
          label: "Positive",
          score: 0.84,
          pros: ["Reviewers praise performances", "Visual style is frequently highlighted"],
          cons: ["A few comments mention pacing"]
        }
      : score < -1
        ? {
            label: "Negative",
            score: 0.76,
            pros: ["Interesting premise"],
            cons: ["Execution concerns", "Lower emotional payoff"]
          }
        : {
            label: "Mixed",
            score: 0.58,
            pros: ["Has a niche audience"],
            cons: ["Divisive response"]
          };

  response.json(payload);
});

app.post("/api/recommendations", (request, response) => {
  const genres = Array.isArray(request.body?.genres) ? request.body.genres : [];
  const cacheKey = `recommendations:${genres.join(",")}`;
  const cached = getCache(cacheKey);
  if (cached) {
    response.json(cached);
    return;
  }

  const payload = {
    explanation: `Hybrid recommender blended content and collaborative signals for genres: ${genres.join(", ") || "none yet"}. Swap this stub with Redis-backed candidates and an LLM reranker for production.`,
    picks: []
  };
  setCache(cacheKey, payload);
  response.json(payload);
});

app.post("/api/ai/review-summary", authGuard, (request, response) => {
  const title = sanitizeText(request.body?.title, "Movie");
  aiQueue.push({ title, createdAt: Date.now() });
  response.status(202).json({
    status: "queued",
    summary: `${title} is trending with strong audience interest, a few pacing critiques, and standout praise for performances and visual style.`
  });
});

io.on("connection", (socket) => {
  socket.on("join-room", (payload = {}, callback = () => {}) => {
    try {
      const roomId = sanitizeText(payload.roomId).toUpperCase();
      const inviteToken = sanitizeText(payload.inviteToken);
      const username = sanitizeText(payload.username, "Guest Viewer").slice(0, 28) || "Guest Viewer";
      const participantId = sanitizeText(payload.participantId) || randomUUID();
      const avatarSeed = sanitizeText(payload.avatarSeed, username.slice(0, 2).toUpperCase());

      const room = rooms.get(roomId);
      const accessError = ensureRoomAccess(room, inviteToken);
      if (accessError) {
        callback({ ok: false, error: accessError });
        return;
      }

      const previousSocketEntry = Array.from(room.users.entries()).find(([, user]) => user.participantId === participantId);
      if (previousSocketEntry) {
        room.users.delete(previousSocketEntry[0]);
      }

      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.participantId = participantId;

      room.users.set(socket.id, {
        participantId,
        username,
        avatarSeed,
        joinedAt: new Date().toISOString()
      });

      if (!room.hostId) {
        room.hostId = participantId;
      }

      callback({
        ok: true,
        room: serializeRoom(room),
        participantId
      });

      socket.to(roomId).emit("user-joined", {
        participantId,
        username,
        timestamp: new Date().toISOString()
      });

      broadcastPresence(room);
      io.to(roomId).emit("sync-state", {
        playback: getComputedPlayback(room.playback),
        issuedBy: room.hostId
      });
    } catch (error) {
      callback({ ok: false, error: "Unable to join the watch party right now." });
    }
  });

  socket.on("leave-room", () => {
    removeParticipant(socket, "left");
    socket.leave(socket.data?.roomId);
    socket.data.roomId = null;
    socket.data.participantId = null;
  });

  socket.on("play", (payload = {}) => {
    const room = rooms.get(socket.data?.roomId);
    if (!room || room.hostId !== socket.data?.participantId) return;
    updatePlayback(room, {
      currentTime: Number(payload.currentTime || 0),
      isPlaying: true
    });
    io.to(room.id).emit("play", {
      playback: getComputedPlayback(room.playback),
      issuedBy: socket.data.participantId
    });
  });

  socket.on("pause", (payload = {}) => {
    const room = rooms.get(socket.data?.roomId);
    if (!room || room.hostId !== socket.data?.participantId) return;
    updatePlayback(room, {
      currentTime: Number(payload.currentTime || 0),
      isPlaying: false
    });
    io.to(room.id).emit("pause", {
      playback: getComputedPlayback(room.playback),
      issuedBy: socket.data.participantId
    });
  });

  socket.on("seek", (payload = {}) => {
    const room = rooms.get(socket.data?.roomId);
    if (!room || room.hostId !== socket.data?.participantId) return;
    updatePlayback(room, {
      currentTime: Number(payload.currentTime || 0)
    });
    io.to(room.id).emit("seek", {
      playback: getComputedPlayback(room.playback),
      issuedBy: socket.data.participantId
    });
  });

  socket.on("sync-state", (payload = {}) => {
    const room = rooms.get(socket.data?.roomId);
    if (!room || room.hostId !== socket.data?.participantId) return;
    updatePlayback(room, {
      currentTime: Number(payload.currentTime || room.playback.currentTime || 0),
      isPlaying: Boolean(payload.isPlaying)
    });
    io.to(room.id).emit("sync-state", {
      playback: getComputedPlayback(room.playback),
      issuedBy: socket.data.participantId
    });
  });

  socket.on("chat-message", (payload = {}, callback = () => {}) => {
    const room = rooms.get(socket.data?.roomId);
    if (!room) return;
    if (!canSendChat(room, socket.data.participantId)) {
      callback({ ok: false, error: "You are sending messages too quickly. Please slow down." });
      return;
    }

    const text = sanitizeText(payload.text).slice(0, 280);
    if (!text) {
      callback({ ok: false, error: "Message cannot be empty." });
      return;
    }

    const author = Array.from(room.users.values()).find((user) => user.participantId === socket.data.participantId);
    const message = {
      id: randomUUID(),
      text,
      timestamp: new Date().toISOString(),
      author: {
        participantId: socket.data.participantId,
        username: author?.username || "Guest Viewer",
        avatarSeed: author?.avatarSeed || "GV"
      }
    };

    room.chatHistory = [...room.chatHistory, message].slice(-120);
    io.to(room.id).emit("chat-message", message);
    callback({ ok: true });
  });

  socket.on("typing-status", (payload = {}) => {
    const room = rooms.get(socket.data?.roomId);
    if (!room) return;

    const isTyping = Boolean(payload.isTyping);
    if (isTyping) {
      room.typingUsers.set(socket.data.participantId, true);
    } else {
      room.typingUsers.delete(socket.data.participantId);
    }

    socket.to(room.id).emit("typing-status", {
      participantId: socket.data.participantId,
      isTyping
    });
  });

  socket.on("reaction", (payload = {}) => {
    const room = rooms.get(socket.data?.roomId);
    if (!room) return;
    const emoji = sanitizeText(payload.emoji).slice(0, 4);
    if (!["🔥", "😂", "❤️"].includes(emoji)) return;

    const author = Array.from(room.users.values()).find((user) => user.participantId === socket.data.participantId);
    io.to(room.id).emit("reaction", {
      id: randomUUID(),
      emoji,
      participantId: socket.data.participantId,
      username: author?.username || "Guest Viewer",
      timestamp: new Date().toISOString()
    });
  });

  socket.on("transfer-host", (payload = {}) => {
    const room = rooms.get(socket.data?.roomId);
    if (!room || room.hostId !== socket.data?.participantId) return;

    const targetParticipantId = sanitizeText(payload.participantId);
    const targetExists = Array.from(room.users.values()).some((user) => user.participantId === targetParticipantId);
    if (!targetExists) return;

    room.hostId = targetParticipantId;
    io.to(room.id).emit("host-transferred", { hostId: targetParticipantId });
    broadcastPresence(room);
    io.to(room.id).emit("sync-state", {
      playback: getComputedPlayback(room.playback),
      issuedBy: targetParticipantId
    });
  });

  socket.on("select-movie", (payload = {}) => {
    const room = rooms.get(socket.data?.roomId);
    if (!room || room.hostId !== socket.data?.participantId) return;

    const trailerKey = sanitizeText(payload.trailerKey);
    if (!trailerKey) return;

    room.movie = {
      id: payload.id,
      title: sanitizeText(payload.title, "Trailer Night"),
      posterPath: sanitizeText(payload.posterPath),
      trailerKey,
      year: sanitizeText(payload.year),
      overview: sanitizeText(payload.overview)
    };
    updatePlayback(room, {
      videoId: trailerKey,
      currentTime: 0,
      isPlaying: false,
      duration: 0
    });

    io.to(room.id).emit("movie-selected", {
      movie: room.movie,
      playback: getComputedPlayback(room.playback),
      issuedBy: socket.data.participantId
    });
  });

  socket.on("disconnect", () => {
    removeParticipant(socket, "disconnected");
  });
});

const port = process.env.PORT || 8787;
server.listen(port, () => {
  logger.info({ message: "Afterglow API listening", port });
});
