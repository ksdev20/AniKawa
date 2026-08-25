import { useRef, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

import { useCommentsStore } from "@/lib/comments/commentsStore";

import { getGuestId } from "@/utils/getGuestId";

interface Props {
  episodeId: string;

  parentId: string;

  onCancel: () => void;

  onSuccess?: () => void;
}

const MAX_LENGTH = 5000;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function ReplyForm({
  episodeId,
  parentId,
  onCancel,
  onSuccess,
}: Props) {
  const { isAuthenticated } = useAuth();

  const createComment = useCommentsStore((state) => state.createComment);

  const turnstileToken = useCommentsStore((state) => state.turnstileToken);

  const clearTurnstileToken = useCommentsStore(
    (state) => state.clearTurnstileToken,
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [replyText, setReplyText] = useState("");

  const [guestName, setGuestName] = useState("");

  const [guestEmail, setGuestEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function submitReply() {
    if (loading) return;

    const content = replyText.trim();

    if (!content) {
      setError("Write a reply before posting.");

      textareaRef.current?.focus();

      return;
    }

    if (content.length < 2) {
      setError("Reply must contain at least 2 characters.");

      return;
    }

    if (content.length > MAX_LENGTH) {
      setError(`Reply cannot exceed ${MAX_LENGTH} characters.`);

      return;
    }

    if (!isAuthenticated) {
      if (!guestName.trim()) {
        setError("Please enter your name.");

        return;
      }

      if (guestEmail.trim() && !isValidEmail(guestEmail)) {
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
      const guestId = !isAuthenticated ? getGuestId() : undefined;

      await createComment({
        episodeId,

        parentId,

        content,

        ...(isAuthenticated
          ? {}
          : {
              guestId,

              guestName: guestName.trim(),

              guestEmail: guestEmail.trim(),

              turnstileToken,
            }),
      });

      setReplyText("");

      setGuestName("");

      setGuestEmail("");

      onSuccess?.();

      (window as any).turnstile?.reset();
    } catch (err) {
      console.error("[ReplyForm]", err);

      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);

      clearTurnstileToken();

      (window as any).turnstile?.reset();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      submitReply();
    }
  }

  return (
    <form
      className="reply-form"
      onSubmit={(e) => {
        e.preventDefault();
        submitReply();
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
        value={replyText}
        onChange={(e) => {
          setReplyText(e.target.value);

          setError("");
        }}
        onKeyDown={handleKeyDown}
        placeholder="Write a reply..."
        disabled={loading}
        maxLength={MAX_LENGTH}
      />

      <div className="comment-form-meta">
        <span>
          {replyText.length}/{MAX_LENGTH}
        </span>

        <span>Ctrl + Enter to reply</span>
      </div>

      <div className="reply-buttons">
        <button type="submit" disabled={loading || !replyText.trim()}>
          {loading ? "Posting..." : "Reply"}
        </button>

        <button type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
}
