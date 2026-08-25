import { useEffect, useRef } from "react";

export default function TurnstileWidget({
  onVerify,
}: {
  onVerify: (token: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (isLocal) {
      onVerify("dev-token");
      return;
    }

    function renderTurnstile() {
      if (ref.current && (window as any).turnstile) {
        (window as any).turnstile.render(ref.current, {
          sitekey: "0x4AAAAAAD34ad_MXhB7qGGM",

          callback(token: string) {
            onVerify(token);
          },
        });
      }
    }

    if ((window as any).turnstile) {
      renderTurnstile();
    } else {
      const interval = setInterval(() => {
        if ((window as any).turnstile) {
          clearInterval(interval);

          renderTurnstile();
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, []);

  return <div ref={ref} className="cf-turnstile" />;
}
