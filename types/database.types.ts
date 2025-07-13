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
      announcements: {
        Row: {
          channel_id: string
          content: string
          created_at: string | null
          created_by: string
          embed_color: number | null
          footer_text: string | null
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
          id?: number
          image_url?: string | null
          thumbnail_url?: string | null
          title?: string | null
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
          id?: number
          message_id?: string | null
          prize?: string
          start_time?: string
          winners_count?: number
        }
        Relationships: []
      }
      guild_settings: {
        Row: {
          created_at: string | null
          guild_id: number
          guild_name: string | null
          join_leave_channel_id: number | null
          muted_role_id: number | null
          staff_log_channel_id: number | null
          ticket_channel_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          guild_id: number
          guild_name?: string | null
          join_leave_channel_id?: number | null
          muted_role_id?: number | null
          staff_log_channel_id?: number | null
          ticket_channel_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          guild_id?: number
          guild_name?: string | null
          join_leave_channel_id?: number | null
          muted_role_id?: number | null
          staff_log_channel_id?: number | null
          ticket_channel_id?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      guilds: {
        Row: {
          created_at: string | null
          guild_id: string
          name: string | null
          owner_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          guild_id: string
          name?: string | null
          owner_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          guild_id?: string
          name?: string | null
          owner_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mod_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          guild_id: string
          id: number
          moderator_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          guild_id: string
          id?: number
          moderator_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          guild_id?: string
          id?: number
          moderator_id?: string
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
          permissions: number | null
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
          permissions?: number | null
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
          permissions?: number | null
          position?: number | null
          role_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_guild_id_roles"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["guild_id"]
          },
        ]
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
          id: string
          joined_at: string | null
          left_at: string | null
          roles: string[] | null
          username: string
        }
        Insert: {
          id: string
          joined_at?: string | null
          left_at?: string | null
          roles?: string[] | null
          username: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          left_at?: string | null
          roles?: string[] | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
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
      is_user_staff_web: {
        Args: { user_discord_id: string; guild_discord_id: string }
        Returns: boolean
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
