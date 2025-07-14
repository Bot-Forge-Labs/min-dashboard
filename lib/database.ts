import type { Database } from "../types/database.types";
import { createClient } from "./supabase/client";


// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

const supabase = createClient();

// Type definitions from types/database.types
export * from "../types/database.types";
export interface DashboardStats {
  total_servers: number;
  total_users: number;
  bot_uptime: number;
  commands_per_day: number;
  active_giveaways: number;
  mod_actions_week: number;
  announcements_month: number;
}

// Database query functions
export async function insertPunishment(punishment: Omit<Database["public"]["Tables"]["punishments"]["Row"], "id" | "issued_at">): Promise<Database["public"]["Tables"]["punishments"]["Row"] | null> {
  try {
    const { data, error } = await supabase
      .from("punishments")
      .insert({
        ...punishment,
        issued_at: new Date().toISOString(),
        command_name: punishment.command_name || null,
      })
      .select()
      .single();
    if (error) {
      console.error("Error inserting punishment:", error);
      return null;
    }
    return data ?? null;
  } catch (err) {
    console.error("Error in insertPunishment:", err);
    return null;
  }
}

export async function getGuilds(page: number = 1, limit: number = 10): Promise<{ data: Database["public"]["Tables"]["guilds"]["Row"][]; total: number }> {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const [response, countResponse] = await Promise.all([
      supabase
        .from("guilds")
        .select("*")
        .order("name", { ascending: true })
        .range(from, to),
      supabase.from("guilds").select("*", { count: "exact", head: true }),
    ]);
    const { data, error } = response;
    const { count } = countResponse;
    if (error) {
      console.error("Error fetching guilds:", error);
      return { data: [], total: 0 };
    }
    return { data: data ?? [], total: count ?? 0 };
  } catch (err) {
    console.error("Error in getGuilds:", err);
    return { data: [], total: 0 };
  }
}

export async function getGuildSettings(guildId: string): Promise<Database["public"]["Tables"]["guild_settings"]["Row"] | null> {
  try {
    const { data, error } = await supabase
      .from("guild_settings")
      .select("*")
      .eq("guild_id", guildId)
      .single();
    if (error) {
      console.error(`Error fetching settings for guild ${guildId}:`, error);
      return null;
    }
    return data ?? null;
  } catch (err) {
    console.error(`Error in getGuildSettings for guild ${guildId}:`, err);
    return null;
  }
}

export async function updateGuildSettings(guildId: string, settings: Partial<Database["public"]["Tables"]["guild_settings"]["Row"]>): Promise<Database["public"]["Tables"]["guild_settings"]["Row"] | null> {
  try {
    const { data, error } = await supabase
      .from("guild_settings")
      .upsert({ ...settings, guild_id: guildId, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) {
      console.error(`Error updating settings for guild ${guildId}:`, error);
      return null;
    }
    return data ?? null;
  } catch (err) {
    console.error(`Error in updateGuildSettings for guild ${guildId}:`, err);
    return null;
  }
}

export async function getUsers(page: number = 1, limit: number = 10): Promise<{ data: Database["public"]["Tables"]["users"]["Row"][]; total: number }> {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const [response, countResponse] = await Promise.all([
      supabase
        .from("users")
        .select("*")
        .order("username", { ascending: true })
        .range(from, to),
      supabase.from("users").select("*", { count: "exact", head: true }),
    ]);
    const { data, error } = response;
    const { count } = countResponse;
    if (error) {
      console.error("Error fetching users:", error);
      return { data: [], total: 0 };
    }
    return { data: data ?? [], total: count ?? 0 };
  } catch (err) {
    console.error("Error in getUsers:", err);
    return { data: [], total: 0 };
  }
}

export async function getUserGuilds(
  userId: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ data: Database["public"]["Tables"]["user_guilds"]["Row"][]; total: number }> {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const [response, countResponse] = await Promise.all([
      supabase
        .from("user_guilds")
        .select("*")
        .eq("user_id", userId)
        .order("joined_at", { ascending: false })
        .range(from, to),
      supabase.from("user_guilds").select("*", { count: "exact", head: true }).eq("user_id", userId),
    ]);
    const { data, error } = response;
    const { count } = countResponse;
    if (error) {
      console.error(`Error fetching user guilds for ${userId}:`, error);
      return { data: [], total: 0 };
    }
    return { data: data ?? [], total: count ?? 0 };
  } catch (err) {
    console.error(`Error in getUserGuilds for ${userId}:`, err);
    return { data: [], total: 0 };
  }
}

export async function getCommands(page: number = 1, limit: number = 10): Promise<{ data: Database["public"]["Tables"]["commands"]["Row"][]; total: number }> {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const [response, countResponse] = await Promise.all([
      supabase
        .from("commands")
        .select("*")
        .order("usage_count", { ascending: false })
        .range(from, to),
      supabase.from("commands").select("*", { count: "exact", head: true }),
    ]);
    const { data, error } = response;
    const { count } = countResponse;
    if (error) {
      console.error("Error fetching commands:", error);
      return { data: [], total: 0 };
    }
    return { data: data ?? [], total: count ?? 0 };
  } catch (err) {
    console.error("Error in getCommands:", err);
    return { data: [], total: 0 };
  }
}

export async function getSubCommands(
  commandName: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ data: Database["public"]["Tables"]["subcommands"]["Row"][]; total: number }> {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const [response, countResponse] = await Promise.all([
      supabase
        .from("subcommands")
        .select("*")
        .eq("command_name", commandName)
        .order("name", { ascending: true })
        .range(from, to),
      supabase.from("subcommands").select("*", { count: "exact", head: true }).eq("command_name", commandName),
    ]);
    const { data, error } = response;
    const { count } = countResponse;
    if (error) {
      console.error(`Error fetching subcommands for ${commandName}:`, error);
      return { data: [], total: 0 };
    }
    return { data: data ?? [], total: count ?? 0 };
  } catch (err) {
    console.error(`Error in getSubCommands for ${commandName}:`, err);
    return { data: [], total: 0 };
  }
}

export async function getModLogs(
  guildId?: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ data: Database["public"]["Views"]["mod_logs_with_usernames"]["Row"][]; total: number }> {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    let query = supabase
      .from("mod_logs_with_usernames")
      .select("id, guild_id, user_id, user_username, moderator_id, moderator_username, action, details, created_at")
      .order("created_at", { ascending: false })
      .range(from, to);
    if (guildId) query = query.eq("guild_id", guildId);
    const [response, countResponse] = await Promise.all([
      query,
      supabase.from("mod_logs_with_usernames").select("*", { count: "exact", head: true }).eq("guild_id", guildId || ""),
    ]);
    const { data, error } = response;
    const { count } = countResponse;
    if (error) {
      console.error("Error fetching mod logs:", error);
      return { data: [], total: 0 };
    }
    return { data: data ?? [], total: count ?? 0 };
  } catch (err) {
    console.error("Error in getModLogs:", err);
    return { data: [], total: 0 };
  }
}

export async function getPunishments(
  guildId?: string,
  userId?: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ data: Database["public"]["Tables"]["punishments"]["Row"][]; total: number }> {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    let query = supabase
      .from("punishments")
      .select("id, user_id, guild_id, moderator_id, command_name, reason, issued_at, expires_at, active")
      .order("issued_at", { ascending: false })
      .range(from, to);
    if (guildId) query = query.eq("guild_id", guildId);
    if (userId) query = query.eq("user_id", userId);
    const [response, countResponse] = await Promise.all([
      query,
      supabase
        .from("punishments")
        .select("*", { count: "exact", head: true })
        .eq("guild_id", guildId || "")
        .eq("user_id", userId || ""),
    ]);
    const { data, error } = response;
    const { count } = countResponse;
    if (error) {
      console.error("Error fetching punishments:", error);
      return { data: [], total: 0 };
    }
    return { data: data ?? [], total: count ?? 0 };
  } catch (err) {
    console.error("Error in getPunishments:", err);
    return { data: [], total: 0 };
  }
}
export async function getGiveaways(
  guildId?: string,
  activeOnly: boolean = false,
  page: number = 1,
  limit: number = 10,
): Promise<{ data: Database["public"]["Tables"]["giveaways"]["Row"][]; total: number }> {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    let query = supabase
      .from("giveaways")
      .select("*")
      .order("start_time", { ascending: false })
      .range(from, to);
    if (guildId) query = query.eq("guild_id", guildId);
    if (activeOnly) query = query.eq("ended", false);

    let countQuery = supabase
      .from("giveaways")
      .select("*", { count: "exact", head: true });
    if (guildId) countQuery = countQuery.eq("guild_id", guildId);
    if (activeOnly) countQuery = countQuery.eq("ended", false);

    const [response, countResponse] = await Promise.all([query, countQuery]);

    const { data, error } = response;
    const { count } = countResponse;

    if (error) {
      console.error("Error fetching giveaways:", error);
      return { data: [], total: 0 };
    }
    return { data: data ?? [], total: count ?? 0 };
  } catch (err) {
    console.error("Error in getGiveaways:", err);
    return { data: [], total: 0 };
  }
}


export async function getGiveawayWinners(
  giveawayId: number,
  page: number = 1,
  limit: number = 10,
): Promise<{ data: Database["public"]["Tables"]["giveaway_winners"]["Row"][]; total: number }> {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const [response, countResponse] = await Promise.all([
      supabase
        .from("giveaway_winners")
        .select("*")
        .eq("giveaway_id", giveawayId)
        .order("won_at", { ascending: false })
        .range(from, to),
      supabase.from("giveaway_winners").select("*", { count: "exact", head: true }).eq("giveaway_id", giveawayId),
    ]);
    const { data, error } = response;
    const { count } = countResponse;
    if (error) {
      console.error(`Error fetching giveaway winners for giveaway ${giveawayId}:`, error);
      return { data: [], total: 0 };
    }
    return { data: data ?? [], total: count ?? 0 };
  } catch (err) {
    console.error(`Error in getGiveawayWinners for giveaway ${giveawayId}:`, err);
    return { data: [], total: 0 };
  }
}

export async function getAnnouncements(
  guildId?: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ data: Database["public"]["Tables"]["announcements"]["Row"][]; total: number }> {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    let query = supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);
    if (guildId) query = query.eq("guild_id", guildId);
    const [response, countResponse] = await Promise.all([
      query,
      supabase.from("announcements").select("*", { count: "exact", head: true }).eq("guild_id", guildId || ""),
    ]);
    const { data, error } = response;
    const { count } = countResponse;
    if (error) {
      console.error("Error fetching announcements:", error);
      return { data: [], total: 0 };
    }
    return { data: data ?? [], total: count ?? 0 };
  } catch (err) {
    console.error("Error in getAnnouncements:", err);
    return { data: [], total: 0 };
  }
}

export async function getBotSettings(): Promise<Database["public"]["Tables"]["bot_settings"]["Row"] | null> {
  try {
    const { data, error } = await supabase
      .from("bot_settings")
      .select("*")
      .single();
    if (error) {
      console.error("Error fetching bot settings:", error);
      return null;
    }
    return data ?? null;
  } catch (err) {
    console.error("Error in getBotSettings:", err);
    return null;
  }
}

export async function getBotStatus(): Promise<Database["public"]["Tables"]["bot_status"]["Row"] | null> {
  try {
    const { data, error } = await supabase
      .from("bot_status")
      .select("*")
      .single();
    if (error) {
      console.error("Error fetching bot status:", error);
      return null;
    }
    return data ?? null;
  } catch (err) {
    console.error("Error in getBotStatus:", err);
    return null;
  }
}

export async function getChannels(
  guildId: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ data: Database["public"]["Tables"]["channels"]["Row"][]; total: number }> {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const [response, countResponse] = await Promise.all([
      supabase
        .from("channels")
        .select("*")
        .eq("guild_id", guildId)
        .order("name", { ascending: true })
        .range(from, to),
      supabase.from("channels").select("*", { count: "exact", head: true }).eq("guild_id", guildId),
    ]);
    const { data, error } = response;
    const { count } = countResponse;
    if (error) {
      console.error(`Error fetching channels for guild ${guildId}:`, error);
      return { data: [], total: 0 };
    }
    return { data: data ?? [], total: count ?? 0 };
  } catch (err) {
    console.error(`Error in getChannels for guild ${guildId}:`, err);
    return { data: [], total: 0 };
  }
}

export async function getCommandUsageLogs(
  guildId?: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ data: Database["public"]["Tables"]["command_usage_logs"]["Row"][]; total: number }> {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    let query = supabase
      .from("command_usage_logs")
      .select("id, command_name, guild_id, user_id, used_at")
      .order("used_at", { ascending: false })
      .range(from, to);
    if (guildId) query = query.eq("guild_id", guildId);
    const [response, countResponse] = await Promise.all([
      query,
      supabase.from("command_usage_logs").select("*", { count: "exact", head: true }).eq("guild_id", guildId || ""),
    ]);
    const { data, error } = response;
    const { count } = countResponse;
    if (error) {
      console.error("Error fetching command usage logs:", error);
      return { data: [], total: 0 };
    }
    return { data: data ?? [], total: count ?? 0 };
  } catch (err) {
    console.error("Error in getCommandUsageLogs:", err);
    return { data: [], total: 0 };
  }
}

export async function getGuildCommands(
  guildId: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ data: Database["public"]["Tables"]["guild_commands"]["Row"][]; total: number }> {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const [response, countResponse] = await Promise.all([
      supabase
        .from("guild_commands")
        .select("*")
        .eq("guild_id", guildId)
        .order("created_at", { ascending: false })
        .range(from, to),
      supabase.from("guild_commands").select("*", { count: "exact", head: true }).eq("guild_id", guildId),
    ]);
    const { data, error } = response;
    const { count } = countResponse;
    if (error) {
      console.error(`Error fetching guild commands for guild ${guildId}:`, error);
      return { data: [], total: 0 };
    }
    return { data: data ?? [], total: count ?? 0 };
  } catch (err) {
    console.error(`Error in getGuildCommands for guild ${guildId}:`, err);
    return { data: [], total: 0 };
  }
}

export async function getUserRoles(
  userId: string,
  guildId?: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ data: Database["public"]["Tables"]["user_roles"]["Row"][]; total: number }> {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    let query = supabase
      .from("user_roles")
      .select("id, user_id, role_id, guild_id, assigned_at, assigned_by") // Added assigned_by
      .eq("user_id", userId)
      .order("assigned_at", { ascending: false })
      .range(from, to);
    if (guildId) query = query.eq("guild_id", guildId);
    const [response, countResponse] = await Promise.all([
      query,
      supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("guild_id", guildId || ""),
    ]);
    const { data, error } = response;
    const { count } = countResponse;
    if (error) {
      console.error(`Error fetching user roles for ${userId}:`, error);
      return { data: [], total: 0 };
    }
    return { data: data ?? [], total: count ?? 0 };
  } catch (err) {
    console.error(`Error in getUserRoles for ${userId}:`, err);
    return { data: [], total: 0 };
  }
}

export async function getReactionRoles(
  guildId?: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ data: Database["public"]["Tables"]["reaction_roles"]["Row"][]; total: number }> {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    let query = supabase
      .from("reaction_roles")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);
    if (guildId) query = query.eq("guild_id", guildId);
    const [response, countResponse] = await Promise.all([
      query,
      supabase.from("reaction_roles").select("*", { count: "exact", head: true }).eq("guild_id", guildId || ""),
    ]);
    const { data, error } = response;
    const { count } = countResponse;
    if (error) {
      console.error("Error fetching reaction roles:", error);
      return { data: [], total: 0 };
    }
    return { data: data ?? [], total: count ?? 0 };
  } catch (err) {
    console.error("Error in getReactionRoles:", err);
    return { data: [], total: 0 };
  }
}

export async function getReactionRoleEmbeds(
  guildId?: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ data: Database["public"]["Tables"]["reaction_role_embeds"]["Row"][]; total: number }> {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    let query = supabase
      .from("reaction_role_embeds")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);
    if (guildId) query = query.eq("guild_id", guildId);
    const [response, countResponse] = await Promise.all([
      query,
      supabase.from("reaction_role_embeds").select("*", { count: "exact", head: true }).eq("guild_id", guildId || ""),
    ]);
    const { data, error } = response;
    const { count } = countResponse;
    if (error) {
      console.error("Error fetching reaction role embeds:", error);
      return { data: [], total: 0 };
    }
    return { data: data ?? [], total: count ?? 0 };
  } catch (err) {
    console.error("Error in getReactionRoleEmbeds:", err);
    return { data: [], total: 0 };
  }
}

export async function getRoles(
  guildId: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ data: Database["public"]["Tables"]["roles"]["Row"][]; total: number }> {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const [response, countResponse] = await Promise.all([
      supabase
        .from("roles")
        .select("*")
        .eq("guild_id", guildId)
        .order("name", { ascending: true })
        .range(from, to),
      supabase.from("roles").select("*", { count: "exact", head: true }).eq("guild_id", guildId),
    ]);
    const { data, error } = response;
    const { count } = countResponse;
    if (error) {
      console.error(`Error fetching roles for guild ${guildId}:`, error);
      return { data: [], total: 0 };
    }
    return { data: data ?? [], total: count ?? 0 };
  } catch (err) {
    console.error(`Error in getRoles for guild ${guildId}:`, err);
    return { data: [], total: 0 };
  }
}

export async function getStaffRoles(
  guildId: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ data: Database["public"]["Tables"]["staff_roles"]["Row"][]; total: number }> {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const [response, countResponse] = await Promise.all([
      supabase
        .from("staff_roles")
        .select("*")
        .eq("guild_id", guildId)
        .order("created_at", { ascending: false })
        .range(from, to),
      supabase.from("staff_roles").select("*", { count: "exact", head: true }).eq("guild_id", guildId),
    ]);
    const { data, error } = response;
    const { count } = countResponse;
    if (error) {
      console.error(`Error fetching staff roles for guild ${guildId}:`, error);
      return { data: [], total: 0 };
    }
    return { data: data ?? [], total: count ?? 0 };
  } catch (err) {
    console.error(`Error in getStaffRoles for guild ${guildId}:`, err);
    return { data: [], total: 0 };
  }
}

export async function getAnalyticsEvents(
  guildId?: string,
  eventType?: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ data: Database["public"]["Tables"]["analytics_events"]["Row"][]; total: number }> {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    let query = supabase
      .from("analytics_events")
      .select("id, guild_id, user_id, event_type, event_data, timestamp")
      .order("timestamp", { ascending: false })
      .range(from, to);
    if (guildId) query = query.eq("guild_id", guildId);
    if (eventType) query = query.eq("event_type", eventType);
    const [response, countResponse] = await Promise.all([
      query,
      supabase
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("guild_id", guildId || "")
        .eq("event_type", eventType || ""),
    ]);
    const { data, error } = response;
    const { count } = countResponse;
    if (error) {
      console.error("Error fetching analytics events:", error);
      return { data: [], total: 0 };
    }
    return { data: data ?? [], total: count ?? 0 };
  } catch (err) {
    console.error("Error in getAnalyticsEvents:", err);
    return { data: [], total: 0 };
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [
      guildCount,
      userCount,
      giveawayCount,
      modLogCount,
      announcementCount,
      commandCount,
      botStatus,
    ] = await Promise.all([
      supabase.from("guilds").select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("giveaways").select("*", { count: "exact", head: true }).eq("ended", false),
      supabase
        .from("mod_logs_with_usernames")
        .select("*", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from("announcements")
        .select("*", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from("command_usage_logs")
        .select("*", { count: "exact", head: true })
        .gte("used_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      supabase.from("bot_status").select("uptime_seconds").single(),
    ]);

    const { count: total_servers } = guildCount;
    const { count: total_users } = userCount;
    const { count: active_giveaways } = giveawayCount;
    const { count: mod_actions_week } = modLogCount;
    const { count: announcements_month } = announcementCount;
    const { count: commands_per_day } = commandCount;
    const { data: bot_status, error: bot_status_error } = botStatus;

    if (bot_status_error) {
      console.error("Error fetching bot status:", bot_status_error);
    }

    return {
      total_servers: total_servers ?? 0,
      total_users: total_users ?? 0,
      bot_uptime: bot_status?.uptime_seconds ?? process.uptime(),
      commands_per_day: commands_per_day ?? 0,
      active_giveaways: active_giveaways ?? 0,
      mod_actions_week: mod_actions_week ?? 0,
      announcements_month: announcements_month ?? 0,
    };
  } catch (err) {
    console.error("Error in getDashboardStats:", err);
    return {
      total_servers: 0,
      total_users: 0,
      bot_uptime: process.uptime(),
      commands_per_day: 0,
      active_giveaways: 0,
      mod_actions_week: 0,
      announcements_month: 0,
    };
  }
}