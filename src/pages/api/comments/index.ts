/*----OVERVIEW OF POST----
Request
 |
 |-- Parse JSON
 |
 |-- Validate input
 |
 |-- Authenticate user
 |
 |-- Guest checks
 |
 |-- Turnstile verify
 |
 |-- Rate limit
 |
 |-- Spam scoring
 |
 |-- XSS sanitization
 |
 |-- Hash sensitive data
 |
 |-- Get metadata
 |
 |-- Call RPC
 |
Response
*/
import type { APIRoute } from "astro";

import {
  badRequest,
  created,
  forbidden,
  serverError,
  tooManyRequests,
  success,
} from "@/lib/api/json";

import {
  calculateSpamScore,
  checkCommentRateLimit,
  hashEmail,
  hashIp,
  sanitizeComment,
} from "@/lib/comments/security";
import { getUserRole } from "@/lib/auth/getUserRole";
import { isValidUUID } from "@/utils/isValidUUID";
import { createNotification } from "@/lib/notifications/createNotification";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // =====================================================
    // CONTENT TYPE
    // =====================================================

    if (!request.headers.get("content-type")?.includes("application/json")) {
      return badRequest("Content-Type must be application/json");
    }

    // =====================================================
    // SUPABASE
    // =====================================================

    const supabase = locals.supabase;

    if (!supabase) {
      return serverError("Supabase unavailable");
    }

    // =====================================================
    // BODY
    // =====================================================

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    const {
      episodeId,
      parentId,
      content,
      guestName,
      guestEmail,
      turnstileToken,
      notificationUrl,
    } = body;

    // =====================================================
    // VALIDATION
    // =====================================================

    if (typeof episodeId !== "string" || episodeId.trim() === "") {
      return badRequest("Episode id required");
    }

    if (
      notificationUrl !== undefined &&
      (typeof notificationUrl !== "string" ||
        !notificationUrl.startsWith("/") ||
        notificationUrl.startsWith("//"))
    ) {
      return badRequest("Invalid notification URL");
    }

    if (
      parentId !== null &&
      parentId !== undefined &&
      (typeof parentId !== "string" || !UUID_REGEX.test(parentId))
    ) {
      return badRequest("Invalid parent id");
    }

    if (typeof content !== "string") {
      return badRequest("Content required");
    }

    // =====================================================
    // SANITIZE
    // =====================================================

    const cleanContent = sanitizeComment(content);

    if (cleanContent.length < 2) {
      return badRequest("Comment too short");
    }

    if (cleanContent.length > 5000) {
      return badRequest("Comment too long");
    }

    // =====================================================
    // IDENTITY
    // =====================================================

    const userId = locals.user?.id ?? null;

    const isGuest = userId === null;
    const guestId = request.headers.get("x-guest-id");

    if (!userId && !guestId) {
      return badRequest("Guest identity missing");
    }

    const normalizedGuestName =
      typeof guestName === "string" ? guestName.trim() : "";

    const normalizedGuestEmail =
      typeof guestEmail === "string" ? guestEmail.trim().toLowerCase() : "";

    // =====================================================
    // GUEST VERIFICATION
    // =====================================================

    if (isGuest) {
      if (typeof guestId !== "string") {
        return badRequest("Guest id required");
      }

      if (guestId && !isValidUUID(guestId)) {
        return badRequest("Invalid guest id");
      }

      if (normalizedGuestName.length < 2) {
        return badRequest("Guest name required");
      }

      if (typeof turnstileToken !== "string") {
        return badRequest("Verification required");
      }

      const verified = true; //temp
      // const verified = await verifyTurnstile(turnstileToken, request);

      if (!verified) {
        return forbidden("Verification failed");
      }
    }

    // =====================================================
    // METADATA
    // =====================================================

    const ip =
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for");

    const ipHash = ip ? hashIp(ip) : null;

    const userAgent = request.headers.get("user-agent") ?? undefined;

    // =====================================================
    // RATE LIMIT
    // =====================================================

    const role = await getUserRole(supabase, userId);

    const rateLimit = await checkCommentRateLimit({
      guestId: isGuest ? (guestId as string) : null,
      userId,
      role,
    });

    if (!rateLimit.success) {
      return tooManyRequests(
        "You're commenting too quickly. Please wait a moment and try again.",
      );
    }

    // =====================================================
    // SPAM
    // =====================================================

    const spamScore = calculateSpamScore({
      content: cleanContent,
      guestName: normalizedGuestName,
      email: normalizedGuestEmail,
    });

    const status =
      spamScore >= 70 ? "deleted" : spamScore >= 30 ? "pending" : "approved";

    // =====================================================
    // RPC
    // =====================================================

    const { data, error } = await supabase.rpc("rpc_create_comment", {
      p_episode_id: episodeId,

      ...(parentId && { p_parent_id: parentId ?? null }),

      p_content: cleanContent,

      p_guest_id: isGuest ? (guestId as string) : undefined,

      p_guest_name: isGuest ? normalizedGuestName : undefined,

      ...(isGuest &&
        normalizedGuestEmail && {
          p_guest_email_hash: hashEmail(normalizedGuestEmail) ?? undefined,
        }),

      p_status: status,

      p_spam_score: spamScore,

      p_ip_hash: ipHash ?? undefined,

      p_user_agent: userAgent,
    });

    const commentUrl =
      typeof notificationUrl === "string" && data
        ? `${notificationUrl}#comment-${data.id}`
        : undefined;

    if (error) {
      console.error("rpc_create_comment", error);

      return badRequest(error.message);
    }

    // =====================================================
    // COMMENT REPLY NOTIFICATION
    // =====================================================

    if (data && data.parent_id && data.status === "approved") {
      try {
        const { data: parentComment, error: parentError } = await supabase
          .from("comments")
          .select("user_id")
          .eq("id", data.parent_id)
          .is("deleted_at", null)
          .maybeSingle();

        if (parentError) {
          console.error(
            "[Notifications] Failed to find parent comment:",
            parentError,
          );
        } else if (parentComment?.user_id) {
          await createNotification(supabase, {
            userId: parentComment.user_id,

            actorId: data.user_id ?? undefined,

            type: "comment_reply",

            title: "Someone replied to your comment",

            body: cleanContent,

            url: commentUrl,

            data: {
              commentId: data.id,
              parentCommentId: data.parent_id,
              episodeId,
            },

            dedupeKey: `comment_reply:${data.id}`,
          });
        }
      } catch (error) {
        console.error(
          "[Notifications] Comment reply notification failed:",
          error,
        );
      }
    }

    return created(data);
  } catch (error) {
    console.error("POST /api/comments", error);

    return serverError(
      error instanceof Error ? error.message : "Unexpected error",
    );
  }
};

const ALLOWED_SORTS = ["top", "newest", "oldest"] as const;

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const supabase = locals.supabase;

    if (!supabase) {
      return serverError("Supabase unavailable");
    }

    // =====================================================
    // Query params
    // =====================================================

    const url = new URL(request.url);

    const episodeId = url.searchParams.get("episodeId");

    const sort = url.searchParams.get("sort") ?? "top";

    const limit = Number(url.searchParams.get("limit") ?? "5");

    const cursorScore = url.searchParams.get("cursorScore");
    const cursorCreatedAt = url.searchParams.get("cursorCreatedAt");
    const cursorId = url.searchParams.get("cursorId");

    // =====================================================
    // Validation
    // =====================================================

    if (!episodeId) {
      return badRequest("Episode id required");
    }

    if (!ALLOWED_SORTS.includes(sort as (typeof ALLOWED_SORTS)[number])) {
      return badRequest("Invalid sort option");
    }

    if (Number.isNaN(limit) || limit < 1 || limit > 50) {
      return badRequest("Invalid limit");
    }

    // =====================================================
    // Guest / User identity
    // =====================================================

    const userId = locals.user?.id ?? null;

    const guestId = request.headers.get("x-guest-id");

    if (guestId && !isValidUUID(guestId)) {
      return badRequest("Invalid guest id");
    }

    const parsedCursorScore =
      cursorScore !== null ? Number(cursorScore) : undefined;

    if (parsedCursorScore !== undefined && Number.isNaN(parsedCursorScore)) {
      return badRequest("Invalid cursor score");
    }

    // =====================================================
    // Fetch comments
    // =====================================================

    const { data, error } = await supabase.rpc("rpc_get_comments", {
      p_episode_id: episodeId,

      p_sort: sort,

      p_limit: limit,

      p_cursor_score: parsedCursorScore,
      p_cursor_created_at: cursorCreatedAt ?? undefined,
      p_cursor_id: cursorId ?? undefined,

      p_guest_id: !userId && guestId ? guestId : undefined,

      p_user_id: userId ?? undefined,
    });

    if (error) {
      console.error("rpc_get_comments:", error);

      return badRequest(error.message);
    }

    const rows = Array.isArray(data) ? data : [];

    // =====================================================
    // Normalize
    // =====================================================

    const commentsById: Record<string, unknown> = {};

    const rootCommentIds: string[] = [];

    const replyIdsByParent: Record<string, string[]> = {};

    for (const comment of rows) {
      commentsById[comment.id] = comment;

      if (comment.parent_id === null) {
        rootCommentIds.push(comment.id);
      } else {
        (replyIdsByParent[comment.parent_id] ??= []).push(comment.id);
      }
    }

    // =====================================================
    // Cursor
    // =====================================================

    const hasMore = rows.length === limit;

    const last = rows.at(-1);

    const nextCursor =
      hasMore && last
        ? {
            score: last.likes_count - last.dislikes_count,
            createdAt: last.created_at,
            id: last.id,
          }
        : null;

    return success({
      commentsById,

      rootCommentIds,

      replyIdsByParent,

      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("GET /api/comments:", error);

    return serverError(
      error instanceof Error ? error.message : "Unexpected error",
    );
  }
};
