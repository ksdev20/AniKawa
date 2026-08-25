import { z } from "zod";

const profilePrivacySchema = z.enum(["public", "semi_public", "private"]);

const favoriteTypeSchema = z.enum([
  "anime",
  "manga",
  "character",
  "staff",
  "studio",
]);

const animeListStatusSchema = z.enum([
  "watching",
  "completed",
  "paused",
  "dropped",
  "planning",
]);

export const privateProfileRpcProfileSchema = z.object({
  username: z.string(),
  display_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  banner_url: z.string().nullable(),
  bio: z.string().nullable(),
  about: z.string().nullable(),
  watching_since: z.string().nullable(),
  gender: z.string().nullable(),
  country: z.string().nullable(),
  privacy: profilePrivacySchema,
  created_at: z.string(),
});

export const privateProfileRpcFavoriteSchema = z.object({
  id: z.string(),
  type: favoriteTypeSchema,
  item_id: z.string(),
  created_at: z.string(),
});

export const privateProfileRpcContinueWatchingSchema = z.object({
  anime_id: z.string(),
  episode_nanoid: z.string(),
  watched_seconds: z.number().nullable(),
  duration_seconds: z.number().nullable(),
  updated_at: z.string().nullable(),
});

export const privateProfileRpcRecentlyWatchedSchema = z.object({
  anime_id: z.string(),
  watched_at: z.string(),
});

export const privateProfileRpcAnimeListItemSchema = z.object({
  anime_nanoid: z.string(),
  status: animeListStatusSchema,
  progress: z.number(),
  score: z.number().nullable(),
  notes: z.string().nullable(),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const privateProfileRpcStatsSchema = z.object({
  total: z.number(),
  watching: z.number(),
  completed: z.number(),
  paused: z.number(),
  dropped: z.number(),
  planning: z.number(),
  episodes_watched: z.number(),
  average_score: z.number().nullable(),
});

export const privateProfileRpcSuccessSchema = z.object({
  status: z.literal("ok"),
  profile: privateProfileRpcProfileSchema,
  favorites: z.array(privateProfileRpcFavoriteSchema),
  continue_watching: z.array(privateProfileRpcContinueWatchingSchema),
  recently_watched: z.array(privateProfileRpcRecentlyWatchedSchema),
  anime_list: z.array(privateProfileRpcAnimeListItemSchema),
  stats: privateProfileRpcStatsSchema,
});

export const privateProfileRpcErrorSchema = z.object({
  status: z.literal("error"),
  error: z.string(),
});

export const privateProfileRpcResponseSchema = z.discriminatedUnion("status", [
  privateProfileRpcSuccessSchema,
  privateProfileRpcErrorSchema,
]);

export type PrivateProfileRpcResponse = z.infer<
  typeof privateProfileRpcResponseSchema
>;

export type PrivateProfileRpcSuccess = z.infer<
  typeof privateProfileRpcSuccessSchema
>;
