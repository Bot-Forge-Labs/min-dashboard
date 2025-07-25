import type { Database } from "./database.types"

export interface Role {
  role_id: string
  name: string
  color: number
}

export type Guild = Database["public"]["Tables"]["guilds"]["Row"]
export type GuildSettings = Database["public"]["Tables"]["guild_settings"]["Row"]
export type User = Database["public"]["Tables"]["users"]["Row"]
export type Command = Database["public"]["Tables"]["commands"]["Row"]
export type ModLog = Database["public"]["Views"]["mod_logs_with_usernames"]["Row"]
export type Punishment = Database["public"]["Tables"]["punishments"]["Row"]
export type Giveaway = Database["public"]["Tables"]["giveaways"]["Row"]
export type GiveawayWinner = Database["public"]["Tables"]["giveaway_winners"]["Row"]
export type Announcement = Database["public"]["Tables"]["announcements"]["Row"]
export type ReactionRoleEmbed = Database["public"]["Tables"]["reaction_role_embeds"]["Row"]
export type ReactionRole = Database["public"]["Tables"]["reaction_roles"]["Row"]
export type StaffRole = Database["public"]["Tables"]["staff_roles"]["Row"]
export type UserRole = Database["public"]["Tables"]["user_roles"]["Row"]
export type UserGuild = Database["public"]["Tables"]["user_guilds"]["Row"]
export type SubCommand = Database["public"]["Tables"]["subcommands"]["Row"]
export type AnalyticsEvent = Database["public"]["Tables"]["analytics_events"]["Row"]
export type BotSettings = Database["public"]["Tables"]["bot_settings"]["Row"]
export type BotStatus = Database["public"]["Tables"]["bot_status"]["Row"]
export type Channel = Database["public"]["Tables"]["channels"]["Row"]
export type CommandUsageLog = Database["public"]["Tables"]["command_usage_logs"]["Row"]
export type GuildCommand = Database["public"]["Tables"]["guild_commands"]["Row"]
export type UserMessage = Database["public"]["Tables"]["user_messages"]["Row"]

// Leveling System Types
export type UserLevel = Database["public"]["Tables"]["user_levels"]["Row"]
export type LevelRole = Database["public"]["Tables"]["level_roles"]["Row"]
export type LevelingConfig = Database["public"]["Tables"]["leveling_config"]["Row"]
export type XPTransaction = Database["public"]["Tables"]["xp_transactions"]["Row"]
export type LevelingStats = Database["public"]["Tables"]["leveling_stats"]["Row"]
export type AutoModerationConfig = Database["public"]["Tables"]["auto_moderation_config"]["Row"]

// Insert Types for Leveling System
export type UserLevelInsert = Database["public"]["Tables"]["user_levels"]["Insert"]
export type LevelRoleInsert = Database["public"]["Tables"]["level_roles"]["Insert"]
export type LevelingConfigInsert = Database["public"]["Tables"]["leveling_config"]["Insert"]
export type XPTransactionInsert = Database["public"]["Tables"]["xp_transactions"]["Insert"]
export type LevelingStatsInsert = Database["public"]["Tables"]["leveling_stats"]["Insert"]
export type AutoModerationConfigInsert = Database["public"]["Tables"]["auto_moderation_config"]["Insert"]

// Update Types for Leveling System
export type UserLevelUpdate = Database["public"]["Tables"]["user_levels"]["Update"]
export type LevelRoleUpdate = Database["public"]["Tables"]["level_roles"]["Update"]
export type LevelingConfigUpdate = Database["public"]["Tables"]["leveling_config"]["Update"]
export type XPTransactionUpdate = Database["public"]["Tables"]["xp_transactions"]["Update"]
export type LevelingStatsUpdate = Database["public"]["Tables"]["leveling_stats"]["Update"]
export type AutoModerationConfigUpdate = Database["public"]["Tables"]["auto_moderation_config"]["Update"]
