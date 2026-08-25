import type { APIRoute } from "astro";
import { badRequest, serverError, unauthorized } from "@/lib/api/json";

const ALLOWED_TYPES = ["anime", "episode", "character", "studio"] as const;

type FavoriteType = (typeof ALLOWED_TYPES)[number];

function isFavoriteType(value: unknown): value is FavoriteType {
  return (
    typeof value === "string" && ALLOWED_TYPES.includes(value as FavoriteType)
  );
}

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    const user = locals.user;

    if (!user) {
      return unauthorized("You must be logged in");
    }

    const typeParam = url.searchParams.get("type");

    if (typeParam !== null && !isFavoriteType(typeParam)) {
      return badRequest("Invalid favorite type");
    }

    let query = locals.supabase
      .from("favorites")
      .select("id, type, item_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (typeParam !== null) {
      query = query.eq("type", typeParam);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[Favorites GET]", {
        userId: user.id,
        error,
      });

      return serverError("Failed to fetch favorites");
    }

    return new Response(JSON.stringify(data ?? []), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[Favorites GET] Unexpected error", error);

    return serverError("Internal server error");
  }
};

export const POST: APIRoute = async ({ locals, request }) => {
  try {
    const user = locals.user;

    if (!user) {
      return unauthorized("You must be logged in");
    }

    if (
      request.headers.get("content-type")?.includes("application/json") !== true
    ) {
      return badRequest("Request must use application/json");
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    if (
      typeof body !== "object" ||
      body === null ||
      !("type" in body) ||
      !("item_id" in body)
    ) {
      return badRequest("Favorite type and item_id are required");
    }

    const type = body.type;
    const itemId = body.item_id;

    if (!isFavoriteType(type) || typeof itemId !== "string") {
      return badRequest("Invalid favorite data");
    }

    const normalizedItemId = itemId.trim();

    if (!normalizedItemId) {
      return badRequest("Invalid favorite item");
    }

    const { data: existing, error: findError } = await locals.supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("type", type)
      .eq("item_id", normalizedItemId)
      .maybeSingle();

    if (findError) {
      console.error("[Favorites POST] Lookup failed", {
        userId: user.id,
        type,
        itemId: normalizedItemId,
        error: findError,
      });

      return serverError("Failed to update favorite");
    }

    /*
     * Remove existing favorite
     */
    if (existing) {
      const { error } = await locals.supabase
        .from("favorites")
        .delete()
        .eq("id", existing.id)
        .eq("user_id", user.id);

      if (error) {
        console.error("[Favorites POST] Delete failed", {
          userId: user.id,
          favoriteId: existing.id,
          error,
        });

        return serverError("Failed to remove favorite");
      }

      return Response.json({
        favorited: false,
      });
    }

    /*
     * Add favorite
     */
    const { error } = await locals.supabase.from("favorites").insert({
      user_id: user.id,
      type,
      item_id: normalizedItemId,
    });

    if (error) {
      console.error("[Favorites POST] Insert failed", {
        userId: user.id,
        type,
        itemId: normalizedItemId,
        error,
      });

      /*
       * The database unique constraint protects against duplicates.
       * Don't expose the raw database error.
       */
      return serverError("Failed to add favorite");
    }

    return Response.json({
      favorited: true,
    });
  } catch (error) {
    console.error("[Favorites POST] Unexpected error", error);

    return serverError("Internal server error");
  }
};
