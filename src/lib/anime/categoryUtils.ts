import type { Anime } from "@/lib/anime/types";

export function normalizeAnimeTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/(season|s)\s?\d+/g, "")
    .replace(/(part|cour)\s?\d+/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

export function removeDuplicateSlugAnime(animeList: Anime[]) {
  const usedSlugs = new Set<string>();

  return animeList.filter((anime) => {
    if (!anime.slug) return true;

    if (usedSlugs.has(anime.slug)) {
      return false;
    }

    usedSlugs.add(anime.slug);

    return true;
  });
}
