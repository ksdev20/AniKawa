import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

const CONTINUE_WATCHING_KEY = "continueWatching";
const RECENTLY_WATCHED_KEY = "recentlyWatched";

export async function mergeGuestUserData(userId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const supabase = getBrowserSupabaseClient();

  /*
    Merge continue watching
  */

  const continueWatchingSuccess = await mergeContinueWatching(supabase, userId);

  /*
    Merge recently watched
  */

  const recentlyWatchedSuccess = await mergeRecentlyWatched(supabase, userId);

  /*
    Remove local data only after successful merge
  */

  if (continueWatchingSuccess) {
    localStorage.removeItem(CONTINUE_WATCHING_KEY);
  }

  if (recentlyWatchedSuccess) {
    localStorage.removeItem(RECENTLY_WATCHED_KEY);
  }
}

/*
  Continue Watching
*/

async function mergeContinueWatching(
  supabase: ReturnType<typeof getBrowserSupabaseClient>,
  userId: string,
) {
  const stored = localStorage.getItem(CONTINUE_WATCHING_KEY);

  if (!stored) {
    return true;
  }

  let history: Record<string, Record<string, any>>;

  try {
    history = JSON.parse(stored);
  } catch {
    console.error("[mergeGuestUserData] Invalid continue watching storage");

    return false;
  }

  const rows = Object.entries(history).flatMap(([animeId, episodes]) =>
    Object.values(episodes)
      .filter((data) => data?.episodeNanoid)
      .map((data) => ({
        user_id: userId,
        anime_id: animeId,
        episode_nanoid: data.episodeNanoid,
        watched_seconds: data.watchedSeconds ?? 0,
        duration_seconds: data.durationSeconds ?? 0,
        updated_at: new Date(data.updatedAt ?? Date.now()).toISOString(),
      })),
  );

  if (rows.length === 0) {
    return true;
  }

  const { error } = await supabase.from("continue_watching").upsert(rows, {
    onConflict: "user_id,anime_id,episode_nanoid",
  });

  if (error) {
    console.error("[mergeGuestUserData] continue watching failed:", error);

    return false;
  }

  return true;
}

/*
  Recently Watched
*/
async function mergeRecentlyWatched(
  supabase: ReturnType<typeof getBrowserSupabaseClient>,
  userId: string,
) {
  const stored = localStorage.getItem(RECENTLY_WATCHED_KEY);

  if (!stored) {
    return true;
  }

  let history: {
    animeId: string;
    watchedAt: number;
  }[];

  try {
    history = JSON.parse(stored);
  } catch {
    console.error("[mergeGuestUserData] Invalid recently watched storage");

    return false;
  }

  if (!Array.isArray(history) || history.length === 0) {
    return true;
  }

  const rows = history.flatMap((item) => {
    const date = new Date(item.watchedAt);

    if (!item.animeId || isNaN(date.getTime())) {
      return [];
    }

    return [
      {
        user_id: userId,
        anime_id: item.animeId,
        watched_at: date.toISOString(),
      },
    ];
  });

  const { error } = await supabase.from("recently_watched").upsert(rows, {
    onConflict: "user_id,anime_id",
  });

  if (error) {
    console.error("[mergeGuestUserData] recently watched failed:", error);

    return false;
  }

  return true;
}
