import type { Anime } from "../../filters/mergedListTypes";
import "./animecard.css";
import AnimeWBtn from "./AnimeWBtn";

export default function AnimeCardReact({
  anime,
  forNewPop = false,
}: {
  anime: Anime;
  forNewPop: boolean;
}) {
  const { nanoid, slug } = anime;
  const {
    title,
    season_poster = anime?.poster,
    description,
    scoreAlt,
    season,
    seasons
  } = anime ?? {};
  const titleAlt = seasons > 1 ? `${title} Season ${season}` : title;
  const language =
    anime?.episodes?.[0]?.audio == "ja" ? "Subtitled" : "Sub|Dub";
  const episodes = anime?.episodes?.length;
  const epSlug = anime?.episodes?.[0]?.slug;
  if (!title && !season_poster && !nanoid) return null;
  return (
    <li className={`anime-card ${forNewPop ? "new-pop-ac" : ""}`}>
      <article
        className={`anime-card-first ${forNewPop ? "new-pop-anime-card" : ""}`}
      >
        <a href={`/show/${nanoid}/${slug}`} className="anime-card-link"></a>
        <img
          className="anime-card-image"
          src={season_poster ?? "/anime-image-alt.png"}
          loading="lazy"
          decoding="async"
          alt={`Cover of ${title}`}
        />
        <h2 className="anime-card-title">{titleAlt}</h2>
        <div className="anime-card-language">{language}</div>

        <div
          className="anime-card-hover"
          style={{ backgroundImage: `url(${season_poster})` }}
        >
          <div className="anime-card-hover-details">
            <h3 className="anime-card-hover-title">{titleAlt}</h3>
            <div className="anime-card-hover-rating">{scoreAlt}</div>
            <div className="anime-card-hover-episodes">{episodes} Episodes</div>
            <p className="anime-card-hover-description">
              {description ?? "No description"}
            </p>
          </div>
        </div>
        <div className="anime-card-hover-actions">
          <div className="tooltip" data-tip="Play S1 E1">
            <a
              href={`/episode/${nanoid}/${epSlug}`}
              aria-label={`Watch ${title} Episode 1`}
            >
              <svg
                className="card-action-play"
                xmlns="http://www.w3.org/2000/svg"
                height="35px"
                viewBox="0 -960 960 960"
                width="35px"
                fill="#8c52ff"
              >
                <path d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z"></path>
              </svg>
            </a>
          </div>
          <div className="tooltip w" data-tip="Add to Watchlist">
            <AnimeWBtn nanoid={nanoid} />
          </div>
        </div>
      </article>
    </li>
  );
}
