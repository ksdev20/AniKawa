import { useEffect, useState } from "react";
import '@/styles/components/Loaders/anime-card-skeletons.css';
import type { Anime } from "@/lib/anime";

import { getRecentlyWatched } from "@/lib/recentlyWatched/getRecentlyWatched";

import { useAuth } from "@/hooks/useAuth";

import AnimeSliderCSR from "./AnimeSliderCSR";
import AnimeCardReact from "../AnimeCard/AnimeCardReact";

import "./anime-slidertw.css";

interface ASCProps {
  info: {
    bigH?: string;
    smallH?: string;

    forRW?: boolean;

    forProfile?: boolean;

    list?: Anime[];
  };
}

export function AnimeSliderClient({ info }: ASCProps) {
  const { bigH, smallH, forRW, forProfile, list } = info;

  const { user, initialized } = useAuth();

  const [animeArray, setAnimeArray] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(forRW === true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadRecentlyWatched() {
      /*
       * ------------------------------------------------------------------
       * Static / supplied list
       * ------------------------------------------------------------------
       */

      if (!forRW) {
        if (mounted) {
          setAnimeArray(list ?? []);
          setLoading(false);
          setError(null);
        }

        return;
      }

      /*
       * ------------------------------------------------------------------
       * Wait for auth initialization
       * ------------------------------------------------------------------
       */

      if (!initialized) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const history = await getRecentlyWatched(user?.id ?? null);

        if (!mounted) return;

        setAnimeArray(history);
        setError(null);
      } catch (error) {
        console.error("[Recently Watched] Failed to load:", error);

        if (!mounted) return;

        setAnimeArray([]);
        setError("Unable to load recently watched.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadRecentlyWatched();

    return () => {
      mounted = false;
    };
  }, [forRW, initialized, user?.id, list]);

  /*
   * ----------------------------------------------------------------------
   * Loading
   * ----------------------------------------------------------------------
   */

  if (loading || (forRW && !initialized)) {
    return (
      <section className="anime-slider-section">
        <header className="slider-heading">
          <h2 className="slider-section-text-big">{bigH}</h2>

          <h3 className="slider-section-text-small">{smallH}</h3>

          {forProfile && <a href="/recently-watched">View all</a>}
        </header>

        <section className="slider-content-wrapper">
          <ul className="slider-container">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <li key={i} className="anime-card anime-card--skeleton">
                <article className="anime-card-first anime-card-skeleton">
                  <div className="anime-card-skeleton-image" />

                  <div className="anime-card-skeleton-title">
                    <span />
                    <span />
                  </div>

                  <div className="anime-card-skeleton-rating">
                    <span className="anime-card-skeleton-star" />
                    <span className="anime-card-skeleton-score" />
                    <span className="anime-card-skeleton-reviews" />
                  </div>

                  <div className="anime-card-skeleton-genres">
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="anime-card-skeleton-meta">
                    <span />
                    <span />
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>
      </section>
    );
  }

  /*
   * ----------------------------------------------------------------------
   * Error
   * ----------------------------------------------------------------------
   */

  if (error) {
    return (
      <section className="anime-slider-section">
        <header className="slider-heading">
          <h2 className="slider-section-text-big">{bigH}</h2>

          <h3 className="slider-section-text-small">{smallH}</h3>

          {forProfile && <a href="/recently-watched">View all</a>}
        </header>

        <div className="anime-slider-error">
          <p>{error}</p>

          <button
            type="button"
            onClick={() => {
              setError(null);
              setLoading(true);

              void getRecentlyWatched(user?.id ?? null)
                .then((history) => {
                  setAnimeArray(history);
                })
                .catch((error) => {
                  console.error("[Recently Watched] Retry failed:", error);

                  setAnimeArray([]);
                  setError("Unable to load recently watched.");
                })
                .finally(() => {
                  setLoading(false);
                });
            }}
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  /*
   * ----------------------------------------------------------------------
   * Loaded but empty
   * ----------------------------------------------------------------------
   */

  if (initialized && !loading && animeArray.length === 0) {
    return null;
  }

  /*
   * ----------------------------------------------------------------------
   * Render
   * ----------------------------------------------------------------------
   */

  return (
    <section className="anime-slider-section">
      <header className="slider-heading">
        <h2 className="slider-section-text-big">{bigH}</h2>

        <h3 className="slider-section-text-small">{smallH}</h3>

        {forProfile && <a href="/recently-watched">View all</a>}
      </header>

      <section className="slider-content-wrapper">
        <ul className="slider-container">
          {animeArray.slice(0, 20).map((anime) => (
            <AnimeCardReact
              key={anime.nanoid}
              anime={anime}
              forNewPop={false}
            />
          ))}
        </ul>

        <AnimeSliderCSR />
      </section>
    </section>
  );
}
