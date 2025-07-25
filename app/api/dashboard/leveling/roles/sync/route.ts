import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Define the UserRole type to match the Supabase schema
interface UserRole {
  id?: string // Optional, auto-generated
  guild_id: string
  user_id: string
  role_id: string
  assigned_at?: string | null
  assigned_by: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { guild_id, roles } = body

    // Validate input
    if (!guild_id || typeof guild_id !== "string") {
      return NextResponse.json({ error: "Invalid or missing guild_id" }, { status: 400 })
    }

    if (!Array.isArray(roles) || !roles.every((role) => "user_id" in role && "role_id" in role)) {
      return NextResponse.json({ error: "Invalid or missing roles array" }, { status: 400 })
    }

    // Initialize Supabase client
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Map roles to match user_roles table schema
    const roleData: UserRole[] = roles.map((role: { user_id: string; role_id: string }) => ({
      guild_id,
      user_id: role.user_id,
      role_id: role.role_id,
      assigned_at: new Date().toISOString(),
      assigned_by: "leveling_system", // Specify it's from leveling system
    }))

    // Upsert roles into user_roles table
    const { error } = await supabase.from("user_roles").upsert(roleData, {
      onConflict: "user_id,role_id", // Adjust based on your actual constraint
      ignoreDuplicates: true, // Ignore duplicates instead of updating
    })

    if (error) {
      console.error("Error syncing leveling roles to Supabase:", error)
      return NextResponse.json({ error: "Failed to sync leveling roles", details: error.message }, { status: 500 })
    }

    // Log to mod_logs with leveling context
    await supabase.from("mod_logs").insert({
      guild_id,
      user_id: "system",
      moderator_id: "leveling_system",
      action: "leveling_role_sync",
      details: { roles: roles.map((r: any) => ({ user_id: r.user_id, role_id: r.role_id })) },
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ message: "Leveling roles synced successfully", count: roles.length }, { status: 200 })
  } catch (error) {
    console.error("Error processing leveling role sync:", error)
    return NextResponse.json(
      { error: "Failed to process leveling role sync", details: (error as Error).message },
      { status: 500 },
    )
  }
}
