import type { PublicFavorite } from "@/types/profile";

interface Props {
  favorites: PublicFavorite[];
}

export default function FavoriteCharacters({ favorites }: Props) {
  return (
    <div className="favorite-block">
      <h3 className="favorite-block__title">⭐ Favorite Characters</h3>

      <div className="character-grid">
        {favorites.map((item) => (
          <div key={item.id} className="character-card">
            <div className="character-avatar">?</div>

            <p>{item.item_id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
