import { useEffect, useRef, useState } from "react";
import {
  CheckCircleIcon,
  CircleNotchIcon,
  InfoIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

interface Props {
  profile: {
    username: string;
    username_changed_at?: string | null;
  };

  onProfileUpdate: (profile: any) => void;
}

type Availability = "available" | "unavailable" | "error" | null;

interface ApiResponse {
  available?: boolean;
  reason?: string;
  error?: string;
  remaining?: number;
  profile?: any;
}

const USERNAME_MAX_LENGTH = 20;
const USERNAME_MIN_LENGTH = 3;
const AVAILABILITY_DEBOUNCE_MS = 450;

const USERNAME_PATTERN = /^[a-z0-9_]+$/;

function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

function isValidUsername(value: string): boolean {
  return (
    value.length >= USERNAME_MIN_LENGTH &&
    value.length <= USERNAME_MAX_LENGTH &&
    USERNAME_PATTERN.test(value)
  );
}

async function parseJsonResponse(response: Response): Promise<ApiResponse> {
  try {
    return (await response.json()) as ApiResponse;
  } catch {
    return {};
  }
}

function getErrorMessage(data: ApiResponse, fallback: string): string {
  return typeof data.error === "string" && data.error.trim()
    ? data.error
    : fallback;
}

export default function UsernameCard({ profile, onProfileUpdate }: Props) {
  const currentUsername = normalizeUsername(profile.username ?? "");

  const [username, setUsername] = useState(currentUsername);

  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<Availability>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [saving, setSaving] = useState(false);

  const [remainingChanges, setRemainingChanges] = useState<number | null>(null);

  const availabilityAbortRef = useRef<AbortController | null>(null);

  const limitAbortRef = useRef<AbortController | null>(null);

  const requestIdRef = useRef(0);

  const normalizedUsername = normalizeUsername(username);

  const usernameChanged = normalizedUsername !== currentUsername;

  /*
   * Fetch the current username-change allowance.
   */
  useEffect(() => {
    const controller = new AbortController();

    limitAbortRef.current?.abort();
    limitAbortRef.current = controller;

    async function fetchUsernameLimit() {
      try {
        const response = await fetch("/api/profile/username-limit", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await parseJsonResponse(response);

        if (!response.ok) {
          throw new Error(
            getErrorMessage(data, "Unable to load username change limit."),
          );
        }

        if (
          typeof data.remaining !== "number" ||
          !Number.isFinite(data.remaining)
        ) {
          throw new Error("Invalid username limit response.");
        }

        if (!controller.signal.aborted) {
          setRemainingChanges(Math.max(0, Math.floor(data.remaining)));
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("[UsernameCard] Failed to fetch username limit:", error);

        /*
         * Don't invent a limit when the API failed.
         * The server remains authoritative when saving.
         */
        if (!controller.signal.aborted) {
          setRemainingChanges(null);
        }
      }
    }

    fetchUsernameLimit();

    return () => {
      controller.abort();

      if (limitAbortRef.current === controller) {
        limitAbortRef.current = null;
      }
    };
  }, [currentUsername]);

  /*
   * Keep local state synchronized if the profile changes
   * externally (for example after a successful username update).
   */
  useEffect(() => {
    setUsername(currentUsername);
    setAvailability(null);
    setError(null);
    setSuccess(false);
  }, [currentUsername]);

  /*
   * Username availability checker.
   *
   * Important:
   * - Debounced
   * - Abort previous request
   * - Ignores stale responses
   * - Client validation happens before network request
   */
  useEffect(() => {
    const value = normalizedUsername;

    availabilityAbortRef.current?.abort();

    const requestId = ++requestIdRef.current;

    setChecking(false);

    if (!value || value === currentUsername) {
      setAvailability(null);
      setError(null);
      return;
    }

    if (!isValidUsername(value)) {
      setAvailability(null);

      if (value.length < USERNAME_MIN_LENGTH) {
        setError(
          `Username must be at least ${USERNAME_MIN_LENGTH} characters.`,
        );
      } else if (value.length > USERNAME_MAX_LENGTH) {
        setError(
          `Username cannot be longer than ${USERNAME_MAX_LENGTH} characters.`,
        );
      } else {
        setError(
          "Username can only contain lowercase letters, numbers and underscores.",
        );
      }

      return;
    }

    setError(null);
    setAvailability(null);

    const timer = window.setTimeout(async () => {
      const controller = new AbortController();

      availabilityAbortRef.current = controller;

      setChecking(true);

      try {
        const response = await fetch(
          `/api/profile/username?username=${encodeURIComponent(value)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const data = await parseJsonResponse(response);

        /*
         * A newer request may already have started.
         * Never allow this response to modify its state.
         */
        if (controller.signal.aborted || requestId !== requestIdRef.current) {
          return;
        }

        if (!response.ok) {
          setAvailability("error");
          setError(
            getErrorMessage(data, "Unable to check username availability."),
          );
          return;
        }

        if (typeof data.available !== "boolean") {
          setAvailability("error");
          setError("Unable to verify username availability.");
          return;
        }

        if (data.available) {
          setAvailability("available");
          setError(null);
        } else {
          setAvailability("unavailable");
          setError(
            typeof data.reason === "string" && data.reason.trim()
              ? data.reason
              : "Username is already taken.",
          );
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        if (controller.signal.aborted || requestId !== requestIdRef.current) {
          return;
        }

        console.error("[UsernameCard] Failed to check username:", error);

        setAvailability("error");
        setError("Unable to check username availability. Please try again.");
      } finally {
        if (!controller.signal.aborted && requestId === requestIdRef.current) {
          setChecking(false);
        }
      }
    }, AVAILABILITY_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controllerAbort();
    };

    function controllerAbort() {
      availabilityAbortRef.current?.abort();
    }
  }, [normalizedUsername, currentUsername]);

  /*
   * Clean up outstanding requests when the component unmounts.
   */
  useEffect(() => {
    return () => {
      availabilityAbortRef.current?.abort();
      limitAbortRef.current?.abort();
    };
  }, []);

  function handleUsernameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");

    setUsername(value);
    setAvailability(null);
    setError(null);
    setSuccess(false);
  }

  async function saveUsername(event?: React.SubmitEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (saving) {
      return;
    }

    const value = normalizeUsername(username);

    /*
     * Always validate locally before sending.
     */
    if (!value) {
      setError("Please enter a username.");
      setAvailability(null);
      return;
    }

    if (!isValidUsername(value)) {
      setError(
        `Username must be ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} characters and can only contain lowercase letters, numbers and underscores.`,
      );
      setAvailability(null);
      return;
    }

    if (value === currentUsername) {
      setError(null);
      setAvailability(null);
      return;
    }

    /*
     * Availability is only a UX optimization.
     * The PATCH endpoint MUST still validate uniqueness,
     * permissions and rate limits server-side.
     */
    if (availability !== "available") {
      if (availability === "error") {
        setError(
          "We couldn't verify this username. Please check its availability again.",
        );
      } else if (availability === "unavailable") {
        setError("This username is not available.");
      } else {
        setError("Please wait until the username has been checked.");
      }

      return;
    }

    if (remainingChanges === 0) {
      setError(
        "You have reached your username change limit. Please try again after the limit resets.",
      );
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/profile/username", {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: value,
        }),
      });

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        /*
         * The server is authoritative.
         * This handles races where another user claims the
         * username between our availability check and PATCH.
         */
        throw new Error(getErrorMessage(data, "Failed to update username."));
      }

      if (!data.profile) {
        throw new Error(
          "Username was updated, but the server returned an invalid profile.",
        );
      }

      onProfileUpdate(data.profile);

      setUsername(value);
      setAvailability(null);
      setSuccess(true);

      setRemainingChanges((previous) =>
        previous === null ? previous : Math.max(previous - 1, 0),
      );
    } catch (error) {
      console.error("[UsernameCard] Failed to update username:", error);

      setError(
        error instanceof Error && error.message.trim()
          ? error.message
          : "Something went wrong while updating your username.",
      );

      setSuccess(false);
    } finally {
      setSaving(false);
    }
  }

  const buttonDisabled =
    saving ||
    checking ||
    !usernameChanged ||
    !isValidUsername(normalizedUsername) ||
    availability !== "available" ||
    remainingChanges === 0;

  return (
    <section className="settings-card username-card">
      <div className="settings-card__header">
        <div>
          <div className="username-card__title-row">
            <div className="username-card__icon">
              <span aria-hidden="true">@</span>
            </div>

            <h3>Username</h3>
          </div>

          <p>Your username is used to identify your profile across AniKawa.</p>
        </div>

        <span className="settings-badge">Profile</span>
      </div>

      <form className="username-card__form" onSubmit={saveUsername} noValidate>
        <div className="username-card__current">
          <span className="settings-label">Current Username</span>

          <div className="username-card__current-value">
            <span aria-hidden="true">@</span>
            <strong>{currentUsername}</strong>
          </div>
        </div>

        <div className="username-field">
          <input
            id="profile-username"
            name="username"
            value={username}
            onChange={handleUsernameChange}
            className="username-field__input"
            maxLength={USERNAME_MAX_LENGTH}
            minLength={USERNAME_MIN_LENGTH}
            placeholder="username"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            disabled={saving}
          />
        </div>

        <div
          id="username-status"
          className="username-status"
          aria-live="polite"
        >
          {checking && (
            <span className="username-message username-message--checking">
              <CircleNotchIcon
                size={16}
                weight="bold"
                className="username-message__icon username-message__icon--spin"
                aria-hidden="true"
              />
              Checking availability...
            </span>
          )}

          {!checking && availability === "available" && (
            <span className="username-message username-message--success">
              <CheckCircleIcon size={17} weight="fill" aria-hidden="true" />
              Username is available
            </span>
          )}

          {!checking && error && availability !== "available" && (
            <span className="username-message username-message--error">
              <WarningCircleIcon size={17} weight="fill" aria-hidden="true" />
              {error}
            </span>
          )}

          {!checking && success && !error && (
            <span className="username-message username-message--success">
              <CheckCircleIcon size={17} weight="fill" aria-hidden="true" />
              Username updated successfully
            </span>
          )}
        </div>

        <div id="username-hint" className="username-hint-box">
          <InfoIcon size={17} weight="duotone" aria-hidden="true" />

          <div>
            <p>
              Usernames can only contain lowercase letters, numbers and
              underscores.
            </p>

            <p>Username changes are limited to 3 times every 30 days.</p>
          </div>
        </div>

        {remainingChanges !== null && (
          <div className="username-limit">
            <span>Changes remaining</span>

            <strong>
              {remainingChanges}
              <span>/3</span>
            </strong>
          </div>
        )}

        <div className="username-card__actions">
          <button
            type="submit"
            className="settings-save"
            disabled={buttonDisabled}
          >
            {saving ? (
              <>
                <CircleNotchIcon
                  size={17}
                  weight="bold"
                  className="username-message__icon--spin"
                  aria-hidden="true"
                />
                Saving...
              </>
            ) : (
              "Save Username"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
