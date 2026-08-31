import { useEffect, useMemo, useState } from "react";

import type { Anime } from "@/lib/anime/types";

import { getAnimeDiscovery } from "@/lib/anime/discovery/getAnimeDiscovery";

import {
  DEFAULT_ANIME_CATALOGUE_FILTERS,
  type AnimeCatalogueFilters,
} from "@/lib/anime/filtering/animeFilters";

import type { AnimeSortMode } from "@/lib/anime/filtering/sortAnime";

import AnimeCardReact from "../AnimeCard/AnimeCardReact";

/* ================================================================
   TYPES
   ================================================================ */

interface Props {
  anime: Anime[];
  categoryName: string;
}

/* ================================================================
   CONSTANTS
   ================================================================ */

const PAGE_SIZE = 30;

const SORT_OPTIONS: Array<[AnimeSortMode, string]> = [
  ["default", "Default"],
  ["title", "Title"],
  ["score", "Score"],
  ["year", "Release year"],
  ["popularity", "Popularity"],
];

const FORMATS = [
  "All formats",
  "TV",
  "Movie",
  "OVA",
  "ONA",
  "Special",
  "Music",
] as const;

const STATUSES = [
  "All statuses",
  "Finished",
  "Releasing",
  "Cancelled",
] as const;

const COUNTRIES = [
  "All countries",
  "Japan",
  "China",
  "South Korea",
  "United States",
  "France",
] as const;

const GENRES = [
  "All genres",
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Mystery",
  "Sci-Fi",
  "Sports",
  "Supernatural",
  "Thriller",
] as const;

/* ================================================================
   COMPONENT
   ================================================================ */

export default function CategoryAnimeBrowser({ anime, categoryName }: Props) {
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState<AnimeCatalogueFilters>(
    DEFAULT_ANIME_CATALOGUE_FILTERS,
  );

  const [sort, setSort] = useState<AnimeSortMode>("default");

  const [page, setPage] = useState(1);

  const [filtersOpen, setFiltersOpen] = useState(false);

  /* ==============================================================
     DISCOVERY
     ============================================================== */

  const discoveredAnime = useMemo(() => {
    return getAnimeDiscovery(anime, {
      filters,
      search,
      sort,
    });
  }, [anime, filters, search, sort]);

  /* ==============================================================
     PAGINATION
     ============================================================== */

  const totalResults = discoveredAnime.length;

  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);

  const paginatedAnime = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return discoveredAnime.slice(start, start + PAGE_SIZE);
  }, [discoveredAnime, currentPage]);

  /* ==============================================================
     RESET PAGE WHEN DISCOVERY CHANGES
     ============================================================== */

  useEffect(() => {
    setPage(1);
  }, [search, filters, sort]);

  /* ==============================================================
     FILTER HELPERS
     ============================================================== */

  const updateFilter = <K extends keyof AnimeCatalogueFilters>(
    key: K,
    value: AnimeCatalogueFilters[K],
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setSearch("");
    setFilters(DEFAULT_ANIME_CATALOGUE_FILTERS);
    setSort("default");
    setPage(1);
  };

  const hasActiveFilters =
    search.trim().length > 0 ||
    filters.format !== "All formats" ||
    filters.releaseStatus !== "All statuses" ||
    filters.country !== "All countries" ||
    filters.genre !== "All genres" ||
    filters.yearFrom !== "" ||
    filters.yearTo !== "";

  /* ==============================================================
     PAGINATION HELPERS
     ============================================================== */

  const goToPage = (nextPage: number) => {
    const safePage = Math.max(1, Math.min(nextPage, totalPages));

    setPage(safePage);

    requestAnimationFrame(() => {
      document.getElementById("category-browser-title")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const visiblePages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis", totalPages] as const;
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "ellipsis",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ] as const;
    }

    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      totalPages,
    ] as const;
  }, [currentPage, totalPages]);

  /* ==============================================================
     RESULT RANGE
     ============================================================== */

  const resultStart =
    totalResults === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const resultEnd = Math.min(currentPage * PAGE_SIZE, totalResults);

  /* ==============================================================
     RENDER
     ============================================================== */

  return (
    <section
      className="category-browser"
      aria-labelledby="category-browser-title"
    >
      {/* ============================================================
          HEADER
          ============================================================ */}

      <header className="category-browser__header">
        <div className="category-browser__heading">
          <span className="category-browser__eyebrow">
            EXPLORE THE CATALOGUE
          </span>

          <h2 id="category-browser-title" className="category-browser__title">
            Find {categoryName} anime
          </h2>

          <p className="category-browser__description">
            Search and refine the {categoryName.toLowerCase()} catalogue by
            format, release status, country, genre, year, and more.
          </p>
        </div>

        <div className="category-browser__count" aria-live="polite">
          <strong>{totalResults}</strong>

          <span>{totalResults === 1 ? "title" : "titles"}</span>
        </div>
      </header>

      {/* ============================================================
          TOOLBAR
          ============================================================ */}

      <div className="category-browser__toolbar">
        <div className="category-browser__search">
          <span className="category-browser__search-icon" aria-hidden="true">
            ⌕
          </span>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${categoryName.toLowerCase()} anime...`}
            aria-label={`Search ${categoryName} anime`}
          />

          {search && (
            <button
              type="button"
              className="category-browser__search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <button
          type="button"
          className={`category-browser__filter-trigger ${
            filtersOpen ? "is-active" : ""
          }`}
          onClick={() => setFiltersOpen((value) => !value)}
          aria-expanded={filtersOpen}
          aria-controls="category-browser-filters"
        >
          <span>Filters</span>

          <span className="category-browser__filter-icon" aria-hidden="true">
            {filtersOpen ? "−" : "+"}
          </span>
        </button>

        <label className="category-browser__sort">
          <span>Sort</span>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as AnimeSortMode)}
            aria-label="Sort anime"
          >
            {SORT_OPTIONS.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* ============================================================
          FILTER PANEL
          ============================================================ */}

      {filtersOpen && (
        <div
          id="category-browser-filters"
          className="category-browser__filters"
        >
          <FilterSelect
            label="Format"
            value={filters.format}
            options={FORMATS}
            onChange={(value) =>
              updateFilter("format", value as AnimeCatalogueFilters["format"])
            }
          />

          <FilterSelect
            label="Release status"
            value={filters.releaseStatus}
            options={STATUSES}
            onChange={(value) =>
              updateFilter(
                "releaseStatus",
                value as AnimeCatalogueFilters["releaseStatus"],
              )
            }
          />

          <FilterSelect
            label="Country"
            value={filters.country}
            options={COUNTRIES}
            onChange={(value) =>
              updateFilter("country", value as AnimeCatalogueFilters["country"])
            }
          />

          <FilterSelect
            label="Genre"
            value={filters.genre}
            options={GENRES}
            onChange={(value) =>
              updateFilter("genre", value as AnimeCatalogueFilters["genre"])
            }
          />

          <div className="category-browser__field">
            <span>Release year</span>

            <div className="category-browser__year">
              <input
                type="number"
                min="1900"
                max="2100"
                placeholder="From"
                value={filters.yearFrom}
                onChange={(event) =>
                  updateFilter("yearFrom", event.target.value)
                }
                aria-label="Release year from"
              />

              <span aria-hidden="true">—</span>

              <input
                type="number"
                min="1900"
                max="2100"
                placeholder="To"
                value={filters.yearTo}
                onChange={(event) => updateFilter("yearTo", event.target.value)}
                aria-label="Release year to"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="category-browser__clear"
              onClick={resetFilters}
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* ============================================================
          RESULT META
          ============================================================ */}

      {totalResults > 0 && (
        <div className="category-browser__result-meta">
          <span>
            Showing{" "}
            <strong>
              {resultStart}–{resultEnd}
            </strong>{" "}
            of <strong>{totalResults}</strong>
          </span>

          {hasActiveFilters && (
            <button type="button" onClick={resetFilters}>
              Reset discovery
            </button>
          )}
        </div>
      )}

      {/* ============================================================
          RESULTS
          ============================================================ */}

      {paginatedAnime.length > 0 ? (
        <div className="category-browser__grid">
          {paginatedAnime.map((item) => (
            <AnimeCardReact key={item.nanoid} anime={item} forNewPop={true} />
          ))}
        </div>
      ) : (
        <div className="category-browser__empty">
          <span className="category-browser__empty-icon" aria-hidden="true">
            ⌕
          </span>

          <h3>No anime found</h3>

          <p>
            Nothing matches your current search and filters. Try broadening your
            selection.
          </p>

          <button type="button" onClick={resetFilters}>
            Reset discovery
          </button>
        </div>
      )}

      {/* ============================================================
          PAGINATION
          ============================================================ */}

      {totalPages > 1 && (
        <nav
          className="category-browser__pagination"
          aria-label="Anime catalogue pagination"
        >
          <button
            type="button"
            className="category-browser__page-button category-browser__page-button--arrow"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            ←
          </button>

          <div className="category-browser__pages">
            {visiblePages.map((pageNumber, index) =>
              pageNumber === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="category-browser__ellipsis"
                  aria-hidden="true"
                >
                  …
                </span>
              ) : (
                <button
                  type="button"
                  key={pageNumber}
                  className={`category-browser__page-button ${
                    pageNumber === currentPage ? "is-active" : ""
                  }`}
                  onClick={() => goToPage(pageNumber)}
                  aria-current={pageNumber === currentPage ? "page" : undefined}
                >
                  {pageNumber}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            className="category-browser__page-button category-browser__page-button--arrow"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            →
          </button>
        </nav>
      )}

      {totalPages > 1 && (
        <div className="category-browser__mobile-pagination">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            ←
          </button>

          <span>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            →
          </button>
        </div>
      )}
    </section>
  );
}

/* ================================================================
   FILTER SELECT
   ================================================================ */

interface FilterSelectProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="category-browser__field">
      <span>{label}</span>

      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
