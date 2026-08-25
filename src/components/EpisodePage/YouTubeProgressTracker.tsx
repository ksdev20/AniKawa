import { useCallback, useEffect, useRef } from "react";
import { saveContinueWatching } from "@/lib/continueWatching/saveContinueWatching";
import { getContinueWatchingProgress } from "@/lib/continueWatching/getContinueWatchingProgress";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@supabase/supabase-js";

interface Props {
  animeId: string;
  episodeNanoid: string;
}

export default function YouTubeProgressTracker({
  animeId,
  episodeNanoid,
}: Props) {
  const { user } = useAuth();

  const playerRef = useRef<YT.Player | null>(null);

  const userRef = useRef<User | null>(null);

  const initializedRef = useRef(false);

  const destroyedRef = useRef(false);

  const autosaveRef = useRef<number | null>(null);

  const savingRef = useRef(false);

  const iframeId = `episode-iframe-${episodeNanoid}`;

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const stopAutosave = useCallback(() => {
    if (autosaveRef.current !== null) {
      clearInterval(autosaveRef.current);
      autosaveRef.current = null;
    }
  }, []);

  const save = useCallback(async () => {
    const player = playerRef.current;

    if (
      !player ||
      typeof player.getCurrentTime !== "function" ||
      typeof player.getDuration !== "function"
    ) {
      return;
    }

    if (savingRef.current) {
      return;
    }

    const watchedSeconds = Math.floor(player.getCurrentTime());

    const durationSeconds = Math.floor(player.getDuration());

    // ignore accidental page opens
    if (watchedSeconds < 5) {
      return;
    }

    savingRef.current = true;

    try {
      // console.log("Saving progress", watchedSeconds, "/", durationSeconds);

      await saveContinueWatching({
        user: userRef.current,
        animeId,
        episodeNanoid,
        watchedSeconds,
        durationSeconds,
      });
    } finally {
      savingRef.current = false;
    }
  }, [animeId, episodeNanoid]);

  const handleStateChange = useCallback(
    (event: YT.OnStateChangeEvent) => {
      switch (event.data) {
        case YT.PlayerState.PLAYING:
          if (!autosaveRef.current) {
            autosaveRef.current = window.setInterval(save, 5000);
          }

          break;

        case YT.PlayerState.PAUSED:

        case YT.PlayerState.ENDED:
          void save();

          stopAutosave();

          break;
      }
    },
    [save, stopAutosave],
  );

  const handleResume = useCallback(
    async (player: YT.Player) => {
      const seconds = await getContinueWatchingProgress(
        userRef.current,
        animeId,
        episodeNanoid,
      );

      if (seconds >= 5) {
        setTimeout(() => {
          try {
            player.seekTo(seconds, true);
          } catch {}
        }, 800);
      }
    },
    [animeId, episodeNanoid],
  );

  const handleReady = useCallback(
    async (event: YT.PlayerEvent) => {
      // console.log("YT READY");

      await handleResume(event.target);
    },
    [handleResume],
  );

  const loadYouTubeAPI = useCallback(async () => {
    if (window.YT?.Player) {
      return;
    }

    await new Promise<void>((resolve) => {
      const existing = document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]',
      );

      if (existing) {
        const previous = window.onYouTubeIframeAPIReady;

        window.onYouTubeIframeAPIReady = () => {
          previous?.();
          resolve();
        };

        return;
      }

      window.onYouTubeIframeAPIReady = resolve;

      const script = document.createElement("script");

      script.src = "https://www.youtube.com/iframe_api";

      document.body.appendChild(script);
    });
  }, []);

  const initPlayer = useCallback(async () => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    // console.log("PLAYER INIT");

    await loadYouTubeAPI();

    await new Promise((r) => setTimeout(r, 500));

    if (destroyedRef.current) {
      return;
    }

    const existing = YT.get?.(iframeId);

    if (existing) {
      playerRef.current = existing;

      await handleResume(existing);

      return;
    }

    playerRef.current = new YT.Player(iframeId, {
      events: {
        onReady: handleReady,
        onStateChange: handleStateChange,
      },
    });
  }, [iframeId, loadYouTubeAPI, handleReady, handleStateChange]);

  useEffect(() => {
    destroyedRef.current = false;

    void initPlayer();

    return () => {
      // console.log("PLAYER CLEANUP");

      stopAutosave();

      void save();

      destroyedRef.current = true;

      setTimeout(() => {
        playerRef.current?.destroy();

        playerRef.current = null;

        initializedRef.current = false;
      }, 150);
    };
  }, [initPlayer, save, stopAutosave]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        void save();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [save]);

  return null;
}
