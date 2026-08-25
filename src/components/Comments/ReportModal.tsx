"use client";

import { useEffect, useRef, useState } from "react";

import { useCommentsStore } from "@/lib/comments/commentsStore";

interface Props {
  commentId: string;

  onClose: () => void;
}

const REPORT_REASONS = [
  "Spam",
  "Spoiler",
  "Harassment",
  "Hate speech",
  "Off-topic",
  "Other",
] as const;

export default function ReportModal({ commentId, onClose }: Props) {
  const reportComment = useCommentsStore((state) => state.reportComment);

  const [reason, setReason] = useState("");

  const [details, setDetails] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  const firstRadioRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstRadioRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [loading, onClose]);

  async function submitReport() {
    if (loading) return;

    if (!reason) {
      setError("Please select a reason.");

      return;
    }

    setLoading(true);

    setError("");

    try {
      await reportComment({
        commentId,

        reason:
          details.trim().length > 0 ? `${reason}: ${details.trim()}` : reason,
      });

      setSuccess(true);

      window.setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error("[ReportModal]", err);

      setError(err instanceof Error ? err.message : "Failed to submit report.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="report-overlay"
      onClick={(e) => {
        if (!loading && e.currentTarget === e.target) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="report-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        tabIndex={-1}
      >
        <button
          className="report-close"
          type="button"
          onClick={onClose}
          disabled={loading}
        >
          ✕
        </button>

        <h2 id="report-modal-title">Report Comment</h2>

        {success ? (
          <p>Thanks. Report submitted.</p>
        ) : (
          <>
            <div className="report-options">
              {REPORT_REASONS.map((item, index) => (
                <label key={item}>
                  <input
                    ref={index === 0 ? firstRadioRef : undefined}
                    type="radio"
                    name="reason"
                    value={item}
                    checked={reason === item}
                    disabled={loading}
                    onChange={() => {
                      setReason(item);

                      setError("");
                    }}
                  />

                  {item}
                </label>
              ))}
            </div>

            <textarea
              placeholder="Additional details (optional)"
              value={details}
              onChange={(e) => {
                setDetails(e.target.value);

                setError("");
              }}
              disabled={loading}
              maxLength={500}
            />

            {error && <p className="report-error">{error}</p>}

            <button type="button" onClick={submitReport} disabled={loading}>
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
