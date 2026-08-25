import type { SupabaseClient } from "@supabase/supabase-js";

export async function getEpisodeVotes(
  supabase: SupabaseClient,
  episodeId: string,
) {
  try {
    const query = supabase
      .from("episode_vote_counts")
      .select("likes, dislikes")
      .eq("episode_id", episodeId)
      .maybeSingle();

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Vote fetch timeout")), 3000),
    );

    const { data, error } = (await Promise.race([query, timeout])) as any;

    if (error) {
      console.error("Vote count error:", error);

      return {
        likes: 0,
        dislikes: 0,
      };
    }

    return {
      likes: data?.likes ?? 0,
      dislikes: data?.dislikes ?? 0,
    };
  } catch (error) {
    console.error("Episode vote preload failed:", error);

    return {
      likes: 0,
      dislikes: 0,
    };
  }
}
