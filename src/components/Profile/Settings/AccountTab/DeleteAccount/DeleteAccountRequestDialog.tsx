import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";

interface DeleteAccountRequestDialogProps {
  requesting: boolean;
  error: string | null;
  onSubmit: (password: string) => Promise<boolean>;
}

export default function DeleteAccountRequestDialog({
  requesting,
  error,
  onSubmit,
}: DeleteAccountRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [completed, setCompleted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!open) {
      setPassword("");
      setCompleted(false);
    }
  }, [open]);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!password || requesting) {
      return;
    }

    const success = await onSubmit(password);

    if (success) {
      setPassword("");
      setCompleted(true);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (requesting) {
      return;
    }

    setOpen(nextOpen);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="delete-account-card__button delete-account-card__button--danger"
        >
          Delete account
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="delete-account-modal__overlay" />

        <Dialog.Content
          className="delete-account-modal__dialog"
          aria-describedby="delete-account-request-description"
        >
          {!completed ? (
            <>
              <div className="delete-account-modal__header">
                <div className="delete-account-modal__icon delete-account-modal__icon--danger">
                  <TrashIcon />
                </div>

                <div>
                  <Dialog.Title className="delete-account-modal__title">
                    Delete your account?
                  </Dialog.Title>

                  <Dialog.Description
                    id="delete-account-request-description"
                    className="delete-account-modal__description"
                  >
                    This will start the account deletion process. Your account
                    will not be deleted immediately.
                  </Dialog.Description>
                </div>
              </div>

              <div className="delete-account-modal__warning">
                <div className="delete-account-modal__warning-icon">
                  <WarningIcon />
                </div>

                <div>
                  <h3 className="delete-account-modal__warning-title">
                    Please read before continuing
                  </h3>

                  <p className="delete-account-modal__warning-text">
                    You will have a 24-hour waiting period after starting the
                    deletion request. You must also verify your email before
                    permanent deletion becomes available.
                  </p>
                </div>
              </div>

              <form
                className="delete-account-modal__form"
                onSubmit={handleSubmit}
              >
                <div className="delete-account-modal__field">
                  <label
                    htmlFor="delete-account-password"
                    className="delete-account-modal__label"
                  >
                    Current password
                  </label>

                  <div className="delete-account-modal__password-wrapper">
                    <input
                      id="delete-account-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                      }}
                      className="delete-account-modal__input"
                      placeholder="Enter your current password"
                      autoComplete="current-password"
                      autoFocus
                      disabled={requesting}
                      required
                      spellCheck={false}
                      autoCapitalize="none"
                      autoCorrect="off"
                    />

                    <button
                      type="button"
                      className="delete-account-modal__password-toggle"
                      onClick={() => setShowPassword((current) => !current)}
                      disabled={requesting}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      tabIndex={0}
                    >
                      {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                  </div>
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
                      disabled={requesting}
                    >
                      Cancel
                    </button>
                  </Dialog.Close>

                  <button
                    type="submit"
                    className="delete-account-card__button delete-account-card__button--danger"
                    disabled={requesting || password.length === 0}
                  >
                    {requesting ? (
                      <>
                        <div className="loader-5" />
                        Verifying password…
                      </>
                    ) : (
                      "Start deletion request"
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="delete-account-modal__success">
                <div className="delete-account-modal__success-icon">
                  <CheckIcon />
                </div>

                <div>
                  <Dialog.Title className="delete-account-modal__title">
                    Deletion request created
                  </Dialog.Title>

                  <Dialog.Description className="delete-account-modal__description">
                    Your password was verified and your account deletion request
                    has been created.
                  </Dialog.Description>
                </div>
              </div>

              <div className="delete-account-modal__success-steps">
                <SuccessStep
                  icon={<CheckIcon />}
                  title="Password verified"
                  description="Your identity was confirmed successfully."
                />

                <SuccessStep
                  icon={<MailIcon />}
                  title="Verification email sent"
                  description="Check your account email and open the verification link."
                />

                <SuccessStep
                  icon={<ClockIcon />}
                  title="24-hour waiting period"
                  description="Permanent deletion will only become available after the required waiting period."
                />
              </div>

              <div className="delete-account-modal__info">
                <div className="delete-account-modal__info-icon">
                  <InfoIcon />
                </div>

                <div>
                  <h3 className="delete-account-modal__info-title">
                    Your account has NOT been deleted
                  </h3>

                  <p className="delete-account-modal__info-text">
                    Your account remains fully active. Verify your email first,
                    then wait for the 24-hour period to finish before you can
                    permanently delete your account.
                  </p>
                </div>
              </div>

              <div className="delete-account-modal__actions">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="delete-account-card__button delete-account-card__button--primary"
                  >
                    Got it
                  </button>
                </Dialog.Close>
              </div>
            </>
          )}

          <Dialog.Close asChild disabled={requesting}>
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

interface SuccessStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function SuccessStep({ icon, title, description }: SuccessStepProps) {
  return (
    <div className="delete-account-modal__success-step">
      <div className="delete-account-modal__success-step-icon">{icon}</div>

      <div>
        <h3 className="delete-account-modal__success-step-title">{title}</h3>

        <p className="delete-account-modal__success-step-description">
          {description}
        </p>
      </div>
    </div>
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

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="3.5" y="5" width="17" height="14" rx="2" />

      <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" />

      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" />

      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v5" />

      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h.01" />
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
