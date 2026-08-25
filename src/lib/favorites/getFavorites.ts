import { getSession } from "@/lib/auth/session";

export async function getFavorites() {
  const session = await getSession();

  if (!session) {
    return [];
  }

  const response = await fetch("/api/profile/favorites", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch favorites");
  }

  return response.json();
}
