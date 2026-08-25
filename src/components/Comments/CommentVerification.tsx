"use client";

import { useEffect, useRef } from "react";

import { useCommentsStore } from "@/lib/comments/commentsStore";

const SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_COMMENT_SITE_KEY;

type Turnstile = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;

      callback(token: string): void;

      "expired-callback"(): void;

      "error-callback"(): void;
    },
  ) => string;

  remove(widgetId: string): void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

export default function CommentVerification() {
  const setTurnstileToken = useCommentsStore(
    (state) => state.setTurnstileToken,
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!SITE_KEY) {
      return;
    }

    let cancelled = false;

    const renderWidget = () => {
      if (
        cancelled ||
        widgetId.current ||
        !containerRef.current ||
        !window.turnstile
      ) {
        return;
      }

      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,

        callback(token) {
          setTurnstileToken(token);
        },

        "expired-callback"() {
          setTurnstileToken("");
        },

        "error-callback"() {
          setTurnstileToken("");
        },
      });
    };

    renderWidget();

    if (widgetId.current) {
      return;
    }

    const interval = window.setInterval(() => {
      renderWidget();

      if (widgetId.current) {
        window.clearInterval(interval);
      }
    }, 100);

    return () => {
      cancelled = true;

      window.clearInterval(interval);

      setTurnstileToken("");

      if (window.turnstile && widgetId.current) {
        window.turnstile.remove(widgetId.current);
      }

      widgetId.current = null;
    };
  }, [setTurnstileToken]);

  if (!SITE_KEY) {
    return null;
  }

  return <div ref={containerRef} className="comment-verification" />;
}
