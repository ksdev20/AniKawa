import EpisodeCard from "@/components/EpisodeCard/EpisodeCard";
import { DogIcon } from "@phosphor-icons/react/dist/icons/Dog";
import type {
  PublicContinueWatching,
  ResolvedPublicEpisode,
} from "@/types/profile";

interface Props {
  continueWatching: PublicContinueWatching[];
  episodeRecords: ResolvedPublicEpisode[];
}

export default function CurrentlyWatching({
  continueWatching,
  episodeRecords,
}: Props) {
  return (
    <section className="profile-section">
      <div className="profile-section__header">
        <div>
          <h2 className="profile-section__title">Currently Watching</h2>

          <p className="profile-section__subtitle">
            See what they're watching right now.
          </p>
        </div>

        {continueWatching.length > 0 && (
          <span className="profile-section__count">
            {continueWatching.length}
          </span>
        )}
      </div>

      {continueWatching.length === 0 ? (
        <div className="profile-empty">
          <div className="profile-empty__icon">
            <DogIcon size={32} />
          </div>

          <h3>No anime in progress</h3>
        </div>
      ) : (
        <ul className="profile-episode-grid">
          {episodeRecords.slice(0, 9).map((item) => (
            <EpisodeCard
              key={item.nanoid}
              epData={item}
              forCW={true}
              showWatchedTill={true}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
