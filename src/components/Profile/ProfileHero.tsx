import "@/styles/components/Profile/profile-hero.css";

import type { PublicProfile } from "@/types/profile";

interface Props {
  profile: PublicProfile;
}

export default function ProfileHero({ profile }: Props) {
  const joinedDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <section className="profile-hero">
      <div className="profile-hero__banner">
        {profile.banner_url ? (
          <img
            src={profile.banner_url}
            alt={`${profile.display_name}'s banner`}
            className="profile-hero__banner-image"
          />
        ) : (
          <div className="profile-hero__banner-placeholder" />
        )}
      </div>

      <div className="profile-hero__content">
        <div className="profile-hero__avatar-wrapper">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name ?? profile.username}
              className="profile-hero__avatar"
            />
          ) : (
            <div className="profile-hero__avatar profile-hero__avatar--placeholder">
              {profile.display_name?.charAt(0).toUpperCase() ??
                profile.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="profile-hero__info">
          <h1 className="profile-hero__name">
            {profile.display_name || profile.username}
          </h1>

          <p className="profile-hero__username">@{profile.username}</p>

          {profile.bio && <p className="profile-hero__bio">{profile.bio}</p>}

          <div className="profile-hero__meta">
            {profile.country && <span>{profile.country}</span>}

            {profile.watching_since && (
              <span>Watching since {profile.watching_since}</span>
            )}

            {joinedDate && <span>Joined {joinedDate}</span>}
          </div>
        </div>

        <div className="profile-hero__actions">
          <a
            className="profile-hero__button profile-hero__button--primary"
            href="/profile/settings"
          >
            Edit Profile
          </a>
        </div>
      </div>
    </section>
  );
}
