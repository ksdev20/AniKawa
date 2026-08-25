import { useEffect, useState } from "react";
import {
  CheckIcon,
  CircleNotchIcon,
  IdentificationCardIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

const DISPLAY_NAME_MAX_LENGTH = 30;

function normalizeDisplayName(value: string) {
  return value.normalize("NFKC").replace(/\s+/g, " ").trim();
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

interface Props {
  profile: {
    display_name?: string | null;
  };
  onProfileUpdate: (profile: any) => void;
}

export default function DisplayNameCard({ profile, onProfileUpdate }: Props) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setDisplayName(profile.display_name ?? "");
  }, [profile.display_name]);

  function handleChange(value: string) {
    if (value.length > DISPLAY_NAME_MAX_LENGTH) {
      return;
    }

    setDisplayName(value);
    setError(null);
    setSuccess(false);
  }

  async function saveDisplayName(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) {
      return;
    }

    const normalizedName = normalizeDisplayName(displayName);
    const currentName = normalizeDisplayName(profile.display_name ?? "");

    setError(null);
    setSuccess(false);

    if (!normalizedName) {
      setError("Display name cannot be empty.");
      return;
    }

    if (normalizedName.length > DISPLAY_NAME_MAX_LENGTH) {
      setError(
        `Display name must be ${DISPLAY_NAME_MAX_LENGTH} characters or less.`,
      );
      return;
    }

    if (normalizedName === currentName) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/profile/display-name", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: normalizedName,
        }),
      });

      let data: {
        success?: boolean;
        error?: string;
        data?: {
          profile?: any;
        };
      } = {};

      try {
        data = await res.json();
      } catch {
        // Ignore invalid/empty JSON responses.
      }

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to update display name");
      }

      if (!data.data?.profile) {
        throw new Error("Profile update response was invalid");
      }

      onProfileUpdate(data.data.profile);

      setDisplayName(data.data.profile.display_name ?? normalizedName);
      setSuccess(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const normalizedCurrentName = normalizeDisplayName(
    profile.display_name ?? "",
  );

  const normalizedInputName = normalizeDisplayName(displayName);

  const hasChanges =
    normalizedInputName.length > 0 &&
    normalizedInputName !== normalizedCurrentName;

  return (
    <section className="settings-card display-name-card">
      <div className="settings-card__header">
        <div className="display-name-card__title">
          <div className="display-name-card__icon" aria-hidden="true">
            <IdentificationCardIcon size={20} weight="duotone" />
          </div>

          <div>
            <h3>Display Name</h3>
            <p>Choose the name other users will see on your profile.</p>
          </div>
        </div>

        <span className="settings-badge">Profile</span>
      </div>

      <form
        className="display-name-card__form"
        onSubmit={saveDisplayName}
        noValidate
      >
        <div className="display-name-card__field">
          <label htmlFor="profile-display-name">Display name</label>

          <input
            id="profile-display-name"
            name="displayName"
            type="text"
            className="display-name-card__input"
            value={displayName}
            onChange={(event) => handleChange(event.target.value)}
            placeholder="Enter your display name"
            maxLength={DISPLAY_NAME_MAX_LENGTH}
            autoComplete="name"
            disabled={loading}
          />

          <div className="display-name-card__meta">
            <span>This name does not have to be unique.</span>

            <span>
              {displayName.length}/{DISPLAY_NAME_MAX_LENGTH}
            </span>
          </div>
        </div>

        {error && (
          <div
            className="display-name-card__message display-name-card__message--error"
            role="alert"
          >
            <WarningCircleIcon size={18} weight="fill" aria-hidden="true" />

            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            className="display-name-card__message display-name-card__message--success"
            role="status"
          >
            <CheckIcon size={18} weight="bold" aria-hidden="true" />

            <span>Display name updated successfully.</span>
          </div>
        )}

        <div className="display-name-card__actions">
          <button
            type="submit"
            className="settings-save"
            disabled={loading || !hasChanges}
          >
            {loading ? (
              <>
                <CircleNotchIcon
                  size={18}
                  className="display-name-card__spinner"
                  aria-hidden="true"
                />
                Saving...
              </>
            ) : (
              "Save Display Name"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
