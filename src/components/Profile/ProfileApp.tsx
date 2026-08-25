import { useEffect } from "react";

import { useAuthStore } from "@/stores/authStore";
import { useProfileStore } from "@/stores/profileStore";

import ProfileLayout from "./ProfileLayout";
import ProfileSkeleton from "./ProfileSkeleton";

export default function ProfileApp() {
  const { initialized, user } = useAuthStore();

  const { profile, loading, error, fetchProfile } = useProfileStore();

  useEffect(() => {
    if (!initialized || !user || profile || loading) {
      return;
    }

    void fetchProfile();
  }, [initialized, user, profile, loading, fetchProfile]);

  /*
   * Auth is still initializing.
   *
   * Never show an error here. We simply don't know
   * the authenticated state yet.
   */
  if (!initialized) {
    return (
      <main className="profile-app">
        <ProfileSkeleton />
      </main>
    );
  }

  /*
   * Profile is being fetched.
   */
  if (loading) {
    return (
      <main className="profile-app">
        <ProfileSkeleton />
      </main>
    );
  }

  /*
   * Auth finished and there is no logged-in user.
   */
  if (!user) {
    return (
      <main className="profile-app">
        <section className="profile-error">
          <h2>Please log in</h2>

          <p>You need to be logged in to view your profile.</p>

          <a href="/login/" className="profile-error__button">
            Log In
          </a>
        </section>
      </main>
    );
  }

  /*
   * Profile request finished but failed.
   */
  if (error) {
    return (
      <main className="profile-app">
        <section className="profile-error">
          <h2>Unable to load your profile</h2>

          <p>{error}</p>

          <button
            type="button"
            className="profile-error__button"
            onClick={() => {
              void fetchProfile();
            }}
          >
            Try Again
          </button>
        </section>
      </main>
    );
  }

  /*
   * Authenticated, no error, but profile hasn't arrived yet.
   *
   * This is still a loading state — never an error.
   */
  if (!profile) {
    return (
      <main className="profile-app">
        <ProfileSkeleton />
      </main>
    );
  }

  return (
    <main className="profile-app profile-app--loaded">
      <ProfileLayout profile={profile} />
    </main>
  );
}
