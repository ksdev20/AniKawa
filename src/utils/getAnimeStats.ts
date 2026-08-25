import type { AnimeRecord } from "@/lib/anime/types";
import type { AnimeStatsResult, PublicContinueWatching } from "@/types/profile";

export function getAnimeStats(
  continueWatching: PublicContinueWatching[],
  animeRecords: AnimeRecord[],
): AnimeStatsResult {
  const watchedAnimeIds = new Set<string>();
  const genreCount = new Map<string, number>();

  let totalWatchedSeconds = 0;

  for (const item of continueWatching) {
    const duration = item.duration_seconds ?? 0;
    const watched = item.watched_seconds ?? 0;

    if (duration <= 0 || watched <= 0) {
      continue;
    }

    watchedAnimeIds.add(item.anime_id);

    totalWatchedSeconds += Math.min(watched, duration);
  }

  for (const record of animeRecords) {
    if (!watchedAnimeIds.has(record.anime.nanoid)) {
      continue;
    }

    for (const genre of record.anime.genres ?? []) {
      const normalizedGenre = genre.trim();

      if (!normalizedGenre) {
        continue;
      }

      genreCount.set(
        normalizedGenre,
        (genreCount.get(normalizedGenre) ?? 0) + 1,
      );
    }
  }

  const topGenre = [...genreCount.entries()].sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1];
    }

    return a[0].localeCompare(b[0]);
  })[0];

  let totalScore = 0;
  let scoredAnime = 0;

  for (const record of animeRecords) {
    if (!watchedAnimeIds.has(record.anime.nanoid)) {
      continue;
    }

    const score = record.anime.score;

    if (Number.isFinite(score)) {
      totalScore += score;
      scoredAnime++;
    }
  }

  const meanScore =
    scoredAnime > 0 ? Number((totalScore / scoredAnime).toFixed(1)) : null;

  const daysWatched = Number((totalWatchedSeconds / 60 / 60 / 24).toFixed(1));

  return {
    totalAnime: watchedAnimeIds.size,
    totalEpisodes: continueWatching.filter((item) => {
      const duration = item.duration_seconds ?? 0;
      const watched = item.watched_seconds ?? 0;

      return duration > 0 && watched > 0;
    }).length,
    daysWatched,
    meanScore,
    uniqueGenres: genreCount.size,
    topGenre: topGenre
      ? {
          name: topGenre[0],
          count: topGenre[1],
        }
      : null,
  };
}
