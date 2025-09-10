import { Icon } from "../../../icons/icons";
import { alnItems } from "../../../config/navItems";
import type { AfterLoginProps } from "../../../types/navbarTypes";

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
              "https://ik.imagekit.io/nwstforna/avatars/a1.jpg"
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
            onKeyDown={isLast ? closeFn : undefined}
          >
            <Icon name={lowered} size={26} />
            <div className="cbt-white">{label}</div>
          </button>
        );
      })}
    </nav>
  );
}
