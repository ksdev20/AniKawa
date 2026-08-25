import { useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { XIcon, FlagIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

import { reportProfile } from "@/lib/profile/profileActions";

import "@/styles/components/Profile/report-profile-modal.css";

type ReportReason =
  "spam" | "harassment" | "inappropriate_content" | "impersonation" | "other";

interface ReportProfileModalProps {
  username: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REPORT_REASONS: {
  value: ReportReason;
  label: string;
}[] = [
  {
    value: "spam",
    label: "Spam",
  },
  {
    value: "harassment",
    label: "Harassment",
  },
  {
    value: "inappropriate_content",
    label: "Inappropriate content",
  },
  {
    value: "impersonation",
    label: "Impersonation",
  },
  {
    value: "other",
    label: "Other",
  },
];

export default function ReportProfileModal({
  username,
  open,
  onOpenChange,
}: ReportProfileModalProps) {
  const [reason, setReason] = useState<ReportReason>("spam");

  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;

    onOpenChange(nextOpen);

    if (!nextOpen) {
      setReason("spam");
      setDescription("");
    }
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await reportProfile(username, reason, description.trim() || null);

      toast.success(`Thanks. Your report of @${username} has been submitted.`);

      onOpenChange(false);
      setReason("spam");
      setDescription("");
    } catch (error) {
      console.error("[ReportProfileModal] Report failed:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to submit report.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="report-modal__overlay" />

        <Dialog.Content
          className="report-modal__content"
          aria-describedby="report-profile-description"
        >
          <div className="report-modal__header">
            <div className="report-modal__title-wrapper">
              <div className="report-modal__icon">
                <FlagIcon size={20} weight="bold" />
              </div>

              <div>
                <Dialog.Title className="report-modal__title">
                  Report profile
                </Dialog.Title>

                <Dialog.Description
                  id="report-profile-description"
                  className="report-modal__description"
                >
                  Report @{username} to the Anikawa team.
                </Dialog.Description>
              </div>
            </div>

            <Dialog.Close asChild disabled={isSubmitting}>
              <button
                type="button"
                className="report-modal__close"
                aria-label="Close report dialog"
              >
                <XIcon size={20} weight="bold" />
              </button>
            </Dialog.Close>
          </div>

          <form className="report-modal__form" onSubmit={handleSubmit}>
            <div className="report-modal__field">
              <label htmlFor="report-reason" className="report-modal__label">
                Reason
              </label>

              <select
                id="report-reason"
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value as ReportReason)
                }
                disabled={isSubmitting}
                className="report-modal__select"
              >
                {REPORT_REASONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="report-modal__field">
              <label
                htmlFor="report-description"
                className="report-modal__label"
              >
                Additional details
                <span className="report-modal__optional">Optional</span>
              </label>

              <textarea
                id="report-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={isSubmitting}
                maxLength={1000}
                rows={4}
                placeholder="Tell us what happened..."
                className="report-modal__textarea"
              />

              <div className="report-modal__counter">
                {description.length}/1000
              </div>
            </div>

            <div className="report-modal__actions">
              <Dialog.Close asChild disabled={isSubmitting}>
                <button
                  type="button"
                  className="report-modal__button report-modal__button--secondary"
                >
                  Cancel
                </button>
              </Dialog.Close>

              <button
                type="submit"
                disabled={isSubmitting}
                className="report-modal__button report-modal__button--primary"
              >
                {isSubmitting ? "Submitting..." : "Submit report"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
