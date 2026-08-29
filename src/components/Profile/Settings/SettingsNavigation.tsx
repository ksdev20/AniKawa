type Tab = "profile" | "account" | "notifications";

interface Props {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export default function SettingsNavigation({
  activeTab,
  setActiveTab,
}: Props) {
  const tabs: {
    id: Tab;
    label: string;
  }[] = [
    {
      id: "profile",
      label: "Profile",
    },
    {
      id: "account",
      label: "Account",
    },
    {
      id: "notifications",
      label: "Notifications",
    },
  ];

  return (
    <nav className="settings-navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveTab(tab.id)}
          className={activeTab === tab.id ? "active" : ""}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}