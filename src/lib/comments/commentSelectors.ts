import type { Comment } from "@/types/comments";

/* ===========================================================
   BASIC
   =========================================================== */

export function getComment(
  commentsById: Map<string, Comment>,
  commentId: string,
): Comment | undefined {
  return commentsById.get(commentId);
}

export function hasComment(
  commentsById: Map<string, Comment>,
  commentId: string,
): boolean {
  return commentsById.has(commentId);
}

export function getRootComments(
  commentsById: Map<string, Comment>,
  rootCommentIds: string[],
): Comment[] {
  return rootCommentIds
    .map((id) => commentsById.get(id))
    .filter((comment): comment is Comment => comment !== undefined);
}

/* ===========================================================
   REPLIES
   =========================================================== */

export function getReplyIds(
  replyIdsByParent: Map<string, string[]>,
  parentId: string,
): string[] {
  return replyIdsByParent.get(parentId) ?? [];
}

export function getReplies(
  commentsById: Map<string, Comment>,
  replyIdsByParent: Map<string, string[]>,
  parentId: string,
): Comment[] {
  return getReplyIds(replyIdsByParent, parentId)
    .map((id) => commentsById.get(id))
    .filter((comment): comment is Comment => comment !== undefined);
}

/* ===========================================================
   COUNTS
   =========================================================== */

export function getReplyCount(
  replyIdsByParent: Map<string, string[]>,
  parentId: string,
): number {
  return getReplyIds(replyIdsByParent, parentId).length;
}

export function getTotalComments(commentsById: Map<string, Comment>): number {
  return commentsById.size;
}

/* ===========================================================
   TREE
   =========================================================== */

export interface CommentTreeNode {
  comment: Comment;
  replies: CommentTreeNode[];
}

export function getCommentTree(
  commentsById: Map<string, Comment>,
  replyIdsByParent: Map<string, string[]>,
  rootCommentIds: string[],
): CommentTreeNode[] {
  function build(ids: string[]): CommentTreeNode[] {
    const nodes: CommentTreeNode[] = [];

    for (const id of ids) {
      const comment = commentsById.get(id);

      if (!comment) continue;

      nodes.push({
        comment,
        replies: build(replyIdsByParent.get(id) ?? []),
      });
    }

    return nodes;
  }

  return build(rootCommentIds);
}
