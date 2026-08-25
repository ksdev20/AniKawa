import type { AnimeRecord } from "@/lib/anime/types";
import type {
  AnimePersonality,
  AnimePersonalityInput,
  AnimePersonalityTrait,
  PublicFavorite,
  PublicContinueWatching,
} from "@/types/profile";

// export type AnimePersonality = {
//   title: string;
//   emoji: string;
//   traits: PersonalityTrait[];
//   description: string;
// };

type GenreProfile = {
  name: string;
  count: number;
};

type GenreDefinition = {
  emoji: string;
  label: string;
  title: string;
  description: string;
};

const MIN_WATCHED_PERCENTAGE = 0.1;

const GENRE_PROFILES: Record<string, GenreDefinition> = {
  action: {
    emoji: "⚔️",
    label: "Action Lover",
    title: "Action Lover",
    description:
      "action-heavy stories packed with intense battles, momentum, and high-stakes moments.",
  },

  adventure: {
    emoji: "🗺️",
    label: "Adventure Seeker",
    title: "Adventure Seeker",
    description:
      "adventures filled with exploration, discovery, and worlds worth getting lost in.",
  },

  fantasy: {
    emoji: "🌌",
    label: "Fantasy Explorer",
    title: "Fantasy Explorer",
    description:
      "fantasy worlds with imaginative settings, supernatural elements, and larger-than-life stories.",
  },

  "sci-fi": {
    emoji: "🚀",
    label: "Sci-Fi Dreamer",
    title: "Sci-Fi Dreamer",
    description:
      "science-fiction concepts, futuristic worlds, and stories that explore what could exist beyond the ordinary.",
  },

  "science fiction": {
    emoji: "🚀",
    label: "Sci-Fi Dreamer",
    title: "Sci-Fi Dreamer",
    description:
      "science-fiction concepts, futuristic worlds, and stories that explore what could exist beyond the ordinary.",
  },

  psychological: {
    emoji: "🧠",
    label: "Psychological Enjoyer",
    title: "Psychological Enjoyer",
    description:
      "psychological themes, layered characters, mind games, and stories that keep the viewer thinking after the episode ends.",
  },

  mystery: {
    emoji: "🔍",
    label: "Mystery Seeker",
    title: "Mystery Seeker",
    description:
      "mysteries, unanswered questions, hidden motives, and stories that reward paying close attention.",
  },

  romance: {
    emoji: "💜",
    label: "Romance Enthusiast",
    title: "Romance Enthusiast",
    description:
      "romance-driven stories where relationships, emotions, and character chemistry take center stage.",
  },

  comedy: {
    emoji: "😂",
    label: "Comedy Fan",
    title: "Comedy Fan",
    description:
      "comedy that keeps things light, entertaining, and genuinely fun to watch.",
  },

  drama: {
    emoji: "🎭",
    label: "Drama Enthusiast",
    title: "Drama Enthusiast",
    description:
      "emotionally driven stories with strong character arcs, difficult choices, and memorable moments.",
  },

  horror: {
    emoji: "👻",
    label: "Horror Seeker",
    title: "Horror Seeker",
    description:
      "dark atmospheres, unsettling ideas, and stories that aren't afraid to get seriously disturbing.",
  },

  thriller: {
    emoji: "🔥",
    label: "Thriller Chaser",
    title: "Thriller Chaser",
    description:
      "tense stories, unpredictable turns, and episodes that make it difficult to stop watching.",
  },

  sports: {
    emoji: "🏆",
    label: "Sports Anime Fan",
    title: "Sports Anime Fan",
    description:
      "competitive stories fueled by ambition, rivalry, teamwork, and the thrill of pushing past personal limits.",
  },

  historical: {
    emoji: "🏯",
    label: "History Explorer",
    title: "History Explorer",
    description:
      "historical settings, cultures, and stories that bring another era to life.",
  },
};
function normalizeGenre(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function getGenreProfiles(
  continueWatching: PublicContinueWatching[],
  animeRecords: AnimeRecord[],
): GenreProfile[] {
  const watchedAnimeIds = new Set<string>();

  for (const item of continueWatching) {
    const duration = item.duration_seconds ?? 0;
    const watched = item.watched_seconds ?? 0;

    if (duration <= 0 || watched <= 0) {
      continue;
    }

    if (watched / duration >= MIN_WATCHED_PERCENTAGE) {
      watchedAnimeIds.add(item.anime_id);
    }
  }

  const genreCounts = new Map<string, number>();

  for (const record of animeRecords) {
    if (!watchedAnimeIds.has(record.anime.nanoid)) {
      continue;
    }

    for (const genre of record.anime.genres ?? []) {
      const normalized = normalizeGenre(genre);

      if (!normalized) {
        continue;
      }

      genreCounts.set(normalized, (genreCounts.get(normalized) ?? 0) + 1);
    }
  }

  return [...genreCounts.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }

      return a[0].localeCompare(b[0]);
    })
    .map(([name, count]) => ({
      name,
      count,
    }));
}

function getFavoriteCount(favorites: PublicFavorite[]): number {
  return favorites.length;
}

function getTraits(topGenres: GenreProfile[]): AnimePersonalityTrait[] {
  const traits: AnimePersonalityTrait[] = [];

  for (const genre of topGenres.slice(0, 3)) {
    const profile = GENRE_PROFILES[genre.name];

    if (!profile) {
      continue;
    }

    traits.push({
      emoji: profile.emoji,
      label: profile.label,
    });
  }

  if (!traits.length) {
    traits.push({
      emoji: "✨",
      label: "Anime Explorer",
    });
  }

  return traits;
}

function getPersonalityIdentity(
  topGenres: GenreProfile[],
): Pick<AnimePersonality, "title" | "emoji"> {
  const genreSet = new Set(topGenres.map((genre) => genre.name));

  if (genreSet.has("action") && genreSet.has("fantasy")) {
    return {
      title: "Battlefield Dreamer",
      emoji: "⚔️",
    };
  }

  if (genreSet.has("psychological") && genreSet.has("mystery")) {
    return {
      title: "Mind Game Mastermind",
      emoji: "🧠",
    };
  }

  if (genreSet.has("action") && genreSet.has("adventure")) {
    return {
      title: "Adventure Warrior",
      emoji: "🗡️",
    };
  }

  if (genreSet.has("romance") && genreSet.has("drama")) {
    return {
      title: "Emotional Storyteller",
      emoji: "💜",
    };
  }

  if (genreSet.has("fantasy") && genreSet.has("adventure")) {
    return {
      title: "World Explorer",
      emoji: "🌌",
    };
  }

  const primaryGenre = topGenres[0];

  if (!primaryGenre) {
    return {
      title: "Anime Explorer",
      emoji: "✨",
    };
  }

  const profile = GENRE_PROFILES[primaryGenre.name];

  return {
    title: profile?.title ?? "Anime Explorer",
    emoji: profile?.emoji ?? "✨",
  };
}

function getDescription(
  topGenres: GenreProfile[],
  completed: number,
  watching: number,
  favoriteCount: number,
  averageScore: number | null,
): string {
  const genreNames = topGenres.slice(0, 3).map((genre) => genre.name);

  let description = "";

  if (genreNames.length >= 3) {
    const [first, second, third] = genreNames;

    description =
      `${GENRE_PROFILES[first]?.description ?? `${first} stories`} ` +
      `There is also a noticeable pull toward ${second} and ${third} themes.`;
  } else if (genreNames.length === 2) {
    const [first, second] = genreNames;

    description =
      `${GENRE_PROFILES[first]?.description ?? `${first} stories`} ` +
      `There is also a noticeable taste for ${second}.`;
  } else if (genreNames.length === 1) {
    const [first] = genreNames;

    description = GENRE_PROFILES[first]?.description ?? `${first} stories.`;
  }

  if (completed >= 20) {
    description +=
      " Once a story hooks them, they clearly like seeing it through.";
  } else if (averageScore !== null && averageScore >= 8) {
    description +=
      " They also seem to have a high bar for what earns their attention.";
  } else if (favoriteCount >= 10) {
    description +=
      " When something really clicks, it tends to become one of their favorites.";
  } else if (watching >= 5) {
    description += " They're rarely sticking to just one story at a time.";
  }

  return description;
}

export function getAnimePersonality({
  continueWatching,
  animeRecords,
  favorites,
  stats,
}: AnimePersonalityInput): AnimePersonality | null {
  if (!animeRecords.length && !continueWatching.length) {
    return null;
  }

  const genres = getGenreProfiles(continueWatching, animeRecords);

  const favoriteCount = getFavoriteCount(favorites);

  const completed = stats?.completed ?? 0;
  const watching = stats?.watching ?? 0;
  const averageScore = stats?.average_score ?? null;

  /*
   * No usable genre data.
   * Fall back to broader personality signals.
   */
  if (!genres.length) {
    if (completed >= 10) {
      return {
        title: "Dedicated Watcher",
        emoji: "🍿",
        traits: [
          {
            emoji: "🍿",
            label: "Dedicated Watcher",
          },
          {
            emoji: "🎬",
            label: "Anime Fan",
          },
        ],
        description:
          "anime worth sticking with, with a clear tendency to see stories through to the end.",
      };
    }

    if (favoriteCount >= 5) {
      return {
        title: "Anime Collector",
        emoji: "💜",
        traits: [
          {
            emoji: "💜",
            label: "Big Favorites",
          },
          {
            emoji: "✨",
            label: "Anime Fan",
          },
        ],
        description:
          "anime that leaves enough of an impression to earn a permanent place among their favorites.",
      };
    }

    return {
      title: "Anime Explorer",
      emoji: "✨",
      traits: [
        {
          emoji: "✨",
          label: "Anime Explorer",
        },
      ],
      description:
        "different kinds of anime while they continue discovering exactly what pulls them in.",
    };
  }

  const topGenres = genres.slice(0, 3);

  const { title, emoji } = getPersonalityIdentity(topGenres);

  const traits = getTraits(topGenres);

  const description = getDescription(
    topGenres,
    completed,
    watching,
    favoriteCount,
    averageScore,
  );

  return {
    title,
    emoji,
    traits,
    description,
  };
}
