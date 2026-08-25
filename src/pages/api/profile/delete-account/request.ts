import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import {
  badRequest,
  conflict,
  ok,
  serverError,
  unauthorized,
} from "@/lib/api/json";
import {
  ACCOUNT_DELETION_WAIT_MS,
  ACCOUNT_DELETION_VERIFICATION_TTL_MS,
} from "@/lib/account/deletion/constants";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";
import type {
  AccountDeletionRequestRow,
} from "@/lib/account/deletion/types";
import { sendAccountDeletionVerificationEmail } from "@/lib/email/sendAccountDeletionVerificationEmail";
import { getAccountDeletionVerificationUrl } from "@/lib/account/deletion/urls";
import {
  generateDeletionVerificationToken,
  hashDeletionVerificationToken,
} from "@/lib/account/deletion/tokens";

interface RequestBody {
  password?: string;
}

export const POST: APIRoute = async ({ locals, request }) => {
  try {
    /*
     * ---------------------------------------------------------
     * 1. Authenticate the current Anikawa session
     * ---------------------------------------------------------
     */
    const {
      data: { user },
      error: userError,
    } = await locals.supabase.auth.getUser();

    if (userError || !user) {
      return unauthorized("You must be logged in.");
    }

    /*
     * ---------------------------------------------------------
     * 2. Parse request body
     * ---------------------------------------------------------
     */
    let body: RequestBody;

    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid request body.");
    }

    const password = typeof body.password === "string" ? body.password : "";

    if (!password) {
      return badRequest("Password is required.");
    }

    if (password.length > 256) {
      return badRequest("Invalid password.");
    }

    /*
     * ---------------------------------------------------------
     * 3. Check that there isn't already an active request
     * ---------------------------------------------------------
     */
    const { data: existingData, error: existingError } = await locals.supabase
      .from("account_deletion_requests")
      .select(
        [
          "id",
          "user_id",
          "requested_at",
          "delete_after",
          "password_verified_at",
          "email_verified_at",
          "completed_at",
          "cancelled_at",
          "created_at",
        ].join(", "),
      )
      .eq("user_id", user.id)
      .is("completed_at", null)
      .is("cancelled_at", null)
      .maybeSingle();

    if (existingError) {
      console.error(
        "[DELETE ACCOUNT] Failed to check existing request:",
        existingError,
      );

      return serverError("Unable to check your account deletion status.");
    }

    const existingRequest =
      existingData as unknown as AccountDeletionRequestRow | null;

    if (existingRequest) {
      return conflict("You already have an active account deletion request.");
    }

    /*
     * ---------------------------------------------------------
     * 4. Verify password
     *
     * We intentionally use a separate Supabase client here.
     * It does NOT touch the user's existing Anikawa session.
     * ---------------------------------------------------------
     */
    const email = user.email;

    if (!email) {
      return serverError("Your account does not have a valid email address.");
    }

    const passwordClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { data: passwordAuthData, error: passwordError } =
      await passwordClient.auth.signInWithPassword({
        email,
        password,
      });

    /*
     * We don't need this temporary session.
     */
    void passwordAuthData;

    if (passwordError) {
      return badRequest("The password you entered is incorrect.");
    }

    /*
     * ---------------------------------------------------------
     * 5. Create the 24-hour deletion request
     * ---------------------------------------------------------
     */
    const requestedAt = new Date();

    const deleteAfter = new Date(
      requestedAt.getTime() + ACCOUNT_DELETION_WAIT_MS,
    );

    /*
     * IMPORTANT:
     *
     * account_deletion_requests has no client INSERT policy.
     *
     * Therefore the actual INSERT will be performed with the
     * server-side admin client AFTER we have authenticated the
     * user above.
     *
     * We import it here rather than bypassing RLS through the
     * normal authenticated client.
     */
    const { supabaseAdmin } = await import("@/lib/supabase/admin");

    const { data: createdData, error: createError } = await supabaseAdmin
      .from("account_deletion_requests")
      .insert({
        user_id: user.id,
        requested_at: requestedAt.toISOString(),
        delete_after: deleteAfter.toISOString(),
        password_verified_at: requestedAt.toISOString(),
      })
      .select(
        [
          "id",
          "user_id",
          "requested_at",
          "delete_after",
          "password_verified_at",
          "email_verified_at",
          "completed_at",
          "cancelled_at",
          "created_at",
        ].join(", "),
      )
      .single();

    if (createError || !createdData) {
      console.error(
        "[DELETE ACCOUNT] Failed to create deletion request:",
        createError,
      );

      return serverError("Unable to create your account deletion request.");
    }

    const deletionRequest = createdData as unknown as AccountDeletionRequestRow;

    /*
     * ---------------------------------------------------------
     * 6. Create email verification token
     * ---------------------------------------------------------
     */
    const rawToken = generateDeletionVerificationToken();

    const tokenHash = await hashDeletionVerificationToken(rawToken);

    const verificationExpiresAt = new Date(
      requestedAt.getTime() + ACCOUNT_DELETION_VERIFICATION_TTL_MS,
    );

    const { error: verificationError } = await supabaseAdmin
      .from("account_deletion_verifications")
      .insert({
        deletion_request_id: deletionRequest.id,
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: verificationExpiresAt.toISOString(),
      });

    if (verificationError) {
      console.error(
        "[DELETE ACCOUNT] Failed to create email verification:",
        verificationError,
      );

      /*
       * Roll back the deletion request because the email
       * verification stage could not be prepared.
       */
      await supabaseAdmin
        .from("account_deletion_requests")
        .update({
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", deletionRequest.id)
        .eq("user_id", user.id);

      return serverError("Unable to prepare account deletion verification.");
    }

    /*
     * ---------------------------------------------------------
     * 7. Send verification email
     * ---------------------------------------------------------
     */

    const verificationUrl = getAccountDeletionVerificationUrl(rawToken);

    try {
      await sendAccountDeletionVerificationEmail({
        email,
        verificationUrl,
        expiresAt: verificationExpiresAt,
      });
    } catch (error) {
      console.error(
        "[DELETE ACCOUNT] Failed to send verification email:",
        error,
      );

      /*
       * The deletion request must not remain active if we
       * couldn't send the verification email.
       */
      await supabaseAdmin
        .from("account_deletion_requests")
        .update({
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", deletionRequest.id)
        .eq("user_id", user.id);

      return serverError(
        "We couldn't send the verification email. Please try again.",
      );
    }

    /*
     * TODO:
     *
     * await sendAccountDeletionVerificationEmail({
     *   email,
     *   token: rawToken,
     *   expiresAt: verificationExpiresAt,
     * });
     */

    return ok({
      success: true,
      message:
        "Your account deletion request has been created. Email verification is required before the 24-hour waiting period can complete.",
      requestedAt: deletionRequest.requested_at,
      deleteAfter: deletionRequest.delete_after,
      emailVerificationRequired: true,
    });
  } catch (error) {
    console.error(
      "[POST /api/profile/delete-account/request] Unexpected error:",
      error,
    );

    return serverError("Unable to create your account deletion request.");
  }
};
