import { AnimeRepository } from "@/lib/anime";

import type { Anime } from "@/lib/anime/types";

import type { CategoryName } from "@/lib/category/category";

export interface CategoryAnimeOptions {
  /**
   * Maximum number of anime to return.
   *
   * Omit to return the complete category catalogue.
   */
  limit?: number;
}

/* ================================================================
   CATEGORY KEYWORDS
   ================================================================ */

/**
 * Additional signals used when genre data is incomplete.
 *
 * These are intentionally category-specific rather than using a
 * generic substring search, which could create bad matches.
 */
const CATEGORY_KEYWORDS: Record<CategoryName, string[]> = {
  Action: [
    "action",
    "battle",
    "combat",
    "fighting",
    "war",
    "assassin",
    "martial arts",
  ],

  Adventure: [
    "adventure",
    "journey",
    "exploration",
    "explore",
    "travel",
    "quest",
    "expedition",
  ],

  Fantasy: [
    "fantasy",
    "magic",
    "magical",
    "wizard",
    "witch",
    "sorcery",
    "spell",
    "mythical",
    "dragon",
    "demon",
    "elf",
    "isekai",
  ],

  Sports: [
    "sport",
    "sports",
    "football",
    "soccer",
    "basketball",
    "baseball",
    "volleyball",
    "tennis",
    "swimming",
    "boxing",
    "wrestling",
    "cycling",
    "running",
    "track",
    "field",
    "athletics",
    "karate",
    "judo",
    "kendo",
    "gymnastics",
    "skateboarding",
    "surfing",
    "golf",
    "racing",
    "competition",
    "tournament",
    "championship",
    "team",
    "coach",
    "athlete",
  ],

  Thriller: [
    "thriller",
    "psychological",
    "suspense",
    "mystery",
    "serial killer",
    "murder",
    "crime",
    "conspiracy",
    "survival",
  ],

  Supernatural: [
    "supernatural",
    "ghost",
    "spirit",
    "spirits",
    "yokai",
    "youkai",
    "demon",
    "curse",
    "haunted",
    "exorcist",
    "paranormal",
    "occult",
    "vampire",
    "werewolf",
    "psychic",
  ],

  Comedy: [
    "comedy",
    "funny",
    "humor",
    "humour",
    "parody",
    "satire",
    "gag",
    "slapstick",
    "absurd",
  ],

  Romance: [
    "romance",
    "romantic",
    "love",
    "relationship",
    "dating",
    "couple",
    "girlfriend",
    "boyfriend",
    "marriage",
  ],

  Drama: [
    "drama",
    "emotional",
    "family",
    "tragedy",
    "friendship",
    "coming of age",
    "life",
  ],

  Music: [
    "music",
    "musical",
    "band",
    "singer",
    "singing",
    "idol",
    "concert",
    "piano",
    "guitar",
    "song",
  ],

  "Sci-Fi": [
    "sci-fi",
    "science fiction",
    "science-fiction",
    "space",
    "spaceship",
    "robot",
    "android",
    "cyborg",
    "technology",
    "future",
    "futuristic",
    "mecha",
    "artificial intelligence",
    "ai",
    "alien",
    "planet",
    "galaxy",
    "time travel",
  ],
};

/* ================================================================
   CATEGORY NORMALIZATION
   ================================================================ */

function normalize(value: string | undefined): string {
  return (
    value
      ?.trim()
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim() ?? ""
  );
}

/* ================================================================
   CATEGORY MATCHING
   ================================================================ */

function belongsToCategory(anime: Anime, category: CategoryName): boolean {
  const normalizedCategory = normalize(category);

  /*
   * --------------------------------------------------------------
   * GENRE MATCH
   * --------------------------------------------------------------
   *
   * Genre is the strongest and most reliable signal.
   */

  const genreMatch =
    anime.genres?.some((genre) => normalize(genre) === normalizedCategory) ??
    false;

  if (genreMatch) {
    return true;
  }

  /*
   * --------------------------------------------------------------
   * KEYWORD MATCH
   * --------------------------------------------------------------
   *
   * Keywords are used as a fallback when the genre field does not
   * explicitly contain the category.
   */

  const categoryKeywords = CATEGORY_KEYWORDS[category] ?? [];

  if (categoryKeywords.length === 0) {
    return false;
  }

  const keywords = normalize(anime.keywords);

  if (!keywords) {
    return false;
  }

  return categoryKeywords.some((keyword) => {
    const normalizedKeyword = normalize(keyword);

    return (
      keywords === normalizedKeyword || keywords.includes(normalizedKeyword)
    );
  });
}

/* ================================================================
   MAIN
   ================================================================ */

/**
 * Get the complete Anime objects belonging to a category.
 *
 * Matching uses:
 *
 * 1. Exact normalized genre match
 * 2. Category-specific keyword matching
 *
 * The original full Anime object is always returned.
 */
export async function getCategoryAnime(
  categoryName: CategoryName,
  options: CategoryAnimeOptions = {},
): Promise<Anime[]> {
  const allAnime = await AnimeRepository.getAllAnime();

  const result: Anime[] = [];

  for (const anime of allAnime) {
    if (!anime) {
      continue;
    }

    if (!belongsToCategory(anime, categoryName)) {
      continue;
    }

    result.push(anime);

    if (
      typeof options.limit === "number" &&
      Number.isFinite(options.limit) &&
      options.limit >= 0 &&
      result.length >= options.limit
    ) {
      break;
    }
  }

  return result;
}
