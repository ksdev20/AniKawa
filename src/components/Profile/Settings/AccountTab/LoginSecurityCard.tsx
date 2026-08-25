import { useEffect, useState } from "react";
import {
  CheckIcon,
  CircleNotchIcon,
  ShieldCheckIcon,
  ShieldWarningIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

export default function LoginSecurityCard() {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      try {
        setInitialLoading(true);
        setError(null);

        const response = await fetch("/api/profile/login-security", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        let data: {
          success?: boolean;
          error?: string;
          data?: {
            settings?: {
              enabled?: boolean;
            };
          };
        } = {};

        try {
          data = await response.json();
        } catch {
          // Ignore invalid/empty JSON responses.
        }

        if (!response.ok) {
          throw new Error(
            data.error ?? "Failed to load login security settings.",
          );
        }

        const serverEnabled = data.data?.settings?.enabled;

        if (typeof serverEnabled !== "boolean") {
          throw new Error("Invalid login security settings received.");
        }

        if (!mounted) return;

        setEnabled(serverEnabled);
      } catch (err: unknown) {
        if (!mounted) return;

        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        if (mounted) {
          setInitialLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleToggle() {
    if (loading || initialLoading) return;

    const nextValue = !enabled;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/profile/login-security", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled: nextValue,
        }),
      });

      let data: {
        success?: boolean;
        error?: string;
        data?: {
          settings?: {
            enabled?: boolean;
          };
        };
      } = {};

      try {
        data = await response.json();
      } catch {
        // Ignore invalid/empty JSON responses.
      }

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to update login security settings.",
        );
      }

      const updatedEnabled = data.data?.settings?.enabled ?? nextValue;

      setEnabled(updatedEnabled);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="settings-card login-security-card">
      <div className="settings-card__header">
        <div className="login-security-card__title">
          <div className="login-security-card__icon" aria-hidden="true">
            <ShieldCheckIcon size={20} weight="duotone" />
          </div>

          <div>
            <h3>Login Location Security</h3>

            <p>
              We'll monitor the location of your logins and flag unusual
              sign-ins to help keep your account secure.
            </p>
          </div>
        </div>

        <span className="settings-badge">Security</span>
      </div>

      <div className="login-security-card__status">
        <div className="login-security-card__status-info">
          <div
            className={`login-security-card__status-icon ${
              enabled
                ? "login-security-card__status-icon--enabled"
                : "login-security-card__status-icon--disabled"
            }`}
            aria-hidden="true"
          >
            {enabled ? (
              <CheckIcon size={18} weight="bold" />
            ) : (
              <ShieldWarningIcon size={18} weight="duotone" />
            )}
          </div>

          <div>
            <strong>
              {initialLoading ? "Loading..." : enabled ? "Enabled" : "Disabled"}
            </strong>

            <span>
              {initialLoading
                ? "Checking your security settings."
                : enabled
                  ? "Unusual login locations will be flagged."
                  : "Login location monitoring is turned off."}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="settings-secondary-button login-security-card__toggle"
          onClick={handleToggle}
          disabled={loading || initialLoading}
        >
          {initialLoading ? (
            <>
              <CircleNotchIcon
                size={18}
                className="login-security-card__spinner"
                aria-hidden="true"
              />
              Loading...
            </>
          ) : loading ? (
            <>
              <CircleNotchIcon
                size={18}
                className="login-security-card__spinner"
                aria-hidden="true"
              />
              Saving...
            </>
          ) : enabled ? (
            "Disable"
          ) : (
            "Enable"
          )}
        </button>
      </div>

      {error && (
        <div
          className="login-security-card__message login-security-card__message--error"
          role="alert"
        >
          <WarningCircleIcon size={18} weight="fill" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          className="login-security-card__message login-security-card__message--success"
          role="status"
        >
          <CheckIcon size={18} weight="bold" aria-hidden="true" />
          <span>
            Login location security {enabled ? "enabled" : "disabled"}.
          </span>
        </div>
      )}
    </section>
  );
}
