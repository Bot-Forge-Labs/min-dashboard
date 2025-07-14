import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest, { params }: { params: { guildId: string } }) {
  try {
    const { guildId } = params

    const { data, error } = await supabase
      .from("guild_commands")
      .select("*")
      .eq("guild_id", guildId)
      .order("category", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching commands:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    return NextResponse.json({ commands: data })
  } catch (error) {
    console.error("Get commands error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
