import { useState } from "react";
import {
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
  LockKeyIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

const MIN_PASSWORD_LENGTH = 8;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

export default function PasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const hasMinLength = newPassword.length >= MIN_PASSWORD_LENGTH;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);

  const passwordsMatch =
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  async function changePassword(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError(null);
    setMessage(null);

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber) {
      setError("Please meet all password requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "Your new password must be different from your current password.",
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      let data: { error?: string } = {};

      try {
        data = await res.json();
      } catch {
        // Ignore invalid/empty JSON responses.
      }

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to change password");
      }

      setMessage("Password changed successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="settings-card password-card">
      <div className="settings-card__header">
        <div className="password-card__title">
          <div className="password-card__icon" aria-hidden="true">
            <LockKeyIcon size={20} weight="duotone" />
          </div>

          <div>
            <h3>Change Password</h3>
            <p>Update your account password securely.</p>
          </div>
        </div>

        <span className="settings-badge">Security</span>
      </div>

      <form
        className="password-card__form"
        onSubmit={changePassword}
        noValidate
      >
        <div className="password-card__field">
          <label htmlFor="current-password">Current password</label>

          <div className="password-card__input-wrapper">
            <input
              id="current-password"
              name="currentPassword"
              type={showCurrent ? "text" : "password"}
              className="password-card__input"
              placeholder="Enter your current password"
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value);
                setError(null);
                setMessage(null);
              }}
              autoComplete="current-password"
              disabled={loading}
            />

            <button
              type="button"
              className="password-card__toggle"
              onClick={() => setShowCurrent((visible) => !visible)}
              aria-label={
                showCurrent ? "Hide current password" : "Show current password"
              }
              disabled={loading}
            >
              {showCurrent ? (
                <EyeSlashIcon size={19} aria-hidden="true" />
              ) : (
                <EyeIcon size={19} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div className="password-card__field">
          <label htmlFor="new-password">New password</label>

          <div className="password-card__input-wrapper">
            <input
              id="new-password"
              name="newPassword"
              type={showNew ? "text" : "password"}
              className="password-card__input"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                setError(null);
                setMessage(null);
              }}
              autoComplete="new-password"
              disabled={loading}
            />

            <button
              type="button"
              className="password-card__toggle"
              onClick={() => setShowNew((visible) => !visible)}
              aria-label={showNew ? "Hide new password" : "Show new password"}
              disabled={loading}
            >
              {showNew ? (
                <EyeSlashIcon size={19} aria-hidden="true" />
              ) : (
                <EyeIcon size={19} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div className="password-card__field">
          <label htmlFor="confirm-password">Confirm new password</label>

          <div className="password-card__input-wrapper">
            <input
              id="confirm-password"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              className="password-card__input"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setError(null);
                setMessage(null);
              }}
              autoComplete="new-password"
              disabled={loading}
            />

            <button
              type="button"
              className="password-card__toggle"
              onClick={() => setShowConfirm((visible) => !visible)}
              aria-label={
                showConfirm
                  ? "Hide password confirmation"
                  : "Show password confirmation"
              }
              disabled={loading}
            >
              {showConfirm ? (
                <EyeSlashIcon size={19} aria-hidden="true" />
              ) : (
                <EyeIcon size={19} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div className="password-card__requirements">
          <p className="password-card__requirements-title">
            Password must contain:
          </p>

          <div className="password-card__requirements-list">
            <span
              className={`password-card__requirement ${
                hasMinLength ? "password-card__requirement--valid" : ""
              }`}
            >
              <CheckIcon size={15} weight="bold" aria-hidden="true" />
              8+ characters
            </span>

            <span
              className={`password-card__requirement ${
                hasUppercase ? "password-card__requirement--valid" : ""
              }`}
            >
              <CheckIcon size={15} weight="bold" aria-hidden="true" />
              Uppercase letter
            </span>

            <span
              className={`password-card__requirement ${
                hasLowercase ? "password-card__requirement--valid" : ""
              }`}
            >
              <CheckIcon size={15} weight="bold" aria-hidden="true" />
              Lowercase letter
            </span>

            <span
              className={`password-card__requirement ${
                hasNumber ? "password-card__requirement--valid" : ""
              }`}
            >
              <CheckIcon size={15} weight="bold" aria-hidden="true" />
              Number
            </span>
          </div>
        </div>

        {confirmPassword && (
          <div
            className={`password-card__match ${
              passwordsMatch
                ? "password-card__match--valid"
                : "password-card__match--invalid"
            }`}
          >
            {passwordsMatch ? (
              <CheckIcon size={17} weight="bold" aria-hidden="true" />
            ) : (
              <WarningCircleIcon size={17} weight="fill" aria-hidden="true" />
            )}

            <span>
              {passwordsMatch ? "Passwords match" : "Passwords do not match"}
            </span>
          </div>
        )}

        {error && (
          <div
            className="password-card__message password-card__message--error"
            role="alert"
          >
            <WarningCircleIcon size={18} weight="fill" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div
            className="password-card__message password-card__message--success"
            role="status"
          >
            <CheckIcon size={18} weight="bold" aria-hidden="true" />
            <span>{message}</span>
          </div>
        )}

        <div className="password-card__actions">
          <button
            type="submit"
            className="settings-save"
            disabled={
              loading ||
              !currentPassword ||
              !hasMinLength ||
              !hasUppercase ||
              !hasLowercase ||
              !hasNumber ||
              !passwordsMatch
            }
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </div>
      </form>
    </section>
  );
}
