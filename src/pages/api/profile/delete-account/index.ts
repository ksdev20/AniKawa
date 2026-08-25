import type { APIRoute } from "astro";
import { unauthorized, ok, serverError } from "@/lib/api/json";

type AccountDeletionRequestRow = {
  id: string;
  requested_at: string;
  delete_after: string;
  password_verified_at: string | null;
  email_verified_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
};

export const GET: APIRoute = async ({ locals }) => {
  try {
    const { data: userData, error: userError } =
      await locals.supabase.auth.getUser();

    if (userError || !userData.user) {
      return unauthorized("You must be logged in.");
    }

    const userId = userData.user.id;

    const { data, error: requestError } = await locals.supabase
      .from("account_deletion_requests")
      .select(
        [
          "id",
          "requested_at",
          "delete_after",
          "password_verified_at",
          "email_verified_at",
          "completed_at",
          "cancelled_at",
          "created_at",
        ].join(", "),
      )
      .eq("user_id", userId)
      .is("completed_at", null)
      .is("cancelled_at", null)
      .maybeSingle();

    if (requestError) {
      console.error(
        "[GET /api/profile/delete-account] Failed to fetch request:",
        requestError,
      );

      return serverError("Failed to load account deletion status.");
    }

    const request = data as unknown as AccountDeletionRequestRow | null;

    // No active deletion request.
    if (!request) {
      return ok({
        hasRequest: false,
        requestedAt: null,
        deleteAfter: null,
        passwordVerified: false,
        emailVerified: false,
        waitingPeriodComplete: false,
        canCancel: false,
        canComplete: false,
        remainingMs: 0,
      });
    }

    const now = Date.now();
    const deleteAfter = new Date(request.delete_after).getTime();

    const passwordVerified = Boolean(request.password_verified_at);
    const emailVerified = Boolean(request.email_verified_at);

    const waitingPeriodComplete = now >= deleteAfter;

    const canComplete =
      passwordVerified && emailVerified && waitingPeriodComplete;

    return ok({
      hasRequest: true,

      requestedAt: request.requested_at,
      deleteAfter: request.delete_after,

      passwordVerified,
      emailVerified,

      waitingPeriodComplete,

      canCancel: true,
      canComplete,

      remainingMs: Math.max(0, deleteAfter - now),
    });
  } catch (error) {
    console.error("[GET /api/profile/delete-account] Unexpected error:", error);

    return serverError("Failed to load account deletion status.");
  }
};
