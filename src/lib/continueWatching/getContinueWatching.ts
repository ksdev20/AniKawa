import { supabase } from "@/lib/supabase/browser";
import { getEpisode } from "@/filters/getAnimeById";
import {
  LOCAL_KEY,
  type ContinueWatchingRecord,
  type LocalContinueWatchingHistory,
} from "@/types/continueWatching";
import type { ResolvedPublicEpisode } from "@/types/profile";

export async function getContinueWatching(
  userId: string | null,
): Promise<ResolvedPublicEpisode[]> {
  let history: ContinueWatchingRecord[] = [];

  /*
   * --------------------------------------------------------------------------
   * Logged in user
   * --------------------------------------------------------------------------
   */

  if (userId) {
    const { data, error } = await supabase
      .from("continue_watching")
      .select(
        `
          anime_id,
          episode_nanoid,
          watched_seconds,
          duration_seconds,
          updated_at
        `,
      )
      .eq("user_id", userId)
      .order("updated_at", {
        ascending: false,
      })
      .limit(20);

    if (error) {
      console.error(
        "[Continue Watching] Failed getting continue watching",
        error,
      );

      return [];
    }

    history = (data ?? []).map((item): ContinueWatchingRecord => ({
      anime_id: item.anime_id,
      episode_nanoid: item.episode_nanoid,
      watched_seconds: item.watched_seconds ?? 0,
      duration_seconds: item.duration_seconds ?? 0,
      updated_at: item.updated_at,
    }));
  }

  /*
   * --------------------------------------------------------------------------
   * Guest user
   * --------------------------------------------------------------------------
   */
  else {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const stored = localStorage.getItem(LOCAL_KEY);

      if (!stored) {
        return [];
      }

      const parsed: LocalContinueWatchingHistory = JSON.parse(stored);

      history = Object.values(parsed)
        .flat()
        .map((episode): ContinueWatchingRecord => ({
          anime_id: episode.anime_id,
          episode_nanoid: episode.episode_nanoid,
          watched_seconds: episode.watched_seconds ?? 0,
          duration_seconds: episode.duration_seconds ?? 0,
          updated_at:
            episode.updated_at != null
              ? new Date(episode.updated_at).toISOString()
              : null,
        }))
        .sort(
          (a, b) =>
            new Date(b.updated_at ?? 0).getTime() -
            new Date(a.updated_at ?? 0).getTime(),
        )
        .slice(0, 20);
    } catch (error) {
      console.error("[Continue Watching] Failed reading local history", error);

      return [];
    }
  }

  /*
   * --------------------------------------------------------------------------
   * Resolve episode information
   * --------------------------------------------------------------------------
   */

  const result = await Promise.all(
    history.map(async (item): Promise<ResolvedPublicEpisode | null> => {
      const episode = await getEpisode(item.anime_id, item.episode_nanoid);

      if (!episode) {
        console.warn("[Continue Watching] Missing episode", item);

        return null;
      }

      return {
        ...episode,
        userStats: item,
      };
    }),
  );

  return result.filter((item): item is ResolvedPublicEpisode => item !== null);
}
