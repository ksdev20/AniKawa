import { useCallback, useEffect, useRef, useState } from "react";
import { BellIcon, CheckIcon } from "@phosphor-icons/react";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications/notifications";

import {
  NOTIFICATION_TYPES,
  type NotificationType,
} from "@/lib/notifications/types";

import "@/styles/components/Notifications/notification-bell.css";

type Notification = {
  id: string;

  type: NotificationType;

  actor_id: string | null;

  title: string;

  body: string | null;

  url: string | null;

  data: unknown;

  read_at: string | null;

  created_at: string;
};

const VALID_NOTIFICATION_TYPES: ReadonlySet<string> = new Set(
  Object.values(NOTIFICATION_TYPES),
);

function isNotificationType(value: string): value is NotificationType {
  return VALID_NOTIFICATION_TYPES.has(value);
}

function normalizeNotification(value: unknown): Notification | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const notification = value as Record<string, unknown>;

  if (
    typeof notification.id !== "string" ||
    typeof notification.type !== "string" ||
    !isNotificationType(notification.type) ||
    typeof notification.title !== "string" ||
    typeof notification.created_at !== "string"
  ) {
    return null;
  }

  return {
    id: notification.id,

    type: notification.type,

    actor_id:
      typeof notification.actor_id === "string" ? notification.actor_id : null,

    title: notification.title,

    body: typeof notification.body === "string" ? notification.body : null,

    url: typeof notification.url === "string" ? notification.url : null,

    data: notification.data ?? null,

    read_at:
      typeof notification.read_at === "string" ? notification.read_at : null,

    created_at: notification.created_at,
  };
}

function normalizeNotifications(values: unknown[]): Notification[] {
  return values
    .map(normalizeNotification)
    .filter(
      (notification): notification is Notification => notification !== null,
    );
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "new_episode":
      return "▶";

    case "comment_reply":
      return "💬";

    case "new_follower":
      return "👤";

    case "new_blog_post":
      return "📰";

    case "announcement":
      return "📢";

    default:
      return "🔔";
  }
}

function formatNotificationTime(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diff = Math.max(0, Date.now() - date.getTime());

  const seconds = Math.floor(diff / 1000);

  const minutes = Math.floor(seconds / 60);

  const hours = Math.floor(minutes / 60);

  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString();
}

export default function NotificationBell() {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  /*
   * ============================================
   * LOAD NOTIFICATIONS
   * ============================================
   */

  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);

      setUnreadCount(0);

      return;
    }

    try {
      setLoading(true);

      const [items, unread] = await Promise.all([
        getNotifications(30),

        getUnreadNotificationCount(),
      ]);

      setNotifications(normalizeNotifications(items));

      setUnreadCount(unread);
    } catch (error) {
      console.error("[NotificationBell] Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /*
   * ============================================
   * USER CHANGE
   * ============================================
   */

  useEffect(() => {
    setOpen(false);

    void loadNotifications();
  }, [user?.id, loadNotifications]);

  /*
   * ============================================
   * CLOSE ON OUTSIDE CLICK
   * ============================================
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        containerRef.current &&
        !containerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  /*
   * ============================================
   * REALTIME
   * ============================================
   */

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",

          schema: "public",

          table: "notifications",

          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = normalizeNotification(payload.new);

          if (!notification) {
            console.error(
              "[NotificationBell] Invalid realtime notification:",
              payload.new,
            );

            return;
          }

          setNotifications((current) => {
            if (current.some((item) => item.id === notification.id)) {
              return current;
            }

            return [notification, ...current].slice(0, 30);
          });

          /*
           * A newly inserted notification is
           * unread by definition unless the
           * server explicitly inserted read_at.
           */
          if (!notification.read_at) {
            setUnreadCount((current) => current + 1);
          }
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("[NotificationBell] Realtime channel error");
        }

        if (status === "TIMED_OUT") {
          console.error("[NotificationBell] Realtime channel timed out");
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id]);

  /*
   * ============================================
   * BELL
   * ============================================
   */

  async function handleOpen() {
    const nextOpen = !open;

    setOpen(nextOpen);

    /*
     * Refresh whenever the dropdown is opened.
     *
     * This protects against:
     * - missed realtime events
     * - another browser tab
     * - connection interruption
     * - stale state
     */
    if (nextOpen) {
      await loadNotifications();
    }
  }

  /*
   * ============================================
   * SINGLE NOTIFICATION
   * ============================================
   */

  async function handleNotificationClick(notification: Notification) {
    console.log("[Notification clicked]", notification);
    console.log("[Notification URL]", notification.url);
    if (!notification.read_at) {
      try {
        await markNotificationRead(notification.id);

        const now = new Date().toISOString();

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  read_at: now,
                }
              : item,
          ),
        );

        setUnreadCount((current) => Math.max(current - 1, 0));
      } catch (error) {
        console.error(
          "[NotificationBell] Failed to mark notification as read:",
          error,
        );

        /*
         * Don't navigate if marking the
         * notification failed.
         *
         * This prevents the UI from showing
         * a false read state.
         */
        return;
      }
    }

    if (notification.url) {
      window.location.href = notification.url;
    }
  }

  /*
   * ============================================
   * MARK ALL READ
   * ============================================
   */

  async function handleMarkAllRead() {
    if (unreadCount === 0) {
      return;
    }

    try {
      await markAllNotificationsRead();

      const now = new Date().toISOString();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,

          read_at: notification.read_at ?? now,
        })),
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("[NotificationBell] Failed to mark all as read:", error);
    }
  }

  async function handleMarkAsRead(
    event: React.MouseEvent,
    notification: Notification,
  ) {
    event.stopPropagation();

    if (notification.read_at) {
      return;
    }

    try {
      await markNotificationRead(notification.id);

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                read_at: new Date().toISOString(),
              }
            : item,
        ),
      );

      setUnreadCount((current) => Math.max(current - 1, 0));
    } catch (error: unknown) {
      console.error(
        "[Notifications] Failed to mark notification as read:",
        error,
      );
    }
  }

  /*
   * ============================================
   * RENDER
   * ============================================
   */

  return (
    <div ref={containerRef} className="notification-bell">
      <button
        type="button"
        className="notification-bell__trigger"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => void handleOpen()}
      >
        <span className="notification-bell__icon">
          <BellIcon size={24} color="#ffffff" />
        </span>

        {unreadCount > 0 && (
          <span className="notification-bell__badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="notification-bell__dropdown"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="notification-bell__header">
            <div>
              <h3>Notifications</h3>

              {unreadCount > 0 && <span>{unreadCount} unread</span>}
            </div>

            {unreadCount > 0 && (
              <button type="button" onClick={() => void handleMarkAllRead()}>
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-bell__list">
            {loading ? (
              <div className="notification-bell__empty">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-bell__empty">
                <span>🔔</span>

                <p>No notifications yet.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    notification.read_at ? "" : "notification-item--unread"
                  }`}
                >
                  <button
                    type="button"
                    className="notification-item__main"
                    onClick={() => void handleNotificationClick(notification)}
                  >
                    <span className="notification-item__icon">
                      {getNotificationIcon(notification.type)}
                    </span>

                    <span className="notification-item__content">
                      <strong>{notification.title}</strong>

                      {notification.body && <span>{notification.body}</span>}

                      <small>
                        {formatNotificationTime(notification.created_at)}
                      </small>
                    </span>

                    {!notification.read_at && (
                      <span className="notification-item__dot" />
                    )}
                  </button>

                  {!notification.read_at && (
                    <button
                      type="button"
                      className="notification-item__mark-read"
                      aria-label="Mark as read"
                      title="Mark as read"
                      onClick={(event) =>
                        void handleMarkAsRead(event, notification)
                      }
                    >
                      <CheckIcon size={18} weight="bold" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
