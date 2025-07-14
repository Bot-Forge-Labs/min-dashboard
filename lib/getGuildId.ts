// lib/getGuildId.ts

export function getGuildId(params: { guildId?: string | string[] } | undefined): string {
  if (!params || !params.guildId) {
    throw new Error("Missing guildId in route parameters");
  }

  if (Array.isArray(params.guildId)) {
    // If guildId is an array (catch-all routes), take the first one
    return params.guildId[0];
  }

  return params.guildId;
}
