import { Icon } from "../../icons/icons";
import EDelBtn from "./EcDatabaseContact/EDelBtn";
import "./episode-cardtw.css";
export default function EpisodeCard({
  epData,
  forHistory = false,
}: {
  epData: any;
  forHistory?: boolean;
}) {
  const {
    animeTitle = "Anime Title N/A",
    language = "Language N/A",
    animenanoid,
    slug,
    epNum,
  } = epData;
  const { titleAlt, description = "No description" } = epData ?? [];
  const img =
    epData?.img ?? epData.ytThumbnail ?? "/episode-thumbnail-alt-2.png";
  return (
    <li className="episode-card">
      <article className="episode-card-first">
        <img
          className="episode-card-image"
          src={img ?? "/episode-thumbnail-alt-2.png"}
          loading="lazy"
          decoding="async"
          alt={`Episode ${titleAlt} Cover From ${animeTitle}`}
        />
        <div className="anime-title">{animeTitle}</div>
        <h2 className="episode-number-name">{titleAlt}</h2>
        <p className="language-section">{language}</p>

        <div className="episode-card-hover">
          <div className="anime-title">{animeTitle}</div>
          <div className="episode-number-name">{titleAlt}</div>
          <p
            className="episode-number-name episode-description"
            dangerouslySetInnerHTML={{ __html: description }}
          ></p>
          <div className="episode-play-btn">
            <Icon name="play" size={40} color="#8c52ff" />
            Click to Play
          </div>
        </div>
        <a
          href={`/episode/${animenanoid}/${slug}`}
          className="episode-card-link"
        ></a>
      </article>
      {forHistory && (
        <EDelBtn animenanoid={animenanoid} slug={slug}/>
      )}
    </li>
  );
}
