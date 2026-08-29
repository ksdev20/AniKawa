export const NOTIFICATION_TYPES = {
  NEW_EPISODE: "new_episode",
  COMMENT_REPLY: "comment_reply",
  NEW_FOLLOWER: "new_follower",
  NEW_BLOG_POST: "new_blog_post",
  ANNOUNCEMENT: "announcement",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;

  title: string;
  body?: string | null;

  actorId?: string | null;

  url?: string | null;

  data?: Record<string, any>;

  dedupeKey?: string | null;
}