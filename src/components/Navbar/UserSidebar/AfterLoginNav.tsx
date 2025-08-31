import { Icon } from "../../../icons/icons";
import { alnItems } from "../config/items";
import type { AfterLoginProps } from "../NavbarTs/navbar";

const backendUrl = import.meta.env.PUBLIC_BACKEND_URL;

export function logout() {
  fetch(`${backendUrl}/api/logout`, {
    method: "POST",
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        console.log("Successfully logged out ✅");
        localStorage.clear();
        const loc = window.location;
        loc.pathname.includes("profile") ||
        loc.pathname.includes("watchlist") ||
        loc.pathname.includes("history")
          ? (loc.href = "/")
          : loc.reload();
      }
    })
    .catch((e) => {
      console.error(e.message);
    });
}

export default function AfterLoginNav({
  userData,
  clickHandler,
  closeFn,
}: AfterLoginProps) {
  return (
    <nav id="after-login" className={`corner-box`}>
      <a
        id="person-first-btn"
        aria-label="Profile Page"
        href="/profile"
        className="corner-box-btn cbb-account bd-bottom"
      >
        <div className="account-box">
          <img
            className="account-pic"
            src={
              userData?.profilePic ??
              "https://s4.anilist.co/file/anilistcdn/character/large/b88572-IzTwXEHSobRs.jpg"
            }
            alt={`Profile picture of logged in user ${userData?.profileName}`}
            loading="lazy"
            decoding="async"
          />
          <div className="account-name">
            {userData?.profileName || "Username"}
          </div>
        </div>
        <Icon name="manage-account" size={26} />
      </a>
      {alnItems.map((obj, i) => {
        const { label } = obj;
        const lowered = label.toLowerCase();
        const isLast = i == alnItems.length - 1;
        return (
          <button
            key={i}
            aria-label={label}
            className="corner-box-btn cbb-whl"
            onClick={() => {
              clickHandler(lowered);
            }}
            onKeyDown={
              isLast
                ? (e) => {
                    closeFn(e);
                  }
                : (e) => {}
            }
          >
            <Icon name={lowered} size={26} />
            <div className="cbt-white">{label}</div>
          </button>
        );
      })}
    </nav>
  );
}
