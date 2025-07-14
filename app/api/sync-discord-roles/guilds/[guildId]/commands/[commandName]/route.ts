import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest, { params }: { params: { guildId: string; commandName: string } }) {
  try {
    const { guildId, commandName } = params
    const body = await request.json()
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    const { is_enabled, cooldown_seconds, permissions } = body

    // Update guild-specific command settings
    const { data, error } = await supabase
      .from("guild_commands")
      .upsert({
        guild_id: guildId,
        command_name: commandName,
        is_enabled: is_enabled ?? true,
        cooldown_seconds: cooldown_seconds ?? 0,
        permissions: permissions ?? [],
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error updating guild command:", error)
      return NextResponse.json({ error: "Failed to update command" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Guild command update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { guildId: string; commandName: string } }) {
  try {
    const { guildId, commandName } = params
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Get guild-specific command settings
    const { data: guildCommand } = await supabase
      .from("guild_commands")
      .select("*")
      .eq("guild_id", guildId)
      .eq("command_name", commandName)
      .single()

    // Get global command info
    const { data: globalCommand, error: globalError } = await supabase
      .from("commands")
      .select("*")
      .eq("name", commandName)
      .single()

    if (globalError) {
      return NextResponse.json({ error: "Command not found" }, { status: 404 })
    }

    // Merge global and guild-specific data
    const mergedCommand = {
      ...globalCommand,
      guild_enabled: guildCommand?.is_enabled ?? globalCommand.is_enabled,
      guild_cooldown: guildCommand?.cooldown_seconds ?? globalCommand.cooldown,
      guild_permissions: guildCommand?.permissions ?? globalCommand.permissions,
      guild_usage_count: guildCommand?.usage_count ?? 0,
    }

    return NextResponse.json(mergedCommand)
  } catch (error) {
    console.error("Guild command fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
