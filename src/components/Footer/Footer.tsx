import './footer.css';

export default function Footer() {
    return (
        <div className="site-footer">
            <a href="/legal/tos/" target="_blank">Terms of Services</a>
            <div className="sf-separator">|</div>
            <a href="/legal/privacy-policy/" target="_blank">Privacy Policies</a>
            <div className="sf-separator">|</div>
            <a href="/legal/about/">About</a>
            <div className="sf-separator">|</div>
            <a href="/legal/credits">Credits</a>
        </div>
    )
}
