import { useEffect, useState } from "react";

import { Icon } from "@/icons/icons";

import { useAuth } from "@/hooks/useAuth";

import { getFavorites } from "@/lib/favorites/getFavorites";
import {
  toggleFavorite,
  type FavoriteType,
} from "@/lib/favorites/toggleFavorite";

import { useLoginModalStore } from "@/global_assets/loginModalStore";

interface FavoriteButtonProps {
  type: FavoriteType;
  itemId: string;
}

export default function FavoriteButton({ type, itemId }: FavoriteButtonProps) {
  const { user, initialized } = useAuth();

  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      setIsFavorite(false);
      setLoading(false);
      setError(null);
      return;
    }

    async function fetchFavoriteStatus() {
      setLoading(true);
      setError(null);

      try {
        const favorites = await getFavorites();

        setIsFavorite(
          favorites.some(
            (favorite: { type: FavoriteType; item_id: string }) =>
              favorite.type === type && favorite.item_id === itemId,
          ),
        );
      } catch (error) {
        console.error("[FavoriteButton] Failed to load:", error);

        setError("Unable to load favorite status.");
      } finally {
        setLoading(false);
      }
    }

    void fetchFavoriteStatus();
  }, [initialized, user?.id, type, itemId]);

  async function handleClick() {
    if (!user) {
      useLoginModalStore.getState().openLogin();
      return;
    }

    if (loading) return;

    setLoading(true);
    setError(null);

    const previousFavorite = isFavorite;

    // Optimistic update
    setIsFavorite(!previousFavorite);

    try {
      await toggleFavorite({
        type,
        itemId,
      });
    } catch (error) {
      console.error("[FavoriteButton] Failed to toggle:", error);

      // Rollback
      setIsFavorite(previousFavorite);
      setError("Unable to update favorite.");
    } finally {
      setLoading(false);
    }
  }

  if (!initialized) {
    return (
      <button
        type="button"
        disabled
        className="favorite-button favorite-button--loading"
        aria-label="Loading favorite"
      >
        <span className="favorite-button__icon">
          <div className="fav-loader" />
        </span>
        <span>Loading...</span>
      </button>
    );
  }

  if (loading && !user) {
    return null;
  }

  if (error && !user) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      className={`
        favorite-button
        ${isFavorite ? "favorite-button--active" : ""}
        ${loading ? "favorite-button--loading" : ""}
      `}
      title={error ?? undefined}
    >
      <span className="favorite-button__icon">
        {loading ? (
          <div className="fav-loader" />
        ) : isFavorite ? (
          <Icon name="favorite-f" size={24} color="#fb2636" />
        ) : (
          <Icon name="favorite-o" size={24} color="#fb2636" />
        )}
      </span>

      <span>
        {loading ? "Loading..." : isFavorite ? "Favorited" : "Favorite"}
      </span>
    </button>
  );
}
