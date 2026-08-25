import "@/styles/components/PublicProfile/anime-personality.css";

import type { AnimeRecord } from "@/lib/anime/types";
import type {
  PublicContinueWatching,
  PublicFavorite,
  PublicStats,
} from "@/types/profile";
import { getAnimePersonality } from "@/utils/getAnimePersonality";

interface Props {
  continueWatching: PublicContinueWatching[];
  animeRecords: AnimeRecord[];
  favorites: PublicFavorite[];
  stats: PublicStats;
  displayName: string | null;
    isOwner?: boolean;

}

export default function AnimePersonality({
  continueWatching,
  animeRecords,
  favorites,
  stats,
  displayName,
  isOwner = false
}: Props) {
  const personality = getAnimePersonality({
    continueWatching,
    animeRecords,
    favorites,
    stats,
  });

  if (!personality) {
    return null;
  }

  return (
    <section
      className="anime-personality-card"
      aria-labelledby="anime-personality-title"
    >
      <div className="anime-personality-card__glow" aria-hidden="true" />

      <header className="anime-personality-card__header">
        <div className="anime-personality-card__heading">
          <span className="anime-personality-card__eyebrow">
            🎭 Anime Personality
          </span>

          <h2
            id="anime-personality-title"
            className="anime-personality-card__title"
          >
            {personality.title}
          </h2>
        </div>

        <div className="anime-personality-card__badge" aria-hidden="true">
          {personality.emoji}
        </div>
      </header>

      <div className="anime-personality-card__traits">
        {personality.traits.map((trait) => (
          <span
            key={`${trait.label}-${trait.emoji}`}
            className="anime-personality-card__trait"
          >
            <span aria-hidden="true">{trait.emoji}</span>
            {trait.label}
          </span>
        ))}
      </div>

      <div className="anime-personality-card__divider" aria-hidden="true" />

      <div className="anime-personality-card__description">
        <span className="anime-personality-card__description-label">
          {isOwner ? "You" : displayName ?? "User"} seem to gravitate toward
        </span>

        <p>{personality.description}</p>
      </div>
    </section>
  );
}
