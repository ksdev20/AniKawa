import { getSession } from "@/lib/auth/session";

export type FavoriteType = "anime" | "manga" | "character" | "staff" | "studio";

interface Input {
  type: FavoriteType;
  itemId: string;
}

export async function toggleFavorite({ type, itemId }: Input) {
  const session = await getSession();

  if (!session) {
    throw new Error("You must be logged in");
  }

  const response = await fetch("/api/profile/favorites", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",

      Authorization: `Bearer ${session.access_token}`,
    },

    body: JSON.stringify({
      type,
      item_id: itemId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Favorite failed");
  }

  return data;
}
