import { create } from "zustand";

import { getPrivateProfile } from "@/lib/profile/getPrivateProfile";

import type {
  PrivateProfileData,
  PublicContinueWatching,
  PublicFavorite,
  PublicProfile,
  PublicStats,
} from "@/types/profile";

import type { RpcAnimeList } from "@/types/animeList";

import type { Anime } from "@/types/mergedListTypes";
import type { AnimeRecord } from "@/lib/anime/types";

interface ProfileState {
  /**
   * Authoritative private profile snapshot.
   */
  profile: PublicProfile | null;

  /**
   * Favorite metadata.
   *
   * Kept because favorite mutations need the favorite
   * domain record itself.
   */
  favorites: PublicFavorite[];

  /**
   * Render-ready favorite Anime objects.
   */
  favoriteAnime: Anime[];

  /**
   * Continue Watching activity metadata.
   */
  continueWatching: PublicContinueWatching[];

  /**
   * Render-ready Continue Watching episode records.
   */
  resolvedEpisodeRecords: PrivateProfileData["resolvedEpisodeRecords"];

  /**
   * Render-ready recently watched Anime objects.
   */
  recentlyWatched: Anime[];

  /**
   * Authoritative aggregate Anime List statistics.
   *
   * These come directly from rpc_get_private_profile
   * and must not be reconstructed from the bounded list.
   */
  stats: PublicStats;

  /**
   * Render-ready bounded Anime List snapshot.
   *
   * Every item contains:
   *
   * - the real catalog Anime object
   * - the user's status
   * - the user's progress
   * - the user's score
   * - the user's timestamps
   * - the user's notes
   */
  userAnimeList: RpcAnimeList[];

  /**
   * All Anime records resolved for the private profile
   * snapshot.
   *
   * This is the shared catalog-resolution pool used by
   * overview features.
   */
  animeRecords: AnimeRecord[];

  loading: boolean;
  error: string | null;

  /**
   * Fetch the complete private profile snapshot.
   */
  fetchProfile: () => Promise<void>;

  /**
   * Replace the complete profile snapshot.
   */
  setProfile: (data: PrivateProfileData) => void;

  /**
   * Clear private profile state.
   */
  reset: () => void;
}

const EMPTY_STATS: PublicStats = {
  total: 0,
  watching: 0,
  completed: 0,
  paused: 0,
  dropped: 0,
  planning: 0,
  episodes_watched: 0,
  average_score: null,
};

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,

  favorites: [],
  favoriteAnime: [],

  continueWatching: [],
  resolvedEpisodeRecords: [],

  recentlyWatched: [],

  stats: EMPTY_STATS,

  userAnimeList: [],

  animeRecords: [],

  loading: false,
  error: null,

  async fetchProfile() {
    set({
      loading: true,
      error: null,
    });

    try {
      const result = await getPrivateProfile();

      if (result.status !== "ok") {
        set({
          loading: false,
          error: result.error,
        });

        return;
      }

      set({
        profile: result.data.profile,

        favorites: result.data.favorites,
        favoriteAnime: result.data.favoriteAnime,

        continueWatching: result.data.continueWatching,

        resolvedEpisodeRecords: result.data.resolvedEpisodeRecords,

        recentlyWatched: result.data.recentlyWatched,

        stats: result.data.stats,

        userAnimeList: result.data.userAnimeList,

        animeRecords: result.data.animeRecords,

        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("[Profile] Failed to load private profile:", error);

      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while loading your profile.",
      });
    }
  },

  setProfile(data) {
    set({
      profile: data.profile,

      favorites: data.favorites,
      favoriteAnime: data.favoriteAnime,

      continueWatching: data.continueWatching,

      resolvedEpisodeRecords: data.resolvedEpisodeRecords,

      recentlyWatched: data.recentlyWatched,

      stats: data.stats,

      userAnimeList: data.userAnimeList,

      animeRecords: data.animeRecords,

      loading: false,
      error: null,
    });
  },

  reset() {
    set({
      profile: null,

      favorites: [],
      favoriteAnime: [],

      continueWatching: [],
      resolvedEpisodeRecords: [],

      recentlyWatched: [],

      stats: EMPTY_STATS,

      userAnimeList: [],

      animeRecords: [],

      loading: false,
      error: null,
    });
  },
}));
