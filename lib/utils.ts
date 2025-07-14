import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { insertPunishment } from "./database";
import { Database } from "@/types/database.types";
import { UserProfile } from "@/components/settings/settings-form";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function createPunishment(
  userId: string,
  guildId: string,
  moderatorId: string,
  reason: string,
  commandName?: string | null,
  expiresAt?: string | null
): Promise<Database["public"]["Tables"]["punishments"]["Row"] | null> {
  try {
    return await insertPunishment({
      user_id: userId,
      guild_id: guildId,
      moderator_id: moderatorId,
      reason,
      command_name: commandName || null,
      expires_at: expiresAt || null,
      active: true,
    });
  } catch (err) {
    console.error("Error in createPunishment:", err);
    return null;
  }
}

export function normalizeUserData(
  userData: Database["public"]["Tables"]["users"]["Row"]
): UserProfile {
  return {
    id: userData.id,
    username: userData.username ?? "Unknown User",
    discriminator: userData.discriminator ?? "0000",
    avatar:
      userData.avatar ??
      `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 6)}.png`,
    banner: userData.banner ?? undefined,
    roles: [],
    messageCount: userData.message_count ?? 0,
    joinedAt: userData.joined_at ?? new Date().toISOString(),
    lastActive: userData.last_active ?? new Date().toISOString(),
    channelActivity: [],
    status:
      userData.status === "online" ||
      userData.status === "idle" ||
      userData.status === "dnd"
        ? userData.status
        : "offline",
    level: userData.level ?? 1,
    xp: userData.xp ?? 0,
  };
}
