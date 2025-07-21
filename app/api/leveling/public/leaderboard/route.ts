import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const guildId = searchParams.get("guild_id")
    const timeframe = searchParams.get("timeframe") || "all-time"
    const sortBy = searchParams.get("sort_by") || "total_xp"
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    if (!guildId) {
      return NextResponse.json({ error: "Guild ID is required" }, { status: 400 })
    }

    // Check if the guild has public leaderboard enabled
    const { data: guildSettings } = await supabase
      .from("guild_settings")
      .select("leveling_system")
      .eq("guild_id", guildId)
      .single()

    if (!guildSettings?.leveling_system) {
      return NextResponse.json({ error: "Leaderboard not available" }, { status: 404 })
    }

    // Build the query based on timeframe
    let query = supabase.from("user_levels").select("*").eq("guild_id", guildId)

    // Apply timeframe filter
    if (timeframe !== "all-time") {
      const now = new Date()
      let dateFilter: Date

      switch (timeframe) {
        case "daily":
          dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case "weekly":
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "monthly":
          dateFilter = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        default:
          dateFilter = new Date(0)
      }

      query = query.gte("last_message_time", dateFilter.toISOString())
    }

    // Apply sorting
    switch (sortBy) {
      case "level":
        query = query.order("level", { ascending: false }).order("total_xp", { ascending: false })
        break
      case "recent_activity":
        query = query.order("last_message_time", { ascending: false })
        break
      default:
        query = query.order("total_xp", { ascending: false })
    }

    query = query.limit(limit)

    const { data: users, error } = await query

    if (error) {
      console.error("Error fetching leaderboard:", error)
      return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
    }

    // Get stats
    const { data: stats } = await supabase.from("leveling_stats").select("*").eq("guild_id", guildId).single()

    return NextResponse.json({
      users: users || [],
      stats: stats || {
        total_users: users?.length || 0,
        average_level: users?.reduce((acc, user) => acc + user.level, 0) / (users?.length || 1) || 0,
        highest_level: Math.max(...(users?.map((user) => user.level) || [0])),
        total_xp_given: users?.reduce((acc, user) => acc + user.total_xp, 0) || 0,
      },
    })
  } catch (error) {
    console.error("Error in public leaderboard API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
