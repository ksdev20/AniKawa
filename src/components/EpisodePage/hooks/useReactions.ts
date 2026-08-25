import { useCallback, useEffect, useRef, useState } from "react";

import { getReactions, type Reaction } from "@/lib/reactions/getReactions";
import { toggleReaction } from "@/lib/reactions/toggleReaction";

import { useAuth } from "@/hooks/useAuth";
import { getGuestId } from "@/utils/getGuestId";

interface UseReactionsReturn {
  reactions: Reaction[];

  loading: boolean;

  busy: boolean;

  updating: string | null;

  error: string | null;

  showAll: boolean;

  setShowAll: React.Dispatch<React.SetStateAction<boolean>>;

  react: (reactionId: string) => Promise<void>;

  refresh: () => Promise<void>;
}

export function useReactions(episodeId: string): UseReactionsReturn {
  const { user } = useAuth();

  const isLoggedIn = Boolean(user);

  const [reactions, setReactions] = useState<Reaction[]>([]);

  const [loading, setLoading] = useState(true);

  const [busy, setBusy] = useState(false);

  const [updating, setUpdating] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [showAll, setShowAll] = useState(false);

  const loadingRef = useRef(false);

  const loadReactions = useCallback(async () => {
    if (!episodeId || loadingRef.current) {
      return;
    }

    loadingRef.current = true;

    setLoading(true);

    setError(null);

    try {
      const data = await getReactions(episodeId);

      setReactions(data);
    } catch (error) {
      console.error("[useReactions]", error);

      setError(
        error instanceof Error ? error.message : "Failed loading reactions",
      );
    } finally {
      loadingRef.current = false;

      setLoading(false);
    }
  }, [episodeId]);

  useEffect(() => {
    loadReactions();
  }, [loadReactions]);

  const react = useCallback(
    async (reactionId: string) => {
      if (busy) {
        return;
      }

      setUpdating(reactionId);

      setBusy(true);

      setError(null);

      try {
        const result = await toggleReaction(
          episodeId,
          reactionId,
          isLoggedIn ? null : getGuestId(),
        );

        if (!result.success) {
          throw new Error(result.error);
        }

        /*
          Refresh after successful toggle.
          (Can later become optimistic updates.)
        */

        const updated = await getReactions(episodeId);

        setReactions(updated);
      } catch (error) {
        console.error("[useReactions]", error);

        setError(
          error instanceof Error ? error.message : "Failed updating reaction",
        );
      } finally {
        setBusy(false);
      }
    },
    [busy, episodeId, isLoggedIn],
  );

  return {
    reactions,

    loading,

    busy,

    updating,

    error,

    showAll,

    setShowAll,

    react,

    refresh: loadReactions,
  };
}
