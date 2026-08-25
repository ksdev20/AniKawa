import type { APIRoute } from "astro";

import {
  badRequest,
  created,
  serverError,
  unauthorized,
  ok,
  notFound,
} from "@/lib/api/json";
import { AnimeCatalog } from "@/lib/anime/AnimeCatalog";

import type {
  AnimeListStatus,
} from "@/types/animeList";
import { getPublicAnimeList } from "@/lib/profile/getPublicAnimeList";

const allowedStatuses: readonly AnimeListStatus[] = [
  "watching",
  "completed",
  "paused",
  "dropped",
  "planning",
];

/*
|--------------------------------------------------------------------------
| GET — Public anime list
|--------------------------------------------------------------------------
*/

export const GET: APIRoute = async ({
  request,
  locals,
}) => {
  try {
    const url = new URL(request.url);

    const username =
      url.searchParams.get("username")?.trim();

    if (!username) {
      return badRequest("Username is required.");
    }

    if (username.length > 100) {
      return badRequest("Invalid username.");
    }

    const rawLimit = Number(
      url.searchParams.get("limit") ?? "24",
    );

    const rawOffset = Number(
      url.searchParams.get("offset") ?? "0",
    );

    if (
      !Number.isInteger(rawLimit) ||
      rawLimit < 1 ||
      rawLimit > 100
    ) {
      return badRequest("Invalid limit.");
    }

    if (
      !Number.isInteger(rawOffset) ||
      rawOffset < 0
    ) {
      return badRequest("Invalid offset.");
    }

    const result = await getPublicAnimeList(
      locals.supabase,
      {
        username,
        limit: rawLimit,
        offset: rawOffset,
      },
    );

    return ok(result);
  } catch (error) {
    console.error(
      "[API /profile/anime-list] Unexpected GET error:",
      error,
    );

    return serverError("Internal server error.");
  }
};

/*
|--------------------------------------------------------------------------
| POST — Add anime to authenticated user's list
|--------------------------------------------------------------------------
*/

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    /*
     * ----------------------------------------------------------------------
     * Authentication
     * ----------------------------------------------------------------------
     */

    if (!locals.user) {
      return unauthorized("Authentication required.");
    }

    /*
     * ----------------------------------------------------------------------
     * Parse body
     * ----------------------------------------------------------------------
     */

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON body.");
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return badRequest("Invalid request body.");
    }

    const input = body as Record<string, unknown>;

    /*
     * ----------------------------------------------------------------------
     * Anime ID
     * ----------------------------------------------------------------------
     */

    const animeNanoid =
      typeof input.anime_nanoid === "string" ? input.anime_nanoid.trim() : "";

    if (!animeNanoid) {
      return badRequest("anime_nanoid is required.");
    }

    if (animeNanoid.length > 100) {
      return badRequest("Invalid anime_nanoid.");
    }

    /*
     * ----------------------------------------------------------------------
     * Status
     * ----------------------------------------------------------------------
     */

    const rawStatus =
      typeof input.status === "string" ? input.status : "planning";

    if (!allowedStatuses.includes(rawStatus as AnimeListStatus)) {
      return badRequest("Invalid anime list status.");
    }

    const status = rawStatus as AnimeListStatus;

    /*
     * ----------------------------------------------------------------------
     * Progress
     * ----------------------------------------------------------------------
     */

    const progress = input.progress === undefined ? 0 : Number(input.progress);

    if (!Number.isInteger(progress) || progress < 0) {
      return badRequest("Progress must be a non-negative integer.");
    }

    /*
     * ----------------------------------------------------------------------
     * Score
     * ----------------------------------------------------------------------
     */

    let score: number | null = null;

    if (
      input.score !== undefined &&
      input.score !== null &&
      input.score !== ""
    ) {
      score = Number(input.score);

      if (!Number.isFinite(score) || score < 0 || score > 10) {
        return badRequest("Score must be between 0 and 10.");
      }
    }

    /*
     * ----------------------------------------------------------------------
     * Optional fields
     * ----------------------------------------------------------------------
     */

    const startedAt =
      typeof input.startedAt === "string" && input.startedAt.trim()
        ? input.startedAt.trim()
        : null;

    const completedAt =
      typeof input.completedAt === "string" && input.completedAt.trim()
        ? input.completedAt.trim()
        : null;

    const notes = typeof input.notes === "string" ? input.notes.trim() : null;

    /*
     * ----------------------------------------------------------------------
     * RPC
     * ----------------------------------------------------------------------
     *
     * No user ID.
     *
     * The RPC uses auth.uid().
     */

    const { data, error } = await locals.supabase.rpc(
      "rpc_upsert_my_anime_list",
      {
        p_anime_nanoid: animeNanoid,
        p_status: status,
        p_progress: progress,
        p_score: score ?? undefined,
        p_started_at: startedAt ?? undefined,
        p_completed_at: completedAt ?? undefined,
        p_notes: notes ?? undefined,
      },
    );

    if (error) {
      console.error("[API /profile/anime-list] POST RPC failed:", error);

      return serverError("Unable to add anime to your list.");
    }

    const anime = await AnimeCatalog.getAnime(animeNanoid);

    return created({
      ...anime,
      userAnime: {
        ...data
      }
    });
  } catch (error) {
    console.error("[API /profile/anime-list] Unexpected POST error:", error);

    return serverError("Internal server error.");
  }
};
/*
|--------------------------------------------------------------------------
| DELETE — Remove anime from authenticated user's list
|--------------------------------------------------------------------------
*/

export const DELETE: APIRoute = async ({ request, locals }) => {
  try {
    /*
     * ----------------------------------------------------------------------
     * Authentication
     * ----------------------------------------------------------------------
     */

    if (!locals.user) {
      return unauthorized("Authentication required.");
    }

    /*
     * ----------------------------------------------------------------------
     * Parse body
     * ----------------------------------------------------------------------
     */

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON body.");
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return badRequest("Invalid request body.");
    }

    const input = body as Record<string, unknown>;

    /*
     * ----------------------------------------------------------------------
     * Anime ID
     * ----------------------------------------------------------------------
     */

    const animeNanoid =
      typeof input.anime_nanoid === "string" ? input.anime_nanoid.trim() : "";

    if (!animeNanoid) {
      return badRequest("animeNanoid is required.");
    }

    if (animeNanoid.length > 100) {
      return badRequest("Invalid animeNanoid.");
    }

    /*
     * ----------------------------------------------------------------------
     * RPC
     * ----------------------------------------------------------------------
     *
     * No user ID.
     *
     * The RPC uses auth.uid() to identify the authenticated user.
     */

    const { data, error } = await locals.supabase.rpc(
      "rpc_remove_from_my_anime_list",
      {
        p_anime_nanoid: animeNanoid,
      },
    );

    if (error) {
      console.error("[API /profile/anime-list] DELETE RPC failed:", error);

      return serverError("Unable to remove anime from your list.");
    }

    /*
     * ----------------------------------------------------------------------
     * Not found
     * ----------------------------------------------------------------------
     */

    if (data === false) {
      return notFound("Anime was not found in your list.");
    }

    /*
     * ----------------------------------------------------------------------
     * Success
     * ----------------------------------------------------------------------
     */

    return ok(true);
  } catch (error) {
    console.error("[API /profile/anime-list] Unexpected DELETE error:", error);

    return serverError("Internal server error.");
  }
};
