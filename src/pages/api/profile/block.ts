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
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return badRequest("Content-Type must be application/json");
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
    !("username" in body) ||
    typeof body.username !== "string"
  ) {
    return badRequest("Username is required");
  }

  const username = body.username.trim();

  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    return badRequest("Invalid username");
  }

  const supabase = locals.supabase;

  if (!supabase) {
    console.error("[ProfileBlock] Supabase client unavailable.");
    return serverError("Internal server error");
  }

  const { data, error } = await supabase.rpc("rpc_toggle_profile_block", {
    p_blocked_username: username,
  });

  if (error) {
    console.error("[ProfileBlock] RPC failed:", {
      username,
      error,
    });

    return serverError("Failed to update block status");
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    console.error("[ProfileBlock] Invalid RPC response:", data);
    return serverError("Invalid server response");
  }

  const result = data as {
    status?: string;
    is_blocked?: boolean;
    retry_after_seconds?: number;
  };

  switch (result.status) {
    case "ok":
      if (typeof result.is_blocked !== "boolean") {
        console.error("[ProfileBlock] RPC returned invalid block state:", data);

        return serverError("Invalid server response");
      }

      return ok({
        isBlocked: result.is_blocked,
      });

    case "unauthenticated":
      return unauthorized("You must be logged in to block profiles");

    case "invalid_username":
      return badRequest("Invalid username");

    case "not_found":
      return notFound("Profile not found");

    case "self_block":
      return conflict("You cannot block yourself");

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
      console.error("[ProfileBlock] Unknown RPC status:", data);

      return serverError("Failed to update block status");
  }
};
