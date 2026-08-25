import { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  EnvelopeSimpleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

import { supabase } from "@/lib/supabase";

interface Props {
  currentEmail: string;
  profile: any;
  onProfileUpdate: (profile: any) => void;
}

type MessageType = "success" | "error" | null;

export default function EmailCard({
  currentEmail,
  profile,
  onProfileUpdate,
}: Props) {
  const [email, setEmail] = useState(currentEmail);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>(null);

  useEffect(() => {
    setEmail(currentEmail);
  }, [currentEmail]);

  const normalizedEmail = email.trim().toLowerCase();

  const emailChanged = normalizedEmail !== currentEmail.toLowerCase();

  function clearMessage() {
    setMessage("");
    setMessageType(null);
  }

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    clearMessage();

    if (!normalizedEmail) {
      setMessageType("error");
      setMessage("Please enter your email address.");
      return;
    }

    if (normalizedEmail === currentEmail.toLowerCase()) {
      setMessageType("error");
      setMessage("That's already the email address on your account.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.updateUser({
        email: normalizedEmail,
      });

      if (error) {
        console.error("[EmailCard] Failed to update email:", error);

        setMessageType("error");

        if (error.message.toLowerCase().includes("already registered")) {
          setMessage(
            "That email address is already associated with another account.",
          );
        } else if (error.message.toLowerCase().includes("rate limit")) {
          setMessage("Too many email-change requests. Please try again later.");
        } else {
          setMessage(error.message || "Unable to change your email address.");
        }

        return;
      }

      /*
       * Supabase may return an updated user object here, but the
       * email change is not necessarily finalized yet.
       *
       * Do not blindly replace profile.email with the requested
       * address before confirmation.
       */

      if (data.user) {
        onProfileUpdate({
          ...profile,
          email: data.user.email ?? currentEmail,
        });
      }

      setMessageType("success");
      setMessage(
        "Confirmation emails have been sent. Please check your email to complete the change.",
      );
    } catch (error) {
      console.error("[EmailCard] Unexpected error:", error);

      setMessageType("error");
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="settings-card email-card">
      <div className="settings-card__header">
        <div>
          <div className="email-card__title-row">
            <div className="email-card__icon">
              <EnvelopeSimpleIcon size={21} weight="duotone" aria-hidden="true" />
            </div>

            <h3>Email Address</h3>
          </div>

          <p>
            Manage the email address you use to sign in and receive important
            account emails.
          </p>
        </div>

        <span className="settings-badge">Account</span>
      </div>

      <form className="email-card__form" onSubmit={handleSubmit}>
        <div className="email-card__current">
          <span className="settings-label">Current Email</span>

          <div className="email-card__current-value">
            <EnvelopeSimpleIcon size={18} weight="duotone" aria-hidden="true" />

            <span>{currentEmail || "No email set"}</span>

            <span className="email-card__verified">
              <CheckCircleIcon size={15} weight="fill" aria-hidden="true" />
              Verified
            </span>
          </div>
        </div>

        <div className="account-field">
          <label htmlFor="profile-new-email">New Email Address</label>

          <input
            id="profile-new-email"
            type="email"
            name="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearMessage();
            }}
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            disabled={loading}
            maxLength={254}
            spellCheck={false}
          />

          <span>You'll need to confirm the change through email.</span>
        </div>

        {message && (
          <div
            className={`email-card__message email-card__message--${messageType}`}
            role={messageType === "error" ? "alert" : "status"}
          >
            {messageType === "success" ? (
              <CheckCircleIcon size={18} weight="fill" aria-hidden="true" />
            ) : (
              <WarningCircleIcon size={18} weight="fill" aria-hidden="true" />
            )}

            <span>{message}</span>
          </div>
        )}

        <div className="email-card__actions">
          <button
            type="submit"
            className="settings-save"
            disabled={loading || !normalizedEmail || !emailChanged}
          >
            {loading ? (
              <>
                <span className="email-card__spinner" />
                Sending confirmation...
              </>
            ) : (
              "Change Email"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
