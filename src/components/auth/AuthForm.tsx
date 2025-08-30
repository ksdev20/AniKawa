import { useState, useEffect, useRef } from "react";
import "./log-signtw.css";
import fetchUserDetails from "../../global_assets/FetchUserDetails";
import Footer from "../Footer/Footer";
const backendUrl = import.meta.env.PUBLIC_BACKEND_URL;

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
  const pageTitle =
    keyword == "l" ? "Login to Your Account" : "Sign up for Anikawa";
  const [validEmail, setValidEmail] = useState(true);
  const [validPassword, setValidPassword] = useState(true);
  const [validButton, setValidButton] = useState(false);

  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const actionBtn = useRef<HTMLButtonElement | null>(null);

  const validateAll = () => {
    const emailVal = emailRef?.current?.value ?? "";
    const passwordVal = passwordRef?.current?.value ?? "";

    const emailOk = isValidEmail(emailVal);
    const passwordOk = isValidPassword(passwordVal);

    setValidEmail(emailOk);
    setValidPassword(passwordOk);
    setValidButton(emailOk && passwordOk);
  };

  useEffect(() => {
    const eRef = emailRef.current;
    const pRef = passwordRef.current;

    if (!eRef || !pRef) return;

    eRef.addEventListener("input", validateAll);
    pRef.addEventListener("input", validateAll);

    eRef.addEventListener("change", validateAll);
    pRef.addEventListener("change", validateAll);

    return () => {
      eRef.removeEventListener("input", validateAll);
      pRef.removeEventListener("input", validateAll);
      eRef.removeEventListener("change", validateAll);
      pRef.removeEventListener("change", validateAll);
    };
  }, []);

  function apiCall() {
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

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
          <div className="form-section">
            <div className="form-section email">
              <input
                ref={emailRef}
                type="email"
                id="email"
                placeholder=" "
                autoComplete="email"
                required
              />
              <label
                htmlFor="email"
                id="email-label"
                className={`${!validEmail ? "invalid" : ""}`}
              >
                {validEmail ? "Email Address" : "Invalid Email Address"}
              </label>
            </div>
            <div className="form-section password">
              <input
                ref={passwordRef}
                type="password"
                id="password"
                placeholder=" "
                autoComplete="password"
                required
              />
              <label
                htmlFor="password"
                className={`floating-label ${!validPassword ? "invalid" : ""}`}
                id="password-label"
              >
                Password
              </label>
            </div>
            {keyword == "s" ? (
              <label className="password-note">
                Use at least 6 characters, do not use empty spaces
              </label>
            ) : (
              <div></div>
            )}
          </div>
          <button
            ref={actionBtn}
            className={`create-account-btn ${validButton ? "active" : ""}`}
            onClick={() => {
              if (validButton) {
                apiCall();
              }
            }}
          >
            {buttonLabel}
          </button>
          <LinksElement keyword={keyword} />
        </section>
      </main>
      <Footer />
    </>
  );
}
