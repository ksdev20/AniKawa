import type { Anime } from "@/lib/anime/types";
import type { PublicFavorite } from "@/types/profile";

interface Props {
  favorites: PublicFavorite[];
  favoriteAnime: Anime[];
}

export default function FavoritesSection({
  favorites,
  favoriteAnime,
}: Props) {
  if (!favorites.length) {
    return null;
  }

  const animeFavorites = favorites
    .filter((favorite) => favorite.type === "anime")
    .slice(0, 6);

  if (!animeFavorites.length) {
    return null;
  }
  return (
    <section className="favorites-section">
      <header className="favorites-section__header">
        <h2>❤️ Favorites</h2>

        <p>Things this user loves the most</p>
      </header>

      <div className="favorites-section__content">
        {favoriteAnime.length > 0 && (
          <section className="favorite-block">
            <h3 className="favorite-block__title">🎬 Favorite Anime</h3>

            <div className="favorite-anime-grid">
              {favoriteAnime.map((anime, index) => (
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
        )}
      </div>
    </section>
  );
}
