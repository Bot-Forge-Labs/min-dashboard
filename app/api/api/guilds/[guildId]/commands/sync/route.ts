import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { guildId: string } }) {
  try {
    const body = await request.json()
    const { guildId } = params
    const { commands } = body
    const supabase = await createClient()

    if (!guildId) {
      return NextResponse.json({ error: "Guild ID is required" }, { status: 400 })
    }

    if (!commands || !Array.isArray(commands)) {
      return NextResponse.json({ error: "Commands array is required" }, { status: 400 })
    }

    // Sync commands to guild_commands table
    const commandsToUpsert = commands.map((cmd: any) => ({
      guild_id: guildId,
      command_name: cmd.name,
      is_enabled: cmd.enabled !== false,
      usage_count: cmd.usage_count || 0,
      updated_at: new Date().toISOString(),
    }))

    const { data, error } = await supabase
      .from("guild_commands")
      .upsert(commandsToUpsert, { onConflict: "guild_id,command_name" })
      .select()

    if (error) {
      console.error("Error syncing commands:", error)
      return NextResponse.json({ error: "Failed to sync commands", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, synced: data.length, commands: data })
  } catch (error) {
    console.error("Command sync error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
