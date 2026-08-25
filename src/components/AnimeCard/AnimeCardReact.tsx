import type { Anime } from "../../types/mergedListTypes";
import { Icon } from "../../icons/icons";
import { getOptimizedImageUrl } from "../../utils/imageSizing";
import "./animecardtw.css";

export default function AnimeCardReact({
  anime,
  forNewPop = false,
  recentlyCompleted
}: {
  anime: Anime;
  forNewPop?: boolean;
  recentlyCompleted?: string | null;
}) {
  const {
    nanoid,
    slug,
    title,
    season_poster = anime?.poster,
    description,
    season,
    seasons,
    anikawaReview,
    score,
    ratedBy,
    genres,
    runtime,
    number_of_episodes,
    status,
  } = anime ?? {};
  const titleAlt = seasons > 1 ? `${title} Season ${season}` : title;
  const ep1Nanoid = anime?.episodes?.[0]?.nanoid;
  const ep1Slug = anime?.episodes?.[0]?.slug;
  if (!title && !season_poster && !nanoid) return null;
  const optImg = getOptimizedImageUrl(season_poster, 342);
  const epLength = number_of_episodes ?? anime.episodes?.length;
  const starCount = Math.round(Number(score) / 2);
  const verdict = anikawaReview?.verdict ?? null;
  const strengths = anikawaReview?.strengths;

  const star = "★";

  return (
    <li className={`anime-card ${forNewPop ? "new-pop-ac" : ""}`}>
      <article
        className={`anime-card-first ${forNewPop ? "new-pop-anime-card" : ""}`}
      >
        <a href={`/show/${nanoid}/${slug}`} className="anime-card-link">
          <span className="sr-only">Go to {title} Anime Page</span>
        </a>
        <img
          className="anime-card-image"
          src={optImg}
          alt={`Cover of ${title}`}
          loading="lazy"
          decoding="async"
        />
        <h2 className="anime-card-title">{titleAlt}</h2>
        <div className="rating-widget">
          <div className="rating-stars">
            <span>{star}</span>
          </div>
          <span className="rating-score">
            {Math.floor(starCount as number)}
          </span>
          <div className="rating-reviews">({ratedBy})</div>
        </div>
        <div className="genres-widget">
          {genres.slice(0, 3).map((genre: string, idx) => (
            <span className="genre-badge" key={idx}>{genre}</span>
          ))}
        </div>
        <div className="episodes-status-widget">
          <span className="episodes-count">{epLength} Eps</span>
          {!isNaN(parseFloat(runtime[0])) && (
            <span className="episode-duration">
              • {runtime.replace("minutes", "mins")}
            </span>
          )}
        </div>
        <section
          className="anime-card-hover"
          style={{ backgroundImage: `url(${optImg})` }}
        >
          <div className="anime-card-hover-details">
            <h3 className="anime-card-hover-title">{titleAlt}</h3>
            <div className="rating-widget">
              <div className="rating-stars">
                <span>{star}</span>
              </div>
              <span className="rating-score">
                {Math.floor(starCount as number)}
              </span>
              <div className="rating-reviews">({ratedBy})</div>
            </div>
            <div className="episodes-status-widget">
              <span className="episodes-count">{epLength} Eps</span>
              {!isNaN(parseFloat(runtime[0])) && (
                <span className="episode-duration">
                  • {runtime.replace("minutes", "mins")}
                </span>
              )}
            </div>
            <span className="status-badge">{status}</span>
            {!verdict && (
              <p className="anime-card-hover-description">{description}</p>
            )}
            {verdict && <p className="hover-verdict">Verdict: {verdict}</p>}
            {strengths && <h4 className="hover-whywatch-title">Why Watch?</h4>}
            {strengths && (
              <ul className="hover-highlights">
                {strengths.slice(0, 3).map((i: string, idx) => (
                  <li key={idx}>{i}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
        <nav className="anime-card-hover-actions">
          <div className="tooltip" data-tip={`Play S${season} E1`}>
            <a
              href={`/episode/${nanoid}/${ep1Nanoid}/${ep1Slug}`}
              aria-label={`Watch ${title} Episode 1`}
            >
              <Icon name="play" size={40} color="#8c52ff" />
            </a>
          </div>
          {/* <div className="tooltip w" data-tip="Add to Watchlist"> */}
            {/* <AnimeWBtn /> */}
          {/* </div> */}
        </nav>
        {recentlyCompleted && <span className="recently-completed-snap">
          {recentlyCompleted}
        </span>}
      </article>
    </li>
  );
}
