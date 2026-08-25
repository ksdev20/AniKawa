import AboutRenderer from "./AboutRenderer";

import type { PublicProfile } from "@/types/profile";

import { getAboutCharacterCount } from "@/lib/profile/profile.helpers";

interface Props {
  profile: PublicProfile | null;
}

export default function AboutCard({
  profile,
}: Props) {
  if (!profile) {
    return null;
  }

  const hasAbout = Boolean(
    profile.about?.trim(),
  );

  const characterCount = hasAbout
    ? getAboutCharacterCount(profile.about)
    : 0;

  return (
    <aside className="about-card">
      <div className="about-card__header">
        <h2>About</h2>

        {hasAbout && (
          <span className="about-card__count">
            {characterCount} characters
          </span>
        )}
      </div>

      {hasAbout ? (
        <AboutRenderer
          about={profile.about}
        />
      ) : (
        <p className="about-card__empty">
          This user hasn't written anything
          about themselves yet.
        </p>
      )}
    </aside>
  );
}