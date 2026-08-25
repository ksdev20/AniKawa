import type { Comment } from "@/types/comments";

export interface NormalizedComments {
  commentsById: Map<string, Comment>;
  rootCommentIds: string[];
  replyIdsByParent: Map<string, string[]>;
}

/* ===========================================================
   BUILD
   =========================================================== */

export function buildNormalizedComments(
  comments: Comment[],
): NormalizedComments {
  const commentsById = new Map<string, Comment>();
  const rootCommentIds: string[] = [];
  const replyIdsByParent = new Map<string, string[]>();

  for (const comment of comments) {
    commentsById.set(comment.id, comment);

    if (comment.parent_id === null) {
      rootCommentIds.push(comment.id);
      continue;
    }

    const replies = replyIdsByParent.get(comment.parent_id as string) ?? [];

    replies.push(comment.id);

    replyIdsByParent.set(comment.parent_id as string, replies);
  }

  return {
    commentsById,
    rootCommentIds,
    replyIdsByParent,
  };
}

/* ===========================================================
   INSERT
   =========================================================== */

export function insertComment(
  state: NormalizedComments,
  comment: Comment,
): NormalizedComments {
  const commentsById = new Map(state.commentsById);
  const rootCommentIds = [...state.rootCommentIds];
  const replyIdsByParent = new Map(state.replyIdsByParent);

  commentsById.set(comment.id, comment);

  if (comment.parent_id === null) {
    rootCommentIds.unshift(comment.id);
  } else {
    const replies = [
      ...(replyIdsByParent.get(comment.parent_id as string) ?? []),
    ];

    replies.push(comment.id);

    replyIdsByParent.set(comment.parent_id as string, replies);

    const parent = commentsById.get(comment.parent_id as string);

    if (parent) {
      commentsById.set(parent.id, {
        ...parent,
        replies_count: parent.replies_count + 1,
      });
    }
  }

  return {
    commentsById,
    rootCommentIds,
    replyIdsByParent,
  };
}

/* ===========================================================
   UPDATE
   =========================================================== */

export function updateComment(
  state: NormalizedComments,
  comment: Comment,
): NormalizedComments {
  const commentsById = new Map(state.commentsById);

  commentsById.set(comment.id, comment);

  return {
    ...state,
    commentsById,
  };
}

/* ===========================================================
   DELETE
   =========================================================== */

export function deleteComment(
  state: NormalizedComments,
  commentId: string,
): NormalizedComments {
  const commentsById = new Map(state.commentsById);
  const rootCommentIds = [...state.rootCommentIds];
  const replyIdsByParent = new Map(state.replyIdsByParent);

  const comment = commentsById.get(commentId);

  if (!comment) {
    return state;
  }

  commentsById.delete(commentId);
  replyIdsByParent.delete(commentId);

  if (comment.parent_id === null) {
    const index = rootCommentIds.indexOf(comment.id);

    if (index !== -1) {
      rootCommentIds.splice(index, 1);
    }
  } else {
    const replies = [
      ...(replyIdsByParent.get(comment.parent_id as string) ?? []),
    ];

    const index = replies.indexOf(comment.id);

    if (index !== -1) {
      replies.splice(index, 1);
    }

    replyIdsByParent.set(comment.parent_id as string, replies);

    const parent = commentsById.get(comment.parent_id as string);

    if (parent) {
      commentsById.set(parent.id, {
        ...parent,
        replies_count: Math.max(0, parent.replies_count - 1),
      });
    }
  }

  return {
    commentsById,
    rootCommentIds,
    replyIdsByParent,
  };
}

/* ===========================================================
   DELETE RECURSIVE
   =========================================================== */

export function deleteCommentRecursive(
  state: NormalizedComments,
  commentId: string,
): NormalizedComments {
  const commentsById = new Map(state.commentsById);

  const rootCommentIds = [...state.rootCommentIds];

  const replyIdsByParent = new Map(state.replyIdsByParent);

  function remove(id: string) {
    const children = replyIdsByParent.get(id) ?? [];

    for (const childId of children) {
      remove(childId);
    }

    commentsById.delete(id);

    replyIdsByParent.delete(id);

    for (const [parent_id, replies] of replyIdsByParent) {
      if (replies.includes(id)) {
        replyIdsByParent.set(
          parent_id,
          replies.filter((replyId) => replyId !== id),
        );
      }
    }

    const rootIndex = rootCommentIds.indexOf(id);

    if (rootIndex !== -1) {
      rootCommentIds.splice(rootIndex, 1);
    }
  }

  remove(commentId);

  return {
    commentsById,

    rootCommentIds,

    replyIdsByParent,
  };
}

/* ===========================================================
   REPLACE OPTIMISTIC
   =========================================================== */

export function replaceOptimisticComment(
  state: NormalizedComments,
  tempId: string,
  realComment: Comment,
): NormalizedComments {
  const commentsById = new Map(state.commentsById);
  const rootCommentIds = [...state.rootCommentIds];
  const replyIdsByParent = new Map(state.replyIdsByParent);

  const optimistic = commentsById.get(tempId);

  if (!optimistic) {
    return state;
  }

  commentsById.delete(tempId);
  commentsById.set(realComment.id, realComment);

  if (optimistic.parent_id === null) {
    const index = rootCommentIds.indexOf(tempId);

    if (index !== -1) {
      rootCommentIds[index] = realComment.id;
    }
  } else {
    const replies = [
      ...(replyIdsByParent.get(optimistic.parent_id as string) ?? []),
    ];

    const index = replies.indexOf(tempId);

    if (index !== -1) {
      replies[index] = realComment.id;
    }

    replyIdsByParent.set(optimistic.parent_id as string, replies);
  }

  return {
    commentsById,
    rootCommentIds,
    replyIdsByParent,
  };
}

/* ===========================================================
   UPDATE VOTE
   =========================================================== */

export function updateVote(
  state: NormalizedComments,
  commentId: string,
  likes: number,
  dislikes: number,
  myVote: -1 | 0 | 1,
): NormalizedComments {
  const commentsById = new Map(state.commentsById);

  const comment = commentsById.get(commentId);

  if (!comment) {
    return state;
  }

  commentsById.set(commentId, {
    ...comment,
    likes_count: likes,
    dislikes_count: dislikes,
    myVote,
  });

  return {
    ...state,
    commentsById,
  };
}
