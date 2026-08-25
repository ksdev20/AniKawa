import type { SupabaseClient } from "@supabase/supabase-js";

import { AnimeCatalog } from "@/lib/anime/AnimeCatalog";
import { getAllPublicAnimeList } from "./getAllPublicAnimeList";

import type { PublicProfileRpcResponse } from "@/types/profile";

import {
  getAboutCharacterCount,
  getProfilePageDescription,
  getProfilePageTitle,
  getUniqueWatchedAnimeIds,
  getUniqueWatchedEpisodeIds,
  resolvePublicEpisodeRecords,
} from "./profile.helpers";
import { resolvePublicFavoriteAnime } from "./resolvePublicFavoriteAnime";
import type { Anime } from "@/types/mergedListTypes";

export type ProfileTab = "overview" | "anime" | "favorites" | "stats";

export const VALID_PROFILE_TABS = new Set<ProfileTab>([
  "overview",
  "anime",
  "favorites",
  "stats",
]);

export type PublicProfilePageData =
  | {
      status: "ok";

      publicProfile: NonNullable<
        Extract<PublicProfileRpcResponse, { status: "ok" }>["profile"]
      >;

      favorites: Extract<
        PublicProfileRpcResponse,
        { status: "ok" }
      >["favorites"];

      stats: Extract<PublicProfileRpcResponse, { status: "ok" }>["stats"];

      continueWatching: Extract<
        PublicProfileRpcResponse,
        { status: "ok" }
      >["continue_watching"];

      isFollowing: Extract<
        PublicProfileRpcResponse,
        { status: "ok" }
      >["is_following"];

      isBlocked: Extract<
        PublicProfileRpcResponse,
        { status: "ok" }
      >["is_blocked"];

      userAnimeList: Awaited<ReturnType<typeof getAllPublicAnimeList>>;

      animeRecords: Awaited<ReturnType<typeof AnimeCatalog.getAnimeByIds>>;

      resolvedEpisodeRecords: ReturnType<typeof resolvePublicEpisodeRecords>;

      watchingSince: string | null;

      hasAbout: boolean;

      characterCount: number;

      pageTitle: string;

      pageDescription: string;

      favoriteAnime: Anime[];
    }
  | {
      status: "not_found";
    }
  | {
      status: "error";
    };

export function resolveProfileTab(value: string | null): ProfileTab {
  if (value && VALID_PROFILE_TABS.has(value as ProfileTab)) {
    return value as ProfileTab;
  }

  return "overview";
}

export async function getPublicProfilePageData(
  supabase: SupabaseClient,
  username: string,
  activeTab: ProfileTab,
): Promise<PublicProfilePageData> {
  const normalizedUsername = username.trim();

  if (!normalizedUsername) {
    return {
      status: "not_found",
    };
  }

  /*
   * ----------------------------------------------------------
   * Public profile RPC
   * ----------------------------------------------------------
   */

  const { data, error } = await supabase.rpc("rpc_get_public_profile", {
    p_username: normalizedUsername,
  });

  if (error) {
    console.error("[PublicProfile] Failed to load profile:", {
      username: normalizedUsername,
      error,
    });

    return {
      status: "error",
    };
  }

  const result = data as PublicProfileRpcResponse;

  if (result.status === "not_found") {
    return {
      status: "not_found",
    };
  }

  if (result.status !== "ok") {
    console.error("[PublicProfile] Unexpected RPC status:", {
      username: normalizedUsername,
      result,
    });

    return {
      status: "error",
    };
  }

  const {
    profile: publicProfile,
    favorites,
    stats,
    continue_watching: continueWatching,
    is_following: isFollowing,
    is_blocked: isBlocked,
  } = result;

  /*
   * ----------------------------------------------------------
   * Public favorites
   *
   * Favorites are needed by:
   * - ?tab=overview
   * - ?tab=favorites
   *
   * Do this outside the overview-only block.
   * ----------------------------------------------------------
   */

  const favoriteAnime = await resolvePublicFavoriteAnime(favorites);

  /*
   * ----------------------------------------------------------
   * Overview-only data
   *
   * Do NOT perform this catalog work for:
   * ?tab=anime
   * ?tab=favorites
   * ?tab=stats
   * ----------------------------------------------------------
   */

  let userAnimeList: Awaited<ReturnType<typeof getAllPublicAnimeList>> = [];

  let animeRecords: Awaited<ReturnType<typeof AnimeCatalog.getAnimeByIds>> = [];

  let resolvedEpisodeRecords: ReturnType<typeof resolvePublicEpisodeRecords> =
    [];

  if (activeTab === "overview") {
    /*
     * Public anime list
     */

    userAnimeList = await getAllPublicAnimeList(
      supabase,
      publicProfile.username,
    );

    /*
     * Continue-watching anime records
     */

    const watchedAnimeIds = getUniqueWatchedAnimeIds(continueWatching);

    animeRecords =
      watchedAnimeIds.length > 0
        ? await AnimeCatalog.getAnimeByIds(watchedAnimeIds)
        : [];

    /*
     * Continue-watching episode records
     */

    const watchedEpisodeIds = getUniqueWatchedEpisodeIds(continueWatching);

    const episodeRecords =
      watchedEpisodeIds.length > 0
        ? await AnimeCatalog.getEpisodesByNanoids(watchedEpisodeIds)
        : [];

    /*
     * Build exact CurrentlyWatching / EpisodeCard shape.
     */

    resolvedEpisodeRecords = resolvePublicEpisodeRecords(
      continueWatching,
      animeRecords,
      episodeRecords,
    );
  }

  /*
   * ----------------------------------------------------------
   * About
   * ----------------------------------------------------------
   */

  const hasAbout = Boolean(publicProfile.about);

  const characterCount = hasAbout
    ? getAboutCharacterCount(publicProfile.about)
    : 0;

  /*
   * ----------------------------------------------------------
   * SEO
   * ----------------------------------------------------------
   */

  const pageTitle = getProfilePageTitle(publicProfile);

  const pageDescription = getProfilePageDescription(publicProfile);

  return {
    status: "ok",

    publicProfile,

    favorites,

    favoriteAnime,

    stats,

    continueWatching,

    isFollowing,

    isBlocked,

    userAnimeList,

    animeRecords,

    resolvedEpisodeRecords,

    watchingSince: publicProfile.watching_since,

    hasAbout,

    characterCount,

    pageTitle,

    pageDescription,
  };
}
