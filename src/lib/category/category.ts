import type { Anime } from "@/lib/anime/types";

import { categoryContent } from "./category.config";
import { getCategoryAnime } from "@/lib/anime/discovery/getCategoryAnime";

/* =========================================================
CATEGORY TYPES
========================================================= */

export type CategoryName = Extract<keyof typeof categoryContent, string>;

export type CategoryConfig = (typeof categoryContent)[CategoryName];

export type CategoryContent = CategoryConfig;

export type CategoryEditorPick = CategoryConfig["editorPicks"][number];

export type CategoryRelatedCategory =
  CategoryConfig["relatedCategories"][number];

export type CategoryFAQItem = CategoryConfig["faq"]["questions"][number];

/* =========================================================
RESOLVED CATEGORY TYPES
========================================================= */

export type CategoryAnimeResult = {
  id: string;
  subtitle: string;
  title: string;
  description: string;
  filter: CategoryEditorPick["filter"];
  anime: Anime[];
};

/* =========================================================
CATEGORY STATS
========================================================= */

export type CategoryStatItem = {
  name: string;
  count: number;
};

export type CategoryCountryStat = {
  name: string;
  count: number;
  percentage: number;
};

export type CategoryStats = {
  totalAnime: number;
  averageScore: number;
  ratedAnime: number;

  years: {
    earliest: number | null;
    latest: number | null;
  };

  formats: CategoryStatItem[];
  statuses: CategoryStatItem[];
  countries: CategoryCountryStat[];
};

/* =========================================================
PAGE DATA
========================================================= */

export type CategoryPageData = {
  category: {
    name: CategoryName;
    content: CategoryConfig;
  };

  anime: Anime[];

  stats: CategoryStats;
  featuredAnime: Anime | null;
};

/* =========================================================
CATEGORY HELPERS
========================================================= */

/**

* Convert a URL slug into a category name.
*
* Examples:
*
* action       -> Action
* adventure    -> Adventure
* sci-fi       -> Sci-Fi
* sci_fi       -> Sci-Fi
  */
export function getCategoryName(slug: string | undefined): CategoryName | null {
  if (!slug) {
    return null;
  }

  const normalizedSlug = slug.trim().toLowerCase().replace(/_/g, "-");

  const categoryNames = Object.keys(categoryContent) as CategoryName[];

  return (
    categoryNames.find((name) => {
      const normalizedName = name.toLowerCase().replace(/\s+/g, "-");

      return normalizedName === normalizedSlug;
    }) ?? null
  );
}

/**

* Get the complete configuration for a category.
  */
export function getCategory(slug: string | undefined): {
  name: CategoryName;
  content: CategoryConfig;
} | null {
  const name = getCategoryName(slug);

  if (!name) {
    return null;
  }

  return {
    name,
    content: categoryContent[name],
  };
}
/**
 * Select the strongest overall anime to feature for a category.
 *
 * The selection deliberately avoids trusting raw scores when the
 * number of ratings is very small.
 *
 * Ranking considers:
 *
 * - Bayesian/confidence-adjusted score
 * - Number of ratings
 * - Popularity
 * - Recency / release year
 * - Catalogue completeness
 *
 * Raw score is never used by itself.
 */
export function getFeaturedAnime(anime: Anime[]): Anime | null {
  if (anime.length === 0) {
    return null;
  }

  return (
    [...anime]
      .map((item) => ({
        anime: item,
        score: getFeaturedScore(item, anime),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        /*
         * Stable tie-breakers.
         */
        if (b.anime.ratedBy !== a.anime.ratedBy) {
          return b.anime.ratedBy - a.anime.ratedBy;
        }

        return (b.anime.popularity ?? 0) - (a.anime.popularity ?? 0);
      })[0]?.anime ?? null
  );
}

/**
 * Calculate how suitable an anime is for the featured spotlight.
 */
function getFeaturedScore(anime: Anime, catalogue: Anime[]): number {
  /*
   * ---------------------------------------------------------------
   * 1. CONFIDENCE-ADJUSTED SCORE
   * ---------------------------------------------------------------
   *
   * Prevents:
   *
   *   10.0 / 2 ratings
   *
   * from beating:
   *
   *   9.3 / 50,000 ratings
   *
   * We use a Bayesian-style weighted rating.
   *
   * C = confidence threshold.
   * M = average score of the category catalogue.
   */
  const validScores = catalogue.filter(
    (item) =>
      Number.isFinite(item.score) &&
      item.score > 0 &&
      Number.isFinite(item.ratedBy) &&
      item.ratedBy > 0,
  );

  const categoryAverage =
    validScores.length > 0
      ? validScores.reduce((sum, item) => sum + item.score, 0) /
        validScores.length
      : 7;

  /*
   * 500 ratings is enough for the anime's own score to become
   * highly influential, while small samples remain conservative.
   */
  const confidence = 500;

  const ratings = Math.max(0, anime.ratedBy || 0);
  const score = Number.isFinite(anime.score) ? anime.score : 0;

  const weightedScore =
    (ratings / (ratings + confidence)) * score +
    (confidence / (ratings + confidence)) * categoryAverage;

  /*
   * ---------------------------------------------------------------
   * 2. RATING CONFIDENCE
   * ---------------------------------------------------------------
   *
   * Give well-established anime a modest advantage.
   *
   * This is intentionally logarithmic so:
   *
   * 100 → 1,000
   *
   * matters, but:
   *
   * 10,000 → 100,000
   *
   * doesn't completely dominate the ranking.
   */
  const ratingConfidence = Math.log10(ratings + 1);

  /*
   * ---------------------------------------------------------------
   * 3. POPULARITY
   * ---------------------------------------------------------------
   *
   * Popularity is useful as a tie-breaker / quality signal,
   * but should never overpower score.
   *
   * The exact direction depends on your AnimeRepository data.
   *
   * If a HIGHER popularity number means MORE popular, use this.
   */
  const popularitySignal =
    anime.popularity > 0 ? Math.log10(anime.popularity + 1) : 0;

  /*
   * ---------------------------------------------------------------
   * 4. DATA QUALITY
   * ---------------------------------------------------------------
   *
   * Prefer anime that can actually make a good featured experience.
   */
  let completeness = 0;

  if (anime.poster) completeness += 1;
  if (anime.backdrop) completeness += 1;
  if (anime.description) completeness += 1;
  if (anime.genres?.length) completeness += 1;
  if (anime.number_of_episodes) completeness += 1;
  if (anime.format) completeness += 1;
  if (anime.year) completeness += 1;

  /*
   * ---------------------------------------------------------------
   * 5. FINAL SCORE
   * ---------------------------------------------------------------
   *
   * Weighted score is overwhelmingly dominant.
   */
  return (
    weightedScore * 100 +
    ratingConfidence * 2 +
    popularitySignal * 1 +
    completeness * 0.5
  );
}
/* =========================================================
CATEGORY PAGE DATA
========================================================= */

/**

* Build everything required by [category].astro.
*
* The returned shape intentionally matches the Astro page:
*
* {
* category: {
* 
  name,
  
* 
  content
  
* },
* anime,
* stats
* }
  */
export async function getCategoryPageData(
  slug: string | undefined,
): Promise<CategoryPageData | null> {
  const category = getCategory(slug);

  if (!category) {
    return null;
  }

  const { name, content } = category;

  /*

* Fetch the complete catalogue once.
*
* The category page uses this same catalogue for:
* * statistics
* * the anime browser
* * editorial information
*
* Editor picks currently describe curated filters but do not
* require separate API requests here.
  */
  const anime = await getCategoryAnime(name);
  const featuredAnime = getFeaturedAnime(anime);

  const stats = getCategoryStats(anime);

  return {
    category: {
      name,
      content,
    },

    anime,

    stats,
    featuredAnime,
  };
}

/* =========================================================
CATEGORY STATS
========================================================= */

/**

* Calculate statistics used by the category page.
*
* This deliberately lives in this file so the category page
* has a single data layer.
  */
export function getCategoryStats(anime: Anime[]): CategoryStats {
  const totalAnime = anime.length;

  /* -------------------------------------------------------
Scores
------------------------------------------------------- */

  const scores = anime
    .map((item) => item.score)
    .filter(
      (score): score is number =>
        typeof score === "number" && Number.isFinite(score) && score > 0,
    );

  const ratedAnime = scores.length;

  const averageScore =
    ratedAnime > 0
      ? scores.reduce((sum, score) => sum + score, 0) / ratedAnime
      : 0;

  /* -------------------------------------------------------
Years
------------------------------------------------------- */

  const years = anime
    .map((item) => item.year)
    .filter(
      (year): year is number =>
        typeof year === "number" && Number.isFinite(year) && year > 0,
    );

  const earliestYear = years.length > 0 ? Math.min(...years) : null;

  const latestYear = years.length > 0 ? Math.max(...years) : null;

  /* -------------------------------------------------------
Formats
------------------------------------------------------- */

  const formats = countAnimeField(anime, "format");

  /* -------------------------------------------------------
Statuses
------------------------------------------------------- */

  const statuses = countAnimeField(anime, "status");

  /* -------------------------------------------------------
Countries
------------------------------------------------------- */

  const countries = countAnimeCountries(anime);

  return {
    totalAnime,
    averageScore,
    ratedAnime,

    years: {
      earliest: earliestYear,
      latest: latestYear,
    },

    formats,
    statuses,
    countries,
  };
}

/* =========================================================
STAT HELPERS
========================================================= */

type AnimeWithDynamicFields = Anime & {
  [key: string]: unknown;
};

/**

* Count a simple string field on Anime.
  */
function countAnimeField(
  anime: Anime[],
  field: "format" | "status",
): CategoryStatItem[] {
  const counts = new Map<string, number>();

  for (const item of anime) {
    const value = (item as AnimeWithDynamicFields)[field];

    if (typeof value !== "string" || !value.trim()) {
      continue;
    }

    const name = value.trim();

    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

/**

* Count countries and calculate their percentage of the
* complete catalogue.
*
* Supports both:
*
* country: "Japan"
*
* and:
*
* countries: ["Japan", "United States"]
  */
function countAnimeCountries(anime: Anime[]): CategoryCountryStat[] {
  const counts = new Map<string, number>();

  for (const item of anime) {
    const record = item as AnimeWithDynamicFields;

    const value = record.countries ?? record.country;

    const values = Array.isArray(value)
      ? value
      : typeof value === "string"
        ? [value]
        : [];

    const uniqueValues = new Set(
      values
        .filter(
          (country): country is string =>
            typeof country === "string" && country.trim().length > 0,
        )
        .map((country) => country.trim()),
    );

    for (const country of uniqueValues) {
      counts.set(country, (counts.get(country) ?? 0) + 1);
    }
  }

  const total = anime.length;

  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/* =========================================================
CATEGORY UTILS
========================================================= */

/**

* Return all available category names.
  */
export function getCategoryNames(): CategoryName[] {
  return Object.keys(categoryContent) as CategoryName[];
}

/**

* Check whether a category exists.
  */
export function isCategoryName(value: string): value is CategoryName {
  return value in categoryContent;
}

/**

* Convert a category name to its URL slug.
  */
export function categoryToSlug(category: CategoryName): string {
  return category.toLowerCase().replace(/\s+/g, "-");
}
