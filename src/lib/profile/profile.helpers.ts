import type { AnimeRecord, EpisodeRecord } from "@/lib/anime/types";
import type { PublicContinueWatching, PublicProfile, ResolvedPublicEpisode } from "@/types/profile";

export function getProfileDisplayName(profile: PublicProfile): string {
  return profile.display_name?.trim() || profile.username;
}

export function getProfilePageTitle(profile: PublicProfile): string {
  return `${getProfileDisplayName(profile)}'s Profile`;
}

export function getProfilePageDescription(profile: PublicProfile): string {
  const displayName = getProfileDisplayName(profile);

  const bio = profile.bio?.trim();

  return (
    bio ||
    `View ${displayName}'s anime profile, favorites, and statistics on Anikawa.`
  );
}

/**
 * Counts meaningful text characters from the serialized
 * Tiptap/JSON content stored in `about`.
 *
 * Unlike the old implementation, this does not throw away
 * non-Latin characters such as Japanese, Hindi, Korean, etc.
 */
export function getAboutCharacterCount(about: string | null): number {
  if (!about) {
    return 0;
  }

  try {
    const parsed: unknown = JSON.parse(about);

    return Array.from(extractTextFromJson(parsed)).length;
  } catch {
    return 0;
  }
}

function extractTextFromJson(value: unknown): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(extractTextFromJson).join("");
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    if (typeof record.text === "string") {
      return record.text;
    }

    if (Array.isArray(record.content)) {
      return extractTextFromJson(record.content);
    }
  }

  return "";
}

export function getUniqueWatchedAnimeIds(
  continueWatching: PublicContinueWatching[],
): string[] {
  return [...new Set(continueWatching.map((item) => item.anime_id))];
}

export function getUniqueWatchedEpisodeIds(
  continueWatching: PublicContinueWatching[],
): Array<{
  animeId: string;
  episodeNanoid: string;
}> {
  const unique = new Map<
    string,
    {
      animeId: string;
      episodeNanoid: string;
    }
  >();

  for (const item of continueWatching) {
    const key = `${item.anime_id}:${item.episode_nanoid}`;

    if (!unique.has(key)) {
      unique.set(key, {
        animeId: item.anime_id,
        episodeNanoid: item.episode_nanoid,
      });
    }
  }

  return [...unique.values()];
}

export function createAnimeRecordMap(
  animeRecords: AnimeRecord[],
): Map<string, AnimeRecord> {
  return new Map(animeRecords.map((record) => [record.anime.nanoid, record]));
}

export function createEpisodeRecordMap(
  episodeRecords: EpisodeRecord[],
): Map<string, EpisodeRecord> {
  return new Map(
    episodeRecords.map((record) => [
      `${record.anime.nanoid}:${record.episode.nanoid}`,
      record,
    ]),
  );
}

/**
 * Builds the exact episode shape consumed by
 * CurrentlyWatching / EpisodeCard.
 *
 * IMPORTANT:
 * `userStats` remains the original public continue-watching
 * record. Do not flatten or remove it.
 */
export function resolvePublicEpisodeRecords(
  continueWatching: PublicContinueWatching[],
  animeRecords: AnimeRecord[],
  episodeRecords: EpisodeRecord[],
): ResolvedPublicEpisode[] {
  const animeRecordMap = createAnimeRecordMap(animeRecords);

  const episodeRecordMap = createEpisodeRecordMap(episodeRecords);
  
  return continueWatching
    .slice(0, 20)
    .map((item) => {
      const animeRecord = animeRecordMap.get(item.anime_id);

      const episodeRecord = episodeRecordMap.get(
        `${item.anime_id}:${item.episode_nanoid}`,
      );

      if (!animeRecord || !episodeRecord) {
        return null;
      }

      return {
        ...episodeRecord.episode,

        animeTitle: animeRecord.anime.title,

        animenanoid: animeRecord.anime.nanoid,

        animeslug: animeRecord.anime.slug,

        userStats: item,

        language:
          animeRecord.anime.episodes?.[0]?.audio === "ja"
            ? "Subtitled"
            : "Sub|Dub",
      };
    })
    .filter((item) => item !== null);
}
