import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { User } from "@supabase/supabase-js";

const LOCAL_KEY = "continueWatching";

interface SaveContinueWatchingInput {
  user: User | null;
  animeId: string;
  episodeNanoid: string;
  watchedSeconds?: number;
  durationSeconds?: number;
}

export async function saveContinueWatching({
  user,
  animeId,
  episodeNanoid,
  watchedSeconds = 0,
  durationSeconds = 0,
}: SaveContinueWatchingInput) {
  const item = {
    anime_id: animeId,
    episode_nanoid: episodeNanoid,
    watched_seconds: watchedSeconds,
    duration_seconds: durationSeconds,
    updated_at: Date.now(),
  };

  if (user) {
    const supabase = getBrowserSupabaseClient();

    const { error } = await supabase.from("continue_watching").upsert(
      {
        user_id: user.id,
        anime_id: animeId,
        episode_nanoid: episodeNanoid,
        watched_seconds: watchedSeconds,
        duration_seconds: durationSeconds,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,anime_id,episode_nanoid",
      },
    );

    if (error) {
      console.error("[Continue Watching Save]", error);
    }

    return;
  }

  try {
    const stored = localStorage.getItem(LOCAL_KEY);

    const history = stored ? JSON.parse(stored) : {};

    if (!history[animeId]) {
      history[animeId] = [];
    }

    const episodes = history[animeId];

    const existingIndex = episodes.findIndex(
      (episode: typeof item) => episode.episode_nanoid === episodeNanoid,
    );

    if (existingIndex >= 0) {
      episodes[existingIndex] = item;
    } else {
      episodes.push(item);
    }

    localStorage.setItem(LOCAL_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("[Continue Watching Local Save]", error);
  }
}
