import ProfileIcon from "../ProfileIcon";

import type {
  AnimeFilters,
  AnimeFormat,
  AnimeReleaseStatus,
} from "@/types/animeList";

interface Props {
  filters: AnimeFilters;
  open: boolean;
  onToggle: () => void;

  onChange: <K extends keyof AnimeFilters>(
    key: K,
    value: AnimeFilters[K],
  ) => void;

  onReset: () => void;
}

const formats: readonly AnimeFormat[] = [
  "All formats",
  "TV",
  "Movie",
  "OVA",
  "ONA",
  "Special",
  "Music",
];

const releaseStatuses: readonly AnimeReleaseStatus[] = [
  "All statuses",
  "Finished",
  "Releasing",
  "Cancelled",
];

const countries: readonly string[] = [
  "All countries",
  "Japan",
  "China",
  "South Korea",
  "United States",
  "France",
];

const genres: readonly string[] = [
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
];

export default function AnimeListFilters({
  filters,
  open,
  onToggle,
  onChange,
  onReset,
}: Props) {
  return (
    <div className="anime-list__filters">
      <button
        type="button"
        className="anime-list__filters-header"
        onClick={onToggle}
        aria-expanded={open}
      >
        <div>
          <span>REFINE</span>
          <strong>Filters</strong>
        </div>

        <span className="anime-list__filters-toggle">
          {open ? (
            <ProfileIcon name="minus" size={16} />
          ) : (
            <ProfileIcon name="plus" size={16} />
          )}
        </span>
      </button>

      {open && (
        <div className="anime-list__filters-content">
          <FilterSelect
            label="Format"
            value={filters.format}
            options={formats}
            onChange={(value) =>
              onChange("format", value as AnimeFilters["format"])
            }
          />

          <FilterSelect
            label="Status"
            value={filters.releaseStatus}
            options={releaseStatuses}
            onChange={(value) =>
              onChange("releaseStatus", value as AnimeFilters["releaseStatus"])
            }
          />

          <FilterSelect
            label="Country"
            value={filters.country}
            options={countries}
            onChange={(value) => onChange("country", value)}
          />

          <FilterSelect
            label="Genre"
            value={filters.genre}
            options={genres}
            onChange={(value) => onChange("genre", value)}
          />

          <div className="anime-list__filter-field">
            <div className="anime-list__filter-label">
              <span>Year</span>
            </div>

            <div className="anime-list__year-inputs">
              <input
                type="number"
                min="1900"
                max="2100"
                placeholder="From"
                value={filters.yearFrom}
                onChange={(event) => onChange("yearFrom", event.target.value)}
              />

              <span>—</span>

              <input
                type="number"
                min="1900"
                max="2100"
                placeholder="To"
                value={filters.yearTo}
                onChange={(event) => onChange("yearTo", event.target.value)}
              />
            </div>

            <div className="anime-list__year-shortcuts">
              <button
                type="button"
                onClick={() => {
                  onChange("yearFrom", "2020");
                  onChange("yearTo", "2026");
                }}
              >
                2020s
              </button>

              <button
                type="button"
                onClick={() => {
                  onChange("yearFrom", "2010");
                  onChange("yearTo", "2019");
                }}
              >
                2010s
              </button>

              <button
                type="button"
                onClick={() => {
                  onChange("yearFrom", "2000");
                  onChange("yearTo", "2009");
                }}
              >
                2000s
              </button>

              <button
                type="button"
                onClick={() => {
                  onChange("yearFrom", "1990");
                  onChange("yearTo", "1999");
                }}
              >
                90s
              </button>
            </div>
          </div>

          <button type="button" className="anime-list__reset" onClick={onReset}>
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

interface SelectProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}

function FilterSelect({ label, value, options, onChange }: SelectProps) {
  return (
    <div className="anime-list__filter-field">
      <div className="anime-list__filter-label">
        <span>{label}</span>
      </div>

      <div className="anime-list__select">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>

        <span>
          <ProfileIcon name="chevron-down" />
        </span>
      </div>
    </div>
  );
}
