import { useRef, useState, useEffect } from "react";

import type { Comment } from "@/types/comments";

import { useCommentsStore } from "@/lib/comments/commentsStore";
import { toast } from "sonner";

interface Props {
  comment: Comment;

  onCancel: () => void;

  onSuccess: () => void;
}

export default function EditCommentForm({
  comment,
  onCancel,
  onSuccess,
}: Props) {
  const editComment = useCommentsStore((state) => state.editComment);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [content, setContent] = useState(comment.content);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    textareaRef.current?.focus();

    textareaRef.current?.setSelectionRange(
      comment.content.length,
      comment.content.length,
    );
  }, [comment.content]);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = content.trim();

    if (!trimmed) {
      setError("Comment cannot be empty.");
      return;
    }

    if (trimmed === comment.content) {
      onCancel();
      return;
    }

    try {
      setLoading(true);

      await editComment({
        commentId: comment.id,
        content: trimmed,
      });

      toast.success("Comment updated.");

      onSuccess();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to edit comment.";

      switch (message) {
        case "Editing time has expired":
          toast.error(
            "Comments can only be edited within 10 hours of posting.",
          );
          break;

        case "Comment cannot be edited":
          toast.error("You don't have permission to edit this comment.");
          break;

        case "Comment is locked":
          toast.error("This comment has been locked by a moderator.");
          break;

        default:
          toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="reply-form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e);
      }}
    >
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        disabled={loading}
        rows={4}
        maxLength={2000}
      />

      {error && (
        <p className="reply-error" role="alert">
          {error}
        </p>
      )}

      <div className="reply-buttons">
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>

        <button type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
}
