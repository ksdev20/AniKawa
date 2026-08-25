import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

import { completeAccountDeletion } from "@/lib/account/deletion/api";

interface DeleteAccountFinalDialogProps {
  onCompleted: () => Promise<void>;
}

const CONFIRMATION_TEXT = "DELETE";

export default function DeleteAccountFinalDialog({
  onCompleted,
}: DeleteAccountFinalDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setConfirmation("");
      setCompleting(false);
      setError(null);
    }
  }, [open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (completing) {
      return;
    }

    setOpen(nextOpen);
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (confirmation !== CONFIRMATION_TEXT || completing) {
      return;
    }

    setCompleting(true);
    setError(null);

    try {
      await completeAccountDeletion();

      await onCompleted();

      setOpen(false);

      /*
       * The account will normally be signed out/deleted by the
       * backend flow. Keep this component responsible only for
       * the deletion request itself.
       */
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to permanently delete your account.";

      setError(message);
      setCompleting(false);
    }
  };

  const canSubmit = confirmation === CONFIRMATION_TEXT && !completing;

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="delete-account-card__button delete-account-card__button--danger"
        >
          Permanently delete account
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="delete-account-modal__overlay" />

        <Dialog.Content
          className="delete-account-modal__dialog delete-account-modal__dialog--final"
          aria-describedby="delete-account-final-description"
        >
          <div className="delete-account-modal__header">
            <div className="delete-account-modal__icon delete-account-modal__icon--danger">
              <TrashIcon />
            </div>

            <div>
              <Dialog.Title className="delete-account-modal__title">
                Permanently delete your account?
              </Dialog.Title>

              <Dialog.Description
                id="delete-account-final-description"
                className="delete-account-modal__description"
              >
                This is the final step. Once completed, your account cannot be
                recovered.
              </Dialog.Description>
            </div>
          </div>

          <div className="delete-account-modal__danger-box">
            <div className="delete-account-modal__danger-box-icon">
              <WarningIcon />
            </div>

            <div>
              <h3 className="delete-account-modal__danger-box-title">
                This action cannot be undone
              </h3>

              <p className="delete-account-modal__danger-box-text">
                Your profile, account settings, anime lists, favorites, activity
                data, and other personal data will be permanently removed.
              </p>

              <p className="delete-account-modal__danger-box-text">
                Your existing comments will remain so that conversations are not
                broken, but they will be anonymized and shown under{" "}
                <strong>[deleted]</strong>.
              </p>
            </div>
          </div>

          <div className="delete-account-modal__requirements">
            <div className="delete-account-modal__requirement">
              <div className="delete-account-modal__requirement-icon">
                <CheckIcon />
              </div>

              <span>Password verification completed</span>
            </div>

            <div className="delete-account-modal__requirement">
              <div className="delete-account-modal__requirement-icon">
                <CheckIcon />
              </div>

              <span>Email verification completed</span>
            </div>

            <div className="delete-account-modal__requirement">
              <div className="delete-account-modal__requirement-icon">
                <CheckIcon />
              </div>

              <span>24-hour waiting period completed</span>
            </div>
          </div>

          <form className="delete-account-modal__form" onSubmit={handleSubmit}>
            <div className="delete-account-modal__field">
              <label
                htmlFor="delete-account-confirmation"
                className="delete-account-modal__label"
              >
                Type <strong>{CONFIRMATION_TEXT}</strong> to confirm
              </label>

              <input
                id="delete-account-confirmation"
                name="confirmation"
                type="text"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                className="delete-account-modal__input"
                placeholder="DELETE"
                autoComplete="off"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                autoFocus
                disabled={completing}
                required
              />
            </div>

            {error && (
              <p className="delete-account-modal__error" role="alert">
                {error}
              </p>
            )}

            <div className="delete-account-modal__actions">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="delete-account-card__button delete-account-card__button--secondary"
                  disabled={completing}
                >
                  Keep my account
                </button>
              </Dialog.Close>

              <button
                type="submit"
                className="delete-account-card__button delete-account-card__button--danger"
                disabled={!canSubmit}
              >
                {completing
                  ? "Deleting account…"
                  : "Permanently delete account"}
              </button>
            </div>
          </form>

          <Dialog.Close asChild disabled={completing}>
            <button
              type="button"
              className="delete-account-modal__close"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7h16M9 7V4h6v3m-9 0 1 13h8l1-13M10 11v5m4-5v5"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.5 21 20H3L12 3.5Z"
      />

      <path strokeLinecap="round" d="M12 9v5" />

      <path strokeLinecap="round" d="M12 17.5h.01" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}
