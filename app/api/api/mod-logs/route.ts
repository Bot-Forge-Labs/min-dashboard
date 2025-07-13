import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const guildId = searchParams.get("guild_id")
    const userId = searchParams.get("user_id")
    const action = searchParams.get("action")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const supabase = await createClient()

    let query = supabase.from("mod_logs").select("*").order("timestamp", { ascending: false }).limit(limit)

    if (guildId) {
      query = query.eq("guild_id", guildId)
    }

    if (userId) {
      query = query.eq("user_id", userId)
    }

    if (action) {
      query = query.eq("action", action)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching mod logs:", error)
      return NextResponse.json({ error: "Failed to fetch mod logs", details: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Mod logs fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    const { guild_id, user_id, moderator_id, action, reason, details, expires_at, case_id } = body

    if (!guild_id || !user_id || !moderator_id || !action) {
      return NextResponse.json({ error: "Guild ID, User ID, Moderator ID, and Action are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("mod_logs")
      .insert({
        guild_id,
        user_id,
        moderator_id,
        action,
        reason: reason || "No reason provided",
        details: details || {},
        expires_at,
        case_id,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating mod log:", error)
      return NextResponse.json({ error: "Failed to create mod log", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Mod log creation error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
