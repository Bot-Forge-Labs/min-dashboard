import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("guilds").select("*").order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching guilds:", error)
      return NextResponse.json({ error: "Failed to fetch guilds", details: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Guilds fetch error:", error)
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

    const { guild_id, name, owner_id, icon, member_count, features } = body

    if (!guild_id || !name) {
      return NextResponse.json({ error: "Guild ID and name are required" }, { status: 400 })
    }

    // Upsert guild data
    const { data, error } = await supabase
      .from("guilds")
      .upsert({
        guild_id,
        name,
        owner_id,
        icon,
        member_count: member_count || 0,
        features: features || [],
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error upserting guild:", error)
      return NextResponse.json({ error: "Failed to sync guild", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Guild sync error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
