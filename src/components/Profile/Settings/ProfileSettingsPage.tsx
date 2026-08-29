import { useState } from "react";
import SettingsNavigation from "./SettingsNavigation";

import ProfileTab from "./ProfileTab";
import AccountTab from "./AccountTab";
import NotificationsTab from "./NotificationsTab";
import { WizardLoader } from "@/components/Loaders/WizardLoader";
import { useAuth } from "@/hooks/useAuth";

type Tab = "profile" | "account" | "notifications";

export default function ProfileSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const { profile, setProfile, initialized } = useAuth();

  const loading = !initialized;

  if (loading || !profile) {
    return (
      <section className="profile-settings profile-settings--loading">
        <WizardLoader info={["Loading your settings..."]} />
      </section>
    );
  }

  return (
    <section className="profile-settings">
      <SettingsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="profile-settings__content">
        {activeTab === "profile" && (
          <ProfileTab profile={profile} onProfileUpdate={setProfile} />
        )}

        {activeTab === "account" && (
          <AccountTab profile={profile} onProfileUpdate={setProfile} />
        )}

        {activeTab === "notifications" && <NotificationsTab />}
      </div>
    </section>
  );
}
