import type { PublicProfile } from "@/types/profile";

interface Props {
  profile: PublicProfile;
}

export default function ProfileCompletion({ profile }: Props) {
  const fields = [
    {
      key: "avatar_url",
      label: "Profile picture",
      value: profile.avatar_url,
    },
    {
      key: "bio",
      label: "Bio",
      value: profile.bio,
    },
    {
      key: "about",
      label: "About section",
      value: profile.about,
    },
    {
      key: "banner_url",
      label: "Profile banner",
      value: profile.banner_url,
    },
    {
      key: "country",
      label: "Country",
      value: profile.country,
    },
    {
      key: "gender",
      label: "Gender",
      value: profile.gender,
    },
  ];

  const completedCount = fields.filter((field) => Boolean(field.value)).length;

  const percentage = Math.round((completedCount / fields.length) * 100);

  if (percentage === 100) {
    return null;
  }

  const missing = fields
    .filter((field) => !field.value)
    .map((field) => field.label);

  return (
    <section className="profile-completion">
      <div className="profile-completion__header">
        <div>
          <h3>Complete your profile</h3>

          <p>Make your profile stand out</p>
        </div>

        <strong>{percentage}%</strong>
      </div>

      <div className="profile-completion__progress">
        <div
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <div className="profile-completion__missing">
        {missing.slice(0, 3).map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      <a href="/profile/settings" className="profile-completion__button">
        Complete Profile
      </a>
    </section>
  );
}
