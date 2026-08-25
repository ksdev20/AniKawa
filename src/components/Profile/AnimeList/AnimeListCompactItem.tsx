import { EyesIcon } from "@phosphor-icons/react";
import type { RpcAnimeList } from "@/types/animeList";
import AnimeListEditModal from "./AnimeListEditModal";

interface Props {
  anime: RpcAnimeList;
  canEdit: boolean;
}

export default function AnimeListCompactItem({ anime, canEdit }: Props) {
  const episodes = anime.number_of_episodes ?? anime.episodes?.length ?? 0;

  const progress = episodes
    ? Math.min(100, Math.round((anime.userAnime.progress / episodes) * 100))
    : 0;

  return (
    <article className="anime-list__compact-item">
      <div className="anime-list__compact-title">
        <span className="anime-list__compact-number">
          {anime.userAnime.status === "watching" && (
            <EyesIcon size={24} color="green" />
          )}
        </span>

        <div className="anime-list__compact-hover-poster">
          <img src={anime.poster} alt="" />
        </div>

        <h3>{anime.title}</h3>
      </div>

      <span className="anime-list__compact-score">
        {anime.userAnime.score != null ? (
          <>★ {anime.userAnime.score.toFixed(1)}</>
        ) : (
          "—"
        )}
      </span>

      <span className="anime-list__compact-progress">
        {anime.userAnime.progress}/{episodes}
        <small>{progress}%</small>
      </span>

      <span className="anime-list__compact-type">
        {anime.format ?? "Unknown"}
      </span>

      <div className="anime-list__compact-actions">
        {canEdit && (
          <AnimeListEditModal anime={anime} opBtnClass="anime-list__options" />
        )}
      </div>
    </article>
  );
}
