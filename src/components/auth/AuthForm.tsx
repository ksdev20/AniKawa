import { useState, useEffect, useRef } from "react";
import "./log-signtw.css";
import fetchUserDetails from "../../global_assets/FetchUserDetails";
import { backendUrl } from "../../global_assets/globalPaths";
import { Icon } from "../../icons/icons";

type AuthFormProps = {
  keyword: string;
  title: string;
  buttonLabel: string;
  apiEndPoint: string;
};

function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password: string) {
  if (password.length >= 6 && !password.includes(" ")) {
    return true;
  }
  return false;
}

function LinksElement({ keyword }: { keyword: string }) {
  if (keyword == "s") {
    return (
      <>
        <p className="alt-login-text">
          Already have an account?
          <a className="to-login" href="/login">
            LOG IN
          </a>
        </p>
        <p className="terms-para">
          By creating an account you're agreeing to our
          <a className="term-policy-link" href="/legal/tos/" target="_blank">
            Terms
          </a>
          &
          <a
            className="term-policy-link"
            href="/legal/privacy-policy/"
            target="_blank"
          >
            Privacy Policy
          </a>
          <b>, </b>
          and you confirm that you are at least 18 years of age.
        </p>
      </>
    );
  } else {
    return (
      <div className="after-next-links">
        <a className="to-login" href="/404">
          FORGOT PASSWORD?
        </a>
        <a className="to-login" href="/signup">
          CREATE ACCOUNT
        </a>
      </div>
    );
  }
}

export default function AuthForm({
  keyword,
  title,
  buttonLabel,
  apiEndPoint,
}: AuthFormProps) {
  const [formState, setFormState] = useState({
    email: "",
    password: "",
    validEmail: true,
    validPassword: true,
    validButton: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const actionBtn = useRef<HTMLButtonElement | null>(null);

  const validate = (email: string, password: string) => ({
    validEmail: isValidEmail(email),
    validPassword: isValidPassword(password),
  });

  const handleChange =
    (field: "email" | "password") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const updated = { ...formState, [field]: value };
      const { validEmail, validPassword } = validate(
        updated.email,
        updated.password
      );
      setFormState({
        ...updated,
        validEmail,
        validPassword,
        validButton: validEmail && validPassword,
      });
    };

  function apiCall() {
    const { email, password } = formState;
    if (!email || !password) return;

    fetch(`${backendUrl}/api/${apiEndPoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log(`${buttonLabel} Successsful ✅`);
          fetchUserDetails().then(() => {
            window.location.href = "/";
          });
        } else {
          alert(data.error);
        }
      })
      .catch((e) => {
        console.error(e.message);
      });
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      actionBtn?.current?.click();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  return (
    <>
      <header className="topbar">
        <a href="/" className="website-logo">
          <img
            className="website-logo"
            src="/logo.png"
            alt="Website logo of Anikawa"
          />
        </a>
      </header>
      <main className="main">
        <section className="main-content">
          <h1 id="ls-title" className="main-heading">
            {title}
          </h1>
          <section className="form-section">
            <form
              className="form-section email"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                value={formState.email}
                onChange={handleChange("email")}
                type="email"
                id="email"
                placeholder=" "
                autoComplete="email"
                required
              />
              <label
                htmlFor="email"
                id="email-label"
                className={`${!formState.validEmail ? "invalid" : ""}`}
              >
                {formState.validEmail
                  ? "Email Address"
                  : "Invalid Email Address"}
              </label>
            </form>
            <form
              className="form-section password"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                value={formState.password}
                onChange={handleChange("password")}
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder=" "
                autoComplete="password"
                required
              />
              <label
                htmlFor="password"
                className={`floating-label ${!formState.validPassword ? "invalid" : ""}`}
                id="password-label"
              >
                {formState.validPassword ? "Pasword" : "Invalid Password"}
              </label>
              <button
                type="button"
                className="show-hide-btn"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setShowPassword((prev) => !prev);
                }}
              >
                {showPassword ? (
                  <Icon name="visibility" color="#666" />
                ) : (
                  <Icon name="visibility-off" color="#666" />
                )}
              </button>
            </form>
            {keyword == "s" && (
              <label className="password-note">
                Use at least 6 characters, do not use empty spaces
              </label>
            )}
          </section>
          <button
            ref={actionBtn}
            className={`create-account-btn ${formState.validButton ? "active" : ""}`}
            onClick={() => {
              if (formState.validButton) {
                apiCall();
              }
            }}
          >
            {buttonLabel}
          </button>
          <LinksElement keyword={keyword} />
        </section>
      </main>
    </>
  );
}
