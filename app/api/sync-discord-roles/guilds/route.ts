import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    const { data, error } = await supabase.from("guilds").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching guilds:", error)
      return NextResponse.json({ error: "Failed to fetch guilds" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Guilds fetch error:", error)
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

    const { guild_id, name, owner_id, member_count, online_count, bot_permissions, status = "active" } = body

    if (!guild_id || !name || !owner_id) {
      return NextResponse.json(
        {
          error: "Missing required fields: guild_id, name, owner_id",
        },
        { status: 400 },
      )
    }

    const { data, error } = await supabase
      .from("guilds")
      .upsert({
        guild_id,
        name,
        owner_id,
        member_count: member_count || 0,
        online_count: online_count || 0,
        bot_permissions: bot_permissions || [],
        status,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error upserting guild:", error)
      return NextResponse.json({ error: "Failed to update guild" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Guild upsert error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
