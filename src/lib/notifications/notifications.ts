import { supabase } from "@/lib/supabase";

export async function getNotifications(limit = 30) {
  const safeLimit = Math.min(Math.max(limit, 1), 100);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from("notifications")
    .select(
      `
      id,
      type,
      actor_id,
      title,
      body,
      url,
      data,
      read_at,
      created_at
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    console.error("[Notifications] Failed to fetch:", error);

    throw error;
  }

  return data ?? [];
}

export async function getUnreadNotificationCount() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return 0;
  }

  const { count, error } = await supabase
    .from("notifications")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) {
    console.error("[Notifications] Failed to fetch unread count:", error);

    throw error;
  }

  return count ?? 0;
}

export async function markNotificationRead(notificationId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  const { data, error } = await supabase
    .from("notifications")
    .update({
      read_at: new Date().toISOString(),
    })
    .eq("id", notificationId)
    .eq("user_id", user.id)
    .is("read_at", null)
    .select("id, read_at")
    .maybeSingle();

  if (error) {
    console.error("[Notifications] Failed to mark read:", error);

    throw error;
  }

  return data;
}

export async function markAllNotificationsRead() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  const { error } = await supabase
    .from("notifications")
    .update({
      read_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) {
    console.error("[Notifications] Failed to mark all read:", error);

    throw error;
  }
}

export type NotificationPreferences = {
  user_id: string;

  push_new_episodes: boolean;

  push_comment_replies: boolean;

  push_new_followers: boolean;

  push_blog_posts: boolean;

  push_announcements: boolean;

  created_at: string;

  updated_at: string;
};


export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const { data, error } = await supabase.rpc(
    "rpc_get_notification_preferences",
  );

  if (error) {
    console.error(
      "[Notifications] Failed to load preferences:",
      error,
    );

    throw error;
  }

  return data;
}


export type PushNotificationPreference =
  | "push_new_episodes"
  | "push_comment_replies"
  | "push_new_followers"
  | "push_blog_posts"
  | "push_announcements";


export async function updateNotificationPreference(
  preference: PushNotificationPreference,
  enabled: boolean,
): Promise<NotificationPreferences> {
  const { data, error } = await supabase.rpc(
    "rpc_update_notification_preference",
    {
      p_preference: preference,
      p_enabled: enabled,
    },
  );

  if (error) {
    console.error(
      "[Notifications] Failed to update preference:",
      error,
    );

    throw error;
  }

  return data;
}
