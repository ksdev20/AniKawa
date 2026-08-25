import { useEffect, useState } from "react";
import {
  CheckIcon,
  CircleNotchIcon,
  GlobeIcon,
  LockIcon,
  UsersThreeIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

type Privacy = "public" | "semi_public" | "private";

interface Profile {
  privacy?: Privacy | null;
}

interface Props {
  profile: Profile;
  onProfileUpdate: (profile: any) => void;
}

const PRIVACY_OPTIONS: Array<{
  value: Privacy;
  title: string;
  description: string;
  icon: typeof GlobeIcon;
}> = [
  {
    value: "public",
    title: "Public",
    description:
      "Your profile, anime lists, and activity are visible to everyone.",
    icon: GlobeIcon,
  },
  {
    value: "semi_public",
    title: "Semi-Public",
    description:
      "Your profile, lists, and activity stay visible, but your activity won't be shown in public feeds.",
    icon: UsersThreeIcon,
  },
  {
    value: "private",
    title: "Private",
    description: "Only you can access your profile, lists, and activity.",
    icon: LockIcon,
  },
];

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

export default function PrivacyCard({ profile, onProfileUpdate }: Props) {
  const [privacy, setPrivacy] = useState<Privacy>(profile.privacy ?? "public");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setPrivacy(profile.privacy ?? "public");
  }, [profile.privacy]);

  function handlePrivacyChange(value: Privacy) {
    if (loading) {
      return;
    }

    setPrivacy(value);
    setError(null);
    setSuccess(false);
  }

  async function savePrivacy(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) {
      return;
    }

    const currentPrivacy = profile.privacy ?? "public";

    setError(null);
    setSuccess(false);

    if (privacy === currentPrivacy) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/profile/privacy", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          privacy,
        }),
      });

      let data: {
        success?: boolean;
        error?: string;
        data?: {
          profile?: Profile;
        };
      } = {};

      try {
        data = await res.json();
      } catch {
        // Ignore invalid/empty JSON responses.
      }

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to update privacy settings");
      }

      if (!data.data?.profile) {
        throw new Error("Privacy update response was invalid");
      }

      onProfileUpdate(data.data.profile);
      setPrivacy(data.data.profile.privacy ?? privacy);
      setSuccess(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const currentPrivacy = profile.privacy ?? "public";
  const hasChanges = privacy !== currentPrivacy;

  return (
    <section className="settings-card privacy-card">
      <div className="settings-card__header">
        <div className="privacy-card__title">
          <div className="privacy-card__icon" aria-hidden="true">
            <LockIcon size={20} weight="duotone" />
          </div>

          <div>
            <h3>Privacy</h3>
            <p>Control who can see your profile and activity.</p>
          </div>
        </div>

        <span className="settings-badge">Privacy</span>
      </div>

      <form className="privacy-card__form" onSubmit={savePrivacy}>
        <fieldset className="privacy-card__options" disabled={loading}>
          <legend className="privacy-card__legend">Profile visibility</legend>

          {PRIVACY_OPTIONS.map((option) => {
            const Icon = option.icon;
            const selected = privacy === option.value;

            return (
              <label
                key={option.value}
                className={`privacy-card__option ${
                  selected ? "privacy-card__option--selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="privacy"
                  value={option.value}
                  checked={selected}
                  onChange={() => handlePrivacyChange(option.value)}
                />

                <span className="privacy-card__option-icon" aria-hidden="true">
                  <Icon size={21} weight="duotone" />
                </span>

                <span className="privacy-card__option-content">
                  <span className="privacy-card__option-title">
                    {option.title}
                  </span>

                  <span className="privacy-card__option-description">
                    {option.description}
                  </span>
                </span>

                <span className="privacy-card__radio" aria-hidden="true">
                  <span />
                </span>
              </label>
            );
          })}
        </fieldset>

        {error && (
          <div
            className="privacy-card__message privacy-card__message--error"
            role="alert"
          >
            <WarningCircleIcon size={18} weight="fill" aria-hidden="true" />

            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            className="privacy-card__message privacy-card__message--success"
            role="status"
          >
            <CheckIcon size={18} weight="bold" aria-hidden="true" />

            <span>Privacy settings updated successfully.</span>
          </div>
        )}

        <div className="privacy-card__actions">
          <button
            type="submit"
            className="settings-save"
            disabled={loading || !hasChanges}
          >
            {loading ? (
              <>
                <CircleNotchIcon
                  size={18}
                  className="privacy-card__spinner"
                  aria-hidden="true"
                />
                Saving...
              </>
            ) : (
              "Save Privacy"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
