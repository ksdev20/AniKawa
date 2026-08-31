import { useRef, useState } from "react";
import { capturePageScreenshot } from "@/lib/feedback/capturePageScreenshot";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

import "@/styles/pages/episode/EpisodeFeedback.css";
import { getGuestId } from "@/utils/getGuestId";
import {
  getYouTubeDiagnostics,
} from "@/lib/feedback/youtubeDiagnostics";

interface EpisodeFeedbackProps {
  animeId: string;
  episodeNanoid: string;
}

const REPORT_OPTIONS = [
  {
    value: "video_not_playing",
    label: "Video won't play",
    description: "The video doesn't start or play properly.",
  },
  {
    value: "video_unavailable",
    label: "Video is unavailable",
    description: "The video is private, removed, or unavailable.",
  },
  {
    value: "wrong_episode",
    label: "Wrong episode or video",
    description: "This isn't the episode or video it should be.",
  },
  {
    value: "wrong_anime",
    label: "Wrong anime",
    description: "This episode appears to belong to another anime.",
  },
  {
    value: "video_quality",
    label: "Poor video quality",
    description: "The video quality is too low or looks broken.",
  },
  {
    value: "video_audio",
    label: "Audio problem",
    description: "Audio is missing, incorrect, delayed, or out of sync.",
  },
  {
    value: "subtitle_issue",
    label: "Subtitle problem",
    description: "Subtitles are missing, incorrect, or out of sync.",
  },
  {
    value: "buffering",
    label: "Video keeps buffering",
    description: "The video frequently stops or takes too long to load.",
  },
  {
    value: "episode_information",
    label: "Incorrect episode information",
    description: "The title, episode number, or other information is wrong.",
  },
  {
    value: "page_improvement",
    label: "This page could be improved",
    description: "Suggest something that would make this page better.",
  },
  {
    value: "feature_request",
    label: "Suggest a feature",
    description: "Tell us something you'd like Anikawa to add.",
  },
  {
    value: "design_feedback",
    label: "Design or usability feedback",
    description: "Something could look better or be easier to use.",
  },
  {
    value: "bug",
    label: "Something isn't working",
    description: "You found a bug or another issue on this page.",
  },
  {
    value: "other",
    label: "Something else",
    description: "Tell us anything else you'd like us to know.",
  },
] as const;

type ReportType = (typeof REPORT_OPTIONS)[number]["value"];

export default function EpisodeFeedback({
  animeId,
  episodeNanoid,
}: EpisodeFeedbackProps) {
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [selectedReportType, setSelectedReportType] =
    useState<ReportType | null>(null);

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const screenshotRef = useRef<Blob | null>(null);

  const resetFeedbackForm = () => {
    setSelectedReportType(null);
    setMessage("");
    setSubmissionError(null);
    setIsSubmitting(false);
  };

  const openFeedbackModal = async () => {
    if (isCapturingScreenshot) {
      return;
    }

    resetFeedbackForm();
    setIsSubmitted(false);

    setIsCapturingScreenshot(true);

    try {
      screenshotRef.current = await capturePageScreenshot();
    } finally {
      setIsCapturingScreenshot(false);
      setIsModalOpen(true);
    }
  };

  const closeFeedbackModal = () => {
    if (isSubmitting) {
      return;
    }

    screenshotRef.current = null;

    setIsModalOpen(false);

    window.setTimeout(() => {
      resetFeedbackForm();
      setIsSubmitted(false);
    }, 200);
  };

  const uploadFeedbackScreenshot = async (
    feedbackId: string,
    guestId: string | null,
  ) => {
    if (!screenshotRef.current) {
      return;
    }

    const formData = new FormData();

    formData.append("feedbackId", feedbackId);

    if (guestId) {
      formData.append("guestId", guestId);
    }

    formData.append(
      "screenshot",
      new File([screenshotRef.current], "feedback.webp", {
        type: "image/webp",
      }),
    );

    const response = await fetch("/api/feedback/screenshot", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);

      throw new Error(data?.error ?? "Failed to upload feedback screenshot.");
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedReportType || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const guestId = user ? null : getGuestId();

      const youtubeDiagnostics = getYouTubeDiagnostics();

      const { data: feedbackId, error } = await supabase.rpc(
        "submit_episode_feedback",
        {
          p_anime_id: animeId,
          p_episode_nanoid: episodeNanoid,
          p_report_type: selectedReportType,
          p_message: message.trim() ?? undefined,
          p_guest_id: guestId ?? undefined,
          p_page_url: window.location.href,
          p_user_agent: navigator.userAgent,
          p_youtube_diagnostics: youtubeDiagnostics,
        },
      );

      if (error) {
        throw error;
      }

      if (!feedbackId) {
        throw new Error("Feedback was created without an ID.");
      }

      if (screenshotRef.current) {
        try {
          await uploadFeedbackScreenshot(feedbackId, guestId);
        } catch (screenshotError) {
          console.error(
            "Failed to upload feedback screenshot:",
            screenshotError,
          );
        }
      }

      screenshotRef.current = null;

      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit episode feedback:", error);

      setSubmissionError("We couldn't send your feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="episode-feedback">
        <div className="episode-feedback__prompt">
          <span className="episode-feedback__prompt-text">
            Found an issue or have an idea?
          </span>

          <button
            type="button"
            className="episode-feedback__trigger"
            onClick={openFeedbackModal}
            disabled={isCapturingScreenshot}
          >
            {isCapturingScreenshot ? "Preparing feedback..." : "Give feedback"}
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="episode-feedback-modal"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeFeedbackModal();
            }
          }}
        >
          <div
            className="episode-feedback-modal__content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="episode-feedback-title"
          >
            {!isSubmitted ? (
              <>
                <header className="episode-feedback-modal__header">
                  <div className="episode-feedback-modal__heading">
                    <h2
                      id="episode-feedback-title"
                      className="episode-feedback-modal__title"
                    >
                      Help us improve
                    </h2>

                    <p className="episode-feedback-modal__description">
                      Found a problem or have an idea? We'd love to hear it.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="episode-feedback-modal__close"
                    onClick={closeFeedbackModal}
                    disabled={isSubmitting}
                    aria-label="Close feedback"
                  >
                    ×
                  </button>
                </header>

                <div className="episode-feedback-form">
                  <div className="episode-feedback-form__section">
                    <h3 className="episode-feedback-form__label">
                      What's on your mind?
                    </h3>

                    <div className="episode-feedback-options">
                      {REPORT_OPTIONS.map((option) => {
                        const isSelected = selectedReportType === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            className={`episode-feedback-option ${
                              isSelected
                                ? "episode-feedback-option--selected"
                                : ""
                            }`}
                            onClick={() => setSelectedReportType(option.value)}
                          >
                            <span className="episode-feedback-option__label">
                              {option.label}
                            </span>

                            <span className="episode-feedback-option__description">
                              {option.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="episode-feedback-form__section">
                    <div className="episode-feedback-form__message-header">
                      <label
                        htmlFor="episode-feedback-message"
                        className="episode-feedback-form__label"
                      >
                        Additional details
                      </label>

                      <span className="episode-feedback-form__optional">
                        Optional
                      </span>
                    </div>

                    <textarea
                      id="episode-feedback-message"
                      className="episode-feedback-form__textarea"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Tell us anything else that could help..."
                      maxLength={1000}
                      rows={4}
                    />

                    <div className="episode-feedback-form__character-count">
                      {message.length}/1000
                    </div>
                  </div>

                  {submissionError && (
                    <p className="episode-feedback-form__error" role="alert">
                      {submissionError}
                    </p>
                  )}
                </div>

                <footer className="episode-feedback-modal__footer">
                  <button
                    type="button"
                    className="episode-feedback-modal__cancel"
                    onClick={closeFeedbackModal}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="episode-feedback-modal__submit"
                    onClick={handleFeedbackSubmit}
                    disabled={!selectedReportType || isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send feedback"}
                  </button>
                </footer>
              </>
            ) : (
              <div className="episode-feedback-success">
                <div
                  className="episode-feedback-success__icon"
                  aria-hidden="true"
                >
                  ✓
                </div>

                <h2 className="episode-feedback-success__title">
                  Thanks for the feedback!
                </h2>

                <p className="episode-feedback-success__description">
                  Your feedback has been sent successfully. Every report helps
                  us make Anikawa better.
                </p>

                <button
                  type="button"
                  className="episode-feedback-success__button"
                  onClick={closeFeedbackModal}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
