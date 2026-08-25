import type { APIRoute } from "astro";

import { z } from "zod";

import { badRequest, ok, serverError } from "@/lib/api/json";
import { isValidUUID } from "@/utils/isValidUUID";

const editCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment too long"),
});

export const PATCH: APIRoute = async (context) => {
  try {
    const commentId = context.params.id;

    if (!isValidUUID(commentId)) {
      return badRequest("Invalid comment id");
    }

    const body = await context.request.json();

    const parsed = editCommentSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const guestId = context.request.headers.get("x-guest-id") ?? null;
    if (guestId && !isValidUUID(guestId ?? null)) { 
      return badRequest("Invalid guest id");
    }

    const supabase = context.locals.supabase;

    if (!supabase) {
      return serverError("Supabase client missing");
    }

    const { data, error } = await supabase.rpc("rpc_edit_comment", {
      p_comment_id: commentId,

      p_content: parsed.data.content,

      p_guest_id: guestId ?? undefined,
    });

    if (error) {
      console.error("rpc_edit_comment error:", error);

      return badRequest(error.message);
    }

    return ok(data);
  } catch (error) {
    console.error("PATCH /api/comments/[id] error:", error);

    return serverError(
      error instanceof Error ? error.message : "Unexpected error",
    );
  }
};

export const DELETE: APIRoute = async (context) => {
  try {
    const commentId = context.params.id;

    if (!isValidUUID(commentId)) {
      return badRequest("Invalid comment id");
    }

    const supabase = context.locals.supabase;

    if (!supabase) {
      return serverError("Supabase client missing");
    }

    const guestId = context.request.headers.get("x-guest-id");

    if (guestId && !isValidUUID(guestId)) {
      return badRequest("Invalid guest id");
    }

    const { data, error } = await supabase.rpc("rpc_soft_delete_comment", {
      p_comment_id: commentId,
      p_guest_id: guestId ?? undefined,
    });

    if (error) {
      console.error("rpc_soft_delete_comment:", error);

      return badRequest(error.message);
    }

    if (!data) {
      return badRequest("Comment cannot be deleted");
    }

    return ok(data);
  } catch (error) {
    console.error("DELETE /api/comments/[id]:", error);

    return serverError(
      error instanceof Error ? error.message : "Unexpected error",
    );
  }
};
