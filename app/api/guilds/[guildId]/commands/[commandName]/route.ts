import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { guildId: string; commandName: string } }) {
  try {
    const supabase = await createClient()
    const { commandName } = params

    const { data, error } = await supabase.from("commands").select("*").eq("name", commandName).single()

    if (error) {
      console.error("Error fetching command:", error)
      return NextResponse.json({ error: "Command not found", details: error.message }, { status: 404 })
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
    const supabase = await createClient()
    const { commandName } = params

    const { is_enabled, cooldown, permissions } = body

    // Update specific command
    const { data, error } = await supabase
      .from("commands")
      .update({
        is_enabled: is_enabled !== undefined ? is_enabled : true,
        cooldown: cooldown || 0,
        permissions: permissions || [],
      })
      .eq("name", commandName)
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
