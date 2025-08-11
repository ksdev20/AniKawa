export default function BeforeLoginNav() {
  return (
    <nav
      id="before-login"
      className="corner-box"
    >
      <a
        aria-label="Signup"
        className="corner-box-btn"
        id="signup-btn"
        href="/signup/"
      >
        <div className="corner-box-btn-text">
          <div className="cbt-white">Create Account</div>
          <div className="cbt-gray">Join for free !</div>
        </div>
      </a>
      <a
        aria-label="Login"
        className="corner-box-btn"
        id="login-btn"
        href="/login/"
      >
        <div className="corner-box-btn-text">
          <div className="cbt-white">Log In</div>
          <div className="cbt-gray">
            Welcome back to Anikawa !
          </div>
        </div>
      </a>
    </nav>
  );
}
