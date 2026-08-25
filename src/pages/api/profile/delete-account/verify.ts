import type { APIRoute } from "astro";
import { badRequest, ok, serverError } from "@/lib/api/json";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hashDeletionVerificationToken } from "@/lib/account/deletion/tokens";
import type {
  AccountDeletionRequestRow,
  AccountDeletionVerificationRow,
} from "@/lib/account/deletion/types";

export const GET: APIRoute = async ({ url }) => {
  try {
    /*
     * ---------------------------------------------------------
     * 1. Get token from verification URL
     * ---------------------------------------------------------
     */
    const token = url.searchParams.get("token");

    if (!token) {
      return badRequest("Invalid verification link.");
    }

    if (token.length !== 64) {
      return badRequest("Invalid verification link.");
    }

    /*
     * ---------------------------------------------------------
     * 2. Hash the token
     *
     * We NEVER query the database using the raw token.
     * Only the SHA-256 hash is stored in the database.
     * ---------------------------------------------------------
     */
    const tokenHash = await hashDeletionVerificationToken(token);

    /*
     * ---------------------------------------------------------
     * 3. Find an unused verification record
     * ---------------------------------------------------------
     */
    const { data: verificationData, error: verificationError } =
      await supabaseAdmin
        .from("account_deletion_verifications")
        .select(
          [
            "id",
            "deletion_request_id",
            "user_id",
            "token_hash",
            "expires_at",
            "verified_at",
            "created_at",
          ].join(", "),
        )
        .eq("token_hash", tokenHash)
        .is("verified_at", null)
        .maybeSingle();

    if (verificationError) {
      console.error(
        "[DELETE ACCOUNT VERIFY] Failed to find verification:",
        verificationError,
      );

      return serverError("Unable to verify the deletion request.");
    }

    const verification =
      verificationData as unknown as AccountDeletionVerificationRow | null;

    if (!verification) {
      return badRequest(
        "This verification link is invalid or has already been used.",
      );
    }

    /*
     * ---------------------------------------------------------
     * 4. Check token expiration
     * ---------------------------------------------------------
     */
    const now = new Date();

    const expiresAt = new Date(verification.expires_at);

    if (expiresAt.getTime() <= now.getTime()) {
      return badRequest(
        "This verification link has expired. Please request a new one.",
      );
    }

    /*
     * ---------------------------------------------------------
     * 5. Get the associated deletion request
     * ---------------------------------------------------------
     */
    const { data: requestData, error: requestError } = await supabaseAdmin
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
      .eq("id", verification.deletion_request_id)
      .eq("user_id", verification.user_id)
      .maybeSingle();

    if (requestError) {
      console.error(
        "[DELETE ACCOUNT VERIFY] Failed to fetch deletion request:",
        requestError,
      );

      return serverError("Unable to verify the deletion request.");
    }

    const deletionRequest =
      requestData as unknown as AccountDeletionRequestRow | null;

    if (!deletionRequest) {
      return badRequest("This account deletion request no longer exists.");
    }

    /*
     * ---------------------------------------------------------
     * 6. Make sure the deletion request is still active
     * ---------------------------------------------------------
     */
    if (deletionRequest.completed_at || deletionRequest.cancelled_at) {
      return badRequest("This account deletion request is no longer active.");
    }

    /*
     * ---------------------------------------------------------
     * 7. Make sure password verification happened
     * ---------------------------------------------------------
     */
    if (!deletionRequest.password_verified_at) {
      return badRequest(
        "Password verification is required before email verification.",
      );
    }

    /*
     * ---------------------------------------------------------
     * 8. Atomically consume the verification token
     *
     * The verified_at IS NULL condition is important.
     *
     * If two requests hit this endpoint at the same time,
     * only one can successfully consume the token.
     * ---------------------------------------------------------
     */
    const verifiedAt = now.toISOString();

    const { data: consumedVerification, error: consumeError } =
      await supabaseAdmin
        .from("account_deletion_verifications")
        .update({
          verified_at: verifiedAt,
        })
        .eq("id", verification.id)
        .eq("user_id", verification.user_id)
        .is("verified_at", null)
        .select("id")
        .maybeSingle();

    if (consumeError) {
      console.error(
        "[DELETE ACCOUNT VERIFY] Failed to consume verification:",
        consumeError,
      );

      return serverError("Unable to complete email verification.");
    }

    if (!consumedVerification) {
      return badRequest("This verification link has already been used.");
    }

    /*
     * ---------------------------------------------------------
     * 9. Mark the deletion request as email verified
     * ---------------------------------------------------------
     */
    const { error: requestUpdateError } = await supabaseAdmin
      .from("account_deletion_requests")
      .update({
        email_verified_at: verifiedAt,
      })
      .eq("id", deletionRequest.id)
      .eq("user_id", verification.user_id)
      .is("completed_at", null)
      .is("cancelled_at", null);

    if (requestUpdateError) {
      console.error(
        "[DELETE ACCOUNT VERIFY] Failed to update deletion request:",
        requestUpdateError,
      );

      /*
       * The token has technically been consumed already.
       * This is an exceptional failure case and should be
       * monitored server-side rather than attempting to
       * restore/reuse the token.
       */
      return serverError(
        "Email was verified, but we couldn't update the deletion request. Please contact support.",
      );
    }

    /*
     * ---------------------------------------------------------
     * 10. Success
     *
     * IMPORTANT:
     * Nothing is deleted here.
     *
     * The 24-hour waiting period still has to complete.
     * ---------------------------------------------------------
     */
    return ok({
      success: true,
      emailVerified: true,
      message:
        "Your email has been verified. Your account deletion request is now active and will become eligible for permanent deletion after the 24-hour waiting period.",
      requestedAt: deletionRequest.requested_at,
      deleteAfter: deletionRequest.delete_after,
    });
  } catch (error) {
    console.error(
      "[GET /api/profile/delete-account/verify] Unexpected error:",
      error,
    );

    return serverError("Unable to verify the account deletion request.");
  }
};
