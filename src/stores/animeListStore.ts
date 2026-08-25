import { create } from "zustand";
import type {
  ApiGetAnimeListResponse,
  RpcAnimeList,
} from "@/types/animeList";

// import type
/*
|--------------------------------------------------------------------------
| API RESPONSE
|--------------------------------------------------------------------------
*/

type ApiResponse<T> = {
  success: boolean;

  data?: T;

  error?: string;
};

/*

| USER ANIME STATUS
*/

export type AnimeListStatus =
  "watching" | "completed" | "paused" | "dropped" | "planning";

/*
| ADD / UPDATE INPUT
*/

type AddAnimeInput = {
  anime_nanoid: string;

  status?: AnimeListStatus;

  progress?: number;

  score?: number | null;

  startedAt?: string | null;

  completedAt?: string | null;

  notes?: string | null;
};

/*
|--------------------------------------------------------------------------
| STORE
|--------------------------------------------------------------------------
*/

type AnimeListState = {
  list: RpcAnimeList[];

  loading: boolean;

  loadingMore: boolean;

  saving: boolean;

  error: string | null;

  loadedUsername: string | null;

  offset: number | null;

  hasMore: boolean;

  fetchList: (username: string) => Promise<void>;

  loadMore: () => Promise<void>;

  addToList: (input: AddAnimeInput) => Promise<RpcAnimeList | null>;

  removeFromList: (anime_nanoid: string) => Promise<boolean>;

  clear: () => void;
};

/*
|--------------------------------------------------------------------------
| STORE
|--------------------------------------------------------------------------
*/

export const useAnimeListStore = create<AnimeListState>((set, get) => ({
  list: [],

  loading: false,

  loadingMore: false,

  saving: false,

  error: null,

  loadedUsername: null,

  offset: null,

  hasMore: false,

  /*
  |--------------------------------------------------------------------------
  | GET FIRST PAGE
  |--------------------------------------------------------------------------
  */

  fetchList: async (username) => {
    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
      set({
        list: [],

        loading: false,

        loadingMore: false,

        error: "Username is required.",

        loadedUsername: null,

        offset: null,

        hasMore: false,
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Reset pagination
    |--------------------------------------------------------------------------
    */

    set({
      loading: true,

      loadingMore: false,

      error: null,

      list: [],

      offset: null,

      hasMore: false,

      loadedUsername: normalizedUsername,
    });

    try {
      const response = await fetch(
        `/api/profile/anime-list?username=${encodeURIComponent(
          normalizedUsername,
        )}`,
        {
          method: "GET",

          credentials: "same-origin",
        },
      );

      const result =
        (await response.json()) as ApiResponse<ApiGetAnimeListResponse>;

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Unable to load anime list.");
      }

      if (!result.data) {
        throw new Error("The server returned an invalid anime list.");
      }

      set({
        list: result.data.items,

        offset: result.data.offset + result.data.items.length,

        hasMore: result.data.has_more,

        loading: false,

        error: null,
      });
    } catch (error) {
      console.error("[animeListStore] Failed to fetch list:", error);

      set({
        loading: false,

        error:
          error instanceof Error ? error.message : "Unable to load anime list.",
      });
    }
  },

  /*
  |--------------------------------------------------------------------------
  | LOAD MORE
  |--------------------------------------------------------------------------
  |
  | Used by infinite scroll.
  |
  */

  loadMore: async () => {
    const { loadedUsername, offset, hasMore, loading, loadingMore } = get();

    /*
  |--------------------------------------------------------------------------
  | Don't make duplicate requests.
  |--------------------------------------------------------------------------
  */

    if (!loadedUsername || !hasMore || loading || loadingMore) {
      return;
    }

    set({
      loadingMore: true,
      error: null,
    });

    try {
      const params = new URLSearchParams({
        username: loadedUsername,
        offset: String(offset),
      });

      const response = await fetch(
        `/api/profile/anime-list?${params.toString()}`,
        {
          method: "GET",
          credentials: "same-origin",
        },
      );

      const result =
        (await response.json()) as ApiResponse<ApiGetAnimeListResponse>;

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Unable to load more anime.");
      }

      if (!result.data) {
        throw new Error("The server returned an invalid anime list.");
      }

      set((state) => {
        /*
      |--------------------------------------------------------------------------
      | Avoid accidental duplicates.
      |--------------------------------------------------------------------------
      */

        const existingIds = new Set(state.list.map((anime) => anime.nanoid));

        const newItems = result.data!.items.filter(
          (anime) => !existingIds.has(anime.nanoid),
        );

        return {
          list: [...state.list, ...newItems],

          offset: result.data?.nextOffset,

          hasMore: result.data?.has_more,

          loadingMore: false,

          error: null,
        };
      });
    } catch (error) {
      console.error("[animeListStore] Failed to load more:", error);

      set({
        loadingMore: false,

        error:
          error instanceof Error ? error.message : "Unable to load more anime.",
      });
    }
  },

  /*
  |--------------------------------------------------------------------------
  | ADD / UPDATE LIST ENTRY
  |--------------------------------------------------------------------------
  */

  addToList: async (input) => {
    set({
      saving: true,
      error: null,
    });

    try {
      const response = await fetch("/api/profile/anime-list", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anime_nanoid: input.anime_nanoid,
          status: input.status ?? "planning",
          progress: input.progress ?? 0,
          score: input.score ?? null,
          startedAt: input.startedAt ?? null,
          completedAt: input.completedAt ?? null,
          notes: input.notes ?? null,
        }),
      });

      const result = (await response.json()) as ApiResponse<RpcAnimeList>;

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Unable to save anime list entry.");
      }

      const saved = result.data;

      if (!saved) {
        throw new Error("The server did not return the saved anime.");
      }

      /*
    |--------------------------------------------------------------------------
    | Update local list
    |--------------------------------------------------------------------------
    */

      set((state) => {
        const existingIndex = state.list.findIndex(
          (anime) => anime.nanoid === input.anime_nanoid,
        );

        /*
      |--------------------------------------------------------------------------
      | Existing anime
      |--------------------------------------------------------------------------
      |
      | Preserve all existing anime metadata.
      | Only update the user's list information.
      |
      */

        if (existingIndex !== -1) {
          const existingAnime = state.list[existingIndex];

          const nextList = [...state.list];

          nextList[existingIndex] = {
            ...existingAnime,

            userAnime: {
              ...existingAnime.userAnime,

              status: saved.userAnime.status,
              progress: saved.userAnime.progress,
              score: saved.userAnime.score,
              started_at: saved.userAnime.started_at,
              completed_at: saved.userAnime.completed_at,
              notes: saved.userAnime.notes,
            },
          };

          return {
            list: nextList,
            saving: false,
            error: null,
          };
        }

        /*
      |--------------------------------------------------------------------------
      | New anime
      |--------------------------------------------------------------------------
      */

        return {
          list: [saved, ...state.list],

          saving: false,

          error: null,
        };
      });

      return saved;
    } catch (error) {
      console.error("[animeListStore] Failed to save anime:", error);

      set({
        saving: false,
        error: error instanceof Error ? error.message : "Unable to save anime.",
      });

      return null;
    }
  },

  removeFromList: async (anime_nanoid) => {
    set({
      saving: true,
      error: null,
    });

    try {
      const response = await fetch("/api/profile/anime-list", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anime_nanoid,
        }),
      });

      const result: ApiResponse<boolean> = await response.json();

      console.log("[removeFromList] response:", {
        status: response.status,
        result,
      });

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Unable to remove anime from your list.",
        );
      }

      set((state) => ({
        list: state.list.filter((item) => item.nanoid !== anime_nanoid),
        saving: false,
      }));

      return result.data === true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to remove anime from your list.";

      set({
        saving: false,
        error: message,
      });

      return false;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | CLEAR
  |--------------------------------------------------------------------------
  */

  clear: () => {
    set({
      list: [],

      loading: false,

      loadingMore: false,

      saving: false,

      error: null,

      loadedUsername: null,

      offset: null,

      hasMore: false,
    });
  },
}));
