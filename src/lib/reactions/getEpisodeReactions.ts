import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

export interface EpisodeReaction {
  id: string;

  count: number;
}

export async function getEpisodeReactions(
  supabase: SupabaseClient<Database>,
  episodeId: string,
): Promise<EpisodeReaction[]> {
  if (!episodeId.trim()) {
    throw new Error("Invalid episode id");
  }

  const { data, error } = await supabase
    .from("episode_reactions")
    .select("reaction_id")
    .eq("episode_id", episodeId);

  if (error) {
    console.error("[getEpisodeReactions]", error);

    throw new Error("Failed loading reactions");
  }

  const counts = new Map<string, number>();

  for (const row of data) {
    counts.set(row.reaction_id, (counts.get(row.reaction_id) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([id, count]) => ({
    id,
    count,
  }));
}
