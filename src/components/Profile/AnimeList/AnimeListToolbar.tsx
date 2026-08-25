import { useState } from "react";
import type { SortMode } from "@/types/animeList";
import ProfileIcon from "../ProfileIcon";
import { XIcon } from "@phosphor-icons/react";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;

  viewMode: "detailed" | "compact" | "cards";
  onViewChange: (value: "detailed" | "compact" | "cards") => void;

  sort: SortMode;
  onSortChange: (value: SortMode) => void;
}

const SORT_OPTIONS: Array<[SortMode, string]> = [
  ["default", "Default"],
  ["title", "Title"],
  ["score", "Score"],
  ["progress", "Progress"],
  ["year", "Release year"],
  ["popularity", "Popularity"],
];

export default function AnimeListToolbar({
  search,
  onSearchChange,
  viewMode,
  onViewChange,
  sort,
  onSortChange,
}: Props) {
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <div className="anime-list__toolbar">
      <div className="anime-list__search">
        <span className="anime-list__search-icon">
          <ProfileIcon name="search" />
        </span>

        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search your anime..."
          aria-label="Search anime"
        />

        {search && (
          <button
            type="button"
            className="anime-list__search-clear"
            onClick={() => onSearchChange("")}
          >
            <XIcon size={20} />
          </button>
        )}
      </div>

      <div className="anime-list__toolbar-actions">
        <div className="anime-list__view-switcher">
          <button
            type="button"
            className={viewMode === "detailed" ? "is-active" : ""}
            onClick={() => onViewChange("detailed")}
            aria-label="Detailed view"
          >
            <ProfileIcon name="detailed" weight="bold" />
          </button>

          <button
            type="button"
            className={viewMode === "compact" ? "is-active" : ""}
            onClick={() => onViewChange("compact")}
            aria-label="Compact view"
          >
            <ProfileIcon name="compact" />
          </button>

          <button
            type="button"
            className={viewMode === "cards" ? "is-active" : ""}
            onClick={() => onViewChange("cards")}
            aria-label="Card view"
          >
            <ProfileIcon name="cards" weight="fill" />
          </button>
        </div>

        <div className="anime-list__sort">
          <button
            type="button"
            className="anime-list__sort-trigger"
            onClick={() => setSortOpen((value) => !value)}
          >
            <span>Sort</span>
            <ProfileIcon name="sort" />
          </button>

          {sortOpen && (
            <div className="anime-list__sort-menu">
              {SORT_OPTIONS.map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={sort === value ? "is-active" : ""}
                  onClick={() => {
                    onSortChange(value);
                    setSortOpen(false);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
