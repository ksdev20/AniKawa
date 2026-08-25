import { useEffect, useState } from "react";
import "@/styles/components/Loaders/episode-card-skeletons.css";
import EpisodeCard from "../EpisodeCard/EpisodeCard";
import AnimeSliderCSR from "../AnimeSlider/AnimeSliderCSR";

import { useAuth } from "@/hooks/useAuth";
import { getContinueWatching } from "@/lib/continueWatching/getContinueWatching";
import type { ResolvedPublicEpisode } from "@/types/profile";

export default function ContinueWatchingSlider() {
  const { user, initialized } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ResolvedPublicEpisode[] | null>(null);

  useEffect(() => {
    if (!initialized) return;
    setLoading(true);
    getContinueWatching(user?.id ?? null).then((i) => {
      setItems(i);
      setLoading(false);
    });
  }, [initialized, user?.id]);

  if (!initialized || loading) {
    return (
      <section
        className="latest-episodes-section"
        aria-labelledby="continue-watching-title"
      >
        <div className="latest-episodes-container">
          <header className="latest-episodes-header">
            <div className="latest-episodes-heading">
              <span className="section-badge">▶ Continue Watching</span>

              <h2 id="continue-watching-title" className="section-title">
                Continue Watching
              </h2>

              <p className="section-subtitle">Pick up where you left off.</p>
            </div>

            <a href="/history" className="latest-episodes-view-all">
              View History
              <span aria-hidden="true">→</span>
            </a>
          </header>

          <div className="slider-content-wrapper">
            <ul className="slider-container">
              {[1, 2, 3, 4, 5].map((i) => (
                <li key={i} className="episode-card episode-card--skeleton">
                  <article className="episode-card-first episode-card-skeleton">
                    <div className="episode-skeleton-image" />

                    <div className="episode-skeleton-content">
                      <div className="episode-skeleton-line episode-skeleton-line--title" />

                      <div className="episode-skeleton-line episode-skeleton-line--name" />
                      <div className="episode-skeleton-line episode-skeleton-line--name-short" />

                      <div className="episode-skeleton-meta">
                        <div className="episode-skeleton-line episode-skeleton-line--meta" />
                        <div className="episode-skeleton-line episode-skeleton-line--meta-short" />
                        <div className="episode-skeleton-pill" />
                      </div>

                      <div className="episode-skeleton-progress" />

                      <div className="episode-skeleton-time" />
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    );
  }

  if (initialized && !loading) {
    if (!items || items?.length < 1) return null;
  }

  return (
    <section
      className="latest-episodes-section"
      aria-labelledby="continue-watching-title"
    >
      <div className="latest-episodes-container">
        <header className="latest-episodes-header">
          <div className="latest-episodes-heading">
            <span className="section-badge">▶ Continue Watching</span>

            <h2 id="continue-watching-title" className="section-title">
              Continue Watching
            </h2>

            <p className="section-subtitle">Pick up where you left off.</p>
          </div>

          <a href="/history" className="latest-episodes-view-all">
            View History
            <span aria-hidden="true">→</span>
          </a>
        </header>

        <div className="slider-content-wrapper">
          <ul className="slider-container">
            {items?.slice(0, 20).map((item) => (
              <EpisodeCard
                key={`${item.animenanoid}-${item.nanoid}`}
                epData={item}
                forCW={true}
              />
            ))}
          </ul>

          <AnimeSliderCSR />
        </div>
      </div>
    </section>
  );
}
