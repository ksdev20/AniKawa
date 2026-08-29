import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

import { createNotification } from "./createNotification";

interface CommentReplyNotificationInput {
  supabase: SupabaseClient<Database>;

  authorId: string | null;

  parentCommentAuthorId: string | null;

  commentId: string;
  parentCommentId: string;

  animeSlug?: string | null;
}

export async function notifyCommentReply({
  supabase,
  authorId,
  parentCommentAuthorId,
  commentId,
  parentCommentId,
  animeSlug,
}: CommentReplyNotificationInput) {
  if (!parentCommentAuthorId) {
    return null;
  }

  if (authorId && authorId === parentCommentAuthorId) {
    return null;
  }

  return createNotification(supabase, {
    userId: parentCommentAuthorId,

    actorId: authorId,

    type: "comment_reply",

    title: "Someone replied to your comment",

    url: animeSlug
      ? `/anime/${animeSlug}?comment=${commentId}`
      : null,

    data: {
      comment_id: commentId,
      parent_comment_id: parentCommentId,
    },

    dedupeKey: `comment_reply:${commentId}:${parentCommentAuthorId}`,
  });
}