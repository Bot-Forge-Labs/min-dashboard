import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const event_type = searchParams.get("event_type")
    const guild_id = searchParams.get("guild_id")
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    let query = supabase.from("analytics_events").select("*").order("created_at", { ascending: false }).limit(limit)

    if (event_type) {
      query = query.eq("event_type", event_type)
    }

    if (guild_id) {
      query = query.eq("guild_id", guild_id)
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

    const { event_type, guild_id, user_id, command_name, channel_id, metadata } = body

    if (!event_type) {
      return NextResponse.json({ error: "event_type is required" }, { status: 400 })
    }

    // Create analytics event
    const { data, error } = await supabase
      .from("analytics_events")
      .insert({
        event_type,
        guild_id: guild_id || null,
        user_id: user_id || null,
        command_name: command_name || null,
        channel_id: channel_id || null,
        metadata: metadata || {},
        created_at: new Date().toISOString(),
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
