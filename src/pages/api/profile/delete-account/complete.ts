import type { APIRoute } from "astro";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ok, unauthorized, badRequest, serverError } from "@/lib/api/json";

export const POST: APIRoute = async ({ locals }) => {
  try {
    // ─────────────────────────────────────────────
    // 1. Require an authenticated user
    // ─────────────────────────────────────────────

    const {
      data: { user },
      error: userError,
    } = await locals.supabase.auth.getUser();

    if (userError || !user) {
      return unauthorized("You must be logged in to delete your account.");
    }

    const userId = user.id;

    // ─────────────────────────────────────────────
    // 2. Load the active deletion request
    // ─────────────────────────────────────────────

    const { data: deletionRequest, error: requestError } = await supabaseAdmin
      .from("account_deletion_requests")
      .select(
        `
            id,
            user_id,
            requested_at,
            delete_after,
            password_verified_at,
            email_verified_at,
            completed_at,
            cancelled_at
          `,
      )
      .eq("user_id", userId)
      .is("completed_at", null)
      .is("cancelled_at", null)
      .maybeSingle();

    if (requestError) {
      console.error(
        "[delete-account/complete] Failed to load deletion request:",
        requestError,
      );

      return serverError("Unable to verify your deletion request.");
    }

    if (!deletionRequest) {
      return badRequest(
        "There is no active account deletion request for this account.",
      );
    }

    // Extra ownership check.
    // This should always be true because we queried by userId,
    // but keeping the check makes the security assumption explicit.
    if (deletionRequest.user_id !== userId) {
      console.error(
        "[delete-account/complete] Deletion request ownership mismatch.",
      );

      return serverError("Unable to verify your deletion request.");
    }

    // ─────────────────────────────────────────────
    // 3. Verify password verification happened
    // ─────────────────────────────────────────────

    if (!deletionRequest.password_verified_at) {
      return badRequest(
        "Your password has not been verified for this deletion request.",
      );
    }

    // ─────────────────────────────────────────────
    // 4. Verify email verification happened
    // ─────────────────────────────────────────────

    if (!deletionRequest.email_verified_at) {
      return badRequest(
        "Please verify the account deletion request through the email we sent you.",
      );
    }

    // ─────────────────────────────────────────────
    // 5. Verify the 24-hour waiting period
    // ─────────────────────────────────────────────

    const deleteAfter = new Date(deletionRequest.delete_after);
    const now = new Date();

    if (Number.isNaN(deleteAfter.getTime())) {
      console.error(
        "[delete-account/complete] Invalid delete_after timestamp:",
        deletionRequest.delete_after,
      );

      return serverError("Unable to verify the deletion waiting period.");
    }

    if (deleteAfter.getTime() > now.getTime()) {
      const remainingMs = deleteAfter.getTime() - now.getTime();

      return badRequest(
        `Your account cannot be permanently deleted yet. Please wait ${Math.ceil(
          remainingMs / 60_000,
        )} more minute(s).`,
      );
    }

    // ─────────────────────────────────────────────
    // 6. Perform the public-database cleanup
    // ─────────────────────────────────────────────
    //
    // IMPORTANT:
    // The RPC performs the destructive database work atomically.
    // It also verifies the deletion request, password verification,
    // email verification and 24-hour waiting period again.
    //
    // We intentionally do NOT trust only the checks above.

    const { data: deletionResult, error: deletionError } =
      await supabaseAdmin.rpc("complete_account_deletion", {
        p_user_id: userId,
      });

    if (deletionError) {
      console.error(
        "[delete-account/complete] Database deletion failed:",
        deletionError,
      );

      return badRequest(
        "Your account could not be deleted. Nothing was permanently deleted.",
      );
    }

    // ─────────────────────────────────────────────
    // 7. Delete the Supabase Auth account
    // ─────────────────────────────────────────────
    //
    // This must happen AFTER the public DB cleanup succeeds.
    //
    // The database RPC and Supabase Auth deletion cannot participate
    // in the same PostgreSQL transaction, so this is intentionally
    // a separate operation.

    const { error: authDeleteError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error(
        "[delete-account/complete] Supabase Auth deletion failed:",
        authDeleteError,
      );

      /*
       * IMPORTANT:
       * At this point the user's public/account data has already been
       * removed by the RPC.
       *
       * Do NOT report this as a normal successful deletion because the
       * Auth account may still exist.
       *
       * This is an operational failure that should be monitored and
       * handled manually/retried if it ever occurs.
       */

      return serverError(
        "Your account data was removed, but the account could not be fully closed. Please contact support.",
      );
    }

    // ─────────────────────────────────────────────
    // 8. Success
    // ─────────────────────────────────────────────

    return ok({
      success: true,
      message: "Your account has been permanently deleted.",
      deletion: deletionResult,
    });
  } catch (error) {
    console.error("[delete-account/complete] Unexpected error:", error);

    return serverError(
      "An unexpected error occurred while deleting your account.",
    );
  }
};
