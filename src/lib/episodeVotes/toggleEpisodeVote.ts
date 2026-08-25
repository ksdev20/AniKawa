// src/lib/episodeVotes/toggleEpisodeVote.ts

import type { Vote, EpisodeVotesResponse } from "@/types/episodeVotes";

export async function toggleEpisodeVote(
  episodeId: string,
  vote: Vote,
): Promise<EpisodeVotesResponse> {
  const response = await fetch("/api/episode/vote", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      episodeId,

      vote,
    }),
  });

  if (!response.ok) {
    let message = "Failed updating vote";

    try {
      const result = await response.json();

      message = result.error ?? message;
    } catch {
      // ignore invalid JSON
    }

    throw new Error(message);
  }

  const result = await response.json();

  return {
    likes: result.total_likes,

    dislikes: result.total_dislikes,

    myVote: result.my_vote,
  };
}
