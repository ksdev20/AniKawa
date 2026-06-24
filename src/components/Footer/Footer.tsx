import "./footertw.css";

export default function Footer() {
  return (
    <footer>
      <nav aria-label="Footer navigation">
        <ul className="footer-links">
          <li>
            <a href="/legal/tos/" rel="noopener noreferrer" target="_blank">
              Terms of Service
            </a>
          </li>
          <li>
            <a
              href="/legal/privacy-policy/"
              rel="noopener noreferrer"
              target="_blank"
            >
              Privacy Policy
            </a>
          </li>
          <li>
            <a href="/legal/about/">About</a>
          </li>
          <li>
            <a href="/legal/credits">Credits</a>
          </li>
          <li>
            <a href="/legal/contact">Contact</a>
          </li>
          <li>
            <a href="/legal/disclaimer">Disclaimer</a>
          </li>
          <li>
            <a href="/legal/dmca">DMCA</a>
          </li>
          <li>
            <a href="/legal/cookie-policy" className="no-bd">
              Cookie Policy
            </a>
          </li>
        </ul>
      </nav>
      <section className="content-source-notice">
        <div className="notice-inner">
          <h3>Official Content Sources</h3>
          <p>
            AniKawa does not host, upload, or store anime videos on its own
            servers.
          </p>
          <p>
            All video content is embedded from official YouTube channels and
            authorized content providers using publicly available embed
            functionality.
          </p>
          <p>
            Copyright and ownership of all videos remain with their respective
            creators, studios, licensors, broadcasters, and official rights
            holders.
          </p>
        </div>
      </section>
    </footer>
  );
}
