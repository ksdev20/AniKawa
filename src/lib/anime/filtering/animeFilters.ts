export interface AnimeCatalogueFilters {
  format: "All formats" | "TV" | "Movie" | "OVA" | "ONA" | "Special" | "Music";

  releaseStatus: "All statuses" | "Finished" | "Releasing" | "Cancelled";

  country: string;

  genre: string;

  yearFrom: string;

  yearTo: string;
}

export const DEFAULT_ANIME_CATALOGUE_FILTERS: AnimeCatalogueFilters = {
  format: "All formats",
  releaseStatus: "All statuses",
  country: "All countries",
  genre: "All genres",
  yearFrom: "",
  yearTo: "",
};
