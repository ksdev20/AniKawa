import type { APIRoute } from "astro";
import { badRequest, unauthorized, serverError, ok } from "@/lib/api/json";

const DISPLAY_NAME_MIN_LENGTH = 1;
const DISPLAY_NAME_MAX_LENGTH = 30;

// Allows letters/numbers from any language, spaces, and common
// name punctuation. We deliberately do NOT allow arbitrary symbols.
const DISPLAY_NAME_PATTERN =
  /^[\p{L}\p{M}\p{N}]+(?:[ ._'’-][\p{L}\p{M}\p{N}]+)*$/u;

function normalizeDisplayName(value: string): string {
  return value.normalize("NFKC").replace(/\s+/g, " ").trim();
}

function isValidDisplayName(value: string): boolean {
  if (
    value.length < DISPLAY_NAME_MIN_LENGTH ||
    value.length > DISPLAY_NAME_MAX_LENGTH
  ) {
    return false;
  }

  return DISPLAY_NAME_PATTERN.test(value);
}

export const PATCH: APIRoute = async ({ request, locals }) => {
  try {
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
      !("displayName" in body) ||
      typeof body.displayName !== "string"
    ) {
      return badRequest("Display name is required");
    }

    const displayName = normalizeDisplayName(body.displayName);

    if (!isValidDisplayName(displayName)) {
      return badRequest(
        "Display name must be 1–30 characters and may only contain letters, numbers, spaces, and common name punctuation.",
      );
    }

    const { data: authData, error: authError } =
      await locals.supabase.auth.getUser();

    if (authError || !authData.user) {
      return unauthorized("You must be logged in to update your display name");
    }

    const userId = authData.user.id;

    /*
     * Update only the authenticated user's own profile.
     *
     * The database/RLS policy must also enforce:
     * profiles.id = auth.uid()
     */
    const { data: profile, error: updateError } = await locals.supabase
      .from("profiles")
      .update({
        display_name: displayName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select(
        `
          id,
          username,
          display_name,
          avatar_url,
          banner_url,
          about,
          created_at,
          updated_at
        `,
      )
      .maybeSingle();

    if (updateError) {
      console.error("[Display Name Update]", {
        userId,
        error: updateError,
      });

      return serverError("Failed to update display name");
    }

    if (!profile) {
      return serverError("Profile could not be updated");
    }

    return ok({
      profile,
    });
  } catch (error) {
    console.error("[Display Name API]", error);

    return serverError("Something went wrong");
  }
};
