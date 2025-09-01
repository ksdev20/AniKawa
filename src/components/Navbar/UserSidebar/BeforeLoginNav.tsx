import { blnItems } from "../config/items";
import type { BeforeLoginProps } from "../NavbarTs/navbar";

export default function BeforeLoginNav({closeFn}: BeforeLoginProps) {
  return (
    <nav id="before-login" className="corner-box">
      {blnItems.map((obj, i) => {
        const { h1, h2, label, href } = obj;
        return (
          <a
            id={i == 0 ? "person-first-btn" : undefined}
            key={i}
            aria-label={label}
            className="corner-box-btn"
            href={href}
            onKeyDown={i == 1 ? closeFn : undefined}
          >
            <div className="corner-box-btn-text">
              <div className="cbt-white">{h1}</div>
              <div className="cbt-gray">{h2}</div>
            </div>
          </a>
        );
      })}
    </nav>
  );
}
