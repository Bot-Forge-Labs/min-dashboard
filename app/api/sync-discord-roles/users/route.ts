import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Users fetch error:", error)
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

    const { user_id, username, discriminator, avatar, flags, premium_type, public_flags } = body

    if (!user_id || !username) {
      return NextResponse.json(
        {
          error: "Missing required fields: user_id, username",
        },
        { status: 400 },
      )
    }

    const { data, error } = await supabase
      .from("users")
      .upsert({
        user_id,
        username,
        discriminator: discriminator || "0",
        avatar: avatar || null,
        flags: flags || [],
        premium_type: premium_type || 0,
        public_flags: public_flags || [],
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error upserting user:", error)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("User upsert error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
