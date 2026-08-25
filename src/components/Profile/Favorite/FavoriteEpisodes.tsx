import type { PublicFavorite } from "@/types/profile";

interface Props {
  favorites: PublicFavorite[];
}

export default function FavoriteEpisodes({ favorites }: Props) {
  return (
    <div className="favorite-block">
      <h3 className="favorite-block__title">🎞️ Favorite Episodes</h3>

      <div className="favorite-list">
        {favorites.map((item) => (
          <div key={item.id} className="favorite-episode-card">
            <div>
              <p>Episode</p>

              <span>{item.item_id}</span>
            </div>

            <span className="favorite-icon">⭐</span>
          </div>
        ))}
      </div>
    </div>
  );
}
