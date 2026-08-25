import type { APIRoute } from "astro";

import { z } from "zod";

import { badRequest, json, serverError } from "@/lib/api/json";

import { hashIP } from "@/utils/hashIP";
import { isValidUUID } from "@/utils/isValidUUID";

const schema = z.object({
  commentId: z.uuid(),

  vote: z.union([z.literal(1), z.literal(-1), z.literal(0)]),
});

export const POST: APIRoute = async (context) => {
  try {
    const supabase = context.locals.supabase;

    if (!supabase) {
      return serverError("Supabase client missing");
    }

    // ======================================================
    // BODY
    // ======================================================

    const body = await context.request.json();

    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid vote payload");
    }

    const { commentId, vote } = parsed.data;

    // ======================================================
    // IDENTITY
    // ======================================================

    const guestId = context.request.headers.get("x-guest-id");

    if (guestId && !isValidUUID(guestId)) {
      return badRequest("Invalid Guest Id");
    }

    // ======================================================
    // IP HASH
    // ======================================================

    const forwarded = context.request.headers.get("x-forwarded-for");

    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

    const ipHash = await hashIP(ip);

    // ======================================================
    // RPC
    // ======================================================

    const { data, error } = await supabase.rpc("toggle_comment_vote", {
      p_comment_id: commentId,

      p_vote: vote,

      p_guest_id: guestId ?? undefined,

      p_ip_hash: ipHash,
    });

    if (error) {
      console.error("toggle_comment_vote error:", error);

      return badRequest("Failed to update vote");
    }

    const voteResult = data?.[0];

    if (!voteResult) {
      return badRequest("Vote update failed");
    }

    return json({
      success: true,

      data: {
        likes: voteResult.likes,

        dislikes: voteResult.dislikes,

        myVote: voteResult.my_vote,
      },
    });
  } catch (error) {
    console.error("POST /api/comments/vote error:", error);

    return serverError(
      error instanceof Error ? error.message : "Unexpected error",
    );
  }
};
