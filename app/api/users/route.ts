import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("users").select("*").order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ error: "Failed to fetch users", details: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Users fetch error:", error)
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

    const { user_id, username, discriminator, avatar, bot, system } = body

    if (!user_id || !username) {
      return NextResponse.json({ error: "User ID and username are required" }, { status: 400 })
    }

    // Upsert user data
    const { data, error } = await supabase
      .from("users")
      .upsert({
        user_id,
        username,
        discriminator: discriminator || "0",
        avatar,
        bot: bot || false,
        system: system || false,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error upserting user:", error)
      return NextResponse.json({ error: "Failed to sync user", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("User sync error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
