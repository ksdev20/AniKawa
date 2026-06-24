import { useEffect } from "react";

export default function AdsSnippet() {
  useEffect(() => {});

  return (
    <div className="block">
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4788349295521290"
        crossOrigin="anonymous"
      ></script>
      <ins
        className="adsbygoogle"
        data-ad-format="fluid"
        data-ad-layout-key="-5i+bu-1o-3w+ua"
        data-ad-client="ca-pub-4788349295521290"
        data-ad-slot="7393299071"
      ></ins>
      <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
    </div>
  );
}
