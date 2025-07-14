export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          event_data: Json | null
          event_type: string
          guild_id: string | null
          id: number
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          event_data?: Json | null
          event_type: string
          guild_id?: string | null
          id?: number
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          event_data?: Json | null
          event_type?: string
          guild_id?: string | null
          id?: number
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          channel_id: string
          content: string
          created_at: string | null
          created_by: string
          embed_color: number | null
          footer_text: string | null
          guild_id: string
          id: number
          image_url: string | null
          thumbnail_url: string | null
          title: string | null
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string | null
          created_by: string
          embed_color?: number | null
          footer_text?: string | null
          guild_id: string
          id?: number
          image_url?: string | null
          thumbnail_url?: string | null
          title?: string | null
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string | null
          created_by?: string
          embed_color?: number | null
          footer_text?: string | null
          guild_id?: string
          id?: number
          image_url?: string | null
          thumbnail_url?: string | null
          title?: string | null
        }
        Relationships: []
      }
      bot_settings: {
        Row: {
          anti_spam: boolean | null
          auto_moderation: boolean | null
          auto_role: boolean | null
          bot_name: string | null
          created_at: string | null
          economy_enabled: boolean | null
          id: number
          leveling_system: boolean | null
          logging_enabled: boolean | null
          maintenance_mode: boolean | null
          music_enabled: boolean | null
          ticket_system: boolean | null
          updated_at: string | null
          welcome_messages: boolean | null
        }
        Insert: {
          anti_spam?: boolean | null
          auto_moderation?: boolean | null
          auto_role?: boolean | null
          bot_name?: string | null
          created_at?: string | null
          economy_enabled?: boolean | null
          id?: number
          leveling_system?: boolean | null
          logging_enabled?: boolean | null
          maintenance_mode?: boolean | null
          music_enabled?: boolean | null
          ticket_system?: boolean | null
          updated_at?: string | null
          welcome_messages?: boolean | null
        }
        Update: {
          anti_spam?: boolean | null
          auto_moderation?: boolean | null
          auto_role?: boolean | null
          bot_name?: string | null
          created_at?: string | null
          economy_enabled?: boolean | null
          id?: number
          leveling_system?: boolean | null
          logging_enabled?: boolean | null
          maintenance_mode?: boolean | null
          music_enabled?: boolean | null
          ticket_system?: boolean | null
          updated_at?: string | null
          welcome_messages?: boolean | null
        }
        Relationships: []
      }
      bot_status: {
        Row: {
          activity_name: string | null
          activity_type: string | null
          command_count: number | null
          commands_executed: number | null
          cpu_usage: number | null
          created_at: string | null
          guild_count: number | null
          guilds: number | null
          id: string
          last_updated: string | null
          memory_usage: number | null
          status: string
          uptime: number | null
          uptime_seconds: number | null
          user_count: number | null
          users: number | null
          version: string | null
        }
        Insert: {
          activity_name?: string | null
          activity_type?: string | null
          command_count?: number | null
          commands_executed?: number | null
          cpu_usage?: number | null
          created_at?: string | null
          guild_count?: number | null
          guilds?: number | null
          id?: string
          last_updated?: string | null
          memory_usage?: number | null
          status?: string
          uptime?: number | null
          uptime_seconds?: number | null
          user_count?: number | null
          users?: number | null
          version?: string | null
        }
        Update: {
          activity_name?: string | null
          activity_type?: string | null
          command_count?: number | null
          commands_executed?: number | null
          cpu_usage?: number | null
          created_at?: string | null
          guild_count?: number | null
          guilds?: number | null
          id?: string
          last_updated?: string | null
          memory_usage?: number | null
          status?: string
          uptime?: number | null
          uptime_seconds?: number | null
          user_count?: number | null
          users?: number | null
          version?: string | null
        }
        Relationships: []
      }
      channels: {
        Row: {
          created_at: string | null
          guild_id: string
          id: string
          name: string
          type: number | null
        }
        Insert: {
          created_at?: string | null
          guild_id: string
          id: string
          name: string
          type?: number | null
        }
        Update: {
          created_at?: string | null
          guild_id?: string
          id?: string
          name?: string
          type?: number | null
        }
        Relationships: []
      }
      command_usage_logs: {
        Row: {
          command_name: string
          guild_id: string | null
          id: string
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          command_name: string
          guild_id?: string | null
          id?: string
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          command_name?: string
          guild_id?: string | null
          id?: string
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      commands: {
        Row: {
          added_at: string | null
          category: string | null
          cooldown: number | null
          description: string
          is_enabled: boolean | null
          last_used: string | null
          name: string
          permissions: string[] | null
          type: string | null
          usage_count: number | null
        }
        Insert: {
          added_at?: string | null
          category?: string | null
          cooldown?: number | null
          description: string
          is_enabled?: boolean | null
          last_used?: string | null
          name: string
          permissions?: string[] | null
          type?: string | null
          usage_count?: number | null
        }
        Update: {
          added_at?: string | null
          category?: string | null
          cooldown?: number | null
          description?: string
          is_enabled?: boolean | null
          last_used?: string | null
          name?: string
          permissions?: string[] | null
          type?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      giveaway_winners: {
        Row: {
          giveaway_id: number | null
          id: number
          user_id: string
          won_at: string | null
        }
        Insert: {
          giveaway_id?: number | null
          id?: number
          user_id: string
          won_at?: string | null
        }
        Update: {
          giveaway_id?: number | null
          id?: number
          user_id?: string
          won_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "giveaway_winners_giveaway_id_fkey"
            columns: ["giveaway_id"]
            isOneToOne: false
            referencedRelation: "giveaways"
            referencedColumns: ["id"]
          },
        ]
      }
      giveaways: {
        Row: {
          channel_id: string
          created_at: string | null
          created_by: string
          description: string | null
          duration_minutes: number | null
          end_time: string
          ended: boolean | null
          guild_id: string | null
          id: number
          message_id: string | null
          prize: string
          start_time: string
          winners_count: number
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          created_by: string
          description?: string | null
          duration_minutes?: number | null
          end_time: string
          ended?: boolean | null
          guild_id?: string | null
          id?: number
          message_id?: string | null
          prize: string
          start_time?: string
          winners_count: number
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          duration_minutes?: number | null
          end_time?: string
          ended?: boolean | null
          guild_id?: string | null
          id?: number
          message_id?: string | null
          prize?: string
          start_time?: string
          winners_count?: number
        }
        Relationships: []
      }
      guild_commands: {
        Row: {
          command_name: string
          created_at: string | null
          guild_id: string
          id: string
          is_enabled: boolean | null
          last_used: string | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          command_name: string
          created_at?: string | null
          guild_id: string
          id?: string
          is_enabled?: boolean | null
          last_used?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          command_name?: string
          created_at?: string | null
          guild_id?: string
          id?: string
          is_enabled?: boolean | null
          last_used?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      guild_settings: {
        Row: {
          anti_spam: boolean | null
          auto_moderation: boolean | null
          auto_role: string | null
          created_at: string | null
          economy_enabled: boolean | null
          guild_id: string
          guild_name: string | null
          join_leave_channel_id: number | null
          leave_message: string | null
          level_up_channel: string | null
          level_up_message: string | null
          leveling_system: boolean | null
          logging_enabled: boolean | null
          maintenance_mode: boolean | null
          mod_log_channel: number | null
          music_enabled: boolean | null
          muted_role_id: number | null
          prefix: string | null
          staff_log_channel_id: number | null
          ticket_channel_id: number | null
          ticket_system: boolean | null
          updated_at: string | null
          welcome_channel_id: string | null
          welcome_message: string | null
        }
        Insert: {
          anti_spam?: boolean | null
          auto_moderation?: boolean | null
          auto_role?: string | null
          created_at?: string | null
          economy_enabled?: boolean | null
          guild_id: string
          guild_name?: string | null
          join_leave_channel_id?: number | null
          leave_message?: string | null
          level_up_channel?: string | null
          level_up_message?: string | null
          leveling_system?: boolean | null
          logging_enabled?: boolean | null
          maintenance_mode?: boolean | null
          mod_log_channel?: number | null
          music_enabled?: boolean | null
          muted_role_id?: number | null
          prefix?: string | null
          staff_log_channel_id?: number | null
          ticket_channel_id?: number | null
          ticket_system?: boolean | null
          updated_at?: string | null
          welcome_channel_id?: string | null
          welcome_message?: string | null
        }
        Update: {
          anti_spam?: boolean | null
          auto_moderation?: boolean | null
          auto_role?: string | null
          created_at?: string | null
          economy_enabled?: boolean | null
          guild_id?: string
          guild_name?: string | null
          join_leave_channel_id?: number | null
          leave_message?: string | null
          level_up_channel?: string | null
          level_up_message?: string | null
          leveling_system?: boolean | null
          logging_enabled?: boolean | null
          maintenance_mode?: boolean | null
          mod_log_channel?: number | null
          music_enabled?: boolean | null
          muted_role_id?: number | null
          prefix?: string | null
          staff_log_channel_id?: number | null
          ticket_channel_id?: number | null
          ticket_system?: boolean | null
          updated_at?: string | null
          welcome_channel_id?: string | null
          welcome_message?: string | null
        }
        Relationships: []
      }
      guilds: {
        Row: {
          afk_channel_id: string | null
          afk_timeout: number | null
          banner: string | null
          bot_permissions: string[] | null
          created_at: string | null
          default_message_notifications: number | null
          description: string | null
          discovery_splash: string | null
          emojis: Json | null
          explicit_content_filter: number | null
          features: string[] | null
          guild_id: string
          icon: string | null
          id: string
          joined_at: string | null
          large: boolean | null
          max_members: number | null
          max_presences: number | null
          member_count: number | null
          mfa_level: number | null
          name: string
          nsfw_level: number | null
          owner_id: string | null
          permissions: string[] | null
          preferred_locale: string | null
          premium_progress_bar_enabled: boolean | null
          premium_subscription_count: number | null
          premium_tier: number | null
          public_updates_channel_id: string | null
          region: string | null
          roles: Json | null
          rules_channel_id: string | null
          splash: string | null
          system_channel_flags: string[] | null
          system_channel_id: string | null
          unavailable: boolean | null
          updated_at: string | null
          vanity_url_code: string | null
          verification_level: number | null
          widget_channel_id: string | null
          widget_enabled: boolean | null
        }
        Insert: {
          afk_channel_id?: string | null
          afk_timeout?: number | null
          banner?: string | null
          bot_permissions?: string[] | null
          created_at?: string | null
          default_message_notifications?: number | null
          description?: string | null
          discovery_splash?: string | null
          emojis?: Json | null
          explicit_content_filter?: number | null
          features?: string[] | null
          guild_id: string
          icon?: string | null
          id?: string
          joined_at?: string | null
          large?: boolean | null
          max_members?: number | null
          max_presences?: number | null
          member_count?: number | null
          mfa_level?: number | null
          name: string
          nsfw_level?: number | null
          owner_id?: string | null
          permissions?: string[] | null
          preferred_locale?: string | null
          premium_progress_bar_enabled?: boolean | null
          premium_subscription_count?: number | null
          premium_tier?: number | null
          public_updates_channel_id?: string | null
          region?: string | null
          roles?: Json | null
          rules_channel_id?: string | null
          splash?: string | null
          system_channel_flags?: string[] | null
          system_channel_id?: string | null
          unavailable?: boolean | null
          updated_at?: string | null
          vanity_url_code?: string | null
          verification_level?: number | null
          widget_channel_id?: string | null
          widget_enabled?: boolean | null
        }
        Update: {
          afk_channel_id?: string | null
          afk_timeout?: number | null
          banner?: string | null
          bot_permissions?: string[] | null
          created_at?: string | null
          default_message_notifications?: number | null
          description?: string | null
          discovery_splash?: string | null
          emojis?: Json | null
          explicit_content_filter?: number | null
          features?: string[] | null
          guild_id?: string
          icon?: string | null
          id?: string
          joined_at?: string | null
          large?: boolean | null
          max_members?: number | null
          max_presences?: number | null
          member_count?: number | null
          mfa_level?: number | null
          name?: string
          nsfw_level?: number | null
          owner_id?: string | null
          permissions?: string[] | null
          preferred_locale?: string | null
          premium_progress_bar_enabled?: boolean | null
          premium_subscription_count?: number | null
          premium_tier?: number | null
          public_updates_channel_id?: string | null
          region?: string | null
          roles?: Json | null
          rules_channel_id?: string | null
          splash?: string | null
          system_channel_flags?: string[] | null
          system_channel_id?: string | null
          unavailable?: boolean | null
          updated_at?: string | null
          vanity_url_code?: string | null
          verification_level?: number | null
          widget_channel_id?: string | null
          widget_enabled?: boolean | null
        }
        Relationships: []
      }
      mod_logs: {
        Row: {
          action: string
          case_id: string | null
          created_at: string | null
          details: Json | null
          expires_at: string | null
          guild_id: string
          id: number
          moderator_id: string
          reason: string | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          action: string
          case_id?: string | null
          created_at?: string | null
          details?: Json | null
          expires_at?: string | null
          guild_id: string
          id?: number
          moderator_id: string
          reason?: string | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          action?: string
          case_id?: string | null
          created_at?: string | null
          details?: Json | null
          expires_at?: string | null
          guild_id?: string
          id?: number
          moderator_id?: string
          reason?: string | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: []
      }
      punishments: {
        Row: {
          active: boolean | null
          command_name: string
          expires_at: string | null
          id: number
          issued_at: string | null
          moderator_id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          command_name: string
          expires_at?: string | null
          id?: number
          issued_at?: string | null
          moderator_id: string
          reason?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          command_name?: string
          expires_at?: string | null
          id?: number
          issued_at?: string | null
          moderator_id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_command_name"
            columns: ["command_name"]
            isOneToOne: false
            referencedRelation: "commands"
            referencedColumns: ["name"]
          },
        ]
      }
      reaction_role_embeds: {
        Row: {
          author_id: string
          channel_id: string
          color: string | null
          created_at: string | null
          description: string
          footer_icon: string | null
          footer_text: string | null
          guild_id: string
          id: string
          message_id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          author_id: string
          channel_id: string
          color?: string | null
          created_at?: string | null
          description: string
          footer_icon?: string | null
          footer_text?: string | null
          guild_id: string
          id?: string
          message_id: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          channel_id?: string
          color?: string | null
          created_at?: string | null
          description?: string
          footer_icon?: string | null
          footer_text?: string | null
          guild_id?: string
          id?: string
          message_id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reaction_roles: {
        Row: {
          channel_id: string
          created_at: string | null
          emoji: string
          guild_id: string
          id: string
          message_id: string
          role_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          emoji: string
          guild_id: string
          id?: string
          message_id: string
          role_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          emoji?: string
          guild_id?: string
          id?: string
          message_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reaction_roles_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "reaction_role_embeds"
            referencedColumns: ["message_id"]
          },
        ]
      }
      roles: {
        Row: {
          color: number | null
          created_at: string | null
          guild_id: string
          hoist: boolean | null
          managed: boolean | null
          mentionable: boolean | null
          name: string | null
          permissions: string | null
          position: number | null
          role_id: string
          updated_at: string | null
        }
        Insert: {
          color?: number | null
          created_at?: string | null
          guild_id: string
          hoist?: boolean | null
          managed?: boolean | null
          mentionable?: boolean | null
          name?: string | null
          permissions?: string | null
          position?: number | null
          role_id: string
          updated_at?: string | null
        }
        Update: {
          color?: number | null
          created_at?: string | null
          guild_id?: string
          hoist?: boolean | null
          managed?: boolean | null
          mentionable?: boolean | null
          name?: string | null
          permissions?: string | null
          position?: number | null
          role_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      staff_roles: {
        Row: {
          created_at: string | null
          created_by: string
          guild_id: string
          id: string
          role_id: string
          role_name: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          guild_id: string
          id?: string
          role_id: string
          role_name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          guild_id?: string
          id?: string
          role_id?: string
          role_name?: string
        }
        Relationships: []
      }
      user_messages: {
        Row: {
          channel_id: string
          count: number | null
          guild_id: string
          id: number
          last_message_at: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          count?: number | null
          guild_id: string
          id?: number
          last_message_at?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          count?: number | null
          guild_id?: string
          id?: number
          last_message_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_messages_channels"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by: string
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "staff_roles"
            referencedColumns: ["role_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          bot: boolean | null
          discord_id: string | null
          discriminator: string | null
          email: string | null
          flags: string[] | null
          id: string
          is_admin: boolean | null
          joined_at: string | null
          last_active: string | null
          left_at: string | null
          level: number | null
          premium_type: number | null
          public_flags: string[] | null
          roles: string[] | null
          status: string | null
          system: boolean | null
          updated_at: string | null
          user_id: string | null
          username: string
          xp: number | null
        }
        Insert: {
          avatar?: string | null
          bot?: boolean | null
          discord_id?: string | null
          discriminator?: string | null
          email?: string | null
          flags?: string[] | null
          id: string
          is_admin?: boolean | null
          joined_at?: string | null
          last_active?: string | null
          left_at?: string | null
          level?: number | null
          premium_type?: number | null
          public_flags?: string[] | null
          roles?: string[] | null
          status?: string | null
          system?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          username: string
          xp?: number | null
        }
        Update: {
          avatar?: string | null
          bot?: boolean | null
          discord_id?: string | null
          discriminator?: string | null
          email?: string | null
          flags?: string[] | null
          id?: string
          is_admin?: boolean | null
          joined_at?: string | null
          last_active?: string | null
          left_at?: string | null
          level?: number | null
          premium_type?: number | null
          public_flags?: string[] | null
          roles?: string[] | null
          status?: string | null
          system?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          username?: string
          xp?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      database_inspection: {
        Row: {
          column_default: string | null
          column_name: unknown | null
          data_type: string | null
          foreign_column_name: unknown | null
          foreign_key_name: unknown | null
          foreign_table_name: unknown | null
          foreign_table_schema: unknown | null
          is_nullable: string | null
          rls_command: string | null
          rls_permissive: string | null
          rls_policy_name: unknown | null
          rls_qual: string | null
          rls_roles: unknown[] | null
          rls_with_check: string | null
          table_name: unknown | null
          table_schema: unknown | null
        }
        Relationships: []
      }
      mod_logs_with_usernames: {
        Row: {
          action: string | null
          created_at: string | null
          details: Json | null
          guild_id: string | null
          id: number | null
          moderator_id: string | null
          moderator_username: string | null
          user_id: string | null
          user_username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      increment_command_usage: {
        Args: { command_name: string }
        Returns: undefined
      }
      is_user_staff_web: {
        Args: { user_discord_id: string; guild_discord_id: string }
        Returns: boolean
      }
      safe_upsert_guild: {
        Args: {
          p_guild_id: string
          p_name: string
          p_icon?: string
          p_description?: string
          p_owner_id?: string
          p_member_count?: number
          p_features?: string[]
          p_premium_tier?: number
          p_joined_at?: string
        }
        Returns: Json
      }
      upsert_guild: {
        Args: {
          p_guild_id: string
          p_name: string
          p_icon?: string
          p_description?: string
          p_owner_id?: string
          p_member_count?: number
          p_features?: string[]
        }
        Returns: {
          id: string
          guild_id: string
          name: string
          icon: string
          description: string
          owner_id: string
          member_count: number
          features: string[]
          created_at: string
          updated_at: string
        }[]
      }
      upsert_guild_command: {
        Args: {
          p_guild_id: string
          p_command_name: string
          p_is_enabled?: boolean
          p_usage_count?: number
        }
        Returns: {
          id: string
          guild_id: string
          command_name: string
          is_enabled: boolean
          usage_count: number
          created_at: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
