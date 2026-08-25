import React from "react";

export default function ProfileSkeleton() {
  return (
    <main className="profile-skeleton">
      {/* Hero */}
      <section className="profile-skeleton__hero">
        <div className="profile-skeleton__banner skeleton" />

        <div className="profile-skeleton__hero-content">
          <div className="profile-skeleton__avatar skeleton" />

          <div className="profile-skeleton__info">
            <div className="profile-skeleton__title skeleton" />
            <div className="profile-skeleton__subtitle skeleton" />

            <div className="profile-skeleton__stats">
              <div className="profile-skeleton__stat skeleton" />
              <div className="profile-skeleton__stat skeleton" />
              <div className="profile-skeleton__stat skeleton" />
            </div>
          </div>

          <div className="profile-skeleton__actions">
            <div className="profile-skeleton__button skeleton" />
            <div className="profile-skeleton__button skeleton" />
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="profile-skeleton__grid">
        <div className="profile-skeleton__card skeleton-card">
          <div className="profile-skeleton__heading skeleton" />

          <div className="profile-skeleton__anime-list">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="profile-skeleton__anime skeleton" />
            ))}
          </div>
        </div>

        <div className="profile-skeleton__card skeleton-card">
          <div className="profile-skeleton__heading skeleton" />

          <div className="profile-skeleton__anime-list">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="profile-skeleton__anime skeleton" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
