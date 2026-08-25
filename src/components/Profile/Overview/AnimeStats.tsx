import type { AnimeRecord } from "@/lib/anime/types";
import type { PublicContinueWatching } from "@/types/profile";
import { getAnimeStats } from "@/utils/getAnimeStats";

interface Props {
  continueWatching: PublicContinueWatching[];
  animeRecords: AnimeRecord[];
}

export default function AnimeStats({ continueWatching, animeRecords }: Props) {
  if (!continueWatching.length) return null;

  const stats = getAnimeStats(continueWatching, animeRecords);

  return (
    <section className="anime-stats">
      <div className="anime-stats__header">
        <h2>Anime Stats</h2>

        <span>Lifetime</span>
      </div>

      <div className="anime-stats__primary">
        <div className="anime-stats__circle">
          <strong>{stats.totalAnime}</strong>

          <span>Anime</span>
        </div>

        <div className="anime-stats__score">
          <strong>{stats.meanScore ?? "N/A"}</strong>

          <span>Mean Score</span>
        </div>
      </div>

      <div className="anime-stats__grid">
        <Stat value={stats.daysWatched} label="Days Watched" />

        <Stat value={stats.totalEpisodes} label="Episodes" />

        <Stat value={stats.uniqueGenres} label="Genres" />

        <Stat value={stats.topGenre?.name ?? "-"} label="Top Genre" />
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="anime-stat">
      <strong>{value}</strong>

      <span>{label}</span>
    </div>
  );
}
