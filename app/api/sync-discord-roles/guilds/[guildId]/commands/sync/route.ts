import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { guildId: string } }) {
  try {
    const { guildId } = params
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Get guild-specific command settings
    const { data: guildCommands, error: guildError } = await supabase
      .from("guild_commands")
      .select("*")
      .eq("guild_id", guildId)

    // Get global commands
    const { data: globalCommands, error: globalError } = await supabase
      .from("commands")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true })

    if (globalError) {
      console.error("Error fetching global commands:", globalError)
      return NextResponse.json({ error: "Failed to fetch commands" }, { status: 500 })
    }

    // Merge global commands with guild-specific settings
    const mergedCommands =
      globalCommands?.map((cmd) => {
        const guildCmd = guildCommands?.find((gc) => gc.command_name === cmd.name)
        return {
          ...cmd,
          guild_enabled: guildCmd?.is_enabled ?? cmd.is_enabled,
          guild_cooldown: guildCmd?.cooldown_seconds ?? cmd.cooldown,
          guild_permissions: guildCmd?.permissions ?? cmd.permissions,
          guild_usage_count: guildCmd?.usage_count ?? 0,
        }
      }) || []

    return NextResponse.json({
      guild_id: guildId,
      commands: mergedCommands,
      total: mergedCommands.length,
    })
  } catch (error) {
    console.error("Guild commands fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
