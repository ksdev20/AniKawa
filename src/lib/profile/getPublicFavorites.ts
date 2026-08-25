import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  PublicFavoritesRpcResponse,
} from "@/types/profile";

import type { FavoriteType } from "@/lib/favorites/toggleFavorite";

export interface ResolvedPublicFavorite {
  id: string;
  type: FavoriteType;
  itemId: string;

  title: string;
  image: string | null;
  year: string | null;
  href: string;

  createdAt: string;
}

export interface GetPublicFavoritesOptions {
  username: string;
  limit?: number;
  offset?: number;
}

export interface GetPublicFavoritesResult {
  items: ResolvedPublicFavorite[];
  hasMore: boolean;
  limit: number;
  offset: number;
}

import { AnimeCatalog } from "@/lib/anime/AnimeCatalog";

export async function getPublicFavorites(
  supabase: SupabaseClient,
  { username, limit = 24, offset = 0 }: GetPublicFavoritesOptions,
): Promise<GetPublicFavoritesResult> {
  const normalizedUsername = username.trim();

  if (!normalizedUsername) {
    throw new Error("Username is required.");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error("Invalid favorites limit.");
  }

  if (!Number.isInteger(offset) || offset < 0) {
    throw new Error("Invalid favorites offset.");
  }

  const { data, error } = await supabase.rpc("rpc_get_public_favorites", {
    p_username: normalizedUsername,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) {
    console.error("[getPublicFavorites] RPC failed:", {
      username: normalizedUsername,
      limit,
      offset,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    throw new Error(`Unable to load public favorites: ${error.message}`);
  }

  const result = data as unknown as PublicFavoritesRpcResponse;

  if (result.status !== "ok") {
    return {
      items: [],
      hasMore: false,
      limit,
      offset,
    };
  }

  const resolved: ResolvedPublicFavorite[] = [];

  /*
   * Currently Anime is the only resolvable entity.
   *
   * Future:
   * manga     -> MangaCatalog
   * character -> CharacterCatalog
   * staff     -> StaffCatalog
   * studio    -> StudioCatalog
   */

  const animeFavorites = result.items.filter(
    (favorite) => favorite.type === "anime",
  );

  /*
   * Resolve anime in parallel.
   */

  const animeRecords =
    animeFavorites.length > 0
      ? await AnimeCatalog.getAnimeByIds(
          animeFavorites.map((favorite) => favorite.item_id),
        )
      : [];

  const animeMap = new Map(
    animeRecords.map((record) => [record.anime.nanoid, record.anime]),
  );

  for (const favorite of result.items) {
    if (favorite.type !== "anime") {
      continue;
    }

    const anime = animeMap.get(favorite.item_id);

    if (!anime) {
      console.warn("[getPublicFavorites] Anime not found:", favorite.item_id);

      continue;
    }

    resolved.push({
      id: favorite.id,
      type: favorite.type,
      itemId: favorite.item_id,

      title: anime.title,

      image: anime.poster ?? null,

      year: anime.startDate ? anime.startDate.slice(0, 4) : null,

      href: `/show/${anime.nanoid}/${anime.slug}`,

      createdAt: favorite.created_at,
    });
  }

  return {
    items: resolved,
    hasMore: result.has_more,
    limit: result.limit,
    offset: result.offset,
  };
}
