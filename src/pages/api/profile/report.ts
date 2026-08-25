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
  // 1. Validate content type
  // ----------------------------------------------------------

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return badRequest("Content-Type must be application/json");
  }

  // ----------------------------------------------------------
  // 2. Parse body
  // ----------------------------------------------------------

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (typeof body !== "object" || body === null) {
    return badRequest("Invalid request body");
  }

  if (!("username" in body) || typeof body.username !== "string") {
    return badRequest("Username is required");
  }

  if (!("reason" in body) || typeof body.reason !== "string") {
    return badRequest("Report reason is required");
  }

  const username = body.username.trim();
  const reason = body.reason.trim().toLowerCase();

  const description = "description" in body ? body.description : undefined;

  // ----------------------------------------------------------
  // 3. Validate username
  // ----------------------------------------------------------

  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    return badRequest("Invalid username");
  }

  // ----------------------------------------------------------
  // 4. Validate description type
  // ----------------------------------------------------------

  if (
    description !== undefined &&
    description !== null &&
    typeof description !== "string"
  ) {
    return badRequest("Description must be a string");
  }

  const normalizedDescription =
    typeof description === "string" ? description.trim() : null;

  // Don't duplicate the DB's 1000-character rule blindly,
  // but reject obviously invalid requests before hitting DB.
  if (normalizedDescription !== null && normalizedDescription.length > 1000) {
    return badRequest("Description must be 1000 characters or less");
  }

  // ----------------------------------------------------------
  // 5. Supabase
  // ----------------------------------------------------------

  const supabase = locals.supabase;

  if (!supabase) {
    console.error("[ProfileReport] Supabase client unavailable.");
    return serverError("Internal server error");
  }

  // ----------------------------------------------------------
  // 6. Call authoritative RPC
  // ----------------------------------------------------------

  const { data, error } = await supabase.rpc("rpc_report_profile", {
    p_reported_username: username,
    p_reason: reason,
    p_description: normalizedDescription ?? undefined,
  });

  if (error) {
    console.error("[ProfileReport] RPC failed:", {
      username,
      error,
    });

    return serverError("Failed to submit report");
  }

  // ----------------------------------------------------------
  // 7. Validate RPC response
  // ----------------------------------------------------------

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    console.error("[ProfileReport] Invalid RPC response:", data);

    return serverError("Invalid server response");
  }

  const result = data as {
    status?: string;
    report_id?: string;
    window?: string;
    limit?: number;
    max_length?: number;
  };

  // ----------------------------------------------------------
  // 8. Map RPC status → HTTP response
  // ----------------------------------------------------------

  switch (result.status) {
    case "ok":
      if (typeof result.report_id !== "string") {
        console.error("[ProfileReport] RPC returned invalid report ID:", data);

        return serverError("Invalid server response");
      }

      return ok({
        reported: true,
        reportId: result.report_id,
      });

    case "unauthenticated":
      return unauthorized("You must be logged in to report profiles");

    case "invalid_username":
      return badRequest("Invalid username");

    case "invalid_reason":
      return badRequest("Invalid report reason");

    case "description_too_long":
      return badRequest(
        `Description must be ${
          typeof result.max_length === "number" ? result.max_length : 1000
        } characters or less`,
      );

    case "not_found":
      return notFound("Profile not found");

    case "self_report":
      return conflict("You cannot report yourself");

    case "already_reported":
      return conflict("You have already reported this profile");

    case "rate_limited":
      if (result.window === "10_minutes") {
        return tooManyRequests(
          `You can submit at most ${
            result.limit ?? 3
          } profile reports every 10 minutes`,
        );
      }

      if (result.window === "24_hours") {
        return tooManyRequests(
          `You can submit at most ${
            result.limit ?? 10
          } profile reports every 24 hours`,
        );
      }

      return tooManyRequests("Too many reports. Please try again later");

    default:
      console.error("[ProfileReport] Unknown RPC status:", data);

      return serverError("Failed to submit report");
  }
};
