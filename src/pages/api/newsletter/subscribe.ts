import type { APIRoute } from "astro";

import { badRequest, conflict, ok, serverError } from "@/lib/api/json";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    if (!request.headers.get("content-type")?.includes("application/json")) {
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
      !("email" in body) ||
      typeof body.email !== "string"
    ) {
      return badRequest("Email is required.");
    }

    const email = body.email.trim().toLowerCase();

    if (!email) {
      return badRequest("Email is required.");
    }

    if (email.length > 320) {
      return badRequest("Email address is too long.");
    }

    if (!EMAIL_REGEX.test(email)) {
      return badRequest("Please enter a valid email address.");
    }

    const joinSource =
      "joinSource" in body && typeof body.joinSource === "string"
        ? body.joinSource.trim().slice(0, 100)
        : "unknown";

    const preferredLanguage =
      "preferredLanguage" in body && typeof body.preferredLanguage === "string"
        ? body.preferredLanguage.trim().slice(0, 20)
        : "en";

    /*
     * We intentionally do NOT accept user_id from the client.
     *
     * If the visitor is logged in, get their authenticated user
     * directly from Supabase.
     *
     * If they are a guest, user_id remains null.
     */
    const {
      data: { user },
      error: authError,
    } = await locals.supabase.auth.getUser();

    if (authError) {
      console.warn(
        "[Newsletter] Could not determine authenticated user",
        authError,
      );
    }

    const userId = user?.id ?? null;

    const { data, error } = await locals.supabase
      .from("newsletter_subscribers")
      .insert({
        email,
        user_id: userId,
        join_source: joinSource,
        preferred_language: preferredLanguage,
      });

    if (error) {
      if (error.code === "23505") {
        return conflict("You're already subscribed.");
      }

      console.error("[Newsletter] Subscription insert failed", {
        userId,
        error,
      });

      return serverError("Failed to subscribe to the newsletter.");
    }

    return ok({
      subscription: data,
    });
  } catch (error) {
    console.error("[Newsletter] Unexpected subscription error", error);

    return serverError("Something went wrong.");
  }
};
