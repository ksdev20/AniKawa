import ProfileIcon from "@/components/Profile/ProfileIcon";
import '@/styles/components/Profile/ProfileNavigator.css';
type ProfileTab = "overview" | "anime" | "favorites" | "stats";

interface ProfileNavigatorProps {
  username: string;
  activeTab: ProfileTab;
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

function getTabUrl(username: string, tab: ProfileTab) {
  if (tab === "overview") {
    return `/user/${encodeURIComponent(username)}`;
  }

  return `/user/${encodeURIComponent(username)}?tab=${tab}`;
}

export default function ProfileNavigator({
  username,
  activeTab,
}: ProfileNavigatorProps) {
  return (
    <nav className="profile-navigator" aria-label="Profile navigation">
      <div className="profile-navigator__inner">
        <div className="profile-navigator__tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <a
                key={tab.id}
                href={getTabUrl(username, tab.id)}
                className={`profile-navigator__tab ${
                  isActive ? "profile-navigator__tab--active" : ""
                }`}
                aria-current={isActive ? "page" : undefined}
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
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
