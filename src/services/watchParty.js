import { io } from "socket.io-client";

function getBaseOrigin() {
  if (import.meta.env.VITE_API_ORIGIN) {
    return import.meta.env.VITE_API_ORIGIN;
  }

  if (typeof window === "undefined") {
    return "http://localhost:8787";
  }

  return `${window.location.protocol}//${window.location.hostname}:8787`;
}

export function getWatchPartyApiBase() {
  return `${getBaseOrigin()}/api`;
}

export function getWatchPartySocketOrigin() {
  return getBaseOrigin();
}

async function request(path, options = {}) {
  const response = await fetch(`${getWatchPartyApiBase()}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Watch party request failed.");
  }
  return data;
}

export function createWatchPartyRoom(payload) {
  return request("/watch-party/rooms", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getWatchPartyRoom(roomId, inviteToken = "") {
  const query = inviteToken ? `?invite=${encodeURIComponent(inviteToken)}` : "";
  return request(`/watch-party/rooms/${encodeURIComponent(roomId)}${query}`);
}

export function createWatchPartySocket() {
  return io(getWatchPartySocketOrigin(), {
    autoConnect: false,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 1000
  });
}
