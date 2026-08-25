import { useEffect, useState } from "react";

import {
  getContinueWatching,
} from "@/lib/continueWatching/getContinueWatching";

import { useAuth } from "@/hooks/useAuth";

import AnimeSliderCSR from "../AnimeSlider/AnimeSliderCSR";
import EpisodeCard from "../EpisodeCard/EpisodeCard";
import type { ContinueWatchingItem } from "@/types/animeList";

export default function ContinueWatchingSlider() {
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { user, initialized } = useAuth();

  useEffect(() => {
    if (!initialized) return;

    let cancelled = false;

    async function loadContinueWatching() {
      try {
        setLoading(true);

        const history = await getContinueWatching(user?.id ?? null);

        if (!cancelled) {
          setItems(history);
        }
      } catch (error) {
        console.error("[Continue Watching Slider]", error);

        if (!cancelled) {
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadContinueWatching();

    return () => {
      cancelled = true;
    };
  }, [user?.id, initialized]);

  if (loading || items.length === 0) {
    return null;
  }

  return (
    <section className="latest-episodes-section">
      <div className="latest-episodes-container">
        <div className="latest-episodes-header">
          <div className="latest-episodes-heading">
            <span className="section-badge">▶ Continue Watching</span>

            <h2 className="section-title">Continue Watching</h2>

            <p className="section-subtitle">Pick up where you left off.</p>
          </div>
        </div>

        <section className="slider-content-wrapper">
          <ul className="slider-container">
            {items.map((item) => (
              <EpisodeCard
                key={`${item.animenanoid}-${item.nanoid}`}
                epData={item}
                forCW={true}
              />
            ))}
          </ul>

          <AnimeSliderCSR />
        </section>
      </div>
    </section>
  );
}
