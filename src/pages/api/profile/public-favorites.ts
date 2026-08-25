import type { APIRoute } from "astro";
import { badRequest, serverError } from "@/lib/api/json";

const ALLOWED_TYPES = new Set(["anime", "episode", "character", "studio"]);

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

function parseInteger(value: string | null, fallback: number): number {
  if (value === null || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    return fallback;
  }

  return parsed;
}

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    const username = url.searchParams.get("username")?.trim();

    if (!username) {
      return badRequest("Username is required");
    }

    const typeParam = url.searchParams.get("type")?.trim() || null;

    if (typeParam !== null && !ALLOWED_TYPES.has(typeParam)) {
      return badRequest("Invalid favorite type");
    }

    const requestedLimit = parseInteger(
      url.searchParams.get("limit"),
      DEFAULT_LIMIT,
    );

    const requestedOffset = parseInteger(url.searchParams.get("offset"), 0);

    /*
     * The RPC itself also clamps these values.
     * We clamp here too so the API contract is predictable.
     */
    const limit = Math.min(Math.max(requestedLimit, 1), MAX_LIMIT);

    const offset = Math.max(requestedOffset, 0);

    const { data, error } = await locals.supabase.rpc(
      "rpc_get_public_favorites",
      {
        p_username: username,
        p_type: typeParam ?? undefined,
        p_limit: limit,
        p_offset: offset,
      },
    );

    if (error) {
      console.error("[Public Favorites GET]", {
        username,
        type: typeParam,
        limit,
        offset,
        error,
      });

      return serverError("Failed to fetch public favorites");
    }

    return new Response(
      JSON.stringify(
        data ?? {
          items: [],
          has_more: false,
          limit,
          offset,
        },
      ),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=30, s-maxage=60",
        },
      },
    );
  } catch (error) {
    console.error("[Public Favorites GET] Unexpected error", error);

    return serverError("Internal server error");
  }
};
