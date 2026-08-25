import { useEffect, useState } from "react";

import type { PublicProfile } from "@/types/profile";

import ProfileHero from "./ProfileHero";
import ProfileNavigator from "./ProfileNavigator";
import ProfileOverview from "./Overview/ProfileOverview";
import AnimeList from "./AnimeList/AnimeList";
import Favorites from "./Favorite/Favorites";
import Stats from "./Stats/Stats";

type ProfileTab = "overview" | "anime" | "favorites" | "stats";

interface Props {
  profile: PublicProfile;
}

function getTabFromUrl(): ProfileTab {
  if (typeof window === "undefined") {
    return "overview";
  }

  const tab = new URLSearchParams(window.location.search).get("tab");

  if (tab === "anime" || tab === "favorites" || tab === "stats") {
    return tab;
  }

  return "overview";
}

export default function ProfileLayout({ profile }: Props) {
  const [activeTab, setActiveTab] = useState<ProfileTab>(getTabFromUrl());

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getTabFromUrl());
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "anime":
        return <AnimeList username={profile.username} isOwner={true} />;

      case "favorites":
        return <Favorites username={profile.username} isOwner={true} />;

      case "stats":
        return <Stats />;

      case "overview":
      default:
        return <ProfileOverview />;
    }
  };

  return (
    <main className="profile-layout">
      <ProfileHero profile={profile} />

      <ProfileNavigator activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="profile-layout__content">{renderActiveTab()}</div>
    </main>
  );
}
