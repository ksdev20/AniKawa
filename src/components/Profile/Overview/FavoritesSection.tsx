import type { Anime } from "@/types/mergedListTypes";

interface Props {
  favoriteAnime: Anime[];
}

export default function FavoritesSection({ favoriteAnime }: Props) {
  if (!favoriteAnime.length) {
    return null;
  }

  const animeList = favoriteAnime.slice(0, 6);

  return (
    <section className="favorites-section">
      <header className="favorites-section__header">
        <h2>❤️ Favorites</h2>

        <p>Things this user loves the most</p>
      </header>

      <div className="favorites-section__content">
        <section className="favorite-block">
          <h3 className="favorite-block__title">🎬 Favorite Anime</h3>

          <div className="favorite-anime-grid">
            {animeList.map((anime, index) => (
              <a
                key={anime.nanoid}
                href={`/show/${anime.nanoid}/${anime.slug}`}
              >
                <article className="favorite-anime-card">
                  <span className="favorite-rank">#{index + 1}</span>

                  <img
                    src={anime.poster}
                    alt={anime.title}
                    loading="lazy"
                    className="favorite-anime-card__image"
                  />

                  <div className="favorite-anime-card__overlay">
                    <h4>{anime.title}</h4>

                    <span>
                      {anime.startDate?.slice(0, 4) || anime.year || "N/A"}
                    </span>
                  </div>
                </article>
              </a>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
