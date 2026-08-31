import type { Anime } from "@/lib/anime/types";

import { filterAnime } from "@/lib/anime/filtering/filterAnime";
import { searchAnime } from "@/lib/anime/filtering/searchAnime";
import { sortAnime, type AnimeSortMode } from "@/lib/anime/filtering/sortAnime";

import type { AnimeCatalogueFilters } from "@/lib/anime/filtering/animeFilters";

export interface AnimeDiscoveryOptions {
  filters: AnimeCatalogueFilters;
  search?: string;
  sort?: AnimeSortMode;
  limit?: number;
}

/**
 * Runs discovery operations against an already-selected anime catalogue.
 *
 * Category membership is handled before this function is called.
 *
 * Pipeline:
 *
 * filter → search → sort → limit
 */
export function getAnimeDiscovery(
  animeList: Anime[],
  options: AnimeDiscoveryOptions,
): Anime[] {
  const { filters, search = "", sort = "default", limit } = options;

  let result = animeList;

  // Filter
  result = filterAnime(result, filters);

  // Search
  if (search.trim()) {
    result = searchAnime(result, search);
  }

  // Sort
  result = sortAnime(result, sort);

  // Limit
  if (typeof limit === "number" && Number.isFinite(limit) && limit >= 0) {
    result = result.slice(0, limit);
  }

  return result;
}
