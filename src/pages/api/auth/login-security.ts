import type { APIRoute } from "astro";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { badRequest, ok, serverError, unauthorized } from "@/lib/api/json";

import {
  getClientIp,
  getLoginLocation,
  getUserAgent,
  hashClientIp,
} from "@/lib/security/loginSecurity";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const {
      data: { user },
      error: authError,
    } = await locals.supabase.auth.getUser();

    if (authError || !user) {
      return unauthorized("You must be logged in to record this login.");
    }

    const contentType = request.headers.get("content-type");

    if (contentType && !contentType.includes("application/json")) {
      return badRequest("Invalid request.");
    }

    const { data: settings, error: settingsError } = await locals.supabase
      .from("login_security_settings")
      .select("enabled")
      .eq("user_id", user.id)
      .maybeSingle();

    if (settingsError) {
      console.error("[Login Security] Settings lookup failed", {
        userId: user.id,
        error: settingsError,
      });

      return serverError("Could not check login security settings.");
    }

    // If the row somehow doesn't exist, fail safely rather than
    // silently enabling tracking.
    if (!settings) {
      return ok({
        tracked: false,
        unusual: false,
      });
    }

    if (!settings.enabled) {
      return ok({
        tracked: false,
        unusual: false,
      });
    }

    const location = getLoginLocation(request);
    const ip = getClientIp(request);
    const ipHash = hashClientIp(ip);
    const userAgent = getUserAgent(request);

    /*
     * We intentionally do not treat city/region changes as
     * suspicious. Mobile networks, ISPs and IP geolocation
     * can shift these frequently.
     *
     * Country changes are a much stronger signal.
     */
    const { data: previousEvent, error: previousEventError } =
      await locals.supabase
        .from("login_security_events")
        .select(
          `
            country_code,
            created_at
          `,
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

    if (previousEventError) {
      console.error("[Login Security] Previous event lookup failed", {
        userId: user.id,
        error: previousEventError,
      });

      // Security tracking should never break authentication.
      return ok({
        tracked: false,
        unusual: false,
      });
    }

    let isUnusual = false;
    let unusualReason: string | null = null;

    if (
      previousEvent?.country_code &&
      location.countryCode &&
      previousEvent.country_code !== location.countryCode
    ) {
      isUnusual = true;
      unusualReason =
        "Login originated from a different country than the previous login.";
    }

    const { error: insertError } = await supabaseAdmin
      .from("login_security_events")
      .insert({
        user_id: user.id,
        country_code: location.countryCode,
        region: location.region,
        city: location.city,
        ip_hash: ipHash,
        user_agent: userAgent,
        is_unusual: isUnusual,
        unusual_reason: unusualReason,
      });

    if (insertError) {
      console.error("[Login Security] Event insert failed", {
        userId: user.id,
        error: insertError,
      });

      // Never turn a successful login into a failed login because
      // security telemetry failed.
      return ok({
        tracked: false,
        unusual: false,
      });
    }

    return ok({
      tracked: true,
      unusual: isUnusual,
    });
  } catch (error) {
    console.error("[Login Security] Unexpected error", error);

    // This endpoint is telemetry/security monitoring.
    // It must never break authentication.
    return ok({
      tracked: false,
      unusual: false,
    });
  }
};
