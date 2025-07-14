import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest, { params }: { params: { userId: string; guildId: string } }) {
  try {
    const { userId, guildId } = params
    const body = await request.json()
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    const { roles, permissions, communication_disabled_until } = body

    // Update user roles in the user_roles table
    if (Array.isArray(roles)) {
      // First, delete existing roles for this user in this guild
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("guild_id", guildId)

      // Insert new roles
      if (roles.length > 0) {
        const roleInserts = roles.map((roleId) => ({
          user_id: userId,
          guild_id: guildId,
          role_id: roleId,
          assigned_at: new Date().toISOString(),
        }))

        const { error: rolesError } = await supabase.from("user_roles").insert(roleInserts)

        if (rolesError) {
          console.error("Error updating user roles:", rolesError)
          return NextResponse.json({ error: "Failed to update roles" }, { status: 500 })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "User roles updated successfully",
      user_id: userId,
      guild_id: guildId,
      roles_count: roles?.length || 0,
    })
  } catch (error) {
    console.error("User roles update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { userId: string; guildId: string } }) {
  try {
    const { userId, guildId } = params
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    const { data, error } = await supabase
      .from("user_roles")
      .select(`
        *,
        roles (
          role_id,
          name,
          color,
          permissions
        )
      `)
      .eq("user_id", userId)
      .eq("guild_id", guildId)

    if (error) {
      console.error("Error fetching user roles:", error)
      return NextResponse.json({ error: "Failed to fetch user roles" }, { status: 500 })
    }

    return NextResponse.json({
      user_id: userId,
      guild_id: guildId,
      roles: data || [],
    })
  } catch (error) {
    console.error("User roles fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
