import type { Episode } from "./mergedListTypes";

export type ContinueWatchingItem = Episode & {
  userStats: ContinueWatchingRecord;
};


export interface APContinueWatchingItem {
  anime_id: string;
  watched_seconds: number;
  duration_seconds: number;
  updated_at: string | null;
}


export const LOCAL_KEY = "continueWatching";

/**
 * Raw continue-watching record.
 *
 * This matches the data stored in Supabase after fetching
 * and the normalized shape we build from localStorage.
 */
export interface ContinueWatchingRecord {
  anime_id: string;
  episode_nanoid: string;
  watched_seconds: number;
  duration_seconds: number;
  updated_at: string | null;
}

/**
 * Guest localStorage episode shape.
 *
 * This matches saveContinueWatching().
 */
export interface LocalContinueWatchingEpisode {
  anime_id: string;
  episode_nanoid: string;
  watched_seconds: number;
  duration_seconds: number;
  updated_at: number;
}

export type LocalContinueWatchingHistory = Record<
  string,
  LocalContinueWatchingEpisode[]
>;

export type GetCWReturn = Episode & {
  userStats: ContinueWatchingRecord;
};

export type ContinueWatchingStats =
  | {
      anime_id: string;
      watched_seconds: number;
      duration_seconds: number;
      updated_at: string | null;
    }[]
  | null;
