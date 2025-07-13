import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const guildId = searchParams.get("guild_id")
    const eventType = searchParams.get("event_type")
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    const supabase = await createClient()

    let query = supabase.from("analytics_events").select("*").order("timestamp", { ascending: false }).limit(limit)

    if (guildId) {
      query = query.eq("guild_id", guildId)
    }

    if (eventType) {
      query = query.eq("event_type", eventType)
    }

    if (startDate) {
      query = query.gte("timestamp", startDate)
    }

    if (endDate) {
      query = query.lte("timestamp", endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching analytics events:", error)
      return NextResponse.json({ error: "Failed to fetch analytics events", details: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Analytics events fetch error:", error)
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

    const { guild_id, event_type, event_data, user_id, timestamp } = body

    if (!guild_id || !event_type) {
      return NextResponse.json({ error: "Guild ID and Event Type are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("analytics_events")
      .insert({
        guild_id,
        event_type,
        event_data: event_data || {},
        user_id,
        timestamp: timestamp || new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating analytics event:", error)
      return NextResponse.json({ error: "Failed to create analytics event", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Analytics event creation error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
