import type { APIRoute } from "astro";

import {
  badRequest,
  conflict,
  notFound,
  ok,
  serverError,
  tooManyRequests,
  unauthorized,
} from "@/lib/api/json";

export const POST: APIRoute = async ({ request, locals }) => {
  // ----------------------------------------------------------
  // 1. Method / content validation
  // ----------------------------------------------------------

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return badRequest("Content-Type must be application/json");
  }

  // ----------------------------------------------------------
  // 2. Parse request body
  // ----------------------------------------------------------

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("username" in body) ||
    typeof body.username !== "string"
  ) {
    return badRequest("Username is required");
  }

  const username = body.username.trim();

  // Same username constraints as profiles table.
  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    return badRequest("Invalid username");
  }

  // ----------------------------------------------------------
  // 3. Supabase
  // ----------------------------------------------------------

  const supabase = locals.supabase;

  if (!supabase) {
    console.error("[ProfileFollow] Supabase client unavailable.");
    return serverError("Internal server error");
  }

  // ----------------------------------------------------------
  // 4. Call authoritative DB RPC
  // ----------------------------------------------------------

  const { data, error } = await supabase.rpc("rpc_toggle_profile_follow", {
    p_following_username: username,
  });

  if (error) {
    console.error("[ProfileFollow] RPC failed:", {
      username,
      error,
    });

    return serverError("Failed to update follow status");
  }

  // ----------------------------------------------------------
  // 5. Map RPC result
  // ----------------------------------------------------------

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    console.error("[ProfileFollow] Invalid RPC response:", data);
    return serverError("Invalid server response");
  }

  const result = data as {
    status?: string;
    is_following?: boolean;
    retry_after_seconds?: number;
  };

  switch (result.status) {
    case "ok":
      if (typeof result.is_following !== "boolean") {
        console.error(
          "[ProfileFollow] RPC returned invalid follow state:",
          data,
        );

        return serverError("Invalid server response");
      }

      return ok({
        isFollowing: result.is_following,
      });

    case "unauthenticated":
      return unauthorized("You must be logged in to follow profiles");

    case "invalid_username":
      return badRequest("Invalid username");

    case "not_found":
      return notFound("Profile not found");

    case "self_follow":
      return conflict("You cannot follow yourself");

    case "rate_limited": {
      const retryAfter =
        typeof result.retry_after_seconds === "number"
          ? result.retry_after_seconds
          : 5;

      const response = tooManyRequests(
        `Please wait ${retryAfter} second${
          retryAfter === 1 ? "" : "s"
        } before trying again`,
      );

      response.headers.set("Retry-After", String(retryAfter));

      return response;
    }

    default:
      console.error("[ProfileFollow] Unknown RPC status:", data);

      return serverError("Failed to update follow status");
  }
};
