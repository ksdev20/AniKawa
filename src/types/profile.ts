import type { Anime, AnimeRecord, EpisodeRecord } from "@/lib/anime/types";
import type { FavoriteType } from "@/lib/favorites/toggleFavorite";
import type { RpcAnimeList } from "@/types/animeList";

export type ProfilePrivacy = "public" | "semi_public";

export type PublicProfile = {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  about: string | null;
  watching_since: string | null;
  gender: string | null;
  country: string | null;
  privacy: ProfilePrivacy;
  created_at: string;
};

export type PublicFavorite = {
  id: string;
  type: FavoriteType;
  item_id: string;
  created_at: string;
};

export type UserAnimeListEntry = {
  animeNanoid: string;
  status: "watching" | "completed" | "paused" | "dropped" | "planning";
  progress: number;
  score: number | null;
  startedAt: string | null;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicAnimeListEntry = {
  anime_nanoid: string;
  status: "watching" | "completed" | "paused" | "dropped" | "planning";
  progress: number;
  score: number | null;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicAnimeListRpcResponse =
  | {
      items: PublicAnimeListEntry[];
      has_more: boolean;
      limit: number;
      offset: number;
    }
  | {
      status: "not_found";
    };

export type PublicStats = {
  total: number;
  watching: number;
  completed: number;
  paused: number;
  dropped: number;
  planning: number;
  episodes_watched: number;
  average_score: number | null;
};

export type PublicContinueWatching = {
  anime_id: string;
  episode_nanoid: string;
  watched_seconds: number | null;
  duration_seconds: number | null;
  updated_at: string | null;
};

export type PublicProfileRpcSuccess = {
  status: "ok";
  profile: PublicProfile;
  favorites: PublicFavorite[];
  continue_watching: PublicContinueWatching[];
  stats: PublicStats;
  is_following: boolean | null;
  is_blocked: boolean | null;
};

export type PublicProfileRpcResponse =
  PublicProfileRpcSuccess | { status: "not_found" };

export interface PublicFavoritePageItem {
  id: string;
  type: FavoriteType;
  item_id: string;
  created_at: string;
}

export type PublicFavoritesRpcSuccess = {
  status: "ok";
  items: PublicFavoritePageItem[];
  has_more: boolean;
  limit: number;
  offset: number;
};

export type PublicFavoritesRpcResponse =
  PublicFavoritesRpcSuccess | { status: "not_found" };

export type PublicGenreBreakdown = {
  genre: string;
  count: number;
  percentage: number;
};

export type ResolvedPublicEpisode = EpisodeRecord["episode"] & {
  animeTitle: string;
  animeslug: string;
  userStats: PublicContinueWatching;
  language: "Subtitled" | "Sub|Dub" | string;
};

export type PublicAnimeRecordMap = Map<string, AnimeRecord>;
export type PublicEpisodeRecordMap = Map<string, EpisodeRecord>;
export type ProfileTab = "overview" | "anime" | "favorites" | "stats";

export type PublicProfilePageDataSuccess = {
  status: "ok";
  publicProfile: PublicProfile;
  favorites: PublicFavorite[];
  stats: PublicStats;
  continueWatching: PublicContinueWatching[];
  isFollowing: boolean | null;
  isBlocked: boolean | null;
  userAnimeList: UserAnimeListEntry[];
  animeRecords: AnimeRecord[];
  resolvedEpisodeRecords: ResolvedPublicEpisode[];
  watchingSince: string | null;
  hasAbout: boolean;
  characterCount: number;
  pageTitle: string;
  pageDescription: string;
};

export type PublicProfilePageData =
  PublicProfilePageDataSuccess | { status: "not_found" } | { status: "error" };

export type AnimeStatsResult = {
  totalAnime: number;
  totalEpisodes: number;
  daysWatched: number;
  meanScore: number | null;
  uniqueGenres: number;
  topGenre: {
    name: string;
    count: number;
  } | null;
};

export type AnimePersonalityTrait = {
  emoji: string;
  label: string;
};

export type AnimePersonality = {
  title: string;
  emoji: string;
  traits: AnimePersonalityTrait[];
  description: string;
};

export type AnimePersonalityInput = {
  continueWatching: PublicContinueWatching[];
  animeRecords: AnimeRecord[];
  favorites: PublicFavorite[];
  stats: PublicStats;
};

export type PrivateProfileData = {
  profile: PublicProfile;
  favorites: PublicFavorite[];
  continueWatching: PublicContinueWatching[];
  recentlyWatched: Anime[];
  stats: PublicStats;
  animeRecords: AnimeRecord[];
  resolvedEpisodeRecords: ResolvedPublicEpisode[];
  userAnimeList: RpcAnimeList[];
  favoriteAnime: Anime[];
};

export type PrivateProfileResult =
  | {
      status: "ok";
      data: PrivateProfileData;
    }
  | {
      status: "error";
      error: string;
    };
