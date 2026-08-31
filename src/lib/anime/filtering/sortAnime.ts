import type { Anime } from "@/lib/anime/types";

export type AnimeSortMode =
  "default" | "title" | "score" | "year" | "popularity";

/**
 * Sort a collection of anime without mutating the original array.
 *
 * `default` preserves the incoming order.
 */
export function sortAnime(
  animeList: Anime[],
  sort: AnimeSortMode = "default",
): Anime[] {
  if (sort === "default") {
    return [...animeList];
  }

  return [...animeList].sort((a, b) => {
    switch (sort) {
      case "title":
        return a.title.localeCompare(b.title);

      case "score":
        return (b.score ?? 0) - (a.score ?? 0);

      case "year": {
        const yearA = getAnimeYear(a);
        const yearB = getAnimeYear(b);

        return yearB - yearA;
      }

      case "popularity":
        return (b.popularity ?? 0) - (a.popularity ?? 0);

      default:
        return 0;
    }
  });
}

/**
 * Get the release year from the normalized `year` field,
 * falling back to `startDate` for older or incomplete records.
 */
export function getAnimeYear(anime: Anime): number {
  if (typeof anime.year === "number" && Number.isFinite(anime.year)) {
    return anime.year;
  }

  if (anime.startDate) {
    const year = Number(anime.startDate.slice(0, 4));

    if (Number.isFinite(year)) {
      return year;
    }
  }

  return 0;
}
