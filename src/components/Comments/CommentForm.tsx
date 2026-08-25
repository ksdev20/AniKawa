import { useRef, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

import { useCommentsStore } from "@/lib/comments/commentsStore";

interface Props {
  episodeId: string;
}

const MAX_LENGTH = 5000;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function CommentForm({ episodeId }: Props) {
  const { isAuthenticated } = useAuth();

  const createComment = useCommentsStore((state) => state.createComment);

  const turnstileToken = useCommentsStore((state) => state.turnstileToken);

  const clearTurnstileToken = useCommentsStore(
    (state) => state.clearTurnstileToken,
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [commentText, setCommentText] = useState("");

  const [guestName, setGuestName] = useState("");

  const [guestEmail, setGuestEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function submitComment() {
    if (loading) return;

    const content = commentText.trim();

    const trimmedGuestName = guestName.trim();
    const trimmedGuestEmail = guestEmail.trim();

    if (!content) {
      setError("Write something before posting.");

      textareaRef.current?.focus();

      return;
    }

    if (content.length < 2) {
      setError("Comment must contain at least 2 characters.");

      return;
    }

    if (content.length > MAX_LENGTH) {
      setError(`Comment cannot exceed ${MAX_LENGTH} characters.`);

      return;
    }

    if (!isAuthenticated) {
      if (!trimmedGuestName) {
        setError("Please enter your name.");

        return;
      }

      if (trimmedGuestEmail && !isValidEmail(trimmedGuestEmail)) {
        setError("Please enter a valid email.");

        return;
      }

      if (!turnstileToken) {
        setError("Please complete verification.");

        return;
      }
    }

    setLoading(true);

    setError("");

    try {
      await createComment({
        episodeId,

        parentId: null,

        content,

        ...(isAuthenticated
          ? {}
          : {
              guestName: trimmedGuestName,

              guestEmail: trimmedGuestEmail,

              turnstileToken,
            }),
      });

      setCommentText("");

      textareaRef.current?.focus();

      setGuestName("");

      setGuestEmail("");
    } catch (err) {
      console.error("[CommentForm]", err);

      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
      clearTurnstileToken();
      (window as any).turnstile?.reset();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      submitComment();
    }
  }

  return (
    <form
      className="comment-form"
      onSubmit={(e) => {
        e.preventDefault();
        submitComment();
      }}
    >
      {error && (
        <div className="reply-error" role="alert">
          {error}
        </div>
      )}

      {!isAuthenticated && (
        <>
          <input
            type="text"
            value={guestName}
            onChange={(e) => {
              setGuestName(e.target.value);
              setError("");
            }}
            placeholder="Your name"
            disabled={loading}
            maxLength={80}
          />

          <input
            type="email"
            value={guestEmail}
            onChange={(e) => {
              setGuestEmail(e.target.value);
              setError("");
            }}
            placeholder="Email (optional)"
            disabled={loading}
            maxLength={120}
          />
        </>
      )}

      <textarea
        ref={textareaRef}
        value={commentText}
        onChange={(e) => {
          setCommentText(e.target.value);
          setError("");
        }}
        onKeyDown={handleKeyDown}
        placeholder="Write your thoughts about this episode..."
        disabled={loading}
        maxLength={MAX_LENGTH}
      />

      <div className="comment-form-meta">
        <span
          className={
            commentText.length > MAX_LENGTH * 0.9
              ? "comment-form-count is-limit"
              : "comment-form-count"
          }
        >
          {commentText.length}/{MAX_LENGTH}
        </span>

        <span>Ctrl + Enter to post</span>
      </div>

      <button type="submit" disabled={loading || !commentText.trim()}>
        {loading ? "Posting..." : "Post Comment"}
      </button>
    </form>
  );
}
