import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(_req: NextRequest) {
  // If the environment variables are missing (local preview / demo) return mock data.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        guilds: [
          { guild_id: "1234567890", name: "Demo Server 1", icon: null },
          { guild_id: "0987654321", name: "Demo Server 2", icon: null },
        ],
      },
      { status: 200 },
    )
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  const { data, error } = await supabase
    .from("guilds")
    .select("guild_id, name, icon")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching guilds:", error)
    return NextResponse.json({ error: "Failed to fetch guilds" }, { status: 500 })
  }

  return NextResponse.json({ guilds: data ?? [] }, { status: 200 })
}
