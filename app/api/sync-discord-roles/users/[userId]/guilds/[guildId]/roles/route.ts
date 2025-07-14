import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type UserRoleInsert = {
  user_id: string
  guild_id: string
  role_id: string
  assigned_at?: string | null
  assigned_by: string
  id?: string
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string; guildId: string } }
) {
  try {
    const { userId, guildId } = params
    const body = await request.json()
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    const { roles } = body

    if (Array.isArray(roles)) {
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("guild_id", guildId)

      if (roles.length > 0) {
        const assignedBy = "system" // or fetch admin user ID or bot user ID if available

        const roleInserts: UserRoleInsert[] = roles.map((roleId) => ({
          user_id: userId,
          guild_id: guildId,
          role_id: String(roleId),
          assigned_at: new Date().toISOString(),
          assigned_by: assignedBy,
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

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string; guildId: string } }
) {
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
