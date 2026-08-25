import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";

import EpisodeCard from "../EpisodeCard/EpisodeCard";

import { useAuth } from "@/hooks/useAuth";
import type { ResolvedPublicEpisode } from "@/types/profile";
import { getContinueWatching } from "@/lib/continueWatching/getContinueWatching";

type TimeFilter = "all" | "today" | "yesterday" | "week" | "month" | "custom";

type ProgressFilter = "all" | "in-progress" | "completed";

type SortOption = "recent" | "oldest";

const PAGE_SIZE = 24;

export default function HistoryBrowser() {
  const { user, initialized } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [continueWatching, setCW] = useState<ResolvedPublicEpisode[] | null>(
    null,
  );

  const [search, setSearch] = useState("");

  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  const [progressFilter, setProgressFilter] = useState<ProgressFilter>("all");

  const [sort, setSort] = useState<SortOption>("recent");

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const isWithinDateFilter = (watchedAt: number | null) => {
    if (timeFilter === "all") return true;

    if (!watchedAt) return false;

    const watchedDate = new Date(watchedAt);

    if (timeFilter === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      return watchedDate >= start;
    }

    if (timeFilter === "yesterday") {
      const start = new Date();
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      return watchedDate >= start && watchedDate < end;
    }

    if (timeFilter === "week") {
      const start = new Date();
      start.setDate(start.getDate() - 7);

      return watchedDate >= start;
    }

    if (timeFilter === "month") {
      const start = new Date();
      start.setMonth(start.getMonth() - 1);

      return watchedDate >= start;
    }

    if (timeFilter === "custom") {
      if (dateFrom) {
        const from = new Date(`${dateFrom}T00:00:00`);

        if (watchedDate < from) return false;
      }

      if (dateTo) {
        const to = new Date(`${dateTo}T23:59:59.999`);

        if (watchedDate > to) return false;
      }
    }

    return true;
  };

  /*
   * ----------------------------------------------------------
   * FETCH
   * ----------------------------------------------------------
   */

  async function fetchContinueWatching() {
    setLoading(true);
    setError(null);

    try {
      const result = await getContinueWatching(user?.id ?? null);

      setCW(result);
    } catch (error) {
      console.error("[ContinueWatching] Failed to load:", error);

      setError("Unable to load continue watching.");
      setCW([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initialized) return;

    void fetchContinueWatching();
  }, [initialized, user?.id]);

  const episodes = continueWatching as ResolvedPublicEpisode[] ?? [];

  /*
   * ----------------------------------------------------------
   * FUSE
   * ----------------------------------------------------------
   */

  const fuse = useMemo(() => {
    return new Fuse(episodes, {
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,

      keys: [
        {
          name: "title",
          weight: 0.55,
        },
        {
          name: "titleAlt",
          weight: 0.25,
        },
        {
          name: "animeTitle",
          weight: 0.55,
        },
        {
          name: "slug",
          weight: 0.2,
        },
      ],
    });
  }, [episodes]);

  /*
   * ----------------------------------------------------------
   * FILTER + SORT
   * ----------------------------------------------------------
   */

  const filteredEpisodes = useMemo(() => {
    /*
     * Start with Fuse results when searching.
     * Otherwise preserve the original store order.
     */
    const searchedEpisodes =
      search.trim().length > 1
        ? fuse.search(search.trim()).map((result) => result.item)
        : [...episodes];

    const result = searchedEpisodes.filter((episode) => {
      if (!isWithinDateFilter(episode.userStats.watched_seconds)) {
        return false;
      }

      const duration = episode.userStats.duration_seconds;
      const watched = episode.userStats.watched_seconds;

      const progress =
        watched && duration && duration > 0 ? watched / duration : 0;

      const completed = progress >= 0.9;

      if (progressFilter === "completed" && !completed) {
        return false;
      }

      if (progressFilter === "in-progress" && completed) {
        return false;
      }

      return true;
    });

    /*
     * -------------------------------
     * SORT
     * -------------------------------
     */

    if (sort === "oldest") {
      result.reverse();
    }

    /*
     * `recent` intentionally preserves
     * the order returned by your store.
     */

    return result;
  }, [episodes, fuse, search, timeFilter, progressFilter, sort]);

  /*
   * ----------------------------------------------------------
   * VISIBLE ITEMS
   * ----------------------------------------------------------
   */

  const visibleEpisodes = filteredEpisodes.slice(0, visibleCount);

  const hasMore = visibleCount < filteredEpisodes.length;

  /*
   * ----------------------------------------------------------
   * RESET PAGINATION
   * ----------------------------------------------------------
   */

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, timeFilter, progressFilter, sort, dateFrom, dateTo]);

  /*
   * ----------------------------------------------------------
   * RESET FILTERS
   * ----------------------------------------------------------
   */

  const hasFilters =
    search.trim() !== "" ||
    timeFilter !== "all" ||
    progressFilter !== "all" ||
    sort !== "recent";

  const resetFilters = () => {
    setSearch("");
    setTimeFilter("all");
    setProgressFilter("all");
    setSort("recent");
    setDateFrom("");
    setDateTo("");
  };

  /*
   * ----------------------------------------------------------
   * LOADING
   * ----------------------------------------------------------
   */

  if (!initialized || loading) {
    return (
      <section className="history-browser">
        <div className="history-loading">
          <div className="history-loading__spinner" />

          <p>Loading your history...</p>
        </div>
      </section>
    );
  }

  /*
   * ----------------------------------------------------------
   * ERROR
   * ----------------------------------------------------------
   */

  if (initialized && !loading && error && episodes.length === 0) {
    return (
      <section className="history-browser">
        <div className="history-state">
          <div className="history-state__icon">!</div>

          <h2>Couldn't load your history</h2>

          <p>Something went wrong while loading your watched episodes.</p>

          <button
            type="button"
            className="history-state__button"
            onClick={() => void fetchContinueWatching()}
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  /*
   * ----------------------------------------------------------
   * EMPTY HISTORY
   * ----------------------------------------------------------
   */

  if (initialized && !loading && episodes?.length === 0) {
    return (
      <section className="history-browser">
        <div className="history-state">
          <div className="history-state__icon">◷</div>

          <h2>Your history is empty</h2>

          <p>
            Episodes you watch will appear here so you can easily find them
            again later.
          </p>

          <a href="/" className="history-state__button">
            Explore Anime
          </a>
        </div>
      </section>
    );
  }

  /*
   * ----------------------------------------------------------
   * UI
   * ----------------------------------------------------------
   */

  return (
    <section className="history-browser" aria-label="Episode history">
      {/* =====================================================
          FILTERS
      ====================================================== */}

      <div
        className={[
          "history-filters",
          mobileFiltersOpen ? "history-filters--mobile-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* SEARCH */}

        <div className="history-filter history-filter--search">
          <label htmlFor="history-search" className="history-filter__label">
            Search
          </label>

          <div className="history-search">
            <span className="history-search__icon" aria-hidden="true">
              ⌕
            </span>

            <input
              id="history-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search anime..."
              className="history-search__input"
              autoComplete="off"
            />

            {search && (
              <button
                type="button"
                className="history-search__clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* TIME */}

        <div className="history-filter">
          <label htmlFor="history-time" className="history-filter__label">
            Watched
          </label>

          <select
            id="history-time"
            value={timeFilter}
            onChange={(event) => {
              setTimeFilter(event.target.value as TimeFilter);
            }}
            className="history-filter__select"
          >
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="custom">Custom range</option>
          </select>

          {timeFilter === "custom" && (
            <div className="history-date-range">
              <div className="history-date-field">
                <label htmlFor="history-date-from">From</label>

                <input
                  id="history-date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                />
              </div>

              <div className="history-date-field">
                <label htmlFor="history-date-to">To</label>

                <input
                  id="history-date-to"
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* PROGRESS */}

        <div className="history-filter">
          <label htmlFor="history-progress" className="history-filter__label">
            Progress
          </label>

          <select
            id="history-progress"
            value={progressFilter}
            onChange={(event) =>
              setProgressFilter(event.target.value as ProgressFilter)
            }
            className="history-filter__select"
          >
            <option value="all">All episodes</option>

            <option value="in-progress">In progress</option>

            <option value="completed">Completed</option>
          </select>
        </div>

        {/* SORT */}

        <div className="history-filter">
          <label htmlFor="history-sort" className="history-filter__label">
            Sort
          </label>

          <select
            id="history-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="history-filter__select"
          >
            <option value="recent">Recently watched</option>

            <option value="oldest">Oldest watched</option>
          </select>
        </div>

        {/* RESET */}

        {hasFilters && (
          <button
            type="button"
            className="history-reset"
            onClick={resetFilters}
          >
            Reset
          </button>
        )}
      </div>

      {/* =====================================================
          RESULTS BAR
      ====================================================== */}

      <div className="history-results-bar">
        <div className="history-results">
          <strong>{filteredEpisodes.length}</strong>

          <span>
            {filteredEpisodes.length === 1 ? " episode" : " episodes"}
          </span>
        </div>

        <button
          type="button"
          className="history-mobile-filter-button"
          onClick={() => setMobileFiltersOpen((open) => !open)}
          aria-expanded={mobileFiltersOpen}
        >
          <span aria-hidden="true">☷</span>
          Filters
        </button>
      </div>

      {/* =====================================================
          NO RESULTS
      ====================================================== */}

      {filteredEpisodes.length === 0 && (
        <div className="history-state">
          <div className="history-state__icon">⌕</div>

          <h2>Nothing found</h2>

          <p>Try a different search or clear your filters.</p>

          <button
            type="button"
            className="history-state__button"
            onClick={resetFilters}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* =====================================================
          GRID
      ====================================================== */}

      {visibleEpisodes.length > 0 && (
        <>
          <div className="history-grid" aria-live="polite">
            {visibleEpisodes.map((episode) => (
              <div
                className="history-grid__item"
                key={`${episode.animenanoid}-${episode.nanoid}`}
              >
                <EpisodeCard epData={episode} forCW={true} />
              </div>
            ))}
          </div>

          {/* LOAD MORE */}

          {hasMore && (
            <div className="history-load-more">
              <button
                type="button"
                className="history-load-more__button"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              >
                <span>Load more</span>

                <span className="history-load-more__count">
                  {Math.min(PAGE_SIZE, filteredEpisodes.length - visibleCount)}{" "}
                  more
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
