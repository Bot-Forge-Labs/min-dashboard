import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const guildId = searchParams.get("guild_id")
    const eventType = searchParams.get("event_type")
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    let query = supabase.from("analytics_events").select("*").order("timestamp", { ascending: false }).limit(limit)

    if (guildId) {
      query = query.eq("guild_id", guildId)
    }

    if (eventType) {
      query = query.eq("event_type", eventType)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching analytics events:", error)
      return NextResponse.json({ error: "Failed to fetch analytics events" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Analytics events fetch error:", error)
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

    const { guild_id, user_id, event_type, event_data } = body

    if (!event_type) {
      return NextResponse.json(
        {
          error: "Missing required field: event_type",
        },
        { status: 400 },
      )
    }

    const { data, error } = await supabase
      .from("analytics_events")
      .insert({
        guild_id: guild_id || null,
        user_id: user_id || null,
        event_type,
        event_data: event_data || {},
        timestamp: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating analytics event:", error)
      return NextResponse.json({ error: "Failed to create analytics event" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Analytics event creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
