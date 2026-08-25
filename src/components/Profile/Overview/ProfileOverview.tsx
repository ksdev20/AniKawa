import { useMemo } from "react";

import { useProfileStore } from "@/stores/profileStore";

import ContinueWatching from "@/components/Profile/Overview/ContinueWatching";
import AboutCard from "./AboutCard";
import { AnimeSliderClient } from "@/components/AnimeSlider/AnimeSliderClient";
import GenreOverview from "./GenresOverview";
import AnimeStats from "./AnimeStats";
import FavoritesSection from "./FavoritesSection";
import ProfileCompletion from "./ProfileCompletion";

import WatchActivity from "@/components/PublicProfile/Overview/WatchActivity";
import RecentlyCompleted from "@/components/PublicProfile/Overview/RecentlyCompleted";
import AnimePersonality from "@/components/PublicProfile/Overview/AnimePersonality";
import TopRatedAnime from "@/components/PublicProfile/Overview/TopRatedAnime";
import AnimeListBreakdown from "@/components/PublicProfile/Overview/AnimeListBreakdown";

export default function ProfileOverview() {
  const {
    profile,
    favorites,
    favoriteAnime,
    continueWatching,
    recentlyWatched,
    stats,
    animeRecords,
    userAnimeList,
    resolvedEpisodeRecords
  } = useProfileStore();

  const recentlyWatchedInfo = useMemo(
    () => ({
      bigH: "Recently Watched",
      smallH: "Pick up where you left off",
      forRW: true,
      list: recentlyWatched,
    }),
    [recentlyWatched],
  );

  if (!profile) {
    return null;
  }

  return (
    <section className="profile-overview">
      <aside className="profile-overview__sidebar">
        <ProfileCompletion profile={profile} />

        <AboutCard profile={profile} />

        {continueWatching.length > 0 && (
          <WatchActivity continueWatching={continueWatching} isOwner={true}/>
        )}

        <GenreOverview
          continueWatching={continueWatching}
          animeRecords={animeRecords}
          isOwner={true}
        />

        <AnimeListBreakdown stats={stats} />

        <FavoritesSection
          favoriteAnime={favoriteAnime.map((record) => record)}
        />
      </aside>

      <div className="profile-overview__main">
        <AnimeStats
          continueWatching={continueWatching}
          animeRecords={animeRecords}
        />

        {continueWatching.length > 0 && (
          <AnimePersonality
            continueWatching={continueWatching}
            animeRecords={animeRecords}
            favorites={favorites}
            stats={stats}
            displayName={profile.display_name}
            isOwner={true}
          />
        )}

        <RecentlyCompleted userAnimeList={userAnimeList} />

        <TopRatedAnime userAnimeList={userAnimeList} isOwner={true}/>

        <ContinueWatching resolvedEpisodeRecords={resolvedEpisodeRecords} />

        {recentlyWatched.length > 0 && (
          <AnimeSliderClient info={recentlyWatchedInfo} />
        )}
      </div>
    </section>
  );
}
