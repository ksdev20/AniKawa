import AnimeCardReact from "@/components/AnimeCard/AnimeCardReact";
import "@/styles/components/PublicProfile/recently-completed.css";

import type { RpcAnimeList } from "@/types/animeList";

interface Props {
  userAnimeList: RpcAnimeList[];
  limit?: number;
}

function formatCompletedDate(date: string | null): string {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export default function RecentlyCompleted({ userAnimeList, limit = 6 }: Props) {
  const recentlyCompleted = userAnimeList
    .filter(
      (item) =>
        item.userAnime.status === "completed" &&
        item.userAnime.completed_at !== null,
    )
    .sort((a, b) => {
      const aTime = new Date(a.userAnime.completed_at!).getTime();

      const bTime = new Date(b.userAnime.completed_at!).getTime();

      return bTime - aTime;
    })
    .slice(0, limit);

  if (recentlyCompleted.length === 0) {
    return null;
  }

  return (
    <section
      className="recently-completed"
      aria-labelledby="recently-completed-title"
    >
      <div className="recently-completed__header">
        <div>
          <p className="recently-completed__eyebrow">Recently finished</p>

          <h2
            id="recently-completed-title"
            className="recently-completed__title"
          >
            🎬 Recently Completed
          </h2>
        </div>

        <a
          href="?tab=anime"
          className="recently-completed__view-all"
          aria-label="View anime list"
        >
          View list
          <span aria-hidden="true">→</span>
        </a>
      </div>

      <div className="recently-completed__grid">
        {recentlyCompleted.map((item) => {
          const recentlyCompletedStr = formatCompletedDate(
            item.userAnime.completed_at,
          );

          return (
            <AnimeCardReact
              key={item.userAnime.anime_nanoid}
              anime={item}
              recentlyCompleted={recentlyCompletedStr}
            />
          );
        })}
      </div>
    </section>
  );
}
