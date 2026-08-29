export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_deletion_requests: {
        Row: {
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          delete_after: string
          email_verified_at: string | null
          id: string
          password_verified_at: string | null
          requested_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          delete_after: string
          email_verified_at?: string | null
          id?: string
          password_verified_at?: string | null
          requested_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          delete_after?: string
          email_verified_at?: string | null
          id?: string
          password_verified_at?: string | null
          requested_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_deletion_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      account_deletion_verifications: {
        Row: {
          created_at: string
          deletion_request_id: string
          expires_at: string
          id: string
          token_hash: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          deletion_request_id: string
          expires_at: string
          id?: string
          token_hash: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          deletion_request_id?: string
          expires_at?: string
          id?: string
          token_hash?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_deletion_verifications_request_fkey"
            columns: ["deletion_request_id"]
            isOneToOne: false
            referencedRelation: "account_deletion_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_deletion_verifications_user_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_reports: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          reason: string
          reporter_guest_id: string | null
          reporter_ip_hash: string | null
          reporter_user_id: string | null
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          reason: string
          reporter_guest_id?: string | null
          reporter_ip_hash?: string | null
          reporter_user_id?: string | null
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          reason?: string
          reporter_guest_id?: string | null
          reporter_ip_hash?: string | null
          reporter_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_votes: {
        Row: {
          comment_id: string
          created_at: string
          guest_id: string | null
          id: string
          ip_hash: string | null
          user_id: string | null
          vote: number
        }
        Insert: {
          comment_id: string
          created_at?: string
          guest_id?: string | null
          id?: string
          ip_hash?: string | null
          user_id?: string | null
          vote: number
        }
        Update: {
          comment_id?: string
          created_at?: string
          guest_id?: string | null
          id?: string
          ip_hash?: string | null
          user_id?: string | null
          vote?: number
        }
        Relationships: [
          {
            foreignKeyName: "comment_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          deleted_at: string | null
          depth: number
          dislikes_count: number
          edited: boolean
          episode_id: string
          guest_email_hash: string | null
          guest_id: string | null
          guest_name: string | null
          guest_name_normalized: string | null
          id: string
          ip_hash: string | null
          is_locked: boolean
          is_pinned: boolean
          likes_count: number
          parent_id: string | null
          replies_count: number
          reports_count: number
          spam_score: number
          status: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          content: string
          created_at?: string
          deleted_at?: string | null
          depth?: number
          dislikes_count?: number
          edited?: boolean
          episode_id: string
          guest_email_hash?: string | null
          guest_id?: string | null
          guest_name?: string | null
          guest_name_normalized?: string | null
          id?: string
          ip_hash?: string | null
          is_locked?: boolean
          is_pinned?: boolean
          likes_count?: number
          parent_id?: string | null
          replies_count?: number
          reports_count?: number
          spam_score?: number
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          deleted_at?: string | null
          depth?: number
          dislikes_count?: number
          edited?: boolean
          episode_id?: string
          guest_email_hash?: string | null
          guest_id?: string | null
          guest_name?: string | null
          guest_name_normalized?: string | null
          id?: string
          ip_hash?: string | null
          is_locked?: boolean
          is_pinned?: boolean
          likes_count?: number
          parent_id?: string | null
          replies_count?: number
          reports_count?: number
          spam_score?: number
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      continue_watching: {
        Row: {
          anime_id: string
          duration_seconds: number | null
          episode_nanoid: string
          updated_at: string | null
          user_id: string
          watched_seconds: number | null
        }
        Insert: {
          anime_id: string
          duration_seconds?: number | null
          episode_nanoid: string
          updated_at?: string | null
          user_id: string
          watched_seconds?: number | null
        }
        Update: {
          anime_id?: string
          duration_seconds?: number | null
          episode_nanoid?: string
          updated_at?: string | null
          user_id?: string
          watched_seconds?: number | null
        }
        Relationships: []
      }
      episode_reactions: {
        Row: {
          created_at: string | null
          episode_id: string
          guest_id: string | null
          id: string
          reaction_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          episode_id: string
          guest_id?: string | null
          id?: string
          reaction_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          episode_id?: string
          guest_id?: string | null
          id?: string
          reaction_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "episode_reactions_reaction_id_fkey"
            columns: ["reaction_id"]
            isOneToOne: false
            referencedRelation: "reaction_types"
            referencedColumns: ["id"]
          },
        ]
      }
      episode_vote_counts: {
        Row: {
          dislikes: number | null
          episode_id: string
          likes: number | null
          updated_at: string | null
        }
        Insert: {
          dislikes?: number | null
          episode_id: string
          likes?: number | null
          updated_at?: string | null
        }
        Update: {
          dislikes?: number | null
          episode_id?: string
          likes?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      episode_votes: {
        Row: {
          created_at: string | null
          episode_id: string
          guest_id: string | null
          id: string
          updated_at: string | null
          user_id: string | null
          vote: number
        }
        Insert: {
          created_at?: string | null
          episode_id: string
          guest_id?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
          vote: number
        }
        Update: {
          created_at?: string | null
          episode_id?: string
          guest_id?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
          vote?: number
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          item_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      login_security_events: {
        Row: {
          city: string | null
          country_code: string | null
          created_at: string
          id: string
          ip_hash: string | null
          is_unusual: boolean
          region: string | null
          unusual_reason: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          city?: string | null
          country_code?: string | null
          created_at?: string
          id?: string
          ip_hash?: string | null
          is_unusual?: boolean
          region?: string | null
          unusual_reason?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          city?: string | null
          country_code?: string | null
          created_at?: string
          id?: string
          ip_hash?: string | null
          is_unusual?: boolean
          region?: string | null
          unusual_reason?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "login_security_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      login_security_settings: {
        Row: {
          created_at: string
          enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "login_security_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          country: string | null
          email: string
          favorite_genres: string[] | null
          id: string
          join_source: string | null
          joined_at: string | null
          last_email_sent: string | null
          preferred_language: string | null
          unsubscribed: boolean | null
          user_id: string | null
          utm_source: string | null
          verified: boolean | null
        }
        Insert: {
          country?: string | null
          email: string
          favorite_genres?: string[] | null
          id?: string
          join_source?: string | null
          joined_at?: string | null
          last_email_sent?: string | null
          preferred_language?: string | null
          unsubscribed?: boolean | null
          user_id?: string | null
          utm_source?: string | null
          verified?: boolean | null
        }
        Update: {
          country?: string | null
          email?: string
          favorite_genres?: string[] | null
          id?: string
          join_source?: string | null
          joined_at?: string | null
          last_email_sent?: string | null
          preferred_language?: string | null
          unsubscribed?: boolean | null
          user_id?: string | null
          utm_source?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_subscribers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          push_announcements: boolean
          push_blog_posts: boolean
          push_comment_replies: boolean
          push_new_episodes: boolean
          push_new_followers: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          push_announcements?: boolean
          push_blog_posts?: boolean
          push_comment_replies?: boolean
          push_new_episodes?: boolean
          push_new_followers?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          push_announcements?: boolean
          push_blog_posts?: boolean
          push_comment_replies?: boolean
          push_new_episodes?: boolean
          push_new_followers?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          body: string | null
          created_at: string
          data: Json
          dedupe_key: string | null
          id: string
          read_at: string | null
          title: string
          type: string
          url: string | null
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          data?: Json
          dedupe_key?: string | null
          id?: string
          read_at?: string | null
          title: string
          type: string
          url?: string | null
          user_id: string
        }
        Update: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          data?: Json
          dedupe_key?: string | null
          id?: string
          read_at?: string | null
          title?: string
          type?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profile_block_rate_limits: {
        Row: {
          last_action_at: string
          target_id: string
          user_id: string
        }
        Insert: {
          last_action_at?: string
          target_id: string
          user_id: string
        }
        Update: {
          last_action_at?: string
          target_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_block_rate_limits_target_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_block_rate_limits_user_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_blocks: {
        Row: {
          blocked_user_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_user_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_user_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_users_blocked_user_id_fkey"
            columns: ["blocked_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_users_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_follow_rate_limits: {
        Row: {
          last_action_at: string
          target_id: string
          user_id: string
        }
        Insert: {
          last_action_at?: string
          target_id: string
          user_id: string
        }
        Update: {
          last_action_at?: string
          target_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_follow_rate_limits_target_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_follow_rate_limits_user_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_profile_id: string
          reporter_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_profile_id: string
          reporter_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_profile_id?: string
          reporter_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_reports_reported_profile_id_fkey"
            columns: ["reported_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_settings: {
        Row: {
          allow_follow_requests: boolean
          created_at: string
          id: string
          profile_visibility: string
          show_activity: boolean
          show_anime_list: boolean
          show_favorites: boolean
          show_on_public_feed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_follow_requests?: boolean
          created_at?: string
          id?: string
          profile_visibility?: string
          show_activity?: boolean
          show_anime_list?: boolean
          show_favorites?: boolean
          show_on_public_feed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_follow_requests?: boolean
          created_at?: string
          id?: string
          profile_visibility?: string
          show_activity?: boolean
          show_anime_list?: boolean
          show_favorites?: boolean
          show_on_public_feed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about: string | null
          avatar_status: string | null
          avatar_url: string | null
          banner_status: string | null
          banner_url: string | null
          bio: string | null
          country: string | null
          created_at: string
          display_name: string | null
          gender: string | null
          id: string
          privacy: string
          role: string
          updated_at: string
          username: string
          username_changed_at: string | null
          watching_since: string | null
        }
        Insert: {
          about?: string | null
          avatar_status?: string | null
          avatar_url?: string | null
          banner_status?: string | null
          banner_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          gender?: string | null
          id: string
          privacy?: string
          role?: string
          updated_at?: string
          username: string
          username_changed_at?: string | null
          watching_since?: string | null
        }
        Update: {
          about?: string | null
          avatar_status?: string | null
          avatar_url?: string | null
          banner_status?: string | null
          banner_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          gender?: string | null
          id?: string
          privacy?: string
          role?: string
          updated_at?: string
          username?: string
          username_changed_at?: string | null
          watching_since?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          count: number
          identifier: string
          window_start: string
        }
        Insert: {
          action: string
          count?: number
          identifier: string
          window_start: string
        }
        Update: {
          action?: string
          count?: number
          identifier?: string
          window_start?: string
        }
        Relationships: []
      }
      reaction_types: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id: string
          image_url?: string | null
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      recently_watched: {
        Row: {
          anime_id: string
          user_id: string
          watched_at: string
        }
        Insert: {
          anime_id: string
          user_id: string
          watched_at?: string
        }
        Update: {
          anime_id?: string
          user_id?: string
          watched_at?: string
        }
        Relationships: []
      }
      user_anime_list: {
        Row: {
          anime_nanoid: string
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          progress: number
          score: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["anime_list_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          anime_nanoid: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          progress?: number
          score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["anime_list_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          anime_nanoid?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          progress?: number
          score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["anime_list_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      username_history: {
        Row: {
          created_at: string | null
          id: string
          new_username: string
          old_username: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          new_username: string
          old_username: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          new_username?: string
          old_username?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "username_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_account_deletion: { Args: { p_user_id: string }; Returns: Json }
      episode_vote: {
        Args: {
          p_episode_id: string
          p_guest_id?: string
          p_user_id?: string
          p_vote?: number
        }
        Returns: {
          my_vote: number
          total_dislikes: number
          total_likes: number
        }[]
      }
      get_public_profile: {
        Args: { target_username: string }
        Returns: {
          about: string
          avatar_url: string
          banner_url: string
          bio: string
          country: string
          created_at: string
          display_name: string
          gender: string
          id: string
          username: string
          watching_since: string
        }[]
      }
      remove_vote: {
        Args: { p_comment: string; p_ip: string }
        Returns: undefined
      }
      rpc_create_comment: {
        Args: {
          p_content: string
          p_episode_id: string
          p_guest_email_hash?: string
          p_guest_id?: string
          p_guest_name?: string
          p_ip_hash?: string
          p_parent_id?: string
          p_spam_score?: number
          p_status?: string
          p_user_agent?: string
        }
        Returns: {
          content: string
          created_at: string
          deleted_at: string | null
          depth: number
          dislikes_count: number
          edited: boolean
          episode_id: string
          guest_email_hash: string | null
          guest_id: string | null
          guest_name: string | null
          guest_name_normalized: string | null
          id: string
          ip_hash: string | null
          is_locked: boolean
          is_pinned: boolean
          likes_count: number
          parent_id: string | null
          replies_count: number
          reports_count: number
          spam_score: number
          status: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
          user_name: string | null
        }
        SetofOptions: {
          from: "*"
          to: "comments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      rpc_create_notification: {
        Args: {
          p_actor_id?: string
          p_body?: string
          p_data?: Json
          p_dedupe_key?: string
          p_title: string
          p_type: string
          p_url?: string
          p_user_id: string
        }
        Returns: {
          actor_id: string | null
          body: string | null
          created_at: string
          data: Json
          dedupe_key: string | null
          id: string
          read_at: string | null
          title: string
          type: string
          url: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "notifications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      rpc_edit_comment: {
        Args: { p_comment_id: string; p_content: string; p_guest_id?: string }
        Returns: {
          content: string
          created_at: string
          deleted_at: string | null
          depth: number
          dislikes_count: number
          edited: boolean
          episode_id: string
          guest_email_hash: string | null
          guest_id: string | null
          guest_name: string | null
          guest_name_normalized: string | null
          id: string
          ip_hash: string | null
          is_locked: boolean
          is_pinned: boolean
          likes_count: number
          parent_id: string | null
          replies_count: number
          reports_count: number
          spam_score: number
          status: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
          user_name: string | null
        }
        SetofOptions: {
          from: "*"
          to: "comments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      rpc_get_comments: {
        Args: {
          p_cursor_created_at?: string
          p_cursor_id?: string
          p_cursor_score?: number
          p_episode_id: string
          p_guest_id?: string
          p_limit?: number
          p_sort?: string
          p_user_id?: string
        }
        Returns: {
          can_delete: boolean
          can_edit: boolean
          can_reply: boolean
          content: string
          created_at: string
          deleted_at: string
          depth: number
          dislikes_count: number
          edited: boolean
          episode_id: string
          guest_id: string
          guest_name: string
          id: string
          is_locked: boolean
          is_pinned: boolean
          likes_count: number
          my_vote: number
          parent_id: string
          replies_count: number
          status: string
          updated_at: string
          user_id: string
        }[]
      }
      rpc_get_my_anime_list_entry: {
        Args: { p_anime_nanoid: string }
        Returns: Json
      }
      rpc_get_notification_preferences: {
        Args: never
        Returns: {
          created_at: string
          push_announcements: boolean
          push_blog_posts: boolean
          push_comment_replies: boolean
          push_new_episodes: boolean
          push_new_followers: boolean
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "notification_preferences"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      rpc_get_private_profile: { Args: never; Returns: Json }
      rpc_get_public_anime_list: {
        Args: { p_limit?: number; p_offset?: number; p_username: string }
        Returns: Json
      }
      rpc_get_public_favorites: {
        Args: { p_limit?: number; p_offset?: number; p_username: string }
        Returns: Json
      }
      rpc_get_public_profile: { Args: { p_username: string }; Returns: Json }
      rpc_get_replies: {
        Args: { p_guest_id?: string; p_parent_id: string; p_user_id?: string }
        Returns: {
          can_delete: boolean
          can_edit: boolean
          can_reply: boolean
          content: string
          created_at: string
          deleted_at: string
          depth: number
          dislikes_count: number
          edited: boolean
          episode_id: string
          guest_id: string
          guest_name: string
          id: string
          is_locked: boolean
          is_pinned: boolean
          likes_count: number
          my_vote: number
          parent_id: string
          replies_count: number
          status: string
          updated_at: string
          user_id: string
        }[]
      }
      rpc_remove_from_my_anime_list: {
        Args: { p_anime_nanoid: string }
        Returns: boolean
      }
      rpc_report_comment: {
        Args: {
          p_comment_id: string
          p_guest_id?: string
          p_ip_hash?: string
          p_reason: string
        }
        Returns: Json
      }
      rpc_report_profile: {
        Args: {
          p_description?: string
          p_reason: string
          p_reported_username: string
        }
        Returns: Json
      }
      rpc_soft_delete_comment: {
        Args: { p_comment_id: string; p_guest_id?: string }
        Returns: {
          content: string
          created_at: string
          deleted_at: string | null
          depth: number
          dislikes_count: number
          edited: boolean
          episode_id: string
          guest_email_hash: string | null
          guest_id: string | null
          guest_name: string | null
          guest_name_normalized: string | null
          id: string
          ip_hash: string | null
          is_locked: boolean
          is_pinned: boolean
          likes_count: number
          parent_id: string | null
          replies_count: number
          reports_count: number
          spam_score: number
          status: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
          user_name: string | null
        }
        SetofOptions: {
          from: "*"
          to: "comments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      rpc_toggle_profile_block: {
        Args: { p_blocked_username: string }
        Returns: Json
      }
      rpc_toggle_profile_follow: {
        Args: { p_following_username: string }
        Returns: Json
      }
      rpc_update_notification_preference: {
        Args: { p_enabled: boolean; p_preference: string }
        Returns: {
          created_at: string
          push_announcements: boolean
          push_blog_posts: boolean
          push_comment_replies: boolean
          push_new_episodes: boolean
          push_new_followers: boolean
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "notification_preferences"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      rpc_upsert_my_anime_list: {
        Args: {
          p_anime_nanoid: string
          p_completed_at?: string
          p_notes?: string
          p_progress?: number
          p_score?: number
          p_started_at?: string
          p_status: Database["public"]["Enums"]["anime_list_status"]
        }
        Returns: {
          anime_nanoid: string
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          progress: number
          score: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["anime_list_status"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_anime_list"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      toggle_comment_vote: {
        Args: {
          p_comment_id: string
          p_guest_id?: string
          p_ip_hash?: string
          p_vote: number
        }
        Returns: {
          dislikes: number
          likes: number
          my_vote: number
        }[]
      }
      vote_episode: {
        Args: {
          p_episode_id: string
          p_guest_id?: string
          p_user_id?: string
          p_vote?: number
        }
        Returns: Json
      }
    }
    Enums: {
      anime_list_status:
        | "watching"
        | "completed"
        | "paused"
        | "dropped"
        | "planning"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      anime_list_status: [
        "watching",
        "completed",
        "paused",
        "dropped",
        "planning",
      ],
    },
  },
} as const
