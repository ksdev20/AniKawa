import { useMemo, useState } from "react";

import { XIcon } from "@phosphor-icons/react";

import { useProfileStore } from "@/stores/profileStore";

import {
  toggleFavorite,
  type FavoriteType,
} from "@/lib/favorites/toggleFavorite";

import "@/styles/components/Profile/Favorites.css";

interface FavoritesProps {
  username: string;
  isOwner?: boolean;
}

interface ResolvedFavorite {
  id: string;
  type: FavoriteType;
  itemId: string;
  title: string;
  image: string | null;
  year: string | null;
  href: string;
}

const TYPE_ORDER: FavoriteType[] = [
  "anime",
  "manga",
  "character",
  "staff",
  "studio",
];

const TYPE_LABELS: Record<FavoriteType, string> = {
  anime: "Anime",
  manga: "Manga",
  character: "Characters",
  staff: "Staff",
  studio: "Studios",
};

export default function Favorites({
  username,
  isOwner = false,
}: FavoritesProps) {
  void username;

  const favoriteAnime = useProfileStore((state) => state.favoriteAnime);
  const favorites = useProfileStore((state) => state.favorites);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);

  const [removingId, setRemovingId] = useState<string | null>(null);

  /*
   * ----------------------------------------------------------------------
   * Resolve favorites
   *
   * The private profile data layer already resolved AnimeCatalog records.
   * No catalog lookups belong in this component.
   *
   * Currently only Anime is supported.
   * ----------------------------------------------------------------------
   */

  const resolvedFavorites = useMemo<ResolvedFavorite[]>(() => {
    const animeFavoriteIds = new Map(
      favorites
        .filter((favorite) => favorite.type === "anime")
        .map((favorite) => [favorite.item_id, favorite.id]),
    );

    return favoriteAnime.map((anime) => ({
      id: animeFavoriteIds.get(anime.nanoid) ?? anime.nanoid,
      type: "anime",
      itemId: anime.nanoid,
      title: anime.title,
      image: anime.poster ?? null,
      year: anime.startDate ? anime.startDate.slice(0, 4) : null,
      href: `/show/${anime.nanoid}/${anime.slug}`,
    }));
  }, [favoriteAnime, favorites]);

  /*
   * ----------------------------------------------------------------------
   * Group favorites
   *
   * Keep the existing grouping/rendering structure.
   * Only Anime is currently populated.
   * ----------------------------------------------------------------------
   */

  const groupedFavorites = useMemo(() => {
    const groups: Record<FavoriteType, ResolvedFavorite[]> = {
      anime: [],
      manga: [],
      character: [],
      staff: [],
      studio: [],
    };

    for (const favorite of resolvedFavorites) {
      groups[favorite.type].push(favorite);
    }

    return groups;
  }, [resolvedFavorites]);

  /*
   * ----------------------------------------------------------------------
   * Remove favorite
   *
   * DB operation succeeds first.
   * Then fetch the authoritative private profile again.
   * ----------------------------------------------------------------------
   */

  async function handleRemove(type: FavoriteType, itemId: string) {
    if (removingId) return;

    const key = `${type}:${itemId}`;

    setRemovingId(key);

    try {
      await toggleFavorite({
        type,
        itemId,
      });

      await fetchProfile();
    } catch (error) {
      console.error("[Favorites] Failed to remove favorite:", error);
    } finally {
      setRemovingId(null);
    }
  }

  /*
   * ----------------------------------------------------------------------
   * Empty
   * ----------------------------------------------------------------------
   */

  if (resolvedFavorites.length === 0) {
    return (
      <section className="favorites">
        <div className="favorites__empty">
          <p>No favorites yet.</p>

          <span>
            Anime, manga, characters, staff and studios you favorite will appear
            here.
          </span>
        </div>
      </section>
    );
  }

  /*
   * ----------------------------------------------------------------------
   * Render
   * ----------------------------------------------------------------------
   */

  return (
    <section className="favorites">
      {TYPE_ORDER.map((type) => {
        const items = groupedFavorites[type];

        if (items.length === 0) {
          return null;
        }

        return (
          <section key={type} className="favorites__section">
            <div className="favorites__section-header">
              <h2 className="favorites__section-title">{TYPE_LABELS[type]}</h2>

              <span className="favorites__section-count">{items.length}</span>
            </div>

            <div className="favorites__grid">
              {items.map((favorite) => {
                const key = `${favorite.type}:${favorite.itemId}`;
                const removing = removingId === key;

                return (
                  <article key={favorite.id} className="favorites__item">
                    <a
                      href={favorite.href}
                      className="favorites__item-link"
                      aria-label={favorite.title}
                    >
                      <div className="favorites__image">
                        {favorite.image ? (
                          <img
                            src={favorite.image}
                            alt={`Cover of ${favorite.title}`}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="favorites__image-placeholder">
                            {favorite.title.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="favorites__info">
                        <h3 className="favorites__title">{favorite.title}</h3>

                        {favorite.year && (
                          <span className="favorites__year">
                            {favorite.year}
                          </span>
                        )}
                      </div>
                    </a>

                    {isOwner && (
                      <button
                        type="button"
                        className="favorites__remove"
                        onClick={() =>
                          void handleRemove(favorite.type, favorite.itemId)
                        }
                        disabled={removingId !== null}
                        aria-label={`Remove ${favorite.title} from favorites`}
                      >
                        {removing ? (
                          <div className="loader" />
                        ) : (
                          <XIcon size={15} weight="bold" />
                        )}

                        <span>{removing ? "Removing..." : "Remove"}</span>
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </section>
  );
}
