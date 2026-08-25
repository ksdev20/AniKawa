import type { PublicFavorite } from "@/types/profile";

interface Props {
  favorites: PublicFavorite[];
}

export default function FavoriteStudios({ favorites }: Props) {
  return (
    <div className="favorite-block">
      <h3 className="favorite-block__title">🏢 PublicFavorite Studios</h3>

      <div className="studio-grid">
        {favorites.map((item) => (
          <div key={item.id} className="studio-card">
            <div className="studio-logo">🏢</div>

            <span>{item.item_id}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
