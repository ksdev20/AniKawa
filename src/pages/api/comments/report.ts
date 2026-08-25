import type { APIRoute } from "astro";

import { z } from "zod";

import { badRequest, ok, serverError } from "@/lib/api/json";

import { hashIP } from "@/utils/hashIP";
import { isValidUUID } from "@/utils/isValidUUID";

const reportSchema = z.object({
  commentId: z.uuid(),

  reason: z
    .string()
    .trim()
    .min(3, "Reason is too short")
    .max(500, "Reason too long"),
});

export const POST: APIRoute = async (context) => {
  try {
    const supabase = context.locals.supabase;

    if (!supabase) {
      return serverError("Supabase client missing");
    }

    const body = await context.request.json();

    const parsed = reportSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const { commentId, reason } = parsed.data;

    const guestId = context.request.headers.get("x-guest-id") ?? undefined;

    if (guestId && !isValidUUID(guestId)) {
      return badRequest("Invalid guest id");
    }

    const ip =
      context.request.headers.get("cf-connecting-ip") ??
      context.request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    const ipHash = await hashIP(ip);

    const { data, error } = await supabase.rpc("rpc_report_comment", {
      p_comment_id: commentId,

      p_reason: reason,

      p_guest_id: guestId,

      p_ip_hash: ipHash,
    });

    if (error) {
      console.error("rpc_report_comment:", error);

      return badRequest(error.message);
    }

    return ok(data);
  } catch (error) {
    console.error("POST /api/comments/report:", error);

    return serverError(
      error instanceof Error ? error.message : "Unexpected error",
    );
  }
};
