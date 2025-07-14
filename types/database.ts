import { Tables } from "./database.types";

export type Guild = Tables<"guilds">;

export type GuildSettings = Tables<"guild_settings">;

export type User = Tables<"users">;

export type Command = Tables<"commands">;

export type ModLog = Tables<"mod_logs">;

export type Punishment = Tables<"punishments">;

export type Giveaway = Tables<"giveaways">;

export type GiveawayWinner = Tables<"giveaway_winners">;

export type Announcement = Tables<"announcements">;

export type ReactionRoleEmbed = Tables<"reaction_role_embeds">;

export type ReactionRole = Tables<"reaction_roles">;

export type Role = Tables<"roles">;

export type StaffRole = Tables<"staff_roles">;

export type UserRole = Tables<"user_roles">;

export interface DashboardStats {
  total_servers: number;
  total_users: number;
  bot_uptime: number;
  commands_per_day: number;
  active_giveaways: number;
  mod_actions_week: number;
  announcements_month: number;
}
