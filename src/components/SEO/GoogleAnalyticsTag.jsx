import { useEffect } from 'react';

export function GoogleAnalyticsTag() {
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());

    gtag('config', 'G-TV7KYTR6Z1');
  }, []);
  return (
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-TV7KYTR6Z1"></script>
  );
}
