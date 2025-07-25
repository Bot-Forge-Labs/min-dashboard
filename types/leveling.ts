export interface UserLevel {
  id: string
  user_id: string
  guild_id: string
  username: string
  discriminator: string
  avatar?: string
  xp: number
  level: number
  total_xp: number
  last_message_time?: string
  created_at: string
  updated_at: string
}

export interface LevelRole {
  id: string
  guild_id: string
  level: number
  role_id: string
  role_name: string
  role_color?: number
  created_at: string
}

export interface LevelingConfig {
  id: string
  guild_id: string
  enabled: boolean
  xp_per_message: number
  xp_cooldown: number // in seconds
  level_up_channel_id?: string
  level_up_message: string
  no_xp_roles: string[] // roles that don't gain XP
  no_xp_channels: string[] // channels where no XP is gained
  created_at: string
  updated_at: string
}

export interface LevelingStats {
  total_users: number
  average_level: number
  highest_level: number
  total_xp_given: number
  active_users_today: number
}
