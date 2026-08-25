import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { User } from "@supabase/supabase-js";

const LOCAL_KEY = "continueWatching";

export async function getContinueWatchingProgress(
  user: User | null,
  animeId: string,
  episodeNanoid: string,
) {
  /*
    Logged user
  */

  if (user) {
    const supabase = getBrowserSupabaseClient();

    const { data, error } = await supabase
      .from("continue_watching")
      .select("watched_seconds")
      .eq("user_id", user.id)
      .eq("anime_id", animeId)
      .eq("episode_nanoid", episodeNanoid)
      .maybeSingle();

    if (error || !data) {
      return 0;
    }

    return data.watched_seconds ?? 0;
  }

  /*
    Guest
  */

  try {
    const stored = localStorage.getItem(LOCAL_KEY);

    if (!stored) {
      return 0;
    }

    const history = JSON.parse(stored);

    const episodes = history?.[animeId];

    if (!Array.isArray(episodes)) {
      return 0;
    }

    const episode = episodes.find(
      (item) => item.episode_nanoid === episodeNanoid,
    );

    return episode?.watched_seconds ?? 0;
  } catch {
    return 0;
  }
}
