// src/lib/reactions/toggleReaction.ts

interface ToggleReactionResult {
  success: boolean;

  action?: "added" | "removed";

  error?: string;
}

export async function toggleReaction(
  episodeId: string,
  reactionId: string,
  guestId: string | null,
): Promise<ToggleReactionResult> {
  const response = await fetch("/api/reactions/toggle", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      episodeId,

      reactionId,

      guestId,
    }),
  });

  let result: ToggleReactionResult;

  try {
    result = await response.json();
  } catch {
    result = {
      success: false,
      error: "Invalid server response.",
    };
  }

  if (!response.ok) {
    return {
      success: false,
      error: result.error ?? "Failed updating reaction.",
    };
  }

  return result;
}
