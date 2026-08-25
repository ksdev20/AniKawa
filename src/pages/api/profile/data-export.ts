import type { APIRoute } from "astro";

import { serverError, unauthorized } from "@/lib/api/json";

export const GET: APIRoute = async ({ locals }) => {
  try {
    /*
     * ---------------------------------------------------------
     * 1. Authenticate
     * ---------------------------------------------------------
     */

    const {
      data: { user },
      error: authError,
    } = await locals.supabase.auth.getUser();

    if (authError || !user) {
      return unauthorized("You must be logged in.");
    }

    const userId = user.id;

    /*
     * ---------------------------------------------------------
     * 2. Fetch all user-owned data
     * ---------------------------------------------------------
     */

    const [
      profileResult,
      profileSettingsResult,
      usernameHistoryResult,
      animeListResult,
      favoritesResult,
      continueWatchingResult,
      recentlyWatchedResult,
      commentsResult,
      commentVotesResult,
      commentReportsResult,
      profileReportsResult,
      episodeVotesResult,
      episodeReactionsResult,
      followsResult,
      blockedUsersResult,
      newsletterResult,
      securitySettingsResult,
      securityEventsResult,
    ] = await Promise.all([
      // -------------------------------------------------------
      // Profile
      // -------------------------------------------------------

      locals.supabase
        .from("profiles")
        .select(
          [
            "id",
            "username",
            "display_name",
            "avatar_url",
            "banner_url",
            "bio",
            "about",
            "watching_since",
            "gender",
            "country",
            "created_at",
            "updated_at",
            "avatar_status",
            "banner_status",
            "username_changed_at",
            "privacy",
          ].join(", "),
        )
        .eq("id", userId)
        .maybeSingle(),

      // -------------------------------------------------------
      // Profile settings
      // -------------------------------------------------------

      locals.supabase
        .from("profile_settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),

      // -------------------------------------------------------
      // Username history
      // -------------------------------------------------------

      locals.supabase
        .from("username_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),

      // -------------------------------------------------------
      // Anime list
      // -------------------------------------------------------

      locals.supabase
        .from("user_anime_list")
        .select(
          [
            "id",
            "anime_nanoid",
            "status",
            "progress",
            "score",
            "started_at",
            "completed_at",
            "notes",
            "created_at",
            "updated_at",
          ].join(", "),
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),

      // -------------------------------------------------------
      // Favorites
      // -------------------------------------------------------

      locals.supabase
        .from("favorites")
        .select(["id", "type", "item_id", "created_at"].join(", "))
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),

      // -------------------------------------------------------
      // Continue watching
      // -------------------------------------------------------

      locals.supabase
        .from("continue_watching")
        .select(
          [
            "anime_id",
            "episode_nanoid",
            "watched_seconds",
            "duration_seconds",
            "updated_at",
          ].join(", "),
        )
        .eq("user_id", userId)
        .order("updated_at", { ascending: true }),

      // -------------------------------------------------------
      // Recently watched
      // -------------------------------------------------------

      locals.supabase
        .from("recently_watched")
        .select(["anime_id", "watched_at"].join(", "))
        .eq("user_id", userId)
        .order("watched_at", { ascending: true }),

      // -------------------------------------------------------
      // Comments
      //
      // Own-comment SELECT policy allows the user to retrieve
      // their own comments even if they are not publicly visible.
      // -------------------------------------------------------

      locals.supabase
        .from("comments")
        .select(
          [
            "id",
            "episode_id",
            "parent_id",
            "depth",
            "content",
            "likes_count",
            "dislikes_count",
            "replies_count",
            "status",
            "edited",
            "created_at",
            "updated_at",
            "is_pinned",
            "is_locked",
            "deleted_at",
          ].join(", "),
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),

      // -------------------------------------------------------
      // Comment votes
      // -------------------------------------------------------

      locals.supabase
        .from("comment_votes")
        .select(["id", "comment_id", "vote", "created_at"].join(", "))
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),

      // -------------------------------------------------------
      // Comment reports submitted by the user
      // -------------------------------------------------------

      locals.supabase
        .from("comment_reports")
        .select(["id", "comment_id", "reason", "created_at"].join(", "))
        .eq("reporter_user_id", userId)
        .order("created_at", { ascending: true }),

      // -------------------------------------------------------
      // Profile reports submitted by the user
      // -------------------------------------------------------

      locals.supabase
        .from("profile_reports")
        .select("*")
        .eq("reporter_id", userId)
        .order("created_at", { ascending: true }),

      // -------------------------------------------------------
      // Episode votes
      //
      // These are already publicly readable in the current
      // database, but we only export this user's rows.
      // -------------------------------------------------------

      locals.supabase
        .from("episode_votes")
        .select(
          ["id", "episode_id", "vote", "created_at", "updated_at"].join(", "),
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),

      // -------------------------------------------------------
      // Episode reactions
      // -------------------------------------------------------

      locals.supabase
        .from("episode_reactions")
        .select(["id", "episode_id", "reaction_id", "created_at"].join(", "))
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),

      // -------------------------------------------------------
      // Follows
      //
      // Public SELECT policy exists, but we still only retrieve
      // relationships involving this user.
      // -------------------------------------------------------

      locals.supabase
        .from("profile_follows")
        .select(["id", "follower_id", "following_id", "created_at"].join(", "))
        .or(`follower_id.eq.${userId},following_id.eq.${userId}`)
        .order("created_at", { ascending: true }),

      // -------------------------------------------------------
      // Users blocked by this user
      //
      // We intentionally export only blocks made by this user,
      // not people who blocked this user.
      // -------------------------------------------------------

      locals.supabase
        .from("profile_blocks")
        .select(["id", "blocked_user_id", "created_at"].join(", "))
        .eq("blocker_id", userId)
        .order("created_at", { ascending: true }),

      // -------------------------------------------------------
      // Newsletter subscriptions belonging to this account
      // -------------------------------------------------------

      locals.supabase
        .from("newsletter_subscribers")
        .select(
          [
            "id",
            "email",
            "verified",
            "joined_at",
            "join_source",
            "preferred_language",
            "unsubscribed",
          ].join(", "),
        )
        .eq("user_id", userId)
        .order("joined_at", { ascending: true }),

      // -------------------------------------------------------
      // Login security settings
      // -------------------------------------------------------

      locals.supabase
        .from("login_security_settings")
        .select(["enabled", "created_at", "updated_at"].join(", "))
        .eq("user_id", userId)
        .maybeSingle(),

      // -------------------------------------------------------
      // Login security events
      //
      // IMPORTANT:
      // ip_hash is intentionally NOT exported.
      // -------------------------------------------------------

      locals.supabase
        .from("login_security_events")
        .select(
          [
            "country_code",
            "region",
            "city",
            "user_agent",
            "created_at",
            "is_unusual",
            "unusual_reason",
          ].join(", "),
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),
    ]);

    /*
     * ---------------------------------------------------------
     * 3. Check every query
     * ---------------------------------------------------------
     */

    const results = [
      ["profile", profileResult],
      ["profile settings", profileSettingsResult],
      ["username history", usernameHistoryResult],
      ["anime list", animeListResult],
      ["favorites", favoritesResult],
      ["continue watching", continueWatchingResult],
      ["recently watched", recentlyWatchedResult],
      ["comments", commentsResult],
      ["comment votes", commentVotesResult],
      ["comment reports", commentReportsResult],
      ["profile reports", profileReportsResult],
      ["episode votes", episodeVotesResult],
      ["episode reactions", episodeReactionsResult],
      ["profile follows", followsResult],
      ["blocked users", blockedUsersResult],
      ["newsletter", newsletterResult],
      ["login security settings", securitySettingsResult],
      ["login security events", securityEventsResult],
    ] as const;

    const failedResult = results.find(([, result]) => result.error);

    if (failedResult) {
      const [section, result] = failedResult;

      console.error(`[Data Export] Failed to fetch ${section}`, {
        userId,
        error: result.error,
      });

      return serverError("Failed to generate your data export.");
    }

    /*
     * ---------------------------------------------------------
     * 4. Separate following / followers
     * ---------------------------------------------------------
     */

    type ProfileFollowExportRow = {
      id: string;
      follower_id: string;
      following_id: string;
      created_at: string;
    };

    const follows = (followsResult.data ?? []) as unknown as ProfileFollowExportRow[];

    const following = follows
      .filter((follow) => follow.follower_id === userId)
      .map((follow) => ({
        id: follow.id,
        user_id: follow.following_id,
        created_at: follow.created_at,
      }));

    const followers = follows
      .filter((follow) => follow.following_id === userId)
      .map((follow) => ({
        id: follow.id,
        user_id: follow.follower_id,
        created_at: follow.created_at,
      }));

    /*
     * ---------------------------------------------------------
     * 5. Build export
     * ---------------------------------------------------------
     */

    const exportData = {
      export: {
        format: "Anikawa Data Export",
        version: 1,
        generated_at: new Date().toISOString(),
      },

      account: {
        id: user.id,
        email: user.email ?? null,
        created_at: user.created_at,
      },

      profile: profileResult.data ?? null,

      profile_settings: profileSettingsResult.data ?? null,

      username_history: usernameHistoryResult.data ?? [],

      anime_list: animeListResult.data ?? [],

      favorites: favoritesResult.data ?? [],

      continue_watching: continueWatchingResult.data ?? [],

      recently_watched: recentlyWatchedResult.data ?? [],

      comments: commentsResult.data ?? [],

      comment_votes: commentVotesResult.data ?? [],

      comment_reports: commentReportsResult.data ?? [],

      profile_reports: profileReportsResult.data ?? [],

      episode_votes: episodeVotesResult.data ?? [],

      episode_reactions: episodeReactionsResult.data ?? [],

      following,

      followers,

      blocked_users: blockedUsersResult.data ?? [],

      newsletter: newsletterResult.data ?? [],

      login_security: {
        settings: securitySettingsResult.data ?? null,
        events: securityEventsResult.data ?? [],
      },
    };

    /*
     * ---------------------------------------------------------
     * 6. Return an actual downloadable JSON file
     * ---------------------------------------------------------
     */

    const json = JSON.stringify(exportData, null, 2);

    return new Response(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="anikawa-data-export.json"',
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[Data Export] Unexpected error", error);

    return serverError("Failed to generate your data export.");
  }
};
