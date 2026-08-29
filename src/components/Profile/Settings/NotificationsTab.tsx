import { useEffect, useState } from "react";

import "@/styles/components/Profile/notifications-tab.css";

import {
  getNotificationPreferences,
  updateNotificationPreference,
  type NotificationPreferences,
  type PushNotificationPreference,
} from "@/lib/notifications/notifications";
import { WizardLoader } from "@/components/Loaders/WizardLoader";
import { requestNotificationPermission } from "@/lib/notifications/onesignal";

type PreferenceKey =
  | "commentReplies"
  | "followers"
  | "newEpisodes"
  | "newBlogPosts"
  | "announcements";

const PREFERENCE_MAP: Record<PreferenceKey, PushNotificationPreference> = {
  commentReplies: "push_comment_replies",

  followers: "push_new_followers",

  newEpisodes: "push_new_episodes",

  newBlogPosts: "push_blog_posts",

  announcements: "push_announcements",
};

type Preferences = Record<PreferenceKey, boolean>;

const DEFAULT_PREFERENCES: Preferences = {
  commentReplies: true,

  followers: false,

  newEpisodes: true,

  newBlogPosts: false,

  announcements: true,
};

function fromDatabase(preferences: NotificationPreferences): Preferences {
  return {
    commentReplies: preferences.push_comment_replies,

    followers: preferences.push_new_followers,

    newEpisodes: preferences.push_new_episodes,

    newBlogPosts: preferences.push_blog_posts,

    announcements: preferences.push_announcements,
  };
}

export default function NotificationsTab() {
  const [preferences, setPreferences] =
    useState<Preferences>(DEFAULT_PREFERENCES);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState<PreferenceKey | null>(null);

  const [pushEnabled, setPushEnabled] = useState(false);

  const [pushLoading, setPushLoading] = useState(false);

  const [pushError, setPushError] = useState<string | null>(null);

  async function enablePushNotifications() {
  if (pushLoading) {
    return;
  }

  setPushError(null);
  setPushLoading(true);

  try {
    await requestNotificationPermission();

    setPushEnabled(true);
  } catch (error: unknown) {
    console.error(
      "[NotificationsTab] Failed to enable push notifications:",
      error,
    );

    setPushError(
      "We couldn't enable notifications right now. Please try again.",
    );
  } finally {
    setPushLoading(false);
  }
}

  /*
   * ============================================
   * LOAD
   * ============================================
   */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const data = await getNotificationPreferences();

        if (cancelled) {
          return;
        }

        setPreferences(fromDatabase(data));
      } catch (error) {
        console.error("[NotificationsTab] Failed to load preferences:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ============================================
   * UPDATE
   * ============================================
   */

  async function updatePreference(key: PreferenceKey, value: boolean) {
    if (saving !== null) {
      return;
    }

    const previous = preferences[key];

    /*
     * Optimistic update.
     */
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));

    setSaving(key);

    try {
      const data = await updateNotificationPreference(
        PREFERENCE_MAP[key],
        value,
      );

      /*
       * Use the database response as the
       * source of truth.
       */
      setPreferences(fromDatabase(data));
    } catch (error) {
      console.error("[NotificationsTab] Failed to update preference:", error);

      /*
       * Rollback if the database update failed.
       */
      setPreferences((current) => ({
        ...current,
        [key]: previous,
      }));
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <section className="profile-settings profile-settings--loading">
        <WizardLoader info={["Loading your notifications settings..."]} />
      </section>
    );
  }

  return (
    <div className="settings-tab notifications-tab">
      <div className="notifications-tab__intro">
        <h2>Notifications</h2>

        <p>
          Choose which notifications you want to receive as push notifications.
        </p>
      </div>

      <section className="settings-card notifications-push-card">
        <div className="settings-card__header">
          <div>
            <h3>Browser notifications</h3>

            <p>Get notified even when Anikawa isn't open in your browser.</p>
          </div>

          {!pushLoading && (
            <span
              className={
                pushEnabled
                  ? "notifications-tab__status notifications-tab__status--enabled"
                  : "notifications-tab__status"
              }
            >
              {pushEnabled ? "Enabled" : "Disabled"}
            </span>
          )}
        </div>

        {!pushEnabled && (
          <div className="notifications-push-card__action">
            <button
              type="button"
              className="notifications-push-card__button"
              disabled={pushLoading}
              onClick={() => void enablePushNotifications()}
            >
              {pushLoading ? "Checking..." : "Enable notifications"}
            </button>

            {pushError && (
              <p className="notifications-push-card__error">{pushError}</p>
            )}
          </div>
        )}
      </section>

      {/* ======================================
          IN-APP
      ======================================= */}

      <section className="settings-card">
        <div className="settings-card__header">
          <div>
            <h3>In-app notifications</h3>

            <p>
              Notifications in your Anikawa notification center cannot be
              disabled here.
            </p>
          </div>

          <span className="notifications-tab__always-on">Always on</span>
        </div>
      </section>

      {/* ======================================
          ACTIVITY
      ======================================= */}

      <section className="settings-card">
        <div className="settings-card__header">
          <div>
            <h3>Activity</h3>

            <p>Get push notifications about activity involving your account.</p>
          </div>
        </div>

        <div className="notification-preference-list">
          <PreferenceRow
            title="Comment replies"
            description="When someone replies to your comment."
            enabled={preferences.commentReplies}
            saving={saving === "commentReplies"}
            onChange={(value) => void updatePreference("commentReplies", value)}
          />

          <PreferenceRow
            title="New followers"
            description="When someone follows you."
            enabled={preferences.followers}
            saving={saving === "followers"}
            onChange={(value) => void updatePreference("followers", value)}
          />
        </div>
      </section>

      {/* ======================================
          ANIME
      ======================================= */}

      <section className="settings-card">
        <div className="settings-card__header">
          <div>
            <h3>Anime</h3>

            <p>Get notified about anime you're interested in.</p>
          </div>
        </div>

        <div className="notification-preference-list">
          <PreferenceRow
            title="New episodes"
            description="When a new episode is available for anime you follow."
            enabled={preferences.newEpisodes}
            saving={saving === "newEpisodes"}
            onChange={(value) => void updatePreference("newEpisodes", value)}
          />
        </div>
      </section>

      {/* ======================================
          ANIKAWA
      ======================================= */}

      <section className="settings-card">
        <div className="settings-card__header">
          <div>
            <h3>Anikawa</h3>

            <p>Updates from Anikawa itself.</p>
          </div>
        </div>

        <div className="notification-preference-list">
          <PreferenceRow
            title="New blog posts"
            description="When a new post is published on the Anikawa blog."
            enabled={preferences.newBlogPosts}
            saving={saving === "newBlogPosts"}
            onChange={(value) => void updatePreference("newBlogPosts", value)}
          />

          <PreferenceRow
            title="Announcements"
            description="Important updates from Anikawa."
            enabled={preferences.announcements}
            saving={saving === "announcements"}
            onChange={(value) => void updatePreference("announcements", value)}
          />
        </div>
      </section>
    </div>
  );
}

interface PreferenceRowProps {
  title: string;

  description: string;

  enabled: boolean;

  saving: boolean;

  onChange: (value: boolean) => void;
}

function PreferenceRow({
  title,
  description,
  enabled,
  saving,
  onChange,
}: PreferenceRowProps) {
  return (
    <div className="notification-preference">
      <div className="notification-preference__content">
        <h4>{title}</h4>

        <p>{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`${title} push notifications`}
        disabled={saving}
        onClick={() => onChange(!enabled)}
        className={`notification-toggle ${
          enabled ? "notification-toggle--active" : ""
        }`}
      >
        <span />
      </button>
    </div>
  );
}
