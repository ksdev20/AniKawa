import type { Anime } from "@/lib/anime/types";
import type { getContinueWatching } from "@/lib/continueWatching/getContinueWatching";
import {
  BookmarkSimpleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyesIcon,
  PauseCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";

/*
|--------------------------------------------------------------------------
| USER ANIME LIST STATUS
|--------------------------------------------------------------------------
|
| Mirrors public.user_anime_list.status
|
*/

/* API */

/*GET*/
// Shape of a single row from public.user_anime_list
export interface UserAnimeListItem {
  id: string; // uuid
  user_id: string; // uuid
  anime_nanoid: string; // text
  status: "planning" | "watching" | "completed" | "paused" | "dropped";
  progress: number; // integer >= 0
  score: number | null; // numeric(4,2), 0–10 or null
  started_at: string | null; // ISO timestamp with time zone
  completed_at: string | null; // ISO timestamp with time zone
  notes: string | null; // text
  created_at: string; // ISO timestamp with time zone
  updated_at: string; // ISO timestamp with time zone
}

// Return type of rpc_get_public_anime_list
export interface RpcGetAnimeListResult {
  items: UserAnimeListItem[];
  has_more: boolean;
  limit: number;
  offset: number;
}

export type RpcAnimeList = Anime & {
  userAnime: UserAnimeListItem;
};

export type ApiGetAnimeListResponse = {
  items: RpcAnimeList[];
  has_more: boolean;
  limit: number;
  offset: number;
  nextOffset: number;
};

/* GET END*/
/*AddAnimeToList types*/

export type AnimeListStatus =
  "watching" | "completed" | "paused" | "dropped" | "planning";

export const STATUS_CONFIG: Record<
  AnimeListStatus,
  {
    label: string;
    icon: typeof EyeIcon;
    className: string;
  }
> = {
  watching: {
    label: "Watching",
    icon: EyeIcon,
    className: "add-anime-list__status--watching",
  },

  planning: {
    label: "Planning",
    icon: BookmarkSimpleIcon,
    className: "add-anime-list__status--planning",
  },

  completed: {
    label: "Completed",
    icon: CheckCircleIcon,
    className: "add-anime-list__status--completed",
  },

  paused: {
    label: "Paused",
    icon: PauseCircleIcon,
    className: "add-anime-list__status--paused",
  },

  dropped: {
    label: "Dropped",
    icon: XCircleIcon,
    className: "add-anime-list__status--dropped",
  },
};

export const PROFILE_STATUS_CONFIG = {
  watching: {
    label: "Watching",
    icon: EyesIcon,
    className: "anime-list__detail-status--watching",
  },
  planning: {
    label: "Planning",
    icon: BookmarkSimpleIcon,
    className: "anime-list__detail-status--planning",
  },
  completed: {
    label: "Completed",
    icon: CheckCircleIcon,
    className: "anime-list__detail-status--completed",
  },
  paused: {
    label: "Paused",
    icon: PauseCircleIcon,
    className: "anime-list__detail-status--paused",
  },
  dropped: {
    label: "Dropped",
    icon: XCircleIcon,
    className: "anime-list__detail-status--dropped",
  },
} as const;

/*
|--------------------------------------------------------------------------
| USER ANIME LIST ENTRY
|--------------------------------------------------------------------------
|
| Mirrors public.user_anime_list.
|
| `score` is the user's personal score.
| It intentionally replaces the catalog Anime score when rendering
| a user's anime list.
|
*/

export interface UserAnimeListEntry {
  id: string;
  user_id: string;
  anime_nanoid: string;

  status: AnimeListStatus;
  progress: number;
  score: number | null;

  started_at: string | null;
  completed_at: string | null;
  notes: string | null;

  created_at: string;
  updated_at: string;
}

/*
|--------------------------------------------------------------------------
| NORMALIZED ANIME LIST ITEM
|--------------------------------------------------------------------------
|
| Catalog Anime + user's list entry.
|
| This is the primary frontend shape used by the anime-list UI.
|
| Important:
|
| - animeNanoid comes from user_anime_list.anime_nanoid
| - status comes from user_anime_list.status
| - progress comes from user_anime_list.progress
| - score comes from user_anime_list.score
|
| Therefore `score` here is ALWAYS the user's score, not the
| catalog Anime score.
|
*/

export type AnimeListItem = Anime & {
  anime_nanoid: string;

  status: AnimeListStatus;
  progress: number;
  score: number | null;

  started_at: string | null;
  completed_at: string | null;
  notes: string | null;

  created_at: string;
  updated_at: string;
};

export interface PublicAnimeListApiItem {
  anime: Anime;
  entry: UserAnimeListEntry;
}

/*
|--------------------------------------------------------------------------
| RAW API ITEM
|--------------------------------------------------------------------------
|
| The API returns:
|
| {
|   anime: Anime,
|   entry: UserAnimeListEntry
| }
|
| The frontend can normalize this into AnimeListItem.
|
*/

export interface PublicAnimeListApiItem {
  anime: Anime;
  entry: UserAnimeListEntry;
}

/*
|--------------------------------------------------------------------------
| PUBLIC ANIME LIST API RESPONSE
|--------------------------------------------------------------------------
*/

export interface PublicAnimeListApiResponse {
  items: PublicAnimeListApiItem[];

  hasMore: boolean;
  limit: number;
  offset: number;
}

export type ContinueWatchingItem = NonNullable<
  Awaited<ReturnType<typeof getContinueWatching>>[number]
>;

/*
|--------------------------------------------------------------------------
| UI STATUS
|--------------------------------------------------------------------------
|
| Human-readable labels used by filters and UI.
|
*/

export type UserAnimeStatus =
  "Watching" | "Completed" | "Paused" | "Dropped" | "Planning";

/*
|--------------------------------------------------------------------------
| RELEASE STATUS
|--------------------------------------------------------------------------
*/

export type AnimeReleaseStatus =
  "All statuses" | "Finished" | "Releasing" | "Cancelled";

/*
|--------------------------------------------------------------------------
| ANIME FORMAT
|--------------------------------------------------------------------------
*/

export type AnimeFormat =
  "All formats" | "TV" | "Movie" | "OVA" | "ONA" | "Special" | "Music";

/*
|--------------------------------------------------------------------------
| VIEW MODE
|--------------------------------------------------------------------------
*/

export type ViewMode = "detailed" | "compact" | "cards";

/*
|--------------------------------------------------------------------------
| SORT MODE
|--------------------------------------------------------------------------
*/

export type SortMode =
  "default" | "title" | "score" | "progress" | "year" | "popularity";

/*
|--------------------------------------------------------------------------
| FILTERS
|--------------------------------------------------------------------------
*/

export interface AnimeFilters {
  format: AnimeFormat | "All formats";

  releaseStatus: AnimeReleaseStatus | "All statuses";

  country: string;

  genre: string;

  yearFrom: string;

  yearTo: string;
}

/*
|--------------------------------------------------------------------------
| DEFAULT FILTERS
|--------------------------------------------------------------------------
*/

export const DEFAULT_ANIME_FILTERS: AnimeFilters = {
  format: "All formats",
  releaseStatus: "All statuses",
  country: "All countries",
  genre: "All genres",
  yearFrom: "",
  yearTo: "",
};

/*
|--------------------------------------------------------------------------
| STATUS LABELS
|--------------------------------------------------------------------------
*/

export const ANIME_LIST_STATUS_LABELS: Record<AnimeListStatus, string> = {
  watching: "Watching",
  completed: "Completed",
  paused: "Paused",
  dropped: "Dropped",
  planning: "Planning",
};

/*
|--------------------------------------------------------------------------
| STATUS MAP
|--------------------------------------------------------------------------
|
| Database enum → human-readable UI status.
|
*/

export const ANIME_LIST_STATUS_MAP: Record<AnimeListStatus, UserAnimeStatus> = {
  watching: "Watching",
  completed: "Completed",
  paused: "Paused",
  dropped: "Dropped",
  planning: "Planning",
};
