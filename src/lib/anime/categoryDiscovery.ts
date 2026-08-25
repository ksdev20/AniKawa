// src/lib/anime/categoryDiscovery.ts

import { AnimeRepository } from "@/lib/anime/AnimeRepository";
import type { Anime } from "@/lib/anime/types";
import { removeDuplicateSlugAnime as removeDuplicateAnime } from "./categoryUtils";

function hasGenre(anime: Anime, category: string) {
  return anime.genres?.some((g) => g.toLowerCase() === category.toLowerCase());
}

function getEpisodes(anime: Anime) {
  return anime.number_of_episodes ?? anime.episodes?.length ?? 999;
}

function getYear(anime: Anime) {
  return Number(anime.startDate?.split("-")[0] ?? 0);
}

export async function getAllCategoryAnime(category: string): Promise<Anime[]> {
  const allAnime = await AnimeRepository.getAllAnime();

  return removeDuplicateAnime(
    allAnime.filter((anime) => {
      if (!anime) return false;

      return anime.genres?.some(
        (genre) => genre.toLowerCase() === category.toLowerCase(),
      );
    }),
  );
}

/**
 * Popular anime
 *
 * High engagement + good score
 */
export async function getPopularCategoryAnime(category: string) {
  const allAnime = await AnimeRepository.getAllAnime();

  return removeDuplicateAnime(
    allAnime
      .filter((anime) => anime && hasGenre(anime, category))
      .filter(
        (anime) => (anime.ratedBy ?? 0) >= 1000 && (anime.score ?? 0) >= 7,
      )
      .sort((a, b) => (b.ratedBy ?? 0) - (a.ratedBy ?? 0)),
  ).slice(0, 25);
}

/**
 * Highest quality anime
 */
export async function getTopRatedCategoryAnime(category: string) {
  const allAnime = await AnimeRepository.getAllAnime();

  return removeDuplicateAnime(
    allAnime
      .filter((anime) => anime && hasGenre(anime, category))
      .filter((anime) => (anime.ratedBy ?? 0) >= 500 && (anime.score ?? 0) >= 8)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0)),
  ).slice(0, 25);
}

/**
 * Beginner friendly anime
 */
export async function getBeginnerCategoryAnime(category: string) {
  const allAnime = await AnimeRepository.getAllAnime();

  return removeDuplicateAnime(
    allAnime
      .filter((anime) => anime && hasGenre(anime, category))
      .filter((anime) => {
        const episodes = getEpisodes(anime);

        const year = getYear(anime);

        return episodes <= 50 && year >= 2000 && (anime.score ?? 0) >= 7;
      })
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0)),
  ).slice(0, 25);
}
