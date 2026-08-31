import { useMemo, useState } from "react";

import { Icon } from "@/icons/icons";

type SortOption = {
  value: string;
  label: string;
};

interface ListFiltersProps {
  search: string;
  sort: string;
  status: string;
  format: string;
  language: string;
  year: number | null;
  minScore: number | null;
  episodes: string;
  country: string;

  selectedGenres: string[];

  genres: string[];
  statuses: string[];
  formats: string[];
  years: number[];
  countries: string[];

  totalResults: number;

  sortOptions: SortOption[];
}

export default function ListFilters({
  search,
  sort,
  status,
  format,
  language,
  year,
  minScore,
  episodes,
  country,

  selectedGenres,

  genres,
  statuses,
  formats,
  years,
  countries,

  totalResults,

  sortOptions,
}: ListFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [genreSearch, setGenreSearch] = useState("");

  const filteredGenres = useMemo(() => {
    const query = genreSearch.trim().toLowerCase();

    if (!query) {
      return genres;
    }

    return genres.filter((genre) => genre.toLowerCase().includes(query));
  }, [genres, genreSearch]);

  return (
    <section className="list-filter-system" aria-label="Anime filters">
      {/* ============================================================
          SEARCH + MOBILE FILTER BUTTON
         ============================================================ */}

      <div className="list-filter-topbar">
        <form method="GET" action="/list" className="list-search-form">
          <div className="list-search-box">
            <Icon name="search" size={20} color="currentColor" />

            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Search anime, genres, themes..."
              aria-label="Search anime"
            />

            <input type="hidden" name="sort" value={sort} />

            {status && <input type="hidden" name="status" value={status} />}

            {format && <input type="hidden" name="format" value={format} />}

            {language && (
              <input type="hidden" name="language" value={language} />
            )}

            {year && <input type="hidden" name="year" value={year} />}

            {minScore && (
              <input type="hidden" name="minScore" value={minScore} />
            )}

            {episodes && (
              <input type="hidden" name="episodes" value={episodes} />
            )}

            {country && <input type="hidden" name="country" value={country} />}

            {selectedGenres.map((genre) => (
              <input key={genre} type="hidden" name="genre" value={genre} />
            ))}
          </div>

          <button type="submit" className="list-search-submit">
            Search
          </button>
        </form>

        <button
          type="button"
          className="list-mobile-filter-toggle"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="list-filter-panel"
        >
          <Icon name="filter" size={18} color="currentColor" />
          Filters
        </button>
      </div>

      {/* ============================================================
          FILTER PANEL
         ============================================================ */}

      <div
        id="list-filter-panel"
        className={`list-filter-panel ${isOpen ? "is-open" : ""}`}
      >
        <form method="GET" action="/list" className="list-filter-form">
          {/* Preserve search */}

          {search && <input type="hidden" name="search" value={search} />}

          <div className="list-filter-panel-header">
            <div>
              <p className="list-filter-kicker">Refine your search</p>

              <h2>Filters</h2>
            </div>

            <a href="/list" className="list-filter-reset">
              Reset
            </a>
          </div>

          {/* SORT */}

          <div className="list-filter-group">
            <label htmlFor="list-sort" className="list-filter-label">
              Sort by
            </label>

            <select
              id="list-sort"
              name="sort"
              defaultValue={sort}
              className="list-filter-select"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* STATUS */}

          {statuses.length > 0 && (
            <fieldset className="list-filter-group">
              <legend className="list-filter-label">Status</legend>

              <div className="list-filter-options">
                <label className="list-filter-option">
                  <input
                    type="radio"
                    name="status"
                    value=""
                    defaultChecked={!status}
                  />

                  <span>All</span>
                </label>

                {statuses.map((item) => (
                  <label key={item} className="list-filter-option">
                    <input
                      type="radio"
                      name="status"
                      value={item}
                      defaultChecked={status === item}
                    />

                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {/* FORMAT */}

          {formats.length > 0 && (
            <fieldset className="list-filter-group">
              <legend className="list-filter-label">Format</legend>

              <div className="list-filter-options">
                <label className="list-filter-option">
                  <input
                    type="radio"
                    name="format"
                    value=""
                    defaultChecked={!format}
                  />

                  <span>All</span>
                </label>

                {formats.map((item) => (
                  <label key={item} className="list-filter-option">
                    <input
                      type="radio"
                      name="format"
                      value={item}
                      defaultChecked={format === item}
                    />

                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {/* LANGUAGE */}

          <fieldset className="list-filter-group">
            <legend className="list-filter-label">Language</legend>

            <div className="list-filter-options">
              <label className="list-filter-option">
                <input
                  type="radio"
                  name="language"
                  value=""
                  defaultChecked={!language}
                />

                <span>All</span>
              </label>

              <label className="list-filter-option">
                <input
                  type="radio"
                  name="language"
                  value="sub"
                  defaultChecked={language === "sub"}
                />

                <span>Subtitled</span>
              </label>

              <label className="list-filter-option">
                <input
                  type="radio"
                  name="language"
                  value="dub"
                  defaultChecked={language === "dub"}
                />

                <span>Dubbed</span>
              </label>

              <label className="list-filter-option">
                <input
                  type="radio"
                  name="language"
                  value="both"
                  defaultChecked={language === "both"}
                />

                <span>Sub + Dub</span>
              </label>
            </div>
          </fieldset>

          {/* GENRES */}

          {genres.length > 0 && (
            <fieldset className="list-filter-group">
              <legend className="list-filter-label">Genres</legend>

              <input
                type="search"
                value={genreSearch}
                onChange={(event) => setGenreSearch(event.target.value)}
                placeholder="Search genres..."
                className="list-genre-search"
                aria-label="Search genres"
              />

              <div className="list-genre-options">
                {filteredGenres.map((genre) => (
                  <label key={genre} className="list-genre-option">
                    <input
                      type="checkbox"
                      name="genre"
                      value={genre}
                      defaultChecked={selectedGenres.includes(genre)}
                    />

                    <span>{genre}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {/* YEAR */}

          {years.length > 0 && (
            <div className="list-filter-group">
              <label htmlFor="list-year" className="list-filter-label">
                Release year
              </label>

              <select
                id="list-year"
                name="year"
                defaultValue={year ?? ""}
                className="list-filter-select"
              >
                <option value="">Any year</option>

                {years.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* RATING */}

          <div className="list-filter-group">
            <label htmlFor="list-rating" className="list-filter-label">
              Minimum rating
            </label>

            <select
              id="list-rating"
              name="minScore"
              defaultValue={minScore ?? ""}
              className="list-filter-select"
            >
              <option value="">Any rating</option>

              <option value="7">7.0+</option>

              <option value="7.5">7.5+</option>

              <option value="8">8.0+</option>

              <option value="8.5">8.5+</option>

              <option value="9">9.0+</option>
            </select>
          </div>

          {/* EPISODES */}

          <div className="list-filter-group">
            <label htmlFor="list-episodes" className="list-filter-label">
              Episode count
            </label>

            <select
              id="list-episodes"
              name="episodes"
              defaultValue={episodes}
              className="list-filter-select"
            >
              <option value="">Any length</option>

              <option value="1-12">1–12 episodes</option>

              <option value="13-24">13–24 episodes</option>

              <option value="25-50">25–50 episodes</option>

              <option value="51-100">51–100 episodes</option>

              <option value="100-plus">100+ episodes</option>
            </select>
          </div>

          {/* COUNTRY */}

          {countries.length > 0 && (
            <div className="list-filter-group">
              <label htmlFor="list-country" className="list-filter-label">
                Country
              </label>

              <select
                id="list-country"
                name="country"
                defaultValue={country}
                className="list-filter-select"
              >
                <option value="">All countries</option>

                {countries.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="list-filter-actions">
            <a href="/list" className="list-secondary-button">
              Clear
            </a>

            <button type="submit" className="list-primary-button">
              Apply filters
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
