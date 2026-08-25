import type { RpcAnimeList } from "@/types/animeList";
import "@/styles/components/PublicProfile/top-rated-anime.css";

interface Props {
  userAnimeList: RpcAnimeList[];
  limit?: number;
  isOwner?: boolean;
}

function formatScore(score: number | null) {
  if (score === null) return "—";

  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}

export default function TopRatedAnime({ userAnimeList, limit = 6, isOwner = false }: Props) {
  /*
   * --------------------------------------------------------------------------
   * Top Rated
   * --------------------------------------------------------------------------
   *
   * These scores belong to THIS USER.
   *
   * Only anime with a valid user score are included.
   */

  const topRated = [...userAnimeList]
    .filter(
      (item) =>
        item.userAnime.score !== null &&
        Number.isFinite(item.userAnime.score) &&
        item.userAnime.score >= 0 &&
        item.userAnime.score <= 10,
    )
    .sort((a, b) => {
      const scoreDifference =
        (b.userAnime.score ?? 0) - (a.userAnime.score ?? 0);

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      /*
       * Deterministic tie-breaker:
       * most recently updated rating first.
       */
      const aUpdated = new Date(a.userAnime.updated_at).getTime();

      const bUpdated = new Date(b.userAnime.updated_at).getTime();

      return bUpdated - aUpdated;
    })
    .slice(0, limit);

  if (topRated.length === 0) {
    return null;
  }

  const featured = topRated[0];
  const runnersUp = topRated.slice(1, 3);
  const remaining = topRated.slice(3);

  return (
    <section className="top-rated" aria-labelledby="top-rated-title">
      <div className="top-rated__header">
        <div>
          <p className="top-rated__eyebrow">Personal favorites by score</p>

          <h2 id="top-rated-title" className="top-rated__title">
            🏆 Top Rated Anime
          </h2>

          <p className="top-rated__subtitle">
            {`${isOwner ? "Rated by You · not a global ranking" : "Rated by this user · not a global ranking"}`}
          </p>
        </div>

        <a
          href="?tab=anime"
          className="top-rated__view-all"
          aria-label="View this user's anime list"
        >
          View list
          <span aria-hidden="true">→</span>
        </a>
      </div>

      <div className="top-rated__layout">
        {/* #1 */}
        <a
          href={`/show/${featured.nanoid}/${featured.slug}`}
          className="top-rated__featured"
          aria-label={`Number one rated anime: ${featured.title}, rated ${formatScore(
            featured.userAnime.score,
          )} out of 10`}
        >
          <div className="top-rated__featured-poster-wrap">
            {featured.poster ? (
              <img
                src={featured.poster}
                alt={`${featured.title} poster`}
                className="top-rated__featured-poster"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="top-rated__poster-placeholder" aria-hidden="true">
                🎬
              </div>
            )}

            <span className="top-rated__rank top-rated__rank--first">#1</span>

            <span className="top-rated__score top-rated__score--featured">
              <strong>{formatScore(featured.userAnime.score)}</strong>

              <small>/10</small>
            </span>
          </div>

          <div className="top-rated__featured-content">
            <p className="top-rated__rank-label">Highest rated</p>

            <h3 className="top-rated__featured-title">{featured.title}</h3>

            <p className="top-rated__personal-score">
              <span>★</span>

              {formatScore(featured.userAnime.score)}

              <span className="top-rated__personal-score-label">
                user's rating
              </span>
            </p>
          </div>
        </a>

        {/* #2 / #3 */}
        {runnersUp.length > 0 && (
          <div className="top-rated__runners-up">
            {runnersUp.map((item, index) => {
              const rank = index + 2;

              return (
                <a
                  key={item.nanoid}
                  href={`/show/${item.nanoid}/${item.slug}`}
                  className="top-rated__runner"
                  aria-label={`Number ${rank} rated anime: ${
                    item.title
                  }, rated ${formatScore(item.userAnime.score)} out of 10`}
                >
                  <div className="top-rated__runner-poster-wrap">
                    {item.poster ? (
                      <img
                        src={item.poster}
                        alt={`${item.title} poster`}
                        className="top-rated__runner-poster"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div
                        className="top-rated__poster-placeholder"
                        aria-hidden="true"
                      >
                        🎬
                      </div>
                    )}

                    <span
                      className={[
                        "top-rated__rank",
                        rank === 2 && "top-rated__rank--second",
                        rank === 3 && "top-rated__rank--third",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      #{rank}
                    </span>
                  </div>

                  <div className="top-rated__runner-content">
                    <h3 className="top-rated__runner-title">{item.title}</h3>

                    <p className="top-rated__runner-score">
                      <span>★</span>

                      {formatScore(item.userAnime.score)}

                      <small>/10</small>
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* #4+ */}
        {remaining.length > 0 && (
          <div className="top-rated__remaining">
            {remaining.map((item, index) => {
              const rank = index + 4;

              return (
                <a
                  key={item.nanoid}
                  href={`/anime/${item.slug}`}
                  className="top-rated__compact"
                  aria-label={`${item.title}, ranked ${rank}, rated ${formatScore(
                    item.userAnime.score,
                  )} out of 10`}
                >
                  <span className="top-rated__compact-rank">#{rank}</span>

                  {item.poster ? (
                    <img
                      src={item.poster}
                      alt=""
                      className="top-rated__compact-poster"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div
                      className="top-rated__compact-placeholder"
                      aria-hidden="true"
                    >
                      🎬
                    </div>
                  )}

                  <span className="top-rated__compact-title">{item.title}</span>

                  <span className="top-rated__compact-score">
                    ★ {formatScore(item.userAnime.score)}
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
