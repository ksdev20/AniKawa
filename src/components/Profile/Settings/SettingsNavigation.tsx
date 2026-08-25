interface Props {
  activeTab: string;

  setActiveTab: (tab: any) => void;
}

export default function SettingsNavigation({ activeTab, setActiveTab }: Props) {
  const tabs = [
    {
      id: "profile",
      label: "Profile",
    },
    {
      id: "account",
      label: "Account",
    },
  ];

  return (
    <nav className="settings-navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={activeTab === tab.id ? "active" : ""}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
