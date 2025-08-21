import "./footer.css";

export default function Footer() {
  return (
    <footer>
      <nav aria-label="Footer navigation">
        <ul className="footer-links">
          <li><a href="/legal/tos/" rel="noopener noreferrer" target="_blank">Terms of Service</a></li>
          <li><a href="/legal/privacy-policy/" rel="noopener noreferrer" target="_blank">Privacy Policy</a></li>
          <li><a href="/legal/about/">About</a></li>
          <li><a href="/legal/credits" className="no-bd">Credits</a></li>
        </ul>
      </nav>
      <p className="footer-disclaimer">Anikawa is a fan-powered, non-commercial project. We are not affiliated with, endorsed by, or officially connected to any anime studios, publishers, or licensors. All trademarks and copyrights belong to their respective owners.</p>
    </footer>
  );
}
