import EpisodeCard from "@/components/EpisodeCard/EpisodeCard";
import type { ResolvedPublicEpisode } from "@/types/profile";

export default function ContinueWatching({
  resolvedEpisodeRecords,
}: {
  resolvedEpisodeRecords: ResolvedPublicEpisode[];
}) {
  return (
    <section className="profile-section">
      <div className="profile-section__header">
        <div>
          <h2 className="profile-section__title">Continue Watching</h2>

          <p className="profile-section__subtitle">
            Pick up where you left off.
          </p>

          <a href="/history" className="latest-episodes-view-all">
            View History
            <span aria-hidden="true">→</span>
          </a>
        </div>

        {resolvedEpisodeRecords.length > 0 && (
          <span className="profile-section__count">
            {resolvedEpisodeRecords.length}
          </span>
        )}
      </div>

      {resolvedEpisodeRecords.length === 0 ? (
        <div className="profile-empty">
          <div className="profile-empty__icon">▶</div>

          <h3>No anime in progress</h3>

          <p>
            Start watching an episode and it'll appear here so you can resume
            anytime.
          </p>
        </div>
      ) : (
        <ul className="profile-episode-grid">
          {resolvedEpisodeRecords.slice(0, 9).map((item, idx) => (
            <EpisodeCard
              key={`${item.nanoid}-${idx}`}
              epData={item}
              forCW={true}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
