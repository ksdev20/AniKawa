import AvatarUploader from "./ProfileTab/AvatarUploader";
import BannerUploader from "./ProfileTab/BannerUploader";
import AboutEditor from "./ProfileTab/AboutEditor";

interface Props {
  profile: any;

  onProfileUpdate: (profile: any) => void;
}

export default function ProfileTab({ profile, onProfileUpdate }: Props) {
  return (
    <div className="settings-tab">
      <h2>Profile</h2>

      <BannerUploader profile={profile} onUpdate={onProfileUpdate} />

      <AvatarUploader profile={profile} onUpdate={onProfileUpdate} />

      <AboutEditor profile={profile} onUpdate={onProfileUpdate} />
    </div>
  );
}
