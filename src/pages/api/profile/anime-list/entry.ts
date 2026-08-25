import type { APIRoute } from "astro";

import { badRequest, unauthorized, serverError, ok } from "@/lib/api/json";

import type { AnimeListStatus } from "@/types/animeList";

interface RpcAnimeListEntry {
  exists: boolean;
  anime_nanoid: string;
  status: AnimeListStatus | null;
  progress: number;
  score: number | null;
}

interface AnimeListEntryResponse {
  exists: boolean;
  animeNanoid: string;
  status: AnimeListStatus | null;
  progress: number;
  score: number | null;
}

const VALID_STATUSES: readonly AnimeListStatus[] = [
  "watching",
  "completed",
  "paused",
  "dropped",
  "planning",
];

function isAnimeListStatus(value: unknown): value is AnimeListStatus {
  return (
    typeof value === "string" &&
    VALID_STATUSES.includes(value as AnimeListStatus)
  );
}

function isValidRpcResponse(value: unknown): value is RpcAnimeListEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as Record<string, unknown>;

  if (typeof entry.exists !== "boolean") {
    return false;
  }

  if (typeof entry.anime_nanoid !== "string") {
    return false;
  }

  if (entry.status !== null && !isAnimeListStatus(entry.status)) {
    return false;
  }

  if (
    typeof entry.progress !== "number" ||
    !Number.isFinite(entry.progress) ||
    entry.progress < 0
  ) {
    return false;
  }

  if (
    entry.score !== null &&
    (typeof entry.score !== "number" ||
      !Number.isFinite(entry.score) ||
      entry.score < 0 ||
      entry.score > 10)
  ) {
    return false;
  }

  return true;
}

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
| Check whether the authenticated user has one anime in their list.
|
| GET /api/profile/anime-list/entry?animeNanoid=...
|--------------------------------------------------------------------------
*/

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    /*
     * Authentication is checked before touching the RPC.
     * Guests should never be able to reach the authenticated RPC.
     */
    if (!locals.user) {
      return unauthorized("Authentication required.");
    }

    const url = new URL(request.url);

    const animeNanoid = url.searchParams.get("animeNanoid")?.trim() ?? "";

    if (!animeNanoid) {
      return badRequest("animeNanoid is required.");
    }

    if (animeNanoid.length > 100) {
      return badRequest("Invalid animeNanoid.");
    }

    const { data, error } = await locals.supabase.rpc(
      "rpc_get_my_anime_list_entry",
      {
        p_anime_nanoid: animeNanoid,
      },
    );

    if (error) {
      console.error("[API /profile/anime-list/entry] RPC failed:", error);

      return serverError("Unable to check anime list status.");
    }

    /*
     * Never blindly trust the RPC payload.
     */
    if (!isValidRpcResponse(data)) {
      console.error(
        "[API /profile/anime-list/entry] Invalid RPC response:",
        data,
      );

      return serverError("The server returned an invalid anime list entry.");
    }

    /*
     * Extra consistency check.
     *
     * The RPC should return the exact anime we asked about.
     */
    if (data.anime_nanoid !== animeNanoid) {
      console.error("[API /profile/anime-list/entry] Anime nanoid mismatch.", {
        requested: animeNanoid,
        returned: data.anime_nanoid,
      });

      return serverError("The server returned an invalid anime list entry.");
    }

    const response: AnimeListEntryResponse = {
      exists: data.exists,
      animeNanoid: data.anime_nanoid,
      status: data.status,
      progress: data.progress,
      score: data.score,
    };

    return ok(response);
  } catch (error) {
    console.error(
      "[API /profile/anime-list/entry] Unexpected GET error:",
      error,
    );

    return serverError("Internal server error.");
  }
};
