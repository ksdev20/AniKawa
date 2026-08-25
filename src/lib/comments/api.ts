import type {
  ApiResponse,
  Comment,
  CommentsPage,
  CreateCommentInput,
  EditCommentInput,
  VoteCommentInput,
  ReportCommentInput,
  CommentSort,
  VoteResponse,
  CommentsCursor,
} from "@/types/comments";

// ===========================================================
// HELPERS
// ===========================================================

async function apiRequest<T>(
  url: string,
  options?: RequestInit,
  includeGuestId = false,
): Promise<T> {
  const response = await fetch(url, {
    ...options,

    headers: {
      "Content-Type": "application/json",

      ...(includeGuestId ? { "x-guest-id": getGuestId() } : {}),

      ...(options?.headers ?? {}),
    },
  });

  const result = (await response.json()) as T;

  if (!response.ok) {
    throw new Error((result as ApiResponse<unknown>).error ?? "Request failed");
  }

  return result;
}

// ===========================================================
// CREATE COMMENT
// ===========================================================

import { ApiError } from "@/lib/api/ApiError";
import { getGuestId } from "@/utils/getGuestId";

export async function createComment(
  input: CreateCommentInput,
): Promise<Comment> {
  const response = await apiRequest<ApiResponse<Comment>>(
    "/api/comments",
    {
      method: "POST",

      body: JSON.stringify(input),
    },
    true,
  );

  if (!response.success || !response.data) {
    throw new ApiError(
      response.error ?? "Failed to create comment",

      400,

      response?.code,
    );
  }

  return response.data;
}

// ===========================================================
// GET COMMENTS
// ===========================================================

export async function getComments(
  episodeId: string,

  sort: CommentSort = "top",

  cursor: CommentsCursor | null,

  limit = 30,
): Promise<CommentsPage> {
  const params = new URLSearchParams();

  params.set("episodeId", episodeId);

  params.set("sort", sort);

  params.set("limit", String(limit));

  if (cursor) {
    params.set("cursorScore", String(cursor.score));
    params.set("cursorCreatedAt", cursor.createdAt);
    params.set("cursorId", cursor.id);
  }

  const response = await apiRequest<ApiResponse<CommentsPage>>(
    `/api/comments?${params.toString()}`,
    undefined,
    true,
  );

  if (!response.success || !response.data) {
    throw new Error(response.error ?? "Failed to load comments");
  }

  return response.data;
}

// ===========================================================
// EDIT COMMENT
// ===========================================================

export async function editComment(input: EditCommentInput): Promise<Comment> {
  const response = await apiRequest<ApiResponse<Comment>>(
    `/api/comments/${input.commentId}`,
    {
      method: "PATCH",

      body: JSON.stringify({
        content: input.content,
      }),
    },
    true,
  );

  if (!response.success || !response.data) {
    throw new Error(response.error ?? "Failed to edit comment");
  }

  return response.data;
}

// ===========================================================
// DELETE COMMENT
// ===========================================================

export async function deleteComment(commentId: string): Promise<Comment> {
  const response = await apiRequest<ApiResponse<Comment>>(
    `/api/comments/${commentId}`,
    {
      method: "DELETE",
    },
    true,
  );

  if (!response.success || !response.data) {
    throw new Error(response.error ?? "Failed to delete comment");
  }

  return response.data;
}

// ===========================================================
// VOTE COMMENT
// ===========================================================

export async function voteComment(
  input: VoteCommentInput,
): Promise<VoteResponse> {
  const response = await apiRequest<ApiResponse<VoteResponse>>(
    "/api/comments/vote",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    true,
  );

  if (!response.success || !response.data) {
    throw new Error(response.error ?? "Failed to vote");
  }

  return response.data;
}

// ===========================================================
// REPORT COMMENT
// ===========================================================

export async function reportComment(input: ReportCommentInput): Promise<void> {
  const response = await apiRequest<ApiResponse<void>>(
    "/api/comments/report",
    {
      method: "POST",

      body: JSON.stringify(input),
    },
    true,
  );

  if (!response.success) {
    throw new Error(response.error ?? "Failed to report comment");
  }
}
