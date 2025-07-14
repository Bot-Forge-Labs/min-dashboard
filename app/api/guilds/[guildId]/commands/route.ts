import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { guildId: string } }) {
  try {
    const supabase = await createClient()
    const { guildId } = params

    // Get all commands for this guild
    const { data, error } = await supabase
      .from("commands")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching commands:", error)
      return NextResponse.json({ error: "Failed to fetch commands", details: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Commands fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { guildId: string } }) {
  try {
    const body = await request.json()
    const supabase = await createClient()
    const { guildId } = params

    const { command_name, is_enabled, cooldown, permissions } = body

    if (!command_name) {
      return NextResponse.json({ error: "Command name is required" }, { status: 400 })
    }

    // Update command settings
    const { data, error } = await supabase
      .from("commands")
      .update({
        is_enabled: is_enabled !== undefined ? is_enabled : true,
        cooldown: cooldown || 0,
        permissions: permissions || [],
      })
      .eq("name", command_name)
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
