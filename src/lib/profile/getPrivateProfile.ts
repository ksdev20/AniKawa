import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { AnimeCatalog } from "@/lib/anime";

import type { AnimeRecord, EpisodeRecord } from "@/lib/anime/types";
import type { RpcAnimeList } from "@/types/animeList";

import type {
  PrivateProfileData,
  PrivateProfileResult,
  PublicContinueWatching,
  PublicFavorite,
  PublicProfile,
  PublicStats,
  ResolvedPublicEpisode,
  UserAnimeListEntry,
} from "@/types/profile";

import {
  privateProfileRpcResponseSchema,
  type PrivateProfileRpcSuccess,
} from "./profile.rpc.schema";

const RECENTLY_WATCHED_LIMIT = 20;
const CONTINUE_WATCHING_LIMIT = 20;
const OVERVIEW_ANIME_LIST_LIMIT = 100;

function normalizeProfile(
  row: PrivateProfileRpcSuccess["profile"],
): PublicProfile {
  return {
    username: row.username,
    display_name: row.display_name,
    avatar_url: row.avatar_url,
    banner_url: row.banner_url,
    bio: row.bio,
    about: row.about,
    watching_since: row.watching_since,
    gender: row.gender,
    country: row.country,
    privacy: row.privacy as PublicProfile["privacy"],
    created_at: row.created_at,
  };
}

function normalizeFavorites(
  rows: PrivateProfileRpcSuccess["favorites"],
): PublicFavorite[] {
  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    item_id: row.item_id,
    created_at: row.created_at,
  }));
}

function normalizeContinueWatching(
  rows: PrivateProfileRpcSuccess["continue_watching"],
): PublicContinueWatching[] {
  return rows
    .slice(0, CONTINUE_WATCHING_LIMIT)
    .filter((row) => Boolean(row.anime_id) && Boolean(row.episode_nanoid))
    .map((row) => ({
      anime_id: row.anime_id,
      episode_nanoid: row.episode_nanoid,
      watched_seconds: row.watched_seconds,
      duration_seconds: row.duration_seconds,
      updated_at: row.updated_at,
    }));
}

function normalizeAnimeList(
  rows: PrivateProfileRpcSuccess["anime_list"],
): UserAnimeListEntry[] {
  return rows.slice(0, OVERVIEW_ANIME_LIST_LIMIT).map((row) => ({
    animeNanoid: row.anime_nanoid,
    status: row.status,
    progress: row.progress,
    score: row.score,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

function normalizeStats(stats: PrivateProfileRpcSuccess["stats"]): PublicStats {
  return {
    total: stats.total,
    watching: stats.watching,
    completed: stats.completed,
    paused: stats.paused,
    dropped: stats.dropped,
    planning: stats.planning,
    episodes_watched: stats.episodes_watched,
    average_score: stats.average_score,
  };
}

/**
 * Resolve every Anime nanoid required by the private profile
 * through the authoritative AnimeCatalog.
 *
 * One batch lookup.
 */
async function resolveAnimeRecords(
  favorites: PublicFavorite[],
  recentlyWatched: PrivateProfileRpcSuccess["recently_watched"],
  animeList: UserAnimeListEntry[],
  continueWatching: PublicContinueWatching[],
): Promise<AnimeRecord[]> {
  const animeIds = [
    ...favorites
      .filter((favorite) => favorite.type === "anime")
      .map((favorite) => favorite.item_id),

    ...recentlyWatched.map((item) => item.anime_id),

    ...animeList.map((item) => item.animeNanoid),

    ...continueWatching.map((item) => item.anime_id),
  ].filter(Boolean);

  const uniqueAnimeIds = [...new Set(animeIds)];

  if (uniqueAnimeIds.length === 0) {
    return [];
  }

  return AnimeCatalog.getAnimeByIds(uniqueAnimeIds);
}

/**
 * Resolve Anime favorites from the already-resolved
 * AnimeRecord collection.
 *
 * No additional catalog lookup.
 */
function resolveFavoriteAnime(
  favorites: PublicFavorite[],
  animeRecords: AnimeRecord[],
): PublicFavorite[] extends never[]
  ? never
  : import("@/types/mergedListTypes").Anime[] {
  const animeById = new Map(
    animeRecords.map((record) => [record.anime.nanoid, record.anime]),
  );

  return favorites
    .filter((favorite) => favorite.type === "anime")
    .map((favorite) => animeById.get(favorite.item_id))
    .filter(
      (anime): anime is import("@/types/mergedListTypes").Anime =>
        anime !== undefined,
    );
}

/**
 * Resolve the user's Anime List from the already-resolved
 * AnimeRecord collection.
 *
 * This produces:
 *
 *   Anime + userAnime
 *
 * without overriding any Anime properties.
 *
 * No additional catalog lookup is performed.
 */
function resolveAnimeList(
  entries: UserAnimeListEntry[],
  animeRecords: AnimeRecord[],
): RpcAnimeList[] {
  const animeById = new Map(
    animeRecords.map((record) => [record.anime.nanoid, record.anime]),
  );

  return entries
    .map((entry) => {
      const anime = animeById.get(entry.animeNanoid);

      if (!anime) {
        return null;
      }

      return {
        ...anime,

        userAnime: {
          anime_nanoid: entry.animeNanoid,
          status: entry.status,
          progress: entry.progress,
          score: entry.score,
          started_at: entry.startedAt,
          completed_at: entry.completedAt,
          notes: entry.notes,
          created_at: entry.createdAt,
          updated_at: entry.updatedAt,
        },
      };
    })
    .filter((item): item is RpcAnimeList => item !== null);
}

/**
 * Resolve Continue Watching episodes.
 *
 * AnimeCatalog.getEpisodesByNanoids() requires both
 * animeId and episodeNanoid because its index key is:
 *
 * `${animeId}:${episodeNanoid}`
 */
async function resolveContinueWatchingEpisodes(
  continueWatching: PublicContinueWatching[],
): Promise<ResolvedPublicEpisode[]> {
  if (continueWatching.length === 0) {
    return [];
  }

  const episodeItems = [
    ...new Map(
      continueWatching.map((item) => [
        `${item.anime_id}:${item.episode_nanoid}`,
        {
          animeId: item.anime_id,
          episodeNanoid: item.episode_nanoid,
        },
      ]),
    ).values(),
  ];

  const episodeRecords =
    episodeItems.length > 0
      ? await AnimeCatalog.getEpisodesByNanoids(episodeItems)
      : [];

  const continueWatchingByKey = new Map(
    continueWatching.map((item) => [
      `${item.anime_id}:${item.episode_nanoid}`,
      item,
    ]),
  );

  return episodeRecords
    .map((record: EpisodeRecord) => {
      const anime = record.anime;
      const episode = record.episode;

      const animeId = anime.nanoid;
      const episodeNanoid = episode.nanoid;

      const userStats = continueWatchingByKey.get(
        `${animeId}:${episodeNanoid}`,
      );

      if (!userStats) {
        return null;
      }

      const language =
        anime.episodes?.[0]?.audio === "ja" ? "Subtitled" : "Sub|Dub";

      return {
        ...episode,
        animeTitle: anime.title,
        animeslug: anime.slug,
        userStats,
        language,
      };
    })
    .filter((record): record is ResolvedPublicEpisode => record !== null);
}

/**
 * Fetch the complete private profile snapshot.
 *
 * Database:
 *   ONE RPC call
 *
 * Catalog:
 *   ONE batch Anime resolution
 *   ONE batch Episode resolution
 *
 * The returned data is render-ready.
 */
export async function getPrivateProfile(): Promise<PrivateProfileResult> {
  const supabase = getBrowserSupabaseClient();

  try {
    const { data, error } = await supabase.rpc("rpc_get_private_profile");

    if (error) {
      console.error("[Profile] rpc_get_private_profile failed:", error);

      return {
        status: "error",
        error: error.message ?? "Failed to load your profile.",
      };
    }

    if (data === null || data === undefined) {
      return {
        status: "error",
        error: "Profile data was not returned.",
      };
    }

    /**
     * Runtime validation is the trust boundary between
     * Supabase's generic Json type and our application.
     */
    const parsed = privateProfileRpcResponseSchema.safeParse(data);

    if (!parsed.success) {
      console.error(
        "[Profile] Invalid rpc_get_private_profile response:",
        parsed.error,
      );

      return {
        status: "error",
        error: "Profile data returned by the server was invalid.",
      };
    }

    const response = parsed.data;

    if (response.status !== "ok") {
      return {
        status: "error",
        error: response.error,
      };
    }

    /*
     * Normalize the validated RPC payload.
     */
    const profile = normalizeProfile(response.profile);

    const favorites = normalizeFavorites(response.favorites);

    const continueWatching = normalizeContinueWatching(
      response.continue_watching,
    );

    const userAnimeListEntries = normalizeAnimeList(response.anime_list);

    const stats = normalizeStats(response.stats);

    /*
     * Resolve every required Anime nanoid through the
     * authoritative AnimeCatalog in one batch.
     */
    const animeRecords = await resolveAnimeRecords(
      favorites,
      response.recently_watched,
      userAnimeListEntries,
      continueWatching,
    );

    const animeById = new Map(
      animeRecords.map((record) => [record.anime.nanoid, record.anime]),
    );

    /*
     * Preserve the recently-watched order returned
     * by the RPC.
     *
     * Return actual Anime objects because UI components
     * such as AnimeSliderClient expect Anime[].
     */
    const recentlyWatched = response.recently_watched
      .slice(0, RECENTLY_WATCHED_LIMIT)
      .map((item) => animeById.get(item.anime_id))
      .filter(
        (anime): anime is import("@/types/mergedListTypes").Anime =>
          anime !== undefined,
      );

    /*
     * Resolve Anime favorites from the same catalog
     * result.
     *
     * Returns actual Anime objects.
     */
    const favoriteAnime = resolveFavoriteAnime(favorites, animeRecords);

    /*
     * Resolve the user's Anime List from the same
     * catalog result.
     *
     * Returns Anime + userAnime.
     */
    const userAnimeList = resolveAnimeList(userAnimeListEntries, animeRecords);

    /*
     * Resolve Continue Watching episodes through
     * AnimeCatalog.
     */
    const resolvedEpisodeRecords =
      await resolveContinueWatchingEpisodes(continueWatching);

    const result: PrivateProfileData = {
      profile,

      favorites,
      favoriteAnime,

      continueWatching,
      resolvedEpisodeRecords,

      recentlyWatched,

      stats,

      userAnimeList,

      animeRecords,
    };

    return {
      status: "ok",
      data: result,
    };
  } catch (error) {
    console.error("[Profile] Failed to load private profile:", error);

    return {
      status: "error",
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while loading your profile.",
    };
  }
}
