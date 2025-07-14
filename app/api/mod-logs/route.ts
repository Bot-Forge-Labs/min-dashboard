import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const guild_id = searchParams.get("guild_id")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    let query = supabase.from("mod_logs").select("*").order("created_at", { ascending: false }).limit(limit)

    if (guild_id) {
      query = query.eq("guild_id", guild_id)
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

    const { guild_id, user_id, moderator_id, action, reason, duration, channel_id, message_id } = body

    if (!guild_id || !user_id || !moderator_id || !action) {
      return NextResponse.json({ error: "guild_id, user_id, moderator_id, and action are required" }, { status: 400 })
    }

    // Create mod log entry
    const { data, error } = await supabase
      .from("mod_logs")
      .insert({
        guild_id,
        user_id,
        moderator_id,
        action,
        reason: reason || null,
        duration: duration || null,
        channel_id: channel_id || null,
        message_id: message_id || null,
        created_at: new Date().toISOString(),
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
