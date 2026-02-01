import { useEffect } from 'react';

export function GoogleAnalyticsTag() {
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag("js", new Date());

    gtag("config", "G-KH21EQ579T");
  }, []);
  return (
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-KH21EQ579T"></script>
  );
}
