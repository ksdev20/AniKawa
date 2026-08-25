import { useAuth } from "@/hooks/useAuth.ts";
import EmailCard from "./AccountTab/EmailCard.tsx";
import PasswordCard from "./AccountTab/PasswordCard.tsx";
import UsernameCard from "./AccountTab/UsernameCard.tsx";
// import PasswordCard from "./AccountTab/PasswordCard";
// import PrivacyCard from "./AccountTab/PrivacyCard";
// import BlockedUsersCard from "./AccountTab/BlockedUsersCard";
// import DangerZoneCard from "./AccountTab/DangerZoneCard";
import "@/styles/components/Profile/about-tab.css";
import DisplayNameCard from "./AccountTab/DisplayNameCard.tsx";
import PrivacyCard from "./AccountTab/PrivacyCard.tsx";
import LoginSecurityCard from "./AccountTab/LoginSecurityCard.tsx";
import DataDownloadCard from "./AccountTab/DataDownloadCard.tsx";

interface Props {
  profile: any;
  onProfileUpdate: (profile: any) => void;
}

export default function AccountTab({ profile, onProfileUpdate }: Props) {
  const { user } = useAuth();
  const email = user?.email ?? null;

  return (
    <div className="profile-settings__account space-y-6">
      <section className="settings-card">
        <div className="settings-card__header">
          <div>
            <h3>Account Information</h3>
            <p>Manage your account identity and login details.</p>
          </div>
        </div>
      </section>

      {email && (
        <EmailCard
        currentEmail={email}
        profile={profile}
        onProfileUpdate={onProfileUpdate}
        />
      )}

      <UsernameCard profile={profile} onProfileUpdate={onProfileUpdate} />
      <DisplayNameCard profile={profile} onProfileUpdate={onProfileUpdate} />

      <PasswordCard />

      <PrivacyCard profile={profile} onProfileUpdate={onProfileUpdate} />

      <LoginSecurityCard />

      <DataDownloadCard />

      {/* <DeleteAccountCard /> */}

      {/* <BlockedUsersCard /> */}

      {/* <DangerZoneCard /> */}
    </div>
  );
}
