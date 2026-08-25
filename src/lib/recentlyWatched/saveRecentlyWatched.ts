import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

const LOCAL_STORAGE_KEY = "recentlyWatched";

const MAX_ITEMS = 20;

interface SaveRecentlyWatchedInput {
  animeId: string;
  userId: string | null;
}

interface RecentlyWatchedLocalItem {
  animeId: string;
  watchedAt: number;
}

export async function saveRecentlyWatched({
  animeId,
  userId,
}: SaveRecentlyWatchedInput) {
  if (!animeId) {
    return;
  }

  /*
    Logged in user
    Supabase source
  */

  if (userId) {
    const supabase = getBrowserSupabaseClient();

    const { error } = await supabase.from("recently_watched").upsert(
      {
        user_id: userId,
        anime_id: animeId,
        watched_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,anime_id",
      },
    );

    if (error) {
      console.error("[Recently Watched Save]", error);
    }

    return;
  }

  /*
    Guest user
    localStorage source
  */

  if (typeof window === "undefined") {
    return;
  }

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);

    let items: RecentlyWatchedLocalItem[] = [];

    if (stored) {
      items = JSON.parse(stored);
    }

    const filtered = items.filter((item) => item.animeId !== animeId);

    filtered.unshift({
      animeId,
      watchedAt: Date.now(),
    });

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(filtered.slice(0, MAX_ITEMS)),
    );
  } catch (error) {
    console.error("[Recently Watched Local Save]", error);
  }
}
