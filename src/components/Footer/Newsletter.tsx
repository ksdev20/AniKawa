import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubscribe(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setStatus("Enter your email");
      return;
    }

    if (loading) return;

    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          joinSource: "footer",
          preferredLanguage: navigator.language || "en",
        }),
      });

      let data: {
        success?: boolean;
        error?: string;
        data?: {
          subscription?: unknown;
        };
      } = {};

      try {
        data = await response.json();
      } catch {
        // Ignore invalid or empty JSON responses.
      }

      if (!response.ok) {
        if (response.status === 409) {
          setStatus("You're already subscribed 💜");
          return;
        }

        throw new Error(data.error ?? "Failed to subscribe.");
      }

      setStatus("Welcome to AniKawa 💜");
      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription error:", error);

      setStatus("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="newsletter" onSubmit={handleSubscribe}>
      <h3>Stay Updated</h3>

      <p>
        Get notified about seasonal anime, hidden gems, and major platform
        updates.
      </p>

      <div className="newsletter-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Joining..." : "Join"}
        </button>
      </div>

      {status && <p className="newsletter-status">{status}</p>}
    </form>
  );
}
