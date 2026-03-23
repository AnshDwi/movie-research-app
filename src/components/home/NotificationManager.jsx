import { useEffect, useRef } from "react";

export function NotificationManager({ nowPlaying }) {
  const seenIds = useRef(new Set());

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (typeof Notification === "undefined" || !nowPlaying.length || Notification.permission !== "granted") return;
    nowPlaying.slice(0, 3).forEach((movie) => {
      if (movie.isNewRelease && !seenIds.current.has(movie.id)) {
        seenIds.current.add(movie.id);
        new Notification("New release detected", {
          body: `${movie.title} just landed in the now playing feed.`
        });
      }
    });
  }, [nowPlaying]);

  return null;
}
