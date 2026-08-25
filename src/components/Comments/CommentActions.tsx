import { Icon } from "@/icons/icons";

import { useCommentsStore } from "@/lib/comments/commentsStore";

import type { Comment } from "@/types/comments";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getGuestId } from "@/utils/getGuestId";

interface Props {
  comment: Comment;

  onReply: () => void;

  onEdit: () => void;

  onDelete: () => void;

  onReport: () => void;
}

export default function CommentActions({
  comment,

  onReply,

  onEdit,

  onDelete,

  onReport,
}: Props) {
  const { user } = useAuth();
  const isDeleted = comment.status === "deleted";
  const guestId = getGuestId();
  const voteComment = useCommentsStore((state) => state.voteComment);
  const votingCommentIds = useCommentsStore((state) => state.votingCommentIds);
  const openMenuCommentId = useCommentsStore(
    (state) => state.openMenuCommentId,
  );
  const setOpenMenuCommentId = useCommentsStore(
    (state) => state.setOpenMenuCommentId,
  );
  const loadingVote = votingCommentIds.has(comment.id);
  const showOptions = openMenuCommentId === comment.id;
  const isMenuOpen = openMenuCommentId === comment.id;
  function getUserStatus() {
    switch (true) {
      case user !== null:
        return user.id === comment.user_id;
      case guestId !== null:
        return guestId === comment.guest_id;
      default:
        return false;
    }
  }
  const canReply = !isDeleted;
  const isSameUser = getUserStatus();

  async function vote(vote: 1 | -1 | 0) {
    try {
      await voteComment({
        commentId: comment.id,

        vote,
      });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (isDeleted) {
    return (
      <div className="comment-actions">
        <button
          className={`comment-action-btn ${comment.my_vote === 1 ? "active" : ""}`}
          disabled={true}
          aria-label="Like comment"
        >
          <Icon
            name={
              comment.my_vote === 1 ? "thumbs-up-filled" : "thumbs-up-outlined"
            }
            size={20}
          />

          <span>{comment.likes_count}</span>
        </button>

        <button
          className={`comment-action-btn ${
            comment.my_vote === -1 ? "active" : ""
          }`}
          disabled={true}
          aria-label="Dislike comment"
        >
          <Icon
            name={
              comment.my_vote === -1
                ? "thumbs-down-filled"
                : "thumbs-down-outlined"
            }
            size={20}
          />

          <span>{comment.dislikes_count}</span>
        </button>

        {canReply && (
          <button className="comment-action-btn" disabled={true}>
            Reply
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="comment-actions">
      <button
        className={`comment-action-btn ${comment.my_vote === 1 ? "active" : ""}`}
        disabled={loadingVote || isDeleted}
        onClick={() => vote(comment.my_vote === 1 ? 0 : 1)}
        aria-label="Like comment"
      >
        <Icon
          name={
            comment.my_vote === 1 ? "thumbs-up-filled" : "thumbs-up-outlined"
          }
          size={20}
        />

        <span>{comment.likes_count}</span>
      </button>

      <button
        className={`comment-action-btn ${
          comment.my_vote === -1 ? "active" : ""
        }`}
        disabled={loadingVote || isDeleted}
        onClick={() => vote(comment.my_vote === -1 ? 0 : -1)}
        aria-label="Dislike comment"
      >
        <Icon
          name={
            comment.my_vote === -1
              ? "thumbs-down-filled"
              : "thumbs-down-outlined"
          }
          size={20}
        />

        <span>{comment.dislikes_count}</span>
      </button>

      {canReply && (
        <button
          className="comment-action-btn"
          onClick={onReply}
          disabled={comment.is_locked || isDeleted}
        >
          Reply
        </button>
      )}

      <div className="comment-overflow">
        <button
          className="comment-overflow-trigger"
          onClick={() => setOpenMenuCommentId(isMenuOpen ? null : comment.id)}
          aria-label="More actions"
          aria-expanded={showOptions}
        >
          <Icon name="more-vert" color="#ffffff" size={20} />
        </button>

        {showOptions && (
          <div className="comment-overflow-menu">
            {isSameUser && (
              <button
                className="comment-overflow-item"
                onClick={() => {
                  setOpenMenuCommentId(null);
                  onEdit();
                }}
              >
                <Icon
                  name="edit"
                  className={"comment-overflow-icon"}
                  size={15}
                />
                Edit
              </button>
            )}

            {isSameUser && (
              <button
                className="comment-overflow-item comment-overflow-item-delete"
                onClick={() => {
                  setOpenMenuCommentId(null);

                  onDelete();
                }}
              >
                <Icon
                  name="delete"
                  className={"comment-overflow-icon"}
                  size={15}
                />
                Delete
              </button>
            )}

            {!isDeleted && !isSameUser && (
              <button
                className="comment-overflow-item"
                onClick={() => {
                  setOpenMenuCommentId(null);

                  onReport();
                }}
              >
                <Icon
                  name="report"
                  className={"comment-overflow-icon"}
                  size={15}
                />
                Report
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
