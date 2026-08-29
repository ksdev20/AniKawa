import { supabase } from "@/lib/supabase";

export type NotificationPreferences = {
  push_new_episodes: boolean;
  push_comment_replies: boolean;
  push_new_followers: boolean;
  push_blog_posts: boolean;
  push_announcements: boolean;
};

const DEFAULT_PREFERENCES: NotificationPreferences = {
  push_new_episodes: true,
  push_comment_replies: true,
  push_new_followers: false,
  push_blog_posts: false,
  push_announcements: true,
};

export async function getNotificationPreferences(
  userId: string,
): Promise<NotificationPreferences> {
  const { data, error } = await supabase
    .from("notification_preferences")
    .select(
      `
        push_new_episodes,
        push_comment_replies,
        push_new_followers,
        push_blog_posts,
        push_announcements
      `,
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error(
      "[Notifications] Failed to fetch preferences:",
      error,
    );

    throw error;
  }

  if (!data) {
    return DEFAULT_PREFERENCES;
  }

  return data;
}

export function shouldSendPushNotification(
  preferences: NotificationPreferences,
  type:
    | "new_episode"
    | "comment_reply"
    | "new_follower"
    | "new_blog_post"
    | "announcement",
): boolean {
  switch (type) {
    case "new_episode":
      return preferences.push_new_episodes;

    case "comment_reply":
      return preferences.push_comment_replies;

    case "new_follower":
      return preferences.push_new_followers;

    case "new_blog_post":
      return preferences.push_blog_posts;

    case "announcement":
      return preferences.push_announcements;

    default:
      return false;
  }
}