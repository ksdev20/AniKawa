import { useCallback, useEffect, useState } from "react";
import '@/styles/components/Profile/DeleteAccountCard.css';
import DeleteAccountPending from "./DeleteAccountPending";
import DeleteAccountRequestDialog from "./DeleteAccountRequestDialog";

import {
  cancelAccountDeletion,
  getAccountDeletionStatus,
  requestAccountDeletion,
} from "@/lib/account/deletion/api";

import type { AccountDeletionStatus } from "@/lib/account/deletion/types";

const EMPTY_STATUS: AccountDeletionStatus = {
  hasRequest: false,
  requestedAt: null,
  deleteAfter: null,
  passwordVerified: false,
  emailVerified: false,
  waitingPeriodComplete: false,
  canCancel: false,
  canComplete: false,
  remainingMs: 0,
};

export default function DeleteAccountCard() {
  const [status, setStatus] = useState<AccountDeletionStatus>(EMPTY_STATUS);

  const [loading, setLoading] = useState(true);

  const [requesting, setRequesting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [requestError, setRequestError] = useState<string | null>(null);

  const [cancelError, setCancelError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const nextStatus = await getAccountDeletionStatus();

      setStatus(nextStatus);
    } catch (error) {
      console.error("Failed to load account deletion status:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * Initial status.
   */
  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  /*
   * Refresh whenever the user returns to the page.
   *
   * This is important because email verification happens outside
   * this page.
   */
  useEffect(() => {
    const handleFocus = () => {
      void loadStatus();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadStatus();
      }
    };

    window.addEventListener("focus", handleFocus);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadStatus]);

  /*
   * Keep the 24-hour countdown live without constantly
   * hitting the API.
   *
   * The server remains the source of truth when we refresh.
   */
  useEffect(() => {
    if (!status.hasRequest || !status.deleteAfter) {
      return;
    }

    const updateCountdown = () => {
      const deleteAfter = new Date(status.deleteAfter!).getTime();

      const remainingMs = Math.max(0, deleteAfter - Date.now());

      setStatus((current) => ({
        ...current,
        remainingMs,
        waitingPeriodComplete: remainingMs <= 0,
        canComplete:
          current.passwordVerified && current.emailVerified && remainingMs <= 0,
      }));
    };

    updateCountdown();

    const interval = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [status.deleteAfter, status.hasRequest]);

  /*
   * Request account deletion.
   *
   * The API verifies the password, creates the 24-hour deletion
   * request and sends the email verification message.
   */
  const handleRequestDeletion = useCallback(
    async (password: string) => {
      setRequesting(true);
      setRequestError(null);

      try {
        await requestAccountDeletion(password);

        /*
         * Important:
         * Do NOT close the flow as if the account was deleted.
         *
         * Refresh the real server state so the card immediately
         * switches from "Delete account" to the pending state.
         */
        await loadStatus();

        return true;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to create the deletion request.";

        setRequestError(message);

        return false;
      } finally {
        setRequesting(false);
      }
    },
    [loadStatus],
  );

  /*
   * Cancel an active deletion request.
   */
  const handleCancelDeletion = useCallback(async () => {
    setCancelling(true);
    setCancelError(null);

    try {
      await cancelAccountDeletion();

      /*
       * Always reload from the server rather than manually
       * constructing the new state.
       */
      await loadStatus();

      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to cancel the deletion request.";

      setCancelError(message);

      return false;
    } finally {
      setCancelling(false);
    }
  }, [loadStatus]);

  if (loading) {
    return (
      <section className="delete-account-card">
        <div className="delete-account-card__header">
          <div className="delete-account-card__icon">
            <TrashIcon />
          </div>

          <div className="delete-account-card__heading">
            <h2 className="delete-account-card__title">Delete account</h2>

            <p className="delete-account-card__description">
              Permanently delete your Anikawa account and personal data.
            </p>
          </div>
        </div>

        <div className="delete-account-card__loading">
          Loading account status…
        </div>
      </section>
    );
  }

  /*
   * No active deletion request.
   */
  if (!status.hasRequest) {
    return (
      <section className="delete-account-card">
        <div className="delete-account-card__header">
          <div className="delete-account-card__icon">
            <TrashIcon />
          </div>

          <div className="delete-account-card__heading">
            <h2 className="delete-account-card__title">Delete account</h2>

            <p className="delete-account-card__description">
              Permanently delete your Anikawa account and personal data.
            </p>
          </div>
        </div>

        <DeleteAccountRequestDialog
          requesting={requesting}
          error={requestError}
          onSubmit={handleRequestDeletion}
        />
      </section>
    );
  }

  /*
   * Active deletion request.
   *
   * DeleteAccountPending owns the entire pending/ready UI.
   */
  return (
    <section className="delete-account-card">
      <div className="delete-account-card__header">
        <div className="delete-account-card__icon">
          <TrashIcon />
        </div>

        <div className="delete-account-card__heading">
          <h2 className="delete-account-card__title">Delete account</h2>

          <p className="delete-account-card__description">
            Your account deletion request is currently active.
          </p>
        </div>
      </div>

      <DeleteAccountPending
        status={status}
        cancelling={cancelling}
        cancelError={cancelError}
        onCancel={handleCancelDeletion}
        onRefresh={loadStatus}
      />
    </section>
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
