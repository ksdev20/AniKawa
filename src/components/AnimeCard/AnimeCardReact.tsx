import type { Anime } from "../../types/mergedListTypes";
import { Icon } from "../../icons/icons";
import { getOptimizedImageUrl } from "../../utils/imageSizing";
import "./animecardtw.css";
import AnimeWBtn from "./AnimeWBtn";

export default function AnimeCardReact({
  anime,
  forNewPop = false,
}: {
  anime: Anime;
  forNewPop: boolean;
}) {
  const {
    nanoid,
    slug,
    title,
    season_poster = anime?.poster,
    description,
    scoreAlt,
    season,
    seasons,
  } = anime ?? {};
  const titleAlt = seasons > 1 ? `${title} Season ${season}` : title;
  const language = "Eng Sub";
  const episodes = anime?.episodes?.length;
  const ep1Slug = anime?.episodes?.[0]?.slug;
  if (!title && !season_poster && !nanoid) return null;
  const optImg = getOptimizedImageUrl(season_poster, 342);
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
        <span className="text-sm text-[gray]">{language}</span>

        <section
          className="anime-card-hover"
          style={{ backgroundImage: `url(${optImg})` }}
        >
          <div className="anime-card-hover-details">
            <h3 className="line-clamp-3 mt-2.5 text-[15px]">{titleAlt}</h3>
            <span className="ach-text">{scoreAlt}</span>
            <div className="ach-text">{episodes} Episodes</div>
            <p className="anime-card-hover-description">
              {description ?? "No description"}
            </p>
          </div>
        </section>
        <nav className="anime-card-hover-actions">
          <div className="tooltip" data-tip={`Play S${season} E1`}>
            <a
              href={`/episode/${nanoid}/${ep1Slug}`}
              aria-label={`Watch ${title} Episode 1`}
            >
              <Icon name="play" size={40} color="#8c52ff" />
            </a>
          </div>
          <div className="tooltip w" data-tip="Add to Watchlist">
            <AnimeWBtn nanoid={nanoid} />
          </div>
        </nav>
      </article>
    </li>
  );
}
