// src/lib/anime/filters.ts
import { AnimeRepository } from "@/lib/anime";
import type { Anime, Episode } from "@/lib/anime/types";
import dayjs from "dayjs";

type FilterMode = "single" | "genreCompare";

interface FilterFn {
  fn: (anime: Anime) => boolean;
  mode?: FilterMode;
}

interface FilterOptions {
  genresA?: string[];
  categoryA?: string;
  categoryB?: string;
  forSubCatPage?: boolean;
  usedTitlesGlobal?: string[];
}

const recommendedAnimeNanoIds = [
  "lLIJIsO39FWYFtg",
  "xEjlkrTP7Ccp2EF",
  "PzUiA7d2vtMJMo9",
  "5Z7qwy51WLHEyZu",
  "38pr1sDYWL5DT4J",
  "HgHI9gfwdzgwjZp",
  "8n-ES8yeTKR1rAM",
  "4SnuL7GiJiAGnW2",
  "su_DPYWQYS3OchJ",
  "SBJntSz0jhVrrr6",
  "XuPhC3vPost7qJO",
  "4mA6aduyBCW348y",
];

// 🔧 Sorting helpers
function sortByDate(arr: Anime[]): Anime[] {
  return [...arr].sort((a, b) => {
    const dateA = dayjs(a?.startDate ?? "2000-01-01").valueOf();
    const dateB = dayjs(b?.startDate ?? "2000-01-01").valueOf();
    return dateB - dateA;
  });
}

function sortByScore(arr: Anime[]): Anime[] {
  return [...arr].sort((a, b) => {
    const scoreA = a?.score ?? "0";
    const scoreB = b?.score ?? "0";
    return scoreB - scoreA;
  });
}

// 🔧 Filter functions
function sameMonthAnimeGen(anime: Anime): boolean {
  if (!anime?.startDate) return false;
  const [year, month] = anime.startDate.split("-").map(Number);
  const now = new Date();
  return (
    Number(year) === now.getFullYear() && Number(month) === now.getMonth() + 1
  );
}

function beginnerAnime(anime: Anime): boolean {
  const year = getYear(anime);
  const currentYear = new Date().getFullYear();
  return (
    year < currentYear - 3 && year > currentYear - 10 && (anime.score ?? 0) >= 7
  );
}

function isPopular(anime: Anime): boolean {
  return (anime.score ?? 0) >= 7;
}

function actionPopular(anime: Anime): boolean {
  return genreCheck(anime, "Action") && (anime.score ?? 0) >= 8;
}

function adventurePopular(anime: Anime): boolean {
  return genreCheck(anime, "Adventure") && (anime.score ?? 0) >= 7;
}

function romancePopular(anime: Anime): boolean {
  return genreCheck(anime, "Romance") && (anime.score ?? 0) >= 7;
}

function topRatedLast5(anime: Anime): boolean {
  const year = getYear(anime);

  const currentYear = new Date().getFullYear();

  const fiveYearsAgo = currentYear - 5;

  const passed =
    year >= fiveYearsAgo && year <= currentYear && (anime.score ?? 0) >= 7.5;

  return passed;
}

function recommendedByAnikawa(anime: Anime): boolean {
  const exists = recommendedAnimeNanoIds.includes(anime.nanoid);
  return exists;
}

// 🔧 Category matching
function matchCategories(
  genresA: string[],
  genresB: string[],
  keywords: string[] = [],
): boolean {
  if (!genresB || genresB.length <= 1) return false;
  let count = 0;
  return genresA.some((x) => {
    const lowered = x.toLowerCase();
    if (genresB.includes(x)) count++;
    if (keywords.includes(lowered)) count++;
    return genresA.length === 1 ? count === 1 : count >= 2;
  });
}

// 🔧 Utility
function getYear(anime: Anime): number {
  return Number(anime?.startDate?.split("-")[0] ?? 0);
}

function genreCheck(anime: Anime, genre: string): boolean {
  return anime?.genres?.includes(genre) ?? false;
}

// 🔧 Filter registr
const filters: Record<string, FilterFn | ((anime: Anime) => boolean)> = {
  sameMonthAnimeGen,
  beginnerAnime,
  isPopular,
  actionPopular,
  adventurePopular,
  topRatedLast5,
  matchCategories: { fn: matchCategories as any, mode: "genreCompare" },
  romancePopular,
  recommendedByAnikawa,
};

// 🔧 Main function
export async function getFilteredAnime(
  filterName: string,
  options: FilterOptions = {},
): Promise<Anime[]> {
  const {
    genresA = [],
    categoryA = "",
    categoryB = "",
    forSubCatPage = false,
    usedTitlesGlobal = [],
  } = options;

  const allAnime = await AnimeRepository.getAllAnime();
  const fnRaw = filters[filterName];
  const { fn, mode } =
    typeof fnRaw === "function" ? { fn: fnRaw, mode: "single" } : fnRaw;

  const result: Anime[] = [];
  const usedTitles: Set<string> = new Set();
  const diffGenre = ["New", "Popular"];

  for (const anime of allAnime) {
    if (!anime) continue;
    const title = anime.title ?? anime.id;
    if (result.length >= 25 && !forSubCatPage) break;
    if (usedTitles.has(title)) continue;
    if (usedTitlesGlobal.includes(title)) continue;

    const genresB = anime.genres ?? [];
    const keywords = anime.keywords?.split(",") ?? [];
    let toSend = false;

    if (mode === "genreCompare") {
      const arrA = genresA.length > 0 ? genresA : [categoryA, categoryB];
      if (diffGenre.includes(categoryB)) {
        const score = anime.score ?? 0;
        const startYear = getYear(anime);
        toSend = NewPopChecker({
          score,
          startYear,
          categoryB,
          categoryA,
          genresB,
          keywords,
        });
      } else {
        toSend = (fn as any)(arrA, genresB, keywords);
      }
    } else {
      toSend = (fn as any)(anime);
    }

    if (toSend) {
      result.push(anime);
      usedTitles.add(title);
      usedTitlesGlobal.push(title);
    }
  }

  const skipSort = [
    "sameMonthAnimeGen",
    "matchCategories",
    "recommendedByAnikawa",
  ].includes(filterName);

  if (!skipSort) {
    return sortByScore(result);
  }

  if (
    skipSort &&
    diffGenre.includes(categoryB) &&
    filterName !== "recommendedByAnikawa"
  ) {
    return categoryB === "New" ? sortByDate(result) : sortByScore(result);
  }

  return result;
}

// 🔧 NewPopChecker
export function NewPopChecker({
  genresB,
  categoryA,
  categoryB,
  score,
  startYear,
  keywords,
}: {
  genresB: string[];
  categoryA: string;
  categoryB: string;
  score: number;
  startYear: number;
  keywords: string[];
}): boolean {
  const lowered = categoryA.toLowerCase();
  if (categoryB === "Popular") {
    return (
      score >= 7 && (genresB.includes(categoryA) || keywords.includes(lowered))
    );
  } else {
    return (
      startYear >= new Date().getFullYear() - 1 &&
      (genresB.includes(categoryA) || keywords.includes(lowered))
    );
  }
}

function getCurrentYear(): number {
  return new Date().getFullYear();
}

// Avoid list
const avoidTitlesAC2 = [
  "Uglymug, Epicfighter",
  "Hotel Inhumans",
  "Detectives These Days Are Crazy!",
  "Clevatess",
  "Gachiakuta",
  "My Hero Academia: Vigilantes",
  "The Brilliant Healer's New Life in the Shadows",
  "See You Tomorrow at the Food Court",
  "Farmagia",
  "Solo Leveling",
  "Takopi's Original Sin",
  "Sword of the Demon Hunter",
  "I'm Living with an Otaku NEET Kunoichi!?",
];

/**
 * Pick one top anime this year by category.
 */
export async function thisYearTopByCategory(
  category: string,
  usedTitlesAC2: string[],
): Promise<Anime | undefined> {
  const allAnime = await AnimeRepository.getAllAnime();
  return allAnime.find((anime) => {
    if (!anime) return false;
    const title = anime.title;
    const score = anime.score ?? 0;
    const startYear = getYear(anime);

    if (
      avoidTitlesAC2.includes(title) ||
      usedTitlesAC2.includes(title) ||
      !score ||
      !startYear
    ) {
      return false;
    }

    const isValid =
      startYear >= getCurrentYear() - 1 &&
      genreCheck(anime, category) &&
      score >= 7;

    if (isValid) usedTitlesAC2.push(title);
    return isValid;
  });
}

/**
 * Get newest 15 anime sorted by startDate.
 */
export async function getNewest15Anime(): Promise<Anime[]> {
  const allAnime = await AnimeRepository.getAllAnime();
  return [...allAnime]
    .sort((a, b) => {
      const dateA = dayjs(a?.startDate || "2000-01-01").valueOf();
      const dateB = dayjs(b?.startDate || "2000-01-01").valueOf();
      return dateB - dateA;
    })
    .slice(0, 15);
}

/**
 * Get newest 15 episodes (last episode of each newest anime).
 */
export async function getNewest15Episodes(): Promise<
  (Episode & {
    animeTitle: string;
    animenanoid: string;
    language: string;
  })[]
> {
  const newestAnime = await getNewest15Anime();
  return newestAnime.map((anime) => {
    const lastEp = anime.episodes?.slice(-1)[0];
    return {
      animeTitle: anime.title,
      animenanoid: anime.nanoid,
      language: anime.episodes?.[0]?.audio ?? "unknown",
      ...(lastEp ?? {}),
    };
  });
}
