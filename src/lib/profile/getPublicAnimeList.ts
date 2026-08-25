import { AnimeCatalog } from "@/lib/anime/AnimeCatalog";
import type { RpcAnimeList, RpcGetAnimeListResult } from "@/types/animeList";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface GetPublicAnimeListOptions {
  username: string;
  limit?: number;
  offset?: number;
}

export interface GetPublicAnimeListResult {
  items: RpcAnimeList[];
  has_more: boolean;
  limit: number;
  offset: number;
  nextOffset: number;
}

export async function getPublicAnimeList(
  supabase: SupabaseClient,
  { username, limit = 24, offset = 0 }: GetPublicAnimeListOptions,
): Promise<GetPublicAnimeListResult> {
  const normalizedUsername = username.trim();

  if (!normalizedUsername) {
    throw new Error("Username is required.");
  }

  const { data, error } = await supabase.rpc("rpc_get_public_anime_list", {
    p_username: normalizedUsername,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) {
    console.error("[getPublicAnimeList] RPC failed:", error);

    throw new Error("Unable to load anime list.");
  }

  const result = data as unknown as RpcGetAnimeListResult;

  const animeIds = [
    ...new Set(result.items.map((entry) => entry.anime_nanoid)),
  ];

  const animeRecords =
    animeIds.length > 0 ? await AnimeCatalog.getAnimeByIds(animeIds) : [];

  const animeRecordMap = new Map(
    animeRecords.map((record) => [record.anime.nanoid, record]),
  );

  const animeList: RpcAnimeList[] = [];

  for (const entry of result.items) {
    const record = animeRecordMap.get(entry.anime_nanoid);

    if (!record) {
      console.warn("[getPublicAnimeList] Anime not found:", entry.anime_nanoid);

      continue;
    }

    animeList.push({
      ...record.anime,

      userAnime: {
        ...entry,
      },
    });
  }

  return {
    items: animeList,
    has_more: result.has_more,
    limit: result.limit,
    offset: result.offset,
    nextOffset: result.offset + result.limit,
  };
}
