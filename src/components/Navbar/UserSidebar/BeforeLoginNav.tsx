import { blnItems } from "../config/items";

export default function BeforeLoginNav() {
  return (
    <nav id="before-login" className="corner-box">
      {blnItems.map((obj, i) => {
        const { h1, h2, label, href } = obj;
        return (
          <a key={i} aria-label={label} className="corner-box-btn" href={href}>
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
