import "@/styles/components/Profile/ProfileNavigator.css";

import type { ProfileTab } from "@/types/profile";

import ProfileIcon from "./ProfileIcon";

interface ProfileNavigatorProps {
  activeTab?: ProfileTab;
  onTabChange?: (tab: ProfileTab) => void;
}

const tabs = [
  {
    id: "overview",
    label: "Overview",
    icon: "overview",
  },
  {
    id: "anime",
    label: "Anime List",
    icon: "anime",
  },
  {
    id: "favorites",
    label: "Favorites",
    icon: "favorites",
  },
  {
    id: "stats",
    label: "Stats",
    icon: "stats",
  },
] as const;

export default function ProfileNavigator({
  activeTab = "overview",
  onTabChange,
}: ProfileNavigatorProps) {
  const handleTabChange = (tab: ProfileTab) => {
    onTabChange?.(tab);

    const url = new URL(window.location.href);

    if (tab === "overview") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", tab);
    }

    window.history.pushState({}, "", url);
  };

  return (
    <nav className="profile-navigator" aria-label="Profile navigation">
      <div className="profile-navigator__inner">
        <div className="profile-navigator__tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                className={`profile-navigator__tab ${
                  isActive ? "profile-navigator__tab--active" : ""
                }`}
                aria-current={isActive ? "page" : undefined}
                onClick={() => handleTabChange(tab.id)}
              >
                <ProfileIcon
                  name={tab.icon}
                  size={21}
                  weight={isActive ? "fill" : "regular"}
                  className="profile-nav__icon"
                />

                <span className="profile-navigator__label">{tab.label}</span>

                {isActive && (
                  <span
                    className="profile-navigator__indicator"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
