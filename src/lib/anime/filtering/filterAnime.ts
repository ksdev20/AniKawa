import type { Anime } from "@/lib/anime/types";
import type { AnimeCatalogueFilters } from "./animeFilters";

/**
 * Filter a collection of anime using the shared catalogue filter rules.
 *
 * Category membership is handled before this function is called.
 *
 * This function is intentionally independent of React, Zustand, or
 * any page-specific UI so it can be reused by:
 *
 * - Profile AnimeList
 * - Category pages
 * - Search pages
 * - Future discovery experiences
 */
export function filterAnime(
  animeList: Anime[],
  filters: AnimeCatalogueFilters,
): Anime[] {
  let result = animeList;

  /*
  |--------------------------------------------------------------------------|
  | FORMAT
  |--------------------------------------------------------------------------|
  */

  if (filters.format !== "All formats") {
    result = result.filter((anime) => anime.format === filters.format);
  }

  /*
  |--------------------------------------------------------------------------|
  | RELEASE STATUS
  |--------------------------------------------------------------------------|
  |
  | This is the anime's catalogue/release status.
  |
  | It is intentionally separate from a user's personal list status.
  |
  */

  if (filters.releaseStatus !== "All statuses") {
    result = result.filter((anime) => {
      const releaseStatus = anime.status?.trim().toLowerCase();

      switch (filters.releaseStatus) {
        case "Cancelled":
          return releaseStatus === "cancelled" || releaseStatus === "canceled";

        case "Finished":
          return (
            releaseStatus === "finished" ||
            releaseStatus === "ended" ||
            releaseStatus === "completed"
          );

        case "Releasing":
          return (
            releaseStatus === "releasing" ||
            releaseStatus === "returning series"
          );

        default:
          return true;
      }
    });
  }

  /*
  |--------------------------------------------------------------------------|
  | COUNTRY
  |--------------------------------------------------------------------------|
  */

  if (filters.country !== "All countries") {
    result = result.filter((anime) => anime.country === filters.country);
  }

  /*
  |--------------------------------------------------------------------------|
  | GENRE
  |--------------------------------------------------------------------------|
  */

  if (filters.genre !== "All genres") {
    result = result.filter(
      (anime) => anime.genres?.includes(filters.genre) ?? false,
    );
  }

  /*
  |--------------------------------------------------------------------------|
  | YEAR
  |--------------------------------------------------------------------------|
  |
  | Prefer the normalized `year` field.
  |
  | Fall back to the first four characters of `startDate` for older
  | records that may not have `year` populated yet.
  |
  */

  const yearFrom = filters.yearFrom ? Number(filters.yearFrom) : null;

  const yearTo = filters.yearTo ? Number(filters.yearTo) : null;

  if (yearFrom !== null && Number.isFinite(yearFrom)) {
    result = result.filter((anime) => {
      const year =
        anime.year ??
        (anime.startDate ? Number(anime.startDate.slice(0, 4)) : null);

      return year !== null && Number.isFinite(year) && year >= yearFrom;
    });
  }

  if (yearTo !== null && Number.isFinite(yearTo)) {
    result = result.filter((anime) => {
      const year =
        anime.year ??
        (anime.startDate ? Number(anime.startDate.slice(0, 4)) : null);

      return year !== null && Number.isFinite(year) && year <= yearTo;
    });
  }

  return result;
}
