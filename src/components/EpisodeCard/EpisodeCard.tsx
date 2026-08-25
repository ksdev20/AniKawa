import { episodeCardNullImg } from "@/global_assets/globalPaths";
import { Icon } from "../../icons/icons";
import "./episode-cardtw.css";

interface Props {
  epData: any;
  forCW?: boolean;
  showWatchedTill?: boolean;
}

export default function EpisodeCard({
  epData,
  forCW = false,
  showWatchedTill = false,
}: Props) {
  if (!epData) return null;

  const {
    animeTitle = "Anime Title N/A",
    language = "Language N/A",
    animenanoid,
    slug,
    epNum,
    nanoid,

    badge,
    vote_average,
    air_date,
    runtime,
    arc,
    watchReason,
    highlights = [],
    featuredCharacters = [],
    userStats,
  } = epData;

  const { watched_seconds, duration_seconds, anime_id, episode_nanoid } =
    userStats ?? {};

  const progress =
    watched_seconds > 0 && duration_seconds > 0
      ? Math.min((watched_seconds / duration_seconds) * 100, 100)
      : 0;

  const isCompleted =
    duration_seconds > 0 && watched_seconds / duration_seconds >= 0.9;
  const {
    titleAlt = `Episode ${epNum}`,
    img = epData?.img ?? epData?.ytThumbnail ?? "/episode-thumbnail-alt-2.png",
  } = epData;

  const airDate = air_date
    ? new Date(air_date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;


  return (
    <li className="episode-card">
      <article className="episode-card-first">
        {/* NORMAL STATE */}

        <div className="episode-normal">
          <div className="episode-image-wrapper">
            <img
              className="episode-card-image"
              src={img ?? episodeCardNullImg}
              loading="lazy"
              decoding="async"
              alt={`Episode ${titleAlt} Cover From ${animeTitle}`}
            />

            <div className="episode-image-top">
              {badge && <span className="episode-badge">{badge}</span>}

              {vote_average > 0 && (
                <span className="episode-rating">★ {vote_average}</span>
              )}
            </div>
          </div>

          <div className="episode-content">
            <div className="anime-title">{animeTitle}</div>

            <h2 className="episode-number-name">{titleAlt}</h2>

            <div className="episode-meta">
              {airDate && <span>📅 {airDate}</span>}

              {runtime && <span>⏱ {runtime}</span>}

              <span className="language-section">{language}</span>
            </div>

            {forCW && (
              <div className="continue-progress-wrapper">
                <div
                  className="continue-progress-bar"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            )}

            {forCW && !showWatchedTill && (
              <p className="continue-time">
                {isCompleted
                  ? "↻ Rewatch"
                  : `▶ Resume ${Math.floor(watched_seconds / 60)}:${String(
                      watched_seconds % 60,
                    ).padStart(2, "0")}`}
              </p>
            )}

            {forCW && showWatchedTill && (
              <p className="continue-time">
                {isCompleted
                  ? "✓ Watched till end"
                  : `Watched till ${Math.floor(watched_seconds / 60)}:${String(
                      watched_seconds % 60,
                    ).padStart(2, "0")}`}
              </p>
            )}

            {!forCW && highlights.length > 0 && (
              <div className="highlight-list">
                {highlights.slice(0, 3).map((item: string, index: number) => (
                  <span className="highlight-chip" key={index}>
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* HOVER STATE */}

        <div className="episode-card-hover">
          <div className="anime-title">{animeTitle}</div>

          <div className="episode-number-name">{titleAlt}</div>

          {watchReason && (
            <div className="watch-reason">
              <span>Why Watch?</span>

              <p>{watchReason}</p>
            </div>
          )}

          {arc && <div className="hover-info">📖 Arc: {arc}</div>}

          {featuredCharacters.length > 0 && (
            <div className="hover-info">
              👥 Featured Characters: {featuredCharacters.join(" • ")}
            </div>
          )}

          {highlights.length > 0 && (
            <div className="highlight-list">
              {highlights.map((item: string, index: number) => (
                <span className="highlight-chip" key={index}>
                  {item}
                </span>
              ))}
            </div>
          )}

          <div className="episode-play-btn">
            <Icon name="play" size={24} color="#8c52ff" />
            {forCW
              ? isCompleted
                ? "Watch Again"
                : "Continue Watching"
              : "Watch Episode"}
          </div>
        </div>

        <a
          href={`/episode/${animenanoid ?? anime_id}/${nanoid ?? episode_nanoid}/${slug}`}
          className="episode-card-link"
        >
          <div className="sr-only">
            Go to Episode {epNum} of Anime {animeTitle}
          </div>
        </a>
      </article>
    </li>
  );
}
