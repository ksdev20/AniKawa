import { useEffect, useRef, useState } from "react";
import { Icon } from "@/icons/icons";

const RESET_DELAY = 2000;

type ShareAnikawaCSRProps = {
  url: string;
};

export default function ShareAnikawaCSR({ url }: ShareAnikawaCSRProps) {
  const [label, setLabel] = useState("Share AniKawa");
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "AniKawa — Discover Your Next Favorite Anime",
          text: "🎌 Looking for your next favorite anime? Discover handpicked recommendations, hidden gems, reviews, and more on AniKawa!",
          url,
        });

        return;
      }

      if (!navigator.clipboard) {
        return;
      }

      await navigator.clipboard.writeText(url);

      setLabel("Link Copied!");

      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setLabel("Share AniKawa");
      }, RESET_DELAY);
    } catch {
      // User cancelled sharing or clipboard permission denied.
    }
  }

  return (
    <button
      type="button"
      title="Click to Share AniKawa"
      className="share-primary-btn"
      onClick={handleShare}
    >
      <Icon name="share" color="#ffffff" />
      <span>{label}</span>
    </button>
  );
}
