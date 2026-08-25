import { useState } from "react";

import type { Comment } from "@/types/comments";

import CommentActions from "./CommentActions";
import ReplyForm from "./ReplyForm";
import ReportModal from "./ReportModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import EditCommentForm from "./EditCommentForm";

interface Props {
  comment: Comment;

  commentsById: Map<string, Comment>;

  replyIdsByParent: Map<string, string[]>;

  depth?: number;
}

export default function CommentCard({
  comment,

  commentsById,

  replyIdsByParent,

  depth = 0,
}: Props) {
  const [showReplies, setShowReplies] = useState(false);

  const [replyOpen, setReplyOpen] = useState(false);

  const [reportOpen, setReportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const replyIds = replyIdsByParent.get(comment.id) ?? [];

  const replies = replyIds.map((id) => commentsById.get(id)).filter(Boolean);

  function formatDate(date: string) {
    const now = Date.now();
    const created = new Date(date).getTime();

    const diff = Math.floor((now - created) / 1000);

    const units = [
      {
        unit: "year",
        seconds: 60 * 60 * 24 * 365,
      },
      {
        unit: "month",
        seconds: 60 * 60 * 24 * 30,
      },
      {
        unit: "week",
        seconds: 60 * 60 * 24 * 7,
      },
      {
        unit: "day",
        seconds: 60 * 60 * 24,
      },
      {
        unit: "hour",
        seconds: 60 * 60,
      },
      {
        unit: "minute",
        seconds: 60,
      },
      {
        unit: "second",
        seconds: 1,
      },
    ] as const;

    for (const { unit, seconds } of units) {
      if (diff >= seconds) {
        const value = Math.floor(diff / seconds);

        return `${value} ${unit}${value !== 1 ? "s" : ""} ago`;
      }
    }

    return "just now";
  }

  function getDisplayName() {
    return comment?.user_name ?? comment?.guest_name ?? "Anonymous";
  }

  function avatarLetter() {
    return getDisplayName().charAt(0).toUpperCase();
  }

  const isDeleted = comment.status === "deleted";

  return (
    <article className="comment-card" data-depth={depth}>
      <div className="comment-top">
        <div className="comment-avatar">{avatarLetter()}</div>

        <div className="comment-user">
          <h3>{getDisplayName()}</h3>

          {!isDeleted ? (
            <div>
              <time>{formatDate(comment.created_at)}</time>
              {comment.edited && (
                <span> · Edited {formatDate(comment.updated_at)}</span>
              )}
            </div>
          ) : (
            <span>Deleted {formatDate(comment.deleted_at as string)}</span>
          )}
        </div>
      </div>

      {editOpen ? (
        <EditCommentForm
          comment={comment}
          onCancel={() => setEditOpen(false)}
          onSuccess={() => setEditOpen(false)}
        />
      ) : (
        <p className="comment-content">{comment.content}</p>
      )}

      <CommentActions
        comment={comment}
        onReply={() => setReplyOpen((prev) => !prev)}
        onReport={() => setReportOpen(true)}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      />

      {replyOpen && (
        <ReplyForm
          episodeId={comment.episode_id}

          parentId={comment.id}

          onCancel={() => setReplyOpen(false)}

          onSuccess={() => setReplyOpen(false)}
        />
      )}

      {replyIds.length > 0 && (
        <div className="comment-thread">
          <button
            className="reply-toggle"

            onClick={() => setShowReplies((prev) => !prev)}
          >
            {showReplies ? "Hide replies" : `Show ${replyIds.length} replies`}
          </button>

          {showReplies && (
            <div className="comment-replies">
              {depth >= 5 ? (
                <p className="comments-end">Maximum thread depth reached.</p>
              ) : (
                replies.map((reply) => {
                  if (!reply) return null;

                  return (
                    <CommentCard
                      key={reply?.id}

                      comment={reply}

                      commentsById={commentsById}

                      replyIdsByParent={replyIdsByParent}

                      depth={depth + 1}
                    />
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {reportOpen && (
        <ReportModal
          commentId={comment.id}

          onClose={() => setReportOpen(false)}
        />
      )}

      {deleteOpen && (
        <DeleteConfirmModal
          commentId={comment.id}
          onClose={() => setDeleteOpen(false)}
        />
      )}
    </article>
  );
}
