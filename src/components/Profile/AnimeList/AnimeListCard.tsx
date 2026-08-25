import { PROFILE_STATUS_CONFIG, type RpcAnimeList } from "@/types/animeList";
import AnimeListEditModal from "./AnimeListEditModal";

interface Props {
  anime: RpcAnimeList;
  canEdit: boolean;
}

export default function AnimeListCard({ anime, canEdit }: Props) {
  const episodes =
    anime.number_of_episodes ?? anime.episodes?.length ?? null;

  const currentProgress = Math.max(0, anime.userAnime.progress ?? 0);

  const progress =
    episodes && episodes > 0
      ? Math.min(100, (currentProgress / episodes) * 100)
      : 0;

  const statusConfig = PROFILE_STATUS_CONFIG[anime.userAnime.status];
  const StatusIcon = statusConfig.icon;

  const year =
    anime.year ??
    (anime.startDate
      ? new Date(anime.startDate).getFullYear()
      : null);

  const progressLabel =
    episodes && episodes > 0
      ? `${Math.min(currentProgress, episodes)}/${episodes}`
      : `${currentProgress}/—`;

  const score =
    anime.userAnime.score != null
      ? anime.userAnime.score.toFixed(1)
      : "—";

  return (
    <article className="anime-list__card">
      <div className="anime-list__card-image">
        <img
          src={anime.poster}
          alt={anime.title}
          loading="lazy"
        />

        <div className="anime-list__card-shade" />

        <div
          className="anime-list__card-score"
          aria-label={`Score: ${score}`}
        >
          ★ {score}
        </div>

        {canEdit && (
          <AnimeListEditModal
            anime={anime}
            opBtnClass="anime-list__card-options"
          />
        )}

        <div className="anime-list__progress-info">
          <span
            className={[
              "anime-list__detail-status",
              "al-card",
              statusConfig.className,
            ].join(" ")}
          >
            <span className="anime-list__detail-status-icon">
              <StatusIcon
                size={18}
                weight="fill"
                aria-hidden="true"
              />
            </span>

            <span className="anime-list__detail-status-label">
              {statusConfig.label}
            </span>
          </span>
        </div>
      </div>

      <div className="anime-list__card-content">
        <div>
          <h3 title={anime.title}>{anime.title}</h3>

          <span>
            {year ?? "—"} · {anime.format ?? "Unknown Format"}
          </span>
        </div>

        <div className="anime-list__card-progress">
          <span>{progressLabel}</span>

          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={episodes ?? 0}
            aria-valuenow={
              episodes ? Math.min(currentProgress, episodes) : 0
            }
            aria-label={`${anime.title} progress`}
          >
            <span
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}