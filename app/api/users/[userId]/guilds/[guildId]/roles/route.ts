import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { userId: string; guildId: string } }) {
  try {
    const { userId, guildId } = params
    const supabase = await createClient()

    if (!userId || !guildId) {
      return NextResponse.json({ error: "User ID and Guild ID are required" }, { status: 400 })
    }

    const { data, error } = await supabase.from("user_roles").select("*").eq("user_id", userId).eq("guild_id", guildId)

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
    const { userId, guildId } = params
    const { roles } = body
    const supabase = await createClient()

    if (!userId || !guildId) {
      return NextResponse.json({ error: "User ID and Guild ID are required" }, { status: 400 })
    }

    if (!roles || !Array.isArray(roles)) {
      return NextResponse.json({ error: "Roles array is required" }, { status: 400 })
    }

    // Delete existing roles for this user in this guild
    await supabase.from("user_roles").delete().eq("user_id", userId).eq("guild_id", guildId)

    // Insert new roles
    const rolesToInsert = roles.map((roleId: string) => ({
      user_id: userId,
      guild_id: guildId,
      role_id: roleId,
      assigned_at: new Date().toISOString(),
      assigned_by: "system", 
    }))

    const { data, error } = await supabase.from("user_roles").insert(rolesToInsert).select()

    if (error) {
      console.error("Error updating user roles:", error)
      return NextResponse.json({ error: "Failed to update user roles", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("User roles update error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
