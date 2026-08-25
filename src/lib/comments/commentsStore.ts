import { create } from "zustand";

import type {
  Comment,
  CommentSort,
  CommentsState,
  CreateCommentInput,
  EditCommentInput,
  VoteCommentInput,
  ReportCommentInput,
  CommentsCursor,
} from "@/types/comments";

import {
  getComments,
  createComment as createCommentApi,
  editComment as editCommentApi,
  deleteComment as deleteCommentApi,
  voteComment as voteCommentApi,
  reportComment as reportCommentApi,
} from "./api";

import {
  insertComment,
  updateComment,
} from "./commentTree";

// ===========================================================
// STORE TYPES
// ===========================================================

interface CommentsStore extends CommentsState {
  /*
    Fetch
  */

  fetchComments(
    episodeId: string,
    cursor: CommentsCursor | null,
    sort?: CommentSort,
  ): Promise<void>;

  refresh(episodeId: string, sort?: CommentSort): Promise<void>;

  /*
    Mutations
    (implemented in next parts)
  */

  createComment(input: CreateCommentInput): Promise<Comment>;

  editComment(input: EditCommentInput): Promise<void>;

  deleteComment(commentId: string): Promise<void>;

  voteComment(input: VoteCommentInput): Promise<void>;

  reportComment(input: ReportCommentInput): Promise<boolean>;

  /*
    Reset
  */

  setSort(sort: CommentSort): void;

  setTurnstileToken(token: string): void;

  clearTurnstileToken(): void;

  setRealtimeConnected(connected: boolean): void;

  setSort(sort: CommentSort): void;

  setOpenMenuCommentId(commentId: string | null): void;

  reset(): void;

  loadMoreComments(episodeId: string): void;
}

// ===========================================================
// INITIAL STATE
// ===========================================================

const initialState: CommentsState = {
  commentsById: new Map(),

  rootCommentIds: [],

  replyIdsByParent: new Map(),

  loading: false,

  loadingMore: false,

  openMenuCommentId: null,

  votingCommentIds: new Set<string>(),

  initialized: false,

  hasMore: true,

  nextCursor: null,

  total: 0,

  error: null,

  sort: "top",

  turnstileToken: "",

  realtimeConnected: false,
};

// ===========================================================
// STORE
// ===========================================================

export const useCommentsStore = create<CommentsStore>((set, get) => ({
  ...initialState,

  // ======================================================
  // FETCH COMMENTS
  // ======================================================

  // ======================================================
  // SORT
  // ======================================================

  setSort: (sort) => {
    set({
      sort,
    });
  },

  setOpenMenuCommentId: (commentId: string | null) => {
    set({
      openMenuCommentId: commentId,
    });
  },

  // ======================================================
  // TURNSTILE
  // ======================================================

  setTurnstileToken: (token) => {
    set({
      turnstileToken: token,
    });
  },

  clearTurnstileToken: () => {
    set({
      turnstileToken: "",
    });
  },

  // ======================================================
  // REALTIME
  // ======================================================

  setRealtimeConnected: (connected) => {
    set({
      realtimeConnected: connected,
    });
  },

  fetchComments: async (
    episodeId,

    cursor,

    sort = "top",
  ) => {
    const state = get();

    if (state.loading) {
      return;
    }

    set({
      loading: true,

      loadingMore: cursor ? true : false,

      error: null,
    });

    try {
      const page = await getComments(
        episodeId,

        sort,

        cursor,
      );

      const mapped = page.commentsById;

      const commentsById = new Map(
        Object.entries(mapped).map(([id, comment]) => [id, comment]),
      );

      const rootCommentIds = page.rootCommentIds;

      const replyIdsByParent = new Map(Object.entries(page.replyIdsByParent));

      const mergedReplyIdsByParent = new Map(state.replyIdsByParent);

      replyIdsByParent.forEach((ids, parentId) => {
        const existing = mergedReplyIdsByParent.get(parentId) ?? [];

        mergedReplyIdsByParent.set(parentId, [
          ...new Set([...existing, ...ids]),
        ]);
      });
      if (cursor) {
        const mergedComments = new Map(state.commentsById);

        commentsById.forEach((comment, id) => {
          mergedComments.set(id, comment);
        });

        set({
          commentsById: mergedComments,

          rootCommentIds: [
            ...new Set([...state.rootCommentIds, ...rootCommentIds]),
          ],

          replyIdsByParent: mergedReplyIdsByParent,

          nextCursor: page.nextCursor ?? null,

          hasMore: page.hasMore,

          loading: false,

          loadingMore: false,

          initialized: true,

          total: mergedComments.size,

          sort,
        });

        return;
      }

      set({
        commentsById,

        rootCommentIds,

        replyIdsByParent,

        nextCursor: page.nextCursor ?? null,

        hasMore: page.hasMore,

        loading: false,

        loadingMore: false,

        initialized: true,

        total: commentsById.size,

        sort,
      });
    } catch (error) {
      set({
        loading: false,

        error:
          error instanceof Error ? error.message : "Failed to load comments",
      });
    }
  },

  // ======================================================
  // REFRESH
  // ======================================================

  refresh: async (
    episodeId,

    sort = "top",
  ) => {
    set({
      commentsById: new Map(),

      rootCommentIds: [],

      replyIdsByParent: new Map(),

      initialized: false,

      hasMore: true,

      total: 0,

      error: null,

      sort,
    });

    await get().fetchComments(
      episodeId,

      null,

      sort,
    );
  },

  loadMoreComments: async (episodeId: string) => {
    const state = get();

    if (state.loadingMore || !state.hasMore || !state.nextCursor) {
      return;
    }

    set({
      loadingMore: true,
      error: null,
    });

    try {
      const page = await getComments(episodeId, state.sort, state.nextCursor);

      const newComments = new Map(state.commentsById);

      Object.entries(page.commentsById).forEach(([id, comment]) => {
        newComments.set(id, comment);
      });

      const newReplyMap = new Map(state.replyIdsByParent);

      Object.entries(page.replyIdsByParent).forEach(([parentId, ids]) => {
        const existing = newReplyMap.get(parentId) ?? [];

        newReplyMap.set(parentId, [...new Set([...existing, ...ids])]);
      });

      set({
        commentsById: newComments,

        rootCommentIds: [
          ...new Set([...state.rootCommentIds, ...page.rootCommentIds]),
        ],

        replyIdsByParent: newReplyMap,

        nextCursor: page.nextCursor,

        hasMore: page.nextCursor !== null,

        loadingMore: false,
      });
    } catch (error) {
      set({
        loadingMore: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed loading more comments",
      });
    }
  },

  // ======================================================
  // PLACEHOLDERS
  // ======================================================

  // ======================================================
  // CREATE COMMENT
  // ======================================================

  createComment: async (input) => {
    const comment = await createCommentApi(input);

    set((state) => {
      const updated = insertComment(
        {
          commentsById: state.commentsById,

          rootCommentIds: state.rootCommentIds,

          replyIdsByParent: state.replyIdsByParent,
        },

        comment,
      );

      return {
        commentsById: updated.commentsById,

        rootCommentIds: updated.rootCommentIds,

        replyIdsByParent: updated.replyIdsByParent,

        total: updated.commentsById.size,
      };
    });

    return comment;
  },

  // ======================================================
  // EDIT COMMENT
  // ======================================================

  editComment: async (input: EditCommentInput) => {
    const comment = await editCommentApi(input);

    set((state) => {
      const updated = updateComment(
        {
          commentsById: state.commentsById,
          rootCommentIds: state.rootCommentIds,
          replyIdsByParent: state.replyIdsByParent,
        },
        comment,
      );

      return {
        commentsById: updated.commentsById,
      };
    });
  },

  // ======================================================
  // DELETE COMMENT
  // ======================================================

  deleteComment: async (commentId: string) => {
    const comment = await deleteCommentApi(commentId);

    set((state) => {
      const updated = updateComment(
        {
          commentsById: state.commentsById,
          rootCommentIds: state.rootCommentIds,
          replyIdsByParent: state.replyIdsByParent,
        },
        comment,
      );

      return {
        commentsById: updated.commentsById,
      };
    });
  },

  // ======================================================
  // VOTE COMMENT
  // ======================================================

  voteComment: async (input: VoteCommentInput) => {
    const { votingCommentIds } = get();

    if (votingCommentIds.has(input.commentId)) {
      return;
    }

    set((state) => ({
      votingCommentIds: new Set(state.votingCommentIds).add(input.commentId),
    }));

    try {
      const result = await voteCommentApi(input);

      set((state) => {
        const comment = state.commentsById.get(input.commentId);

        const votingCommentIds = new Set(state.votingCommentIds);

        votingCommentIds.delete(input.commentId);

        if (!comment) {
          return {
            votingCommentIds,
          };
        }

        return {
          votingCommentIds,

          commentsById: new Map(state.commentsById).set(input.commentId, {
            ...comment,

            likes_count: result.likes,

            dislikes_count: result.dislikes,

            my_vote: result.myVote,
          }),
        };
      });
    } catch (error) {
      set((state) => {
        const votingCommentIds = new Set(state.votingCommentIds);

        votingCommentIds.delete(input.commentId);

        return {
          votingCommentIds,
        };
      });

      throw error;
    }
  },

  // ======================================================
  // REPORT COMMENT
  // ======================================================

  reportComment: async (input: ReportCommentInput) => {
    try {
      await reportCommentApi(input);

      return true;
    } catch (error) {
      console.error("[reportComment]", error);

      throw error;
    }
  },

  reset: () => {
    set({
      ...initialState,

      commentsById: new Map(),

      replyIdsByParent: new Map(),

      rootCommentIds: [],
    });
  },
}));
