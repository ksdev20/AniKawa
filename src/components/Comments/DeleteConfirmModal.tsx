import { useState } from "react";

import { useCommentsStore } from "@/lib/comments/commentsStore";
import { toast } from "sonner";

interface Props {
  commentId: string;

  onClose: () => void;
}

export default function DeleteConfirmModal({ commentId, onClose }: Props) {
  const deleteComment = useCommentsStore((state) => state.deleteComment);

  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    try {
      setLoading(true);

      await deleteComment(commentId);
      toast.success("Comment deleted successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete comment.";

      toast.error(message);
    } finally {
      setLoading(false);
      onClose();
    }
  }

  return (
    <div className="comment-modal-overlay">
      <div
        className="comment-delete-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-title"
      >
        <div className="comment-delete-icon">🗑️</div>

        <h2 id="delete-title">Delete comment?</h2>

        <p>
          This action cannot be undone. Your comment will be permanently
          removed.
        </p>

        <div className="comment-delete-actions">
          <button
            className="comment-delete-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="comment-delete-confirm"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
