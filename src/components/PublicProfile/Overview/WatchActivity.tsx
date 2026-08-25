import { memo, useMemo } from "react";

import type { PublicContinueWatching } from "@/types/profile";

import "@/styles/components/PublicProfile/watch-activity.css";

interface Props {
  continueWatching: PublicContinueWatching[];
  isOwner?: boolean;
}

const TOTAL_DAYS = 84;
const WEEKS = 12;

const WEEKDAY_LABELS = ["Mon", "Wed", "Fri"] as const;

interface ActivityDay {
  date: Date;
  key: string;
  count: number;
  dateLabel: string;
  activityLabel: string;
}

interface MonthLabel {
  label: string;
  week: number;
}

function getUtcDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getUtcStartOfDay(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    ),
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getActivityLabel(count: number): string {
  if (count === 0) {
    return "No watch activity";
  }

  if (count === 1) {
    return "1 episode activity";
  }

  return `${count} episode activities`;
}

function getLevel(count: number, maxActivity: number): number {
  if (count === 0) {
    return 0;
  }

  if (maxActivity <= 1) {
    return 4;
  }

  const ratio = count / maxActivity;

  if (ratio <= 0.25) {
    return 1;
  }

  if (ratio <= 0.5) {
    return 2;
  }

  if (ratio <= 0.75) {
    return 3;
  }

  return 4;
}

function buildActivityDays(
  continueWatching: PublicContinueWatching[],
): ActivityDay[] {
  const today = getUtcStartOfDay(new Date());

  const startDate = new Date(today);

  startDate.setUTCDate(
    startDate.getUTCDate() - (TOTAL_DAYS - 1),
  );

  const activityByDate = new Map<string, number>();

  for (const item of continueWatching) {
    if (!item.updated_at) {
      continue;
    }

    const date = new Date(item.updated_at);

    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const key = getUtcDateKey(date);

    activityByDate.set(
      key,
      (activityByDate.get(key) ?? 0) + 1,
    );
  }

  return Array.from(
    { length: TOTAL_DAYS },
    (_, index): ActivityDay => {
      const date = new Date(startDate);

      date.setUTCDate(
        startDate.getUTCDate() + index,
      );

      const key = getUtcDateKey(date);
      const count = activityByDate.get(key) ?? 0;

      return {
        date,
        key,
        count,
        dateLabel: formatDate(date),
        activityLabel: getActivityLabel(count),
      };
    },
  );
}

function getMonthLabels(
  days: ActivityDay[],
): MonthLabel[] {
  const seenWeeks = new Set<number>();
  const labels: MonthLabel[] = [];

  for (let index = 0; index < days.length; index += 1) {
    const day = days[index];

    if (day.date.getUTCDate() > 7) {
      continue;
    }

    const week = Math.floor(index / 7);

    if (seenWeeks.has(week)) {
      continue;
    }

    seenWeeks.add(week);

    labels.push({
      label: day.date.toLocaleDateString("en-US", {
        timeZone: "UTC",
        month: "short",
      }),
      week,
    });
  }

  return labels;
}

function WatchActivity({
  continueWatching,
  isOwner = false
}: Props) {
  const {
    maxActivity,
    monthLabels,
    columns,
  } = useMemo(() => {
    const activityDays =
      buildActivityDays(continueWatching);

    const max = Math.max(
      ...activityDays.map((day) => day.count),
      1,
    );

    const labels = getMonthLabels(activityDays);

    const weeks = Array.from(
      { length: WEEKS },
      (_, weekIndex) =>
        activityDays.slice(
          weekIndex * 7,
          weekIndex * 7 + 7,
        ),
    );

    return {
      days: activityDays,
      maxActivity: max,
      monthLabels: labels,
      columns: weeks,
    };
  }, [continueWatching]);

  if (continueWatching.length === 0) {
    return null;
  }

  return (
    <section
      className="watch-activity-card"
      aria-labelledby="watch-activity-title"
    >
      <header className="watch-activity-card__header">
        <div>
          <span className="watch-activity-card__eyebrow">
            📊 Watching Habits
          </span>

          <h2
            id="watch-activity-title"
            className="watch-activity-card__title"
          >
            Watch Activity
          </h2>

          <p className="watch-activity-card__subtitle">
            {isOwner ? "A look your recent anime activity." : "A look at their recent anime activity."} 
          </p>
        </div>

        <div className="watch-activity-card__summary">
          <strong>{continueWatching.length}</strong>

          <span>recent episodes</span>
        </div>
      </header>

      <div className="watch-activity">
        <div
          className="watch-activity__months"
          aria-hidden="true"
        >
          {monthLabels.map((month) => (
            <span
              key={`${month.week}-${month.label}`}
              style={{
                gridColumn: `${month.week + 1} / span 1`,
              }}
            >
              {month.label}
            </span>
          ))}
        </div>

        <div className="watch-activity__body">
          <div
            className="watch-activity__weekdays"
            aria-hidden="true"
          >
            {WEEKDAY_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div
            className="watch-activity__grid"
            aria-label="Recent watching activity"
          >
            {columns.map((week, weekIndex) => (
              <div
                key={weekIndex}
                className="watch-activity__week"
              >
                {week.map((day) => {
                  const level = getLevel(
                    day.count,
                    maxActivity,
                  );

                  return (
                    <div
                      key={day.key}
                      className="watch-activity__day-wrapper"
                    >
                      <span
                        className={`watch-activity__day watch-activity__day--${level}`}
                        tabIndex={0}
                        role="img"
                        aria-label={`${day.dateLabel}: ${day.activityLabel}`}
                      >
                        <span className="watch-activity__tooltip">
                          <strong>
                            {day.activityLabel}
                          </strong>

                          <small>
                            {day.dateLabel}
                          </small>
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="watch-activity__legend">
          <span>Less</span>

          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className={`watch-activity__legend-block watch-activity__day--${level}`}
              aria-hidden="true"
            />
          ))}

          <span>More</span>
        </div>
      </div>
    </section>
  );
}

export default memo(WatchActivity);