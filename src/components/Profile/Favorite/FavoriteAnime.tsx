import { useEffect, useState } from "react";

import type { PublicFavorite } from "@/types/profile";
import type { Anime } from "@/types/mergedListTypes";

import { getAnimeById } from "@/filters/getAnimeById";

interface Props {
  favorites: PublicFavorite[];
}

export default function FavoriteAnime({ favorites }: Props) {
  const [animeList, setAnimeList] = useState<Anime[]>([]);

  useEffect(() => {
    async function loadFavorites() {
      const animeFavorites = favorites.filter((item) => item.type === "anime");

      const resolved = await Promise.all(
        animeFavorites.map((item) => getAnimeById(item.item_id)),
      );

      setAnimeList(resolved.filter(Boolean) as Anime[]);
    }

    loadFavorites();
  }, [favorites]);

  if (!animeList.length) {
    return null;
  }

  return (
    <section className="favorite-block">
      <h3 className="favorite-block__title">🎬 Favorite Anime</h3>

      <div className="favorite-anime-grid">
        {animeList.map((anime, index) => (
          <a key={index} href={`/show/${anime.nanoid}/${anime.slug}`}>
            <article key={anime.nanoid} className="favorite-anime-card">
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
                  {anime.startDate?.slice(0, 4) || anime?.year || "N/A"}
                </span>
              </div>
            </article>
          </a>
        ))}
      </div>
    </section>
  );
}
