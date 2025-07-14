import { createClient } from "@/lib/supabase/server";
import type {
  Guild,
  Command,
  ModLog,
  Punishment,
  Giveaway,
  Announcement,
  ReactionRole,
  User,
} from "@/types/database";

import { DashboardStats } from "@/types";

// Check if Supabase is configured
function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getGuilds(): Promise<Guild[]> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, returning empty array");
    return [];
  }

  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("guilds")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching guilds:", error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    return [];
  }
}

export async function getCommands(): Promise<Command[]> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, returning empty array");
    return [];
  }

  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("commands")
      .select("*")
      .order("usage_count", { ascending: false });

    if (error) {
      console.error("Error fetching commands:", error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    return [];
  }
}

export async function getModLogs(limit = 50): Promise<ModLog[]> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, returning empty array");
    return [];
  }

  try {
    const supabase = await createClient();
    if (!supabase) return [];

    // Attempt to query the view
    const { data: viewData, error: viewError } = await supabase
      .from("mod_logs_with_usernames")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (viewError && viewError.message.includes("does not exist")) {
      // Fallback to mod_logs table
      const { data: tableData, error: tableError } = await supabase
        .from("mod_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (tableError) {
        console.error("Error fetching mod logs fallback:", tableError);
        return [];
      }

      // Explicitly map to ModLog to ensure type safety
      return (tableData ?? []).map((item: any) => ({
        id: item.id,
        guild_id: item.guild_id,
        user_id: item.user_id,
        user_username: item.user_username ?? undefined,
        moderator_id: item.moderator_id,
        moderator_username: item.moderator_username ?? undefined,
        action: item.action,
        details: item.details ?? {},
        created_at: item.created_at,
      }));
    }

    if (viewError) {
      console.error("Error fetching mod logs:", viewError);
      return [];
    }

    // Map viewData to ModLog interface
    return (viewData ?? []).map((item: any) => ({
      id: item.id,
      guild_id: item.guild_id,
      user_id: item.user_id,
      user_username: item.user_username ?? undefined,
      moderator_id: item.moderator_id,
      moderator_username: item.moderator_username ?? undefined,
      action: item.action,
      details: item.details ?? {},
      created_at: item.created_at,
    }));
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    return [];
  }
}

export async function getPunishments(): Promise<Punishment[]> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, returning empty array");
    return [];
  }

  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("punishments")
      .select("*")
      .order("issued_at", { ascending: false });

    if (error) {
      console.error("Error fetching punishments:", error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    return [];
  }
}

export async function getGiveaways(): Promise<Giveaway[]> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, returning empty array");
    return [];
  }

  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("giveaways")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching giveaways:", error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    return [];
  }
}

export async function getAnnouncements(): Promise<Announcement[]> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, returning empty array");
    return [];
  }

  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching announcements:", error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    return [];
  }
}

export async function getReactionRoles(): Promise<ReactionRole[]> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, returning empty array");
    return [];
  }

  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("reaction_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reaction roles:", error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    return [];
  }
}

export async function getUsers(limit = 100): Promise<User[]> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, returning empty array");
    return [];
  }

  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("joined_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    return [];
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const defaultStats: DashboardStats = {
    total_servers: 0,
    total_users: 0,
    bot_uptime: 0,
    commands_per_day: 0,
    active_giveaways: 0,
    mod_actions_week: 0,
    announcements_month: 0,
  };

  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, returning default stats");
    return defaultStats;
  }

  try {
    const supabase = await createClient();
    if (!supabase) return defaultStats;

    let serverCount = 0;

    const { count: guildCount } = await supabase
      .from("guilds")
      .select("*", { count: "exact", head: true });

    if (guildCount && guildCount > 0) {
      serverCount = guildCount;
    } else {
      const { count: guildSettingsCount } = await supabase
        .from("guild_settings")
        .select("*", { count: "exact", head: true });
      serverCount = guildSettingsCount ?? 0;
    }

    const { count: userCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    const { data: commandsData } = await supabase
      .from("commands")
      .select("usage_count");

    const totalCommandUsage =
      commandsData?.reduce((sum, cmd) => sum + (cmd.usage_count ?? 0), 0) ?? 0;

    const { count: activeGiveaways } = await supabase
      .from("giveaways")
      .select("*", { count: "exact", head: true })
      .eq("ended", false);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { count: modActionsWeek } = await supabase
      .from("mod_logs")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString());

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const { count: announcementsMonth } = await supabase
      .from("announcements")
      .select("*", { count: "exact", head: true })
      .gte("created_at", monthAgo.toISOString());

    return {
      total_servers: serverCount,
      total_users: userCount ?? 0,
      bot_uptime: 99.9, // Replace with your actual uptime source
      commands_per_day: Math.floor(totalCommandUsage / 30),
      active_giveaways: activeGiveaways ?? 0,
      mod_actions_week: modActionsWeek ?? 0,
      announcements_month: announcementsMonth ?? 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return defaultStats;
  }
}

export async function getRecentActivity(limit = 10): Promise<ModLog[]> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, returning empty array");
    return [];
  }

  try {
    const supabase = await createClient();
    if (!supabase) return [];

    // Attempt to query the view
    const { data: viewData, error: viewError } = await supabase
      .from("mod_logs_with_usernames")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (viewError && viewError.message.includes("does not exist")) {
      // Fallback to mod_logs table
      const { data: tableData, error: tableError } = await supabase
        .from("mod_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (tableError) {
        console.error("Error fetching recent activity fallback:", tableError);
        return [];
      }

      // Explicitly map to ModLog to ensure type safety
      return (tableData ?? []).map((item: any) => ({
        id: item.id,
        guild_id: item.guild_id,
        user_id: item.user_id,
        user_username: item.user_username ?? undefined,
        moderator_id: item.moderator_id,
        moderator_username: item.moderator_username ?? undefined,
        action: item.action,
        details: item.details ?? {},
        created_at: item.created_at,
      }));
    }

    if (viewError) {
      console.error("Error fetching recent activity:", viewError);
      return [];
    }

    // Map viewData to ModLog interface
    return (viewData ?? []).map((item: any) => ({
      id: item.id,
      guild_id: item.guild_id,
      user_id: item.user_id,
      user_username: item.user_username ?? undefined,
      moderator_id: item.moderator_id,
      moderator_username: item.moderator_username ?? undefined,
      action: item.action,
      details: item.details ?? {},
      created_at: item.created_at,
    }));
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    return [];
  }
}

export async function getServerOverview(): Promise<{ guild_id: string; name: string }[]> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, returning empty array");
    return [];
  }

  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("guilds")
      .select("guild_id, name")
      .order("created_at", { ascending: false })
      .limit(4);

    if (error) {
      console.error("Error fetching server overview:", error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    return [];
  }
}