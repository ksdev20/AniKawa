import "../../styles/components/Reactions/reactions.css";

import { reactionList } from "@/config/reactions";

import { useReactions } from "./hooks/useReactions";

interface Props {
  episodeId: string;
}

export default function ReactionWidget({ episodeId }: Props) {
  const { reactions, loading, showAll, setShowAll, react, busy, updating } =
    useReactions(episodeId);

  const visibleReactions = showAll ? reactionList : reactionList.slice(0, 6);

  return (
    <section
      className={`episode-reactions ${loading ? "is-loading" : ""}`}
      aria-busy={loading}
    >
      <div className="reaction-header">
        <h3 className="reaction-title">Community Reactions</h3>

        <p className="reaction-description">
          How did viewers feel about this episode?
        </p>
      </div>

      <div className="reaction-grid">
        {visibleReactions.map((reaction) => {
          const found = reactions.find((r) => r.id === reaction.id);

          return (
            <button
              key={reaction.id}
              disabled={loading || busy}
              onClick={() => react(reaction.id)}
              className="reaction-button"
              aria-label={`React ${reaction.name}`}
            >
              <div className="reaction-image-wrapper">
                <img
                  src={reaction.image_url}
                  alt={reaction.name}
                  loading="lazy"
                  className="reaction-image"
                />

                <span className="reaction-count">{found?.count ?? 0}</span>
              </div>

              <span className="reaction-name">{reaction.name}</span>
            </button>
          );
        })}

        {reactionList.length > 4 && (
          <button
            className="show-reactions-button"
            onClick={() => setShowAll((previous) => !previous)}
          >
            {showAll ? "Show Less" : "Show All Reactions"}
          </button>
        )}
      </div>
    </section>
  );
}
