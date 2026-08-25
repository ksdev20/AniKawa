import { useEffect, useMemo, useState } from "react";

import DeleteAccountFinalDialog from "./DeleteAccountFinalDialog";
import DeleteAccountStatus from "./DeleteAccountStatus";

import type { AccountDeletionStatus } from "@/lib/account/deletion/types";

interface DeleteAccountPendingProps {
  status: AccountDeletionStatus;
  cancelling: boolean;
  cancelError: string | null;
  onCancel: () => Promise<boolean>;
  onRefresh: () => Promise<void>;
}

export default function DeleteAccountPending({
  status,
  cancelling,
  cancelError,
  onCancel,
  onRefresh,
}: DeleteAccountPendingProps) {
  const [remainingMs, setRemainingMs] = useState(status.remainingMs);

  /*
   * Keep the countdown completely local between server refreshes.
   *
   * deleteAfter is the source of truth.
   */
  useEffect(() => {
    if (!status.deleteAfter) {
      setRemainingMs(0);
      return;
    }

    const calculateRemaining = () => {
      const deleteAfter = new Date(status.deleteAfter!).getTime();

      return Math.max(0, deleteAfter - Date.now());
    };

    setRemainingMs(calculateRemaining());

    const interval = window.setInterval(() => {
      setRemainingMs(calculateRemaining());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [status.deleteAfter]);

  /*
   * The server decides whether final deletion is allowed.
   *
   * The local countdown only controls when we ask the server
   * for the latest state.
   */
  useEffect(() => {
    if (remainingMs !== 0 || status.canComplete) {
      return;
    }

    void onRefresh();
  }, [remainingMs, status.canComplete, onRefresh]);

  const waitingPeriodComplete =
    remainingMs <= 0 && status.waitingPeriodComplete;

  const canComplete = status.canComplete && waitingPeriodComplete;

  const countdown = useMemo(
    () => formatRemainingTime(remainingMs),
    [remainingMs],
  );

  const requestedDate = useMemo(
    () => formatDate(status.requestedAt),
    [status.requestedAt],
  );

  const deleteAfterDate = useMemo(
    () => formatDate(status.deleteAfter),
    [status.deleteAfter],
  );

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel your account deletion request? Your account will remain active.",
    );

    if (!confirmed) {
      return;
    }

    await onCancel();
  };

  return (
    <div className="delete-account-pending">
      <div className="delete-account-pending__intro">
        <div>
          <h3 className="delete-account-pending__title">
            Account deletion requested
          </h3>

          <p className="delete-account-pending__description">
            Your account is still active. Permanent deletion will only become
            available after the verification and waiting period below.
          </p>
        </div>

        <span
          className={
            waitingPeriodComplete
              ? "delete-account-pending__badge delete-account-pending__badge--ready"
              : "delete-account-pending__badge"
          }
        >
          {waitingPeriodComplete ? "Ready" : "Pending"}
        </span>
      </div>

      <DeleteAccountStatus status={status} />

      {!waitingPeriodComplete && (
        <section className="delete-account-pending__countdown">
          <div className="delete-account-pending__countdown-header">
            <div>
              <span className="delete-account-pending__countdown-label">
                24-hour waiting period
              </span>

              <p className="delete-account-pending__countdown-description">
                Your account cannot be permanently deleted until this timer
                reaches zero.
              </p>
            </div>

            <ClockIcon />
          </div>

          <div
            className="delete-account-pending__countdown-value"
            aria-live="polite"
          >
            {countdown}
          </div>

          <div className="delete-account-pending__progress">
            <div
              className="delete-account-pending__progress-bar"
              style={{
                width: `${getProgressPercentage(
                  status.requestedAt,
                  status.deleteAfter,
                  remainingMs,
                )}%`,
              }}
            />
          </div>

          <div className="delete-account-pending__countdown-footer">
            <span>Requested {requestedDate}</span>

            <span>Available {deleteAfterDate}</span>
          </div>
        </section>
      )}

      {waitingPeriodComplete && (
        <section className="delete-account-pending__ready">
          <div className="delete-account-pending__ready-icon">
            <CheckIcon />
          </div>

          <div>
            <h3>Your waiting period is complete</h3>

            <p>
              Your account is now eligible for permanent deletion. This final
              step cannot be undone.
            </p>
          </div>
        </section>
      )}

      <section className="delete-account-pending__comment-note">
        <div className="delete-account-pending__comment-note-icon">
          <InfoIcon />
        </div>

        <div>
          <h3>Your comments will remain</h3>

          <p>
            Existing comments are preserved so conversations do not break. Your
            account identity and private metadata will be removed, and your
            comments will appear under
            <strong> [deleted]</strong>.
          </p>
        </div>
      </section>

      {cancelError && (
        <p className="delete-account-pending__error" role="alert">
          {cancelError}
        </p>
      )}

      <div className="delete-account-pending__actions">
        {status.canCancel && (
          <button
            type="button"
            className="delete-account-card__button delete-account-card__button--secondary"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling…" : "Cancel deletion"}
          </button>
        )}

        {canComplete && <DeleteAccountFinalDialog onCompleted={onRefresh} />}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */

function formatRemainingTime(ms: number) {
  if (ms <= 0) {
    return "Ready to delete";
  }

  const totalSeconds = Math.ceil(ms / 1000);

  const days = Math.floor(totalSeconds / 86_400);

  const hours = Math.floor((totalSeconds % 86_400) / 3_600);

  const minutes = Math.floor((totalSeconds % 3_600) / 60);

  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }

  if (hours > 0) {
    return `${hours}h ${pad(minutes)}m ${pad(seconds)}s`;
  }

  return `${minutes}m ${pad(seconds)}s`;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getProgressPercentage(
  requestedAt: string | null,
  deleteAfter: string | null,
  remainingMs: number,
) {
  if (!requestedAt || !deleteAfter) {
    return 0;
  }

  const start = new Date(requestedAt).getTime();
  const end = new Date(deleteAfter).getTime();

  const total = end - start;

  if (total <= 0) {
    return 100;
  }

  const elapsed = total - remainingMs;

  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

/* ─────────────────────────────────────────────
   Icons
   ───────────────────────────────────────────── */

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
