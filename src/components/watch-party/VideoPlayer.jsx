import { motion } from "framer-motion";
import { Film, PauseCircle, PlayCircle, Radio } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

let youTubeApiPromise;

function loadYouTubeApi() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube API is only available in the browser."));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (!youTubeApiPromise) {
    youTubeApiPromise = new Promise((resolve) => {
      const existingScript = document.querySelector('script[data-youtube-api="true"]');
      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        script.dataset.youtubeApi = "true";
        document.body.appendChild(script);
      }

      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        resolve(window.YT);
      };
    });
  }

  return youTubeApiPromise;
}

export function VideoPlayer({ movie, playback, isHost, onPlaybackEvent }) {
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const remoteActionRef = useRef(false);
  const lastSampleRef = useRef({ time: 0, stamp: Date.now() });
  const [playerReady, setPlayerReady] = useState(false);

  const videoId = movie?.trailerKey || playback?.videoId || null;
  const statusLabel = useMemo(() => {
    if (!playback) return "Waiting for sync";
    return playback.isPlaying ? "Live sync" : "Paused";
  }, [playback]);

  useEffect(() => {
    let disposed = false;
    loadYouTubeApi().then((YT) => {
      if (disposed || !mountRef.current) return;

      playerRef.current = new YT.Player(mountRef.current, {
        width: "100%",
        height: "100%",
        videoId: videoId || undefined,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1
        },
        events: {
          onReady: () => {
            if (disposed) return;
            setPlayerReady(true);
          },
          onStateChange: (event) => {
            if (!isHost || remoteActionRef.current || !playerRef.current) return;
            const currentTime = playerRef.current.getCurrentTime?.() || 0;
            if (event.data === window.YT.PlayerState.PLAYING) {
              lastSampleRef.current = { time: currentTime, stamp: Date.now() };
              onPlaybackEvent("play", currentTime, true);
            }
            if (event.data === window.YT.PlayerState.PAUSED) {
              onPlaybackEvent("pause", currentTime, false);
            }
          }
        }
      });
    });

    return () => {
      disposed = true;
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
      }
      playerRef.current = null;
    };
  }, [isHost, onPlaybackEvent, videoId]);

  useEffect(() => {
    if (!playerReady || !playerRef.current || !videoId) return;
    const player = playerRef.current;
    const currentVideo = player.getVideoData?.().video_id;
    const targetTime = Number(playback?.currentTime || 0);
    const currentTime = player.getCurrentTime?.() || 0;
    const needsSeek = Math.abs(currentTime - targetTime) > 1.5;

    remoteActionRef.current = true;
    if (currentVideo !== videoId) {
      player.cueVideoById(videoId, targetTime);
    } else if (needsSeek) {
      player.seekTo(targetTime, true);
    }

    if (playback?.isPlaying) {
      player.playVideo?.();
    } else {
      player.pauseVideo?.();
    }

    window.setTimeout(() => {
      remoteActionRef.current = false;
    }, 300);
  }, [playerReady, playback?.currentTime, playback?.isPlaying, videoId]);

  useEffect(() => {
    if (!isHost || !playerReady || !playerRef.current) return undefined;

    const interval = window.setInterval(() => {
      const player = playerRef.current;
      if (!player?.getCurrentTime) return;
      const currentTime = player.getCurrentTime() || 0;
      const lastSample = lastSampleRef.current;
      const expected = lastSample.time + (Date.now() - lastSample.stamp) / 1000;

      if (Math.abs(currentTime - expected) > 2.4) {
        lastSampleRef.current = { time: currentTime, stamp: Date.now() };
        onPlaybackEvent("seek", currentTime, playback?.isPlaying);
        return;
      }

      if (playback?.isPlaying) {
        lastSampleRef.current = { time: currentTime, stamp: Date.now() };
        onPlaybackEvent("sync-state", currentTime, true);
      }
    }, 4000);

    return () => window.clearInterval(interval);
  }, [isHost, onPlaybackEvent, playback?.isPlaying, playerReady]);

  return (
    <div className="glass-panel overflow-hidden p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-400">Now Watching</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
            {movie?.title || "Pick a trailer to start the room"}
          </h2>
          <p className="mt-2 text-sm text-slate-300">{movie?.overview || "Trailer sync appears here for the whole room."}</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="neo-panel inline-flex items-center gap-2 px-4 py-3 text-slate-200">
            <Radio className="h-4 w-4 text-emerald-400" />
            {statusLabel}
          </div>
          <div className="neo-panel inline-flex items-center gap-2 px-4 py-3 text-slate-200">
            {playback?.isPlaying ? <PlayCircle className="h-4 w-4 text-sky-400" /> : <PauseCircle className="h-4 w-4 text-slate-400" />}
            {Math.floor(playback?.currentTime || 0)}s
          </div>
        </div>
      </div>

      <div className="relative mt-5 overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950">
        <div className="aspect-video w-full" ref={mountRef} />
        {!videoId ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/95">
            <div className="text-center">
              <Film className="mx-auto h-12 w-12 text-sky-400" />
              <p className="mt-4 font-display text-2xl font-semibold text-white">Trailer sync starts here</p>
            </div>
          </div>
        ) : null}
      </div>

      <motion.div layout className="mt-4 rounded-[1.5rem] border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-300">
        {isHost
          ? "You are the host. Your play, pause, and scrub actions control the room."
          : "Host controls are synced here automatically. If playback drifts, the next correction pulse will snap it back."}
      </motion.div>
    </div>
  );
}
