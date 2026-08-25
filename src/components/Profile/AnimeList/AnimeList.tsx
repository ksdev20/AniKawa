import "@/styles/components/Profile/AnimeList.css";

import { useEffect, useMemo, useRef, useState } from "react";

import AnimeListToolbar from "./AnimeListToolbar.tsx";
import AnimeListFilters from "./AnimeListFilters.tsx";
import AnimeListItem from "./AnimeListItem.tsx";
import AnimeListCompactItem from "./AnimeListCompactItem.tsx";
import AnimeListCard from "./AnimeListCard.tsx";

import { useAnimeListStore } from "@/stores/animeListStore";

import {
  type UserAnimeStatus,
  type ViewMode,
  type SortMode,
  type AnimeFilters,
  DEFAULT_ANIME_FILTERS,
  ANIME_LIST_STATUS_MAP,
} from "@/types/animeList";

import { WizardLoader } from "@/components/Loaders/WizardLoader.tsx";
import ProfileIcon from "../ProfileIcon.tsx";

import { fuzzyScore, progressPercent } from "./AnimeList.helpers.ts";

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

interface AnimeListProps {
  username: string;
  isOwner: boolean;
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function AnimeList({ username, isOwner }: AnimeListProps) {
  /*
  |--------------------------------------------------------------------------
  | STORE
  |--------------------------------------------------------------------------
  */

  const list = useAnimeListStore((state) => state.list);
  const loading = useAnimeListStore((state) => state.loading);
  const loadingMore = useAnimeListStore((state) => state.loadingMore);
  const error = useAnimeListStore((state) => state.error);
  const fetchList = useAnimeListStore((state) => state.fetchList);
  const loadMore = useAnimeListStore((state) => state.loadMore);
  const hasMore = useAnimeListStore((state) => state.hasMore);

  /*
  |--------------------------------------------------------------------------
  | UI STATE
  |--------------------------------------------------------------------------
  */

  const [activeList, setActiveList] = useState<"All" | UserAnimeStatus>("All");

  const [viewMode, setViewMode] = useState<ViewMode>("detailed");

  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState<AnimeFilters>(DEFAULT_ANIME_FILTERS);

  const [sort, setSort] = useState<SortMode>("default");

  const [filtersOpen, setFiltersOpen] = useState(true);

  const [listsOpen, setListsOpen] = useState(true);

  const normalizedUsername = username.trim();

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  /*
  |--------------------------------------------------------------------------
  | LOAD USER LIST
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!normalizedUsername) {
      return;
    }

    void fetchList(normalizedUsername);
  }, [normalizedUsername, fetchList]);

  /*
  |--------------------------------------------------------------------------
  | LIST COUNTS
  |--------------------------------------------------------------------------
  |
  | Counts are based exclusively on the user's list status.
  |
  */

  const listCounts = useMemo(() => {
    const counts: Record<UserAnimeStatus, number> = {
      Watching: 0,
      Completed: 0,
      Paused: 0,
      Dropped: 0,
      Planning: 0,
    };

    for (const anime of list) {
      const status = anime.userAnime.status;
      const label = ANIME_LIST_STATUS_MAP[status];

      if (label) {
        counts[label]++;
      }
    }

    return {
      All: list.length,
      ...counts,
    };
  }, [list]);

  /*
  |--------------------------------------------------------------------------
  | SEARCH + FILTER + SORT
  |--------------------------------------------------------------------------
  */

  const filteredAnime = useMemo(() => {
    let result = list;

    /*
    |--------------------------------------------------------------------------
    | USER LIST STATUS
    |--------------------------------------------------------------------------
    */

    if (activeList !== "All") {
      result = result.filter(
        (anime) => ANIME_LIST_STATUS_MAP[anime.userAnime.status] === activeList,
      );
    }

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    const query = search.trim().toLowerCase();

    if (query) {
      result = result
        .map((anime) => ({
          anime,
          relevance: fuzzyScore(query, anime.title),
        }))
        .filter(({ relevance }) => relevance > 0)
        .sort((a, b) => b.relevance - a.relevance)
        .map(({ anime }) => anime);
    }

    /*
    |--------------------------------------------------------------------------
    | FORMAT
    |--------------------------------------------------------------------------
    */

    if (filters.format !== "All formats") {
      result = result.filter((anime) => anime.format === filters.format);
    }

    /*
    |--------------------------------------------------------------------------
    | RELEASE STATUS
    |--------------------------------------------------------------------------
    |
    | This is the catalog/release status.
    |
    | DO NOT confuse this with:
    |
    | anime.userAnime.status
    |
    */

    if (filters.releaseStatus !== "All statuses") {
      result = result.filter((anime) => {
        const releaseStatus = anime.status?.trim().toLowerCase();

        switch (filters.releaseStatus) {
          case "Cancelled":
            return (
              releaseStatus === "cancelled" || releaseStatus === "canceled"
            );

          case "Finished":
            return (
              releaseStatus === "finished" ||
              releaseStatus === "ended" ||
              releaseStatus === "completed"
            );

          case "Releasing":
            return (
              releaseStatus === "releasing" ||
              releaseStatus === "returning series"
            );

          default:
            return true;
        }
      });
    }

    /*
    |--------------------------------------------------------------------------
    | COUNTRY
    |--------------------------------------------------------------------------
    */

    if (filters.country !== "All countries") {
      result = result.filter((anime) => anime.country === filters.country);
    }

    /*
    |--------------------------------------------------------------------------
    | GENRE
    |--------------------------------------------------------------------------
    */

    if (filters.genre !== "All genres") {
      result = result.filter(
        (anime) => anime.genres?.includes(filters.genre) ?? false,
      );
    }

    /*
    |--------------------------------------------------------------------------
    | YEAR
    |--------------------------------------------------------------------------
    */

    const yearFrom = filters.yearFrom ? Number(filters.yearFrom) : null;

    const yearTo = filters.yearTo ? Number(filters.yearTo) : null;

    if (yearFrom !== null && Number.isFinite(yearFrom)) {
      result = result.filter((anime) => {
        const year =
          anime.year ??
          (anime.startDate ? Number(anime.startDate.slice(0, 4)) : null);

        return year !== null && Number.isFinite(year) && year >= yearFrom;
      });
    }

    if (yearTo !== null && Number.isFinite(yearTo)) {
      result = result.filter((anime) => {
        const year =
          anime.year ??
          (anime.startDate ? Number(anime.startDate.slice(0, 4)) : null);

        return year !== null && Number.isFinite(year) && year <= yearTo;
      });
    }

    /*
    |--------------------------------------------------------------------------
    | SORT
    |--------------------------------------------------------------------------
    */

    switch (sort) {
      case "title":
        result = [...result].sort((a, b) => a.title.localeCompare(b.title));
        break;

      case "score":
        result = [...result].sort(
          (a, b) => (b.userAnime.score ?? -1) - (a.userAnime.score ?? -1),
        );
        break;

      case "progress":
        result = [...result].sort(
          (a, b) => progressPercent(b) - progressPercent(a),
        );
        break;

      case "year":
        result = [...result].sort((a, b) => {
          const yearA =
            a.year ?? (a.startDate ? Number(a.startDate.slice(0, 4)) : 0);

          const yearB =
            b.year ?? (b.startDate ? Number(b.startDate.slice(0, 4)) : 0);

          return yearB - yearA;
        });
        break;

      case "popularity":
        result = [...result].sort(
          (a, b) => (b.popularity ?? 0) - (a.popularity ?? 0),
        );
        break;

      case "default":
      default:
        /*
        |--------------------------------------------------------------------------
        | Keep API order.
        |--------------------------------------------------------------------------
        |
        | The API/RPC already orders the user's list by:
        |
        | updated_at DESC
        | id DESC
        |
        */
        break;
    }

    return result;
  }, [list, activeList, search, filters, sort]);

  /*
  |--------------------------------------------------------------------------
  | FILTER HANDLERS
  |--------------------------------------------------------------------------
  */

  const updateFilter = <K extends keyof AnimeFilters>(
    key: K,
    value: AnimeFilters[K],
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_ANIME_FILTERS);
  };

  /*
|--------------------------------------------------------------------------
| INFINITE SCROLL
|--------------------------------------------------------------------------
|
| Observe a sentinel at the bottom of the list.
|
| The store handles:
| - hasMore
| - loading
| - loadingMore
| - duplicate-request protection
|
*/

  useEffect(() => {
    const sentinel = loadMoreRef.current;

    if (!sentinel || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry?.isIntersecting) {
          return;
        }

        void loadMore();
      },
      {
        root: null,

        /*
      |--------------------------------------------------------------------------
      | Start loading before the user actually reaches the bottom.
      |--------------------------------------------------------------------------
      |
      | 600px gives the next page time to arrive while the user is
      | still browsing the current page.
      |
      */

        rootMargin: "0px 0px 600px 0px",

        threshold: 0,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadMore]);

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <section className="anime-list">
        <div className="anime-list__loading">
          <div className="anime-list__loading-orb" />

          <WizardLoader
            info={["Preparing the Universe", "Loading the anime list..."]}
          />

          <div className="for-mob">
            <span className="loader-2" />

            <p className="mt-2">Loading the anime list...</p>
          </div>
        </div>
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <section className="anime-list">
        <div className="anime-list__empty">
          <div className="anime-list__empty-icon">!</div>

          <h3>Couldn't load this list.</h3>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => {
              if (normalizedUsername) {
                void fetchList(normalizedUsername);
              }
            }}
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="anime-list">
      <AnimeListToolbar
        search={search}
        onSearchChange={setSearch}
        viewMode={viewMode}
        onViewChange={setViewMode}
        sort={sort}
        onSortChange={setSort}
      />
      <div className="anime-list__body">
        <aside className="anime-list__sidebar">
          <div className="anime-list__filters">
            <button
              type="button"
              className="anime-list__filters-header"
              onClick={() => setListsOpen((value) => !value)}
              aria-expanded={listsOpen}
            >
              <div>
                <span>{username}'s LIBRARY</span>
                <strong>Lists</strong>
              </div>

              <span className="anime-list__filters-toggle">
                {listsOpen ? (
                  <ProfileIcon name="minus" size={16} />
                ) : (
                  <ProfileIcon name="plus" size={16} />
                )}
              </span>
            </button>

            {listsOpen && (
              <div className="anime-list__status-list">
                {(
                  Object.keys(listCounts) as Array<keyof typeof listCounts>
                ).map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`anime-list__status ${
                      activeList === status ? "anime-list__status--active" : ""
                    }`}
                    onClick={() => setActiveList(status)}
                  >
                    <span>{status}</span>
                    <strong>{listCounts[status]}</strong>
                  </button>
                ))}
              </div>
            )}
          </div>

          <AnimeListFilters
            filters={filters}
            open={filtersOpen}
            onToggle={() => setFiltersOpen((value) => !value)}
            onChange={updateFilter}
            onReset={resetFilters}
          />
        </aside>

        <main className="anime-list__results">
          <div className="anime-list__results-header">
            <div>
              <span className="anime-list__results-kicker">
                {search ? "SEARCH RESULTS" : "The Collection"}
              </span>

              <h2 className="anime-list__results-title">
                {filteredAnime.length}
                <span>{filteredAnime.length === 1 ? " anime" : " anime"}</span>
              </h2>
            </div>

            {/* NOT YET RELEASING THIS COMPARISON FEATURE */}
            {/* <button type="button" className="anime-list__compare">
              Compare with your list
              <span>↗</span>
            </button> */}
          </div>

          {filteredAnime.length === 0 ? (
            <div className="anime-list__empty">
              <div className="anime-list__empty-icon">!</div>

              <h3>Nothing found.</h3>

              <p>Try a different search or loosen one of your filters.</p>
            </div>
          ) : (
            <div className={`anime-list__items anime-list__items--${viewMode}`}>
              {viewMode === "compact" && (
                <div className="anime-list__compact-header">
                  <span>Title</span>
                  <span>Score</span>
                  <span>Progress</span>
                  <span>Type</span>
                  <span aria-hidden="true" />
                </div>
              )}

              {filteredAnime.map((anime) => {
                if (viewMode === "compact") {
                  return (
                    <AnimeListCompactItem
                      key={anime.id}
                      anime={anime}
                      canEdit={isOwner}
                    />
                  );
                }

                if (viewMode === "cards") {
                  return (
                    <AnimeListCard
                      key={anime.id}
                      anime={anime}
                      canEdit={isOwner}
                    />
                  );
                }

                return (
                  <AnimeListItem
                    key={anime.id}
                    anime={anime}
                    canEdit={isOwner}
                  />
                );
              })}

              {loadingMore && (
                <div className="anime-list__loading-more">
                  <span className="loader-3" />
                </div>
              )}

              <div
                ref={loadMoreRef}
                className="anime-list__load-more"
                aria-hidden="true"
              />
            </div>
          )}
        </main>
      </div>
    </section>
  );
}
