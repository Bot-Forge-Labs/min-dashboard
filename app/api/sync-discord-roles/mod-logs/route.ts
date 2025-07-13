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

    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

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
      return NextResponse.json({ error: "Failed to fetch mod logs" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Mod logs fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    const { guild_id, user_id, moderator_id, action, reason, duration, expires_at, case_id } = body

    if (!guild_id || !user_id || !moderator_id || !action) {
      return NextResponse.json(
        {
          error: "Missing required fields: guild_id, user_id, moderator_id, action",
        },
        { status: 400 },
      )
    }

    const { data, error } = await supabase
      .from("mod_logs")
      .insert({
        guild_id,
        user_id,
        moderator_id,
        action,
        reason: reason || null,
        duration: duration || null,
        expires_at: expires_at || null,
        case_id: case_id || null,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating mod log:", error)
      return NextResponse.json({ error: "Failed to create mod log" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Mod log creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
