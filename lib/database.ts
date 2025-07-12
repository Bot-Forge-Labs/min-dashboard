// Database connection utility
// Replace with your actual database connection (Neon, Supabase, etc.)

export interface Guild {
  guild_id: string
  name: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface Command {
  name: string
  description: string
  category: string
  usage_count: number
  last_used: string
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
  expires_at: string | null
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
  message_id: string
  ended: boolean
  created_at: string
  duration_minutes: number
}

export interface Announcement {
  id: number
  channel_id: string
  title: string
  content: string
  embed_color: number
  image_url: string | null
  thumbnail_url: string | null
  footer_text: string
  created_at: string
  created_by: string
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

// Database query functions
export async function getGuilds(): Promise<Guild[]> {
  // Implement your database query here
  // Example with Neon:
  // const sql = neon(process.env.DATABASE_URL);
  // return await sql`SELECT * FROM guilds ORDER BY created_at DESC`;
  return []
}

export async function getCommands(): Promise<Command[]> {
  // Implement your database query here
  return []
}

export async function getModLogs(): Promise<ModLog[]> {
  // Implement your database query here
  return []
}

export async function getPunishments(): Promise<Punishment[]> {
  // Implement your database query here
  return []
}

export async function getGiveaways(): Promise<Giveaway[]> {
  // Implement your database query here
  return []
}

export async function getAnnouncements(): Promise<Announcement[]> {
  // Implement your database query here
  return []
}

export async function getReactionRoles(): Promise<ReactionRole[]> {
  // Implement your database query here
  return []
}
