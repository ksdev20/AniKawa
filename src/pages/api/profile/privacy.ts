import type { APIRoute } from "astro";
import { badRequest, serverError, unauthorized, ok } from "@/lib/api/json";

const ALLOWED_PRIVACY_VALUES = ["public", "semi_public", "private"] as const;

type Privacy = (typeof ALLOWED_PRIVACY_VALUES)[number];

function isValidPrivacy(value: unknown): value is Privacy {
  return (
    typeof value === "string" &&
    ALLOWED_PRIVACY_VALUES.includes(value as Privacy)
  );
}

export const PATCH: APIRoute = async ({ request, locals }) => {
  try {
    /* ------------------------------------------------------------------------
       Content type
       ------------------------------------------------------------------------ */

    if (
      request.headers.get("content-type")?.includes("application/json") !== true
    ) {
      return badRequest("Request must use application/json");
    }

    /* ------------------------------------------------------------------------
       Parse body
       ------------------------------------------------------------------------ */

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    if (typeof body !== "object" || body === null || !("privacy" in body)) {
      return badRequest("Privacy setting is required");
    }

    const privacy = body.privacy;

    /* ------------------------------------------------------------------------
       Validate privacy value
       ------------------------------------------------------------------------ */

    if (!isValidPrivacy(privacy)) {
      return badRequest("Privacy must be public, semi_public, or private");
    }

    /* ------------------------------------------------------------------------
       Authenticate user
       ------------------------------------------------------------------------ */

    const { data: authData, error: authError } =
      await locals.supabase.auth.getUser();

    if (authError || !authData.user) {
      return unauthorized(
        "You must be logged in to update your privacy settings",
      );
    }

    const userId = authData.user.id;

    /* ------------------------------------------------------------------------
       Update profile
       ------------------------------------------------------------------------ */

    const { data: profile, error: updateError } = await locals.supabase
      .from("profiles")
      .update({
        privacy,
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
            bio,
            about,
            watching_since,
            gender,
            country,
            privacy,
            created_at,
            updated_at
          `,
      )
      .maybeSingle();

    if (updateError) {
      console.error("[Privacy Update]", {
        userId,
        privacy,
        error: updateError,
      });

      return serverError("Failed to update privacy settings");
    }

    if (!profile) {
      console.error("[Privacy Update] Profile not found", {
        userId,
      });

      return serverError("Profile could not be updated");
    }

    /* ------------------------------------------------------------------------
       Return updated profile
       ------------------------------------------------------------------------ */

    return ok({
      profile,
    });
  } catch (error) {
    console.error("[Privacy API] Unexpected error", error);

    return serverError("Something went wrong");
  }
};
