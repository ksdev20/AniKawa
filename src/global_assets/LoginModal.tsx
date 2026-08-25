import { Icon } from "@/icons/icons";
import { useLoginModalStore } from "./loginModalStore";
import { useAuth } from "@/hooks/useAuth";
import { resendVerification } from "@/lib/auth/resendVerification";
import { signInWithGoogle, signInWithDiscord } from "@/lib/auth/oauth";
import { useEffect, useState } from "react";
import "../styles/components/GlobalAssets/loginmodal.css";
import TurnstileWidget from "./TurnstileWidget";

export default function LoginModal() {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, signup, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const { isOpen, mode, close } = useLoginModalStore();
  const handleClose = () => {
    setCaptchaToken(null);
    setError(null);
    close();
  };

  function updateForm<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  useEffect(() => {
    document.body.style.overflowY = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  async function handleSubmit() {
    if (cooldown > 0) return;

    setError(null);

    const result =
      mode === "login"
        ? await login({
            email: form.email,
            password: form.password,
            captchaToken,
          })
        : await signup({
            displayName: form.name,
            email: form.email,
            password: form.password,
            captchaToken,
          });

    console.log(result);

    if (result.error) {
      setError(result.error);
      setCooldown(5);
      return;
    }

    if (mode === "login") {
      handleClose();
      return;
    }

    setError(
      "Signup successful! Please check your email to verify your account.",
    );
  }

  async function handleResendVerification() {
    if (!form.email) {
      setError("Enter your email to resend verification.");
      return;
    }

    const result = await resendVerification({
      email: form.email,
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    setError("Verification email resent. Please check your inbox.");
  }

  if (!isOpen) return null;

  return (
    <section
      className="login-overlay"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="login-box animate-zoom">
        <button
          aria-label="Close Popup"
          className="login-close"
          onClick={handleClose}
        >
          <Icon name="close" size={22} />
        </button>

        <h2 className="login-title">
          {mode === "login" ? "Login" : "Sign Up"}
        </h2>

        {error && (
          <div className="error-banner">
            {error}
            {error.includes("verify") && (
              <button className="resend-btn" onClick={handleResendVerification}>
                Resend Verification Email
              </button>
            )}
          </div>
        )}

        {mode === "signup" && (
          <input
            type="text"
            placeholder="Full Name"
            className={`login-input ${error?.toLowerCase().includes("name") ? "input-error" : ""}`}
            value={form.name}
            onChange={(e) => updateForm("name", e.target.value)}
            disabled={loading}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          className={`login-input ${error?.toLowerCase().includes("email") ? "input-error" : ""}`}
          value={form.email}
          onChange={(e) => updateForm("email", e.target.value)}
          disabled={loading}
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className={`login-input pr-10 ${error?.toLowerCase().includes("password") ? "input-error" : ""}`}
            value={form.password}
            onChange={(e) => updateForm("password", e.target.value)}
            disabled={loading}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onMouseDown={(e) => {
              e.preventDefault();
              setShowPassword((prev) => !prev);
            }}
          >
            {showPassword ? (
              <Icon name="visibility" color="#888" />
            ) : (
              <Icon name="visibility-off" color="#888" />
            )}
          </button>
        </div>

        <button
          className="login-btn"
          onClick={handleSubmit}
          disabled={loading || cooldown > 0}
        >
          {loading ? (
            <div className="loading-wrapper">
              Loading...
              <span className="loader animate-spin"></span>
            </div>
          ) : cooldown > 0 ? (
            `Wait ${cooldown}s`
          ) : mode === "login" ? (
            "Login"
          ) : (
            "Sign Up"
          )}
        </button>

        <div className="login-divider">OR</div>

        <div className="login-social">
          <button
            className="login-social-btn google"
            onClick={() => signInWithGoogle()}
          >
            Google
          </button>
          <button
            className="login-social-btn discord"
            onClick={() => signInWithDiscord()}
          >
            Discord
          </button>
        </div>

        <p className="login-footer">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <a onClick={() => useLoginModalStore.getState().openSignup()}>
                Sign Up
              </a>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <a onClick={() => useLoginModalStore.getState().openLogin()}>
                Login
              </a>
            </>
          )}
        </p>

        <TurnstileWidget onVerify={(token) => setCaptchaToken(token)} />
      </div>
    </section>
  );
}
