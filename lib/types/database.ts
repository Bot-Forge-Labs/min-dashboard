export interface Guild {
  guild_id: string
  name: string
  owner_id: string
  created_at: string
  updated_at: string
  member_count?: number
  online_count?: number
  status?: "active" | "warning" | "inactive"
}

export interface GuildSettings {
  guild_id: bigint
  staff_log_channel_id?: bigint
  muted_role_id?: bigint
  join_leave_channel_id?: bigint
  ticket_channel_id?: bigint
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  username: string
  joined_at: string
  left_at?: string
  roles?: string[]
}

export interface Command {
  name: string
  description: string
  category: string
  usage_count: number
  last_used?: string
  added_at: string
  is_enabled: boolean
  cooldown: number
  permissions: string[]
  type: string
}

export interface ModLog {
  id: number
  guild_id: string
  user_id: string
  user_username?: string
  moderator_id: string
  moderator_username?: string
  action: string
  details: any
  created_at: string
}

export interface Punishment {
  id: number
  user_id: string
  moderator_id: string
  command_name: string
  reason: string
  issued_at: string
  expires_at?: string
  active: boolean
}

export interface Giveaway {
  id: number
  prize: string
  description: string
  start_time: string
  end_time: string
  winners_count: number
  created_by: string
  channel_id: string
  message_id?: string
  ended: boolean
  created_at: string
  duration_minutes?: number
}

export interface GiveawayWinner {
  id: number
  giveaway_id: number
  user_id: string
  won_at: string
}

export interface Announcement {
  id: number
  channel_id: string
  title: string
  content: string
  embed_color?: number
  image_url?: string
  thumbnail_url?: string
  footer_text?: string
  created_at: string
  created_by: string
}

export interface ReactionRoleEmbed {
  id: string
  guild_id: string
  channel_id: string
  message_id: string
  title?: string
  description?: string
  color?: string
  footer_text?: string
  footer_icon?: string
  author_id: string
  created_at: string
  updated_at: string
}

export interface ReactionRole {
  id: string
  guild_id: string
  channel_id: string
  message_id: string
  emoji: string
  role_id: string
  created_at: string
}

export interface Role {
  role_id: string
  guild_id: string
  name: string
  color?: number
  permissions?: number
  created_at: string
  updated_at: string
}

export interface StaffRole {
  id: string
  role_id: string
  role_name: string
  guild_id: string
  created_at: string
  created_by: string
}

export interface UserRole {
  id: string
  user_id: string
  role_id: string
  assigned_at: string
  assigned_by?: string
}

export interface DashboardStats {
  total_servers: number
  total_users: number
  bot_uptime: number
  commands_per_day: number
  active_giveaways: number
  mod_actions_week: number
  announcements_month: number
}
