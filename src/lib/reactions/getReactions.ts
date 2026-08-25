// src/lib/reactions/getReactions.ts

export interface Reaction {
  id: string;

  count: number;
}

export async function getReactions(episodeId: string): Promise<Reaction[]> {
  const response = await fetch(
    `/api/reactions/${encodeURIComponent(episodeId)}`,
  );

  if (!response.ok) {
    let message = "Failed loading reactions";

    try {
      const result = await response.json();

      message = result.error ?? message;
    } catch {
      // Ignore invalid JSON
    }

    throw new Error(message);
  }

  return (await response.json()) as Reaction[];
}
