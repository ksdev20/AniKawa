import type { Anime } from "@/lib/anime/types";
import { AnimeCatalog } from "@/lib/anime/AnimeCatalog";
import type { PublicFavorite } from "@/types/profile";

export async function resolvePublicFavoriteAnime(
  favorites: PublicFavorite[],
): Promise<Anime[]> {
  const animeFavoriteIds = favorites
    .filter((favorite) => favorite.type === "anime")
    .map((favorite) => favorite.item_id);

  if (!animeFavoriteIds.length) {
    return [];
  }

  const uniqueAnimeIds = [
    ...new Set(animeFavoriteIds),
  ];

  const animeRecords =
    await AnimeCatalog.getAnimeByIds(uniqueAnimeIds);

  const animeById = new Map(
    animeRecords.map((record) => [
      record.anime.nanoid,
      record.anime,
    ]),
  );

  return animeFavoriteIds
    .map((animeId) => animeById.get(animeId))
    .filter(
      (anime): anime is Anime =>
        anime !== undefined,
    );
}