import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

import { getAnimeById } from "@/filters/getAnimeById";

import type { Anime } from "@/lib/anime";

const LOCAL_STORAGE_KEY = "recentlyWatched";

const MAX_ITEMS = 20;

interface RecentlyWatchedLocalItem {
  animeId: string;
  watchedAt: number;
}

export async function getRecentlyWatched(
  userId: string | null,
): Promise<Anime[]> {
  let animeIds: string[] = [];

  /*
    Logged in user
    Supabase source
  */

  if (userId) {
    const supabase = getBrowserSupabaseClient();

    const { data, error } = await supabase
      .from("recently_watched")
      .select(
        `
          anime_id
        `,
      )
      .eq("user_id", userId)
      .order("watched_at", {
        ascending: false,
      })
      .limit(MAX_ITEMS);

    if (error) {
      console.error("[Recently Watched Fetch]", error);

      return [];
    }

    animeIds = data?.map((item) => item.anime_id) ?? [];
  }

  /*
    Guest user
    localStorage source
  */
  else {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (!stored) {
        return [];
      }

      const items: RecentlyWatchedLocalItem[] = JSON.parse(stored);

      if (!Array.isArray(items) || items.length === 0) {
        return [];
      }

      animeIds = items
        .sort((a, b) => b.watchedAt - a.watchedAt)
        .slice(0, MAX_ITEMS)
        .map((item) => item.animeId);
    } catch (error) {
      console.error("[Recently Watched Local Fetch]", error);

      return [];
    }
  }

  if (animeIds.length === 0) {
    return [];
  }

  /*
    Hydrate anime data
  */

  const animeResults = await Promise.all(
    animeIds.map(async (animeId) => {
      try {
        return await getAnimeById(animeId);
      } catch (error) {
        console.error(`[Recently Watched Anime Missing] ${animeId}`, error);

        return null;
      }
    }),
  );

  return animeResults.filter((anime): anime is Anime => anime !== null);
}
