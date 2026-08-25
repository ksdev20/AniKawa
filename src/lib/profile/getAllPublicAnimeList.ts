import type { SupabaseClient } from "@supabase/supabase-js";

import type { RpcAnimeList } from "@/types/animeList";

import { getPublicAnimeList } from "./getPublicAnimeList";

const PAGE_SIZE = 100;

export async function getAllPublicAnimeList(
  supabase: SupabaseClient,
  username: string,
): Promise<RpcAnimeList[]> {
  const allItems: RpcAnimeList[] = [];

  let offset = 0;

  while (true) {
    const result = await getPublicAnimeList(supabase, {
      username,
      limit: PAGE_SIZE,
      offset,
    });

    allItems.push(...result.items);

    if (!result.has_more) {
      break;
    }

    const nextOffset = result.nextOffset;

    if (nextOffset <= offset) {
      console.error("[getAllPublicAnimeList] Invalid pagination progress.", {
        username,
        offset,
        nextOffset,
      });

      break;
    }

    offset = nextOffset;
  }

  return allItems;
}
