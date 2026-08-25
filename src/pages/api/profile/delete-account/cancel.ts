import type { APIRoute } from "astro";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  notFound,
  ok,
  serverError,
  unauthorized,
} from "@/lib/api/json";

type AccountDeletionRequestRow = {
  id: string;
  user_id: string;
  requested_at: string;
  delete_after: string;
  password_verified_at: string | null;
  email_verified_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
};

export const POST: APIRoute = async ({ locals }) => {
  try {
    const {
      data: { user },
      error: authError,
    } = await locals.supabase.auth.getUser();

    if (authError || !user) {
      return unauthorized("You must be logged in.");
    }

    const { data, error: requestError } = await supabaseAdmin
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
      .eq("user_id", user.id)
      .is("completed_at", null)
      .is("cancelled_at", null)
      .maybeSingle();

    if (requestError) {
      console.error(
        "[DELETE ACCOUNT CANCEL] Failed to fetch request:",
        requestError,
      );

      return serverError("Failed to cancel account deletion.");
    }

    if (!data) {
      return notFound("No active account deletion request was found.");
    }

    const request = data as unknown as AccountDeletionRequestRow;

    const cancelledAt = new Date().toISOString();

    const { error: updateError } = await supabaseAdmin
      .from("account_deletion_requests")
      .update({
        cancelled_at: cancelledAt,
      })
      .eq("id", request.id)
      .eq("user_id", user.id)
      .is("completed_at", null)
      .is("cancelled_at", null);

    if (updateError) {
      console.error(
        "[DELETE ACCOUNT CANCEL] Failed to cancel request:",
        updateError,
      );

      return serverError("Failed to cancel account deletion.");
    }

    return ok({
      success: true,
      message: "Your account deletion request has been cancelled.",
      cancelledAt,
    });
  } catch (error) {
    console.error("[DELETE ACCOUNT CANCEL] Unexpected error:", error);

    return serverError("Failed to cancel account deletion.");
  }
};
