import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest, { params }: { params: { guildId: string } }) {
  try {
    const { guildId } = params

    // Get guild information
    const { data: guild, error } = await supabase
      .from("guilds")
      .select("guild_id, name, icon, member_count, description")
      .eq("guild_id", guildId)
      .single()

    if (error || !guild) {
      return NextResponse.json({ error: "Guild not found" }, { status: 404 })
    }

    // Check if leveling system is enabled for this guild
    const { data: settings } = await supabase
      .from("guild_settings")
      .select("leveling_system")
      .eq("guild_id", guildId)
      .single()

    if (!settings?.leveling_system) {
      return NextResponse.json({ error: "Leaderboard not available" }, { status: 404 })
    }

    return NextResponse.json(guild)
  } catch (error) {
    console.error("Error fetching guild info:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
