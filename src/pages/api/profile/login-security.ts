import type { APIRoute } from "astro";

import { badRequest, ok, serverError, unauthorized } from "@/lib/api/json";

export const GET: APIRoute = async ({ locals }) => {
  try {
    const {
      data: { user },
      error: authError,
    } = await locals.supabase.auth.getUser();

    if (authError || !user) {
      return unauthorized("You must be logged in.");
    }

    const { data: settings, error } = await locals.supabase
      .from("login_security_settings")
      .select("user_id, enabled, created_at, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[Login Security] Settings lookup failed", {
        userId: user.id,
        error,
      });

      return serverError("Failed to load login security settings.");
    }

    if (!settings) {
      return ok({
        settings: {
          user_id: user.id,
          enabled: true,
        },
      });
    }

    return ok({
      settings,
    });
  } catch (error) {
    console.error("[Login Security] GET unexpected error", error);

    return serverError("Something went wrong.");
  }
};

export const PATCH: APIRoute = async ({ request, locals }) => {
  try {
    if (
      request.headers.get("content-type")?.includes("application/json") !== true
    ) {
      return badRequest("Request must use application/json.");
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON body.");
    }

    if (
      typeof body !== "object" ||
      body === null ||
      !("enabled" in body) ||
      typeof body.enabled !== "boolean"
    ) {
      return badRequest("Enabled must be a boolean.");
    }

    const {
      data: { user },
      error: authError,
    } = await locals.supabase.auth.getUser();

    if (authError || !user) {
      return unauthorized("You must be logged in.");
    }

    const { data: settings, error } = await locals.supabase
      .from("login_security_settings")
      .upsert(
        {
          user_id: user.id,
          enabled: body.enabled,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      )
      .select("user_id, enabled, created_at, updated_at")
      .single();

    if (error) {
      console.error("[Login Security] Settings update failed", {
        userId: user.id,
        error,
      });

      return serverError("Failed to update login security settings.");
    }

    return ok({
      settings,
    });
  } catch (error) {
    console.error("[Login Security] PATCH unexpected error", error);

    return serverError("Something went wrong.");
  }
};
