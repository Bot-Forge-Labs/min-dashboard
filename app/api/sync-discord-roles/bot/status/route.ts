import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    const { data, error } = await supabase
      .from("bot_status")
      .select("*")
      .order("last_updated", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("Error fetching bot status:", error)
      return NextResponse.json({ error: "Failed to fetch bot status" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Bot status fetch error:", error)
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

    const {
      status,
      activity_type,
      activity_name,
      uptime_seconds,
      guild_count,
      user_count,
      command_count,
      memory_usage,
      cpu_usage,
    } = body

    // Update or insert bot status
    const { data, error } = await supabase
      .from("bot_status")
      .upsert({
        id: "1", // Single row for bot status
        status: status || "online",
        activity_type: activity_type || "playing",
        activity_name: activity_name || "with Discord",
        uptime_seconds: uptime_seconds || 0,
        guild_count: guild_count || 0,
        user_count: user_count || 0,
        command_count: command_count || 0,
        memory_usage: memory_usage || 0,
        cpu_usage: cpu_usage || 0,
        last_updated: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error updating bot status:", error)
      return NextResponse.json({ error: "Failed to update bot status" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Bot status update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
