import { useEffect } from "react";

import { saveRecentlyWatched } from "@/lib/recentlyWatched/saveRecentlyWatched";

import { useAuth } from "@/hooks/useAuth";

interface Props {
  animenanoid?: string;
}

export default function RecentlyWatchedTracker({ animenanoid }: Props) {
  const { user, initialized } = useAuth();

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!animenanoid) {
      return;
    }

    void saveRecentlyWatched({
      animeId: animenanoid,

      userId: user?.id ?? null,
    });
  }, [animenanoid, user?.id, initialized]);

  return null;
}
