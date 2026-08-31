import type { Anime } from "@/lib/anime/types";

export interface SearchResult {
  anime: Anime;
  relevance: number;
}

/**
 * Search anime by title.
 *
 * Results are ranked by relevance rather than simply
 * filtering with an exact string match.
 */
export function searchAnime(animeList: Anime[], query: string): Anime[] {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return animeList;
  }

  return animeList
    .map((anime) => ({
      anime,
      relevance: getSearchRelevance(anime, normalizedQuery),
    }))
    .filter(({ relevance }) => relevance > 0)
    .sort((a, b) => {
      if (b.relevance !== a.relevance) {
        return b.relevance - a.relevance;
      }

      return a.anime.title.localeCompare(b.anime.title);
    })
    .map(({ anime }) => anime);
}

/**
 * Calculate how strongly an anime matches a search query.
 *
 * Higher score = better match.
 */
export function getSearchRelevance(anime: Anime, query: string): number {
  const title = normalize(anime.title);

  if (!title || !query) {
    return 0;
  }

  /*
  |--------------------------------------------------------------------------|
  | EXACT TITLE
  |--------------------------------------------------------------------------|
  */

  if (title === query) {
    return 1000;
  }

  /*
  |--------------------------------------------------------------------------|
  | TITLE STARTS WITH QUERY
  |--------------------------------------------------------------------------|
  */

  if (title.startsWith(query)) {
    return 800;
  }

  /*
  |--------------------------------------------------------------------------|
  | WORD STARTS WITH QUERY
  |--------------------------------------------------------------------------|
  */

  const words = title.split(" ");

  if (words.some((word) => word.startsWith(query))) {
    return 600;
  }

  /*
  |--------------------------------------------------------------------------|
  | TITLE CONTAINS QUERY
  |--------------------------------------------------------------------------|
  */

  if (title.includes(query)) {
    return 400;
  }

  /*
  |--------------------------------------------------------------------------|
  | FUZZY MATCH
  |--------------------------------------------------------------------------|
  |
  | Allows small spelling mistakes while keeping the search
  | lightweight and dependency-free.
  |
  */

  const distance = levenshteinDistance(title, query);
  const maxLength = Math.max(title.length, query.length);

  if (maxLength === 0) {
    return 0;
  }

  const similarity = 1 - distance / maxLength;

  if (similarity >= 0.75) {
    return Math.round(similarity * 300);
  }

  /*
  |--------------------------------------------------------------------------|
  | CHARACTER-ORDER MATCH
  |--------------------------------------------------------------------------|
  |
  | Example:
  |
  | "demon slayer"
  | "dmslyr"
  |
  | This is intentionally given a low score so stronger
  | title matches always win.
  |
  */

  if (isSubsequence(query, title)) {
    return 100;
  }

  return 0;
}

/**
 * Normalize search text consistently.
 */
function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ");
}

/**
 * Calculate Levenshtein edit distance.
 */
function levenshteinDistance(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  if (a.length === 0) {
    return b.length;
  }

  if (b.length === 0) {
    return a.length;
  }

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i++) {
    const current = [i];

    for (let j = 1; j <= b.length; j++) {
      const insertion = current[j - 1] + 1;
      const deletion = previous[j] + 1;
      const substitution = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);

      current.push(Math.min(insertion, deletion, substitution));
    }

    previous = current;
  }

  return previous[b.length];
}

/**
 * Check whether all characters of the query occur in order
 * inside the title.
 */
function isSubsequence(query: string, title: string): boolean {
  let queryIndex = 0;

  for (const character of title) {
    if (character === query[queryIndex]) {
      queryIndex++;

      if (queryIndex === query.length) {
        return true;
      }
    }
  }

  return false;
}
