import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { userId: string; guildId: string } }) {
  try {
    const supabase = await createClient()
    const { userId, guildId } = params

    const { data, error } = await supabase
      .from("user_roles")
      .select(`
        *,
        roles (*)
      `)
      .eq("user_id", userId)
      .eq("guild_id", guildId)

    if (error) {
      console.error("Error fetching user roles:", error)
      return NextResponse.json({ error: "Failed to fetch user roles", details: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("User roles fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { userId: string; guildId: string } }) {
  try {
    const body = await request.json()
    const supabase = await createClient()
    const { userId, guildId } = params

    const { role_ids } = body

    if (!Array.isArray(role_ids)) {
      return NextResponse.json({ error: "role_ids must be an array" }, { status: 400 })
    }

    // Delete existing roles for this user in this guild
    await supabase.from("user_roles").delete().eq("user_id", userId).eq("guild_id", guildId)

    // Insert new roles
    if (role_ids.length > 0) {
      const roleData = role_ids.map((role_id) => ({
        user_id: userId,
        guild_id: guildId,
        role_id,
        assigned_at: new Date().toISOString(),
      }))

      const { error } = await supabase.from("user_roles").insert(roleData)

      if (error) {
        console.error("Error updating user roles:", error)
        return NextResponse.json({ error: "Failed to update user roles", details: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, updated_roles: role_ids.length })
  } catch (error) {
    console.error("User roles update error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
