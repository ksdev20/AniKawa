import { useEffect, useState } from "react";
import "@/styles/components/Loaders/episode-card-skeletons.css";
import '@/styles/components/HomePage/continue-watching.css';
import EpisodeCard from "../EpisodeCard/EpisodeCard";
import AnimeSliderCSR from "../AnimeSlider/AnimeSliderCSR";

import { useAuth } from "@/hooks/useAuth";
import { getContinueWatching } from "@/lib/continueWatching/getContinueWatching";
import type { ResolvedPublicEpisode } from "@/types/profile";

import {
  PlayCircleIcon,
  ClockCountdownIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";

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

  /* ================================================================
     LOADING
     ================================================================ */

  if (!initialized || loading) {
    return (
      <section
        className="continue-watching"
        aria-labelledby="continue-watching-title"
      >
        <div className="continue-watching-container">
          <header className="continue-watching-header">
            <div className="continue-watching-heading">
              <span className="continue-watching-kicker">
                <PlayCircleIcon size={15} weight="duotone" />
                Your queue
              </span>

              <h2
                id="continue-watching-title"
                className="continue-watching-title"
              >
                Continue Watching
              </h2>

              <p className="continue-watching-subtitle">
                Pick up exactly where you left off.
              </p>
            </div>

            <a href="/history" className="continue-watching-history">
              <ClockCountdownIcon size={17} weight="duotone" />
              <span>Watch history</span>
              <ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
            </a>
          </header>

          <div className="continue-watching-slider">
            <ul className="continue-watching-list">
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

  /* ================================================================
     EMPTY
     ================================================================ */

  if (initialized && !loading) {
    if (!items || items.length < 1) return null;
  }

  /* ================================================================
     CONTENT
     ================================================================ */

  return (
    <section
      className="continue-watching"
      aria-labelledby="continue-watching-title"
    >
      <div className="continue-watching-container">
        <header className="continue-watching-header">
          <div className="continue-watching-heading">
            <span className="continue-watching-kicker">
              <PlayCircleIcon size={15} weight="duotone" />
              Your queue
            </span>

            <h2
              id="continue-watching-title"
              className="continue-watching-title"
            >
              Continue Watching
            </h2>

            <p className="continue-watching-subtitle">
              Pick up exactly where you left off.
            </p>
          </div>

          <a href="/history" className="continue-watching-history">
            <ClockCountdownIcon size={17} weight="duotone" />
            <span>Watch history</span>
            <ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
          </a>
        </header>

        <div className="continue-watching-slider">
          <ul className="continue-watching-list">
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
