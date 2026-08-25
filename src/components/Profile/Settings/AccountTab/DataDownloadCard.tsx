import { useEffect, useRef, useState } from "react";
import {
  CheckIcon,
  CircleNotchIcon,
  DownloadSimpleIcon,
  ShieldCheckIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

export default function DataDownloadCard() {
  const [loading, setLoading] = useState(false);
  const [takingLonger, setTakingLonger] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const longerTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (longerTimerRef.current !== null) {
        window.clearTimeout(longerTimerRef.current);
      }
    };
  }, []);

  function startLongerTimer() {
    if (longerTimerRef.current !== null) {
      window.clearTimeout(longerTimerRef.current);
    }

    longerTimerRef.current = window.setTimeout(() => {
      setTakingLonger(true);
    }, 5000);
  }

  function clearLongerTimer() {
    if (longerTimerRef.current !== null) {
      window.clearTimeout(longerTimerRef.current);
      longerTimerRef.current = null;
    }
  }

  async function handleDownload() {
    if (loading) return;

    setLoading(true);
    setTakingLonger(false);
    setError(null);
    setSuccess(false);

    startLongerTimer();

    try {
      const response = await fetch("/api/profile/data-export", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        let message = "Failed to generate your data export.";

        try {
          const data = await response.json();

          if (typeof data?.error === "string") {
            message = data.error;
          }
        } catch {
          // Ignore invalid error responses.
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      if (!blob.size) {
        throw new Error("The data export was empty.");
      }

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "anikawa-data-export.json";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      setSuccess(true);
    } catch (error: unknown) {
      console.error("[Data Export] Download failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to download your data.",
      );
    } finally {
      clearLongerTimer();
      setLoading(false);
      setTakingLonger(false);
    }
  }

  return (
    <section className="settings-card data-download-card">
      <div className="settings-card__header">
        <div className="data-download-card__title">
          <div className="data-download-card__icon" aria-hidden="true">
            <ShieldCheckIcon size={20} weight="duotone" />
          </div>

          <div>
            <h3>Download Your Data</h3>

            <p>
              Download a copy of the personal data you've stored on Anikawa.
            </p>
          </div>
        </div>

        <span className="settings-badge">Privacy</span>
      </div>

      <div className="data-download-card__body">
        <p className="data-download-card__note">
          This is an export of your data for your records. It cannot be imported
          into another Anikawa account.
        </p>

        <div className="data-download-card__action">
          <button
            type="button"
            className="settings-save data-download-card__button"
            onClick={handleDownload}
            disabled={loading}
          >
            {loading ? (
              <>
                <CircleNotchIcon
                  size={18}
                  className="data-download-card__spinner"
                  aria-hidden="true"
                />
                {takingLonger ? "Still preparing..." : "Preparing..."}
              </>
            ) : (
              <>
                <DownloadSimpleIcon size={18} weight="bold" aria-hidden="true" />
                Download Data
              </>
            )}
          </button>

          {takingLonger && (
            <p className="data-download-card__progress" role="status">
              Your export is taking a little longer than expected. Please keep
              this page open.
            </p>
          )}
        </div>
      </div>

      {error && (
        <div
          className="data-download-card__message data-download-card__message--error"
          role="alert"
        >
          <WarningCircleIcon size={18} weight="fill" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          className="data-download-card__message data-download-card__message--success"
          role="status"
        >
          <CheckIcon size={18} weight="bold" aria-hidden="true" />
          <span>Your Anikawa data has been downloaded.</span>
        </div>
      )}
    </section>
  );
}
