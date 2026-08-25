import "@/styles/components/PublicProfile/anime-list-breakdown.css";

import {
  EyeIcon,
  CheckCircleIcon,
  BookmarkSimpleIcon,
  PauseCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";

import type { PublicStats } from "@/types/profile";

interface Props {
  stats: PublicStats;
}

export default function AnimeListBreakdown({ stats }: Props) {
  const breakdown = [
    {
      key: "watching",
      label: "Watching",
      value: stats.watching,
      Icon: EyeIcon,
    },
    {
      key: "completed",
      label: "Completed",
      value: stats.completed,
      Icon: CheckCircleIcon,
    },
    {
      key: "planning",
      label: "Planning",
      value: stats.planning,
      Icon: BookmarkSimpleIcon,
    },
    {
      key: "paused",
      label: "Paused",
      value: stats.paused,
      Icon: PauseCircleIcon,
    },
    {
      key: "dropped",
      label: "Dropped",
      value: stats.dropped,
      Icon: XCircleIcon,
    },
  ] as const;

  const maxValue = Math.max(...breakdown.map((item) => item.value), 1);

  const totalTracked = breakdown.reduce((total, item) => total + item.value, 0);

  if (totalTracked <= 0) {
    return null;
  }

  const items = breakdown.map((item) => ({
    ...item,
    percentage: Math.round((item.value / maxValue) * 100),
    share: Math.round((item.value / totalTracked) * 100),
  }));

  return (
    <section
      className="anime-list-breakdown"
      aria-labelledby="anime-list-breakdown-title"
    >
      <div className="anime-list-breakdown__header">
        <div>
          <p className="anime-list-breakdown__eyebrow">Personal collection</p>

          <h2
            id="anime-list-breakdown-title"
            className="anime-list-breakdown__title"
          >
            📈 Anime List
          </h2>
        </div>

        <div className="anime-list-breakdown__total">
          <strong>{stats.total}</strong>

          <span>anime</span>
        </div>
      </div>

      <div className="anime-list-breakdown__chart">
        {items.map((item) => {
          const Icon = item.Icon;

          return (
            <div key={item.key} className="anime-list-breakdown__row">
              <div className="anime-list-breakdown__label">
                <span
                  className={[
                    "anime-list-breakdown__icon",
                    `anime-list-breakdown__icon--${item.key}`,
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <Icon size={16} weight="duotone" />
                </span>

                <span className="anime-list-breakdown__name">{item.label}</span>
              </div>

              <div className="anime-list-breakdown__bar-wrap">
                <div
                  className={[
                    "anime-list-breakdown__bar",
                    `anime-list-breakdown__bar--${item.key}`,
                  ].join(" ")}
                  style={
                    {
                      "--bar-width": `${item.percentage}%`,
                    } as React.CSSProperties
                  }
                  aria-hidden="true"
                >
                  <span className="anime-list-breakdown__bar-fill" />
                </div>
              </div>

              <div className="anime-list-breakdown__value">
                <strong>{item.value}</strong>

                <span>{item.share}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="anime-list-breakdown__note">
        Based on this user's anime list
      </p>
    </section>
  );
}
