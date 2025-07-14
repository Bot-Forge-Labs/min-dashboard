import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { guildId: string } }) {
  try {
    const { guildId } = params
    const supabase = await createClient()

    if (!guildId) {
      return NextResponse.json({ error: "Guild ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("guild_commands")
      .select("*")
      .eq("guild_id", guildId)
      .order("command_name")

    if (error) {
      console.error("Error fetching guild commands:", error)
      return NextResponse.json({ error: "Failed to fetch commands", details: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Guild commands fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
