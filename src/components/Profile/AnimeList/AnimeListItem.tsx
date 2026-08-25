import { PROFILE_STATUS_CONFIG, type RpcAnimeList } from "@/types/animeList";
import AnimeListEditModal from "./AnimeListEditModal";

interface Props {
  anime: RpcAnimeList;
  canEdit: boolean;
}

export default function AnimeListItem({ anime, canEdit }: Props) {
  const episodes = anime.number_of_episodes ?? anime.episodes?.length ?? 0;

  const progress = episodes
    ? Math.min(100, Math.round((anime.userAnime.progress / episodes) * 100))
    : 0;

  const getGenreUrl = (genre: string) =>
    genre.trim()[0].toUpperCase() + genre.slice(1);

  const statusConfig = PROFILE_STATUS_CONFIG[anime.userAnime.status];

  const StatusIcon = statusConfig.icon;

  return (
    <article className="anime-list__item">
      <div className="anime-list__poster">
        <img src={anime.poster} alt={anime.title} loading="lazy" />

        <a
          href={`/show/${anime.nanoid}/${anime.slug}`}
          className="anime-list__poster-overlay"
        >
          <span>OPEN</span>
        </a>
      </div>

      <div className="anime-list__item-main">
        <div className="anime-list__item-top">
          <div>
            <div className="anime-list__meta-line">
              <span>{anime.format ?? "Unknown Format"}</span>
              <i />
              <span>{anime.year ?? anime.startDate?.split("-")[0] ?? "—"}</span>
              <i />
              <span>{anime.country ?? "Unknown Country"}</span>
            </div>

            <a href={`/show/${anime.nanoid}/${anime.slug}`}>
              <h3>{anime.title}</h3>
            </a>
          </div>

          <div className="anime-list__item-actions">
            <div className="anime-list__score">
              <span>★</span>
              {anime.userAnime.score != null
                ? anime.userAnime.score.toFixed(1)
                : "—"}
            </div>

            {canEdit && (
              <AnimeListEditModal
                anime={anime}
                opBtnClass="anime-list__options"
              />
            )}
          </div>
        </div>

        {anime.badge && (
          <span className="anime-list__badge">{anime.badge}</span>
        )}

        <p className="anime-list__description">{anime.description}</p>

        <div className="anime-list__item-bottom">
          <div className="anime-list__progress-wrap">
            <div className="anime-list__progress-info">
              <span
                className={[
                  "anime-list__detail-status",
                  statusConfig.className,
                ].join(" ")}
              >
                <span className="anime-list__detail-status-icon">
                  <StatusIcon size={18} weight="fill" aria-hidden="true" />
                </span>

                <span className="anime-list__detail-status-label">
                  {statusConfig.label}
                </span>
              </span>

              <strong>
                {anime.userAnime.progress}/{episodes}
              </strong>
            </div>

            <div className="anime-list__progress">
              <span
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>

          <div className="anime-list__genres">
            {anime.genres?.slice(0, 3).map((genre) => (
              <a href={`/category/${getGenreUrl(genre)}`} key={genre} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
