import type { AnimeRecord } from "@/lib/anime/types";
import type {
  PublicContinueWatching,
  PublicGenreBreakdown,
} from "@/types/profile";

const MIN_WATCHED_RATIO = 0.1;

export function getTopGenres(
  continueWatching: PublicContinueWatching[],
  animeRecords: AnimeRecord[],
  limit = 6,
): PublicGenreBreakdown[] {
  if (!continueWatching.length || !animeRecords.length || limit <= 0) {
    return [];
  }

  const watchedAnimeIds = new Set<string>();

  for (const item of continueWatching) {
    const watchedSeconds = item.watched_seconds ?? 0;
    const durationSeconds = item.duration_seconds ?? 0;

    if (durationSeconds <= 0 || watchedSeconds <= 0) {
      continue;
    }

    const watchedPercentage = watchedSeconds / durationSeconds;

    if (watchedPercentage >= MIN_WATCHED_RATIO) {
      watchedAnimeIds.add(item.anime_id);
    }
  }

  if (!watchedAnimeIds.size) {
    return [];
  }

  const genreCounts = new Map<string, number>();

  for (const record of animeRecords) {
    const anime = record.anime;

    if (!watchedAnimeIds.has(anime.nanoid)) {
      continue;
    }

    for (const genre of anime.genres ?? []) {
      const normalizedGenre = genre.trim();

      if (!normalizedGenre) {
        continue;
      }

      genreCounts.set(
        normalizedGenre,
        (genreCounts.get(normalizedGenre) ?? 0) + 1,
      );
    }
  }

  if (!genreCounts.size) {
    return [];
  }

  const totalGenreCount = [...genreCounts.values()].reduce(
    (sum, count) => sum + count,
    0,
  );

  return [...genreCounts.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }

      return a[0].localeCompare(b[0]);
    })
    .slice(0, limit)
    .map(([genre, count]) => ({
      genre,
      count,
      percentage: Math.round((count / totalGenreCount) * 100),
    }));
}
