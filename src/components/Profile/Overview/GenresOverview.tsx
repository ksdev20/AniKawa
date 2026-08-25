import type { AnimeRecord } from "@/lib/anime/types";
import type { PublicContinueWatching } from "@/types/profile";

import { getTopGenres } from "@/utils/getTopGenres";

interface Props {
  continueWatching: PublicContinueWatching[];
  animeRecords: AnimeRecord[];
    isOwner?: boolean;

}

export default function GenreOverview({
  continueWatching,
  animeRecords,
  isOwner = false
}: Props) {
  if (!continueWatching.length || !animeRecords.length) {
    return null;
  }

  const topGenres = getTopGenres(continueWatching, animeRecords);

  if (!topGenres.length) {
    return null;
  }

  return (
    <section className="genre-overview-card">
      <header className="genre-overview-card__header">
        <h2>Genre Overview</h2>

        <p>{isOwner ? "Your anime taste based on recent watches" :"Their anime taste based on recent watches"}</p>
      </header>

      <div className="genre-overview-card__list">
        {topGenres.map((genre) => (
          <div key={genre.genre} className="genre-overview-card__item">
            <div className="genre-overview-card__top">
              <span>{genre.genre}</span>

              <span>{genre.percentage}%</span>
            </div>

            <div className="genre-overview-card__bar">
              <div
                className="genre-overview-card__fill"
                style={{
                  width: `${genre.percentage}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
