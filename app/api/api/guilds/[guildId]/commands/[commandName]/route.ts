import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { guildId: string; commandName: string } }) {
  try {
    const { guildId, commandName } = params
    const supabase = await createClient()

    if (!guildId || !commandName) {
      return NextResponse.json({ error: "Guild ID and command name are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("guild_commands")
      .select("*")
      .eq("guild_id", guildId)
      .eq("command_name", commandName)
      .single()

    if (error) {
      console.error("Error fetching command:", error)
      return NextResponse.json({ error: "Failed to fetch command", details: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Command fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { guildId: string; commandName: string } }) {
  try {
    const body = await request.json()
    const { guildId, commandName } = params
    const { enabled } = body
    const supabase = await createClient()

    if (!guildId || !commandName) {
      return NextResponse.json({ error: "Guild ID and command name are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("guild_commands")
      .upsert({
        guild_id: guildId,
        command_name: commandName,
        is_enabled: enabled !== false,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error updating command:", error)
      return NextResponse.json({ error: "Failed to update command", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Command update error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
