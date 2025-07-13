import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface DiscordRole {
  id: string
  name: string
  color: number
  permissions: string
  position: number
  hoist: boolean
  managed: boolean
  mentionable: boolean
}

interface DiscordGuild {
  id: string
  name: string
  roles: DiscordRole[]
}

export async function POST(request: NextRequest) {
  try {
    const { guildId } = await request.json()

    if (!guildId) {
      return NextResponse.json({ error: "Guild ID is required" }, { status: 400 })
    }

    const botToken = process.env.DISCORD_BOT_TOKEN
    if (!botToken) {
      return NextResponse.json({ error: "Discord bot token not configured" }, { status: 500 })
    }

    // Fetch roles from Discord API
    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Discord API error:", response.status, errorText)
      return NextResponse.json(
        { error: `Discord API error: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    const discordRoles: DiscordRole[] = await response.json()

    // Get Supabase client
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Clear existing roles for this guild
    const { error: deleteError } = await supabase.from("roles").delete().eq("guild_id", guildId)

    if (deleteError) {
      console.error("Error clearing existing roles:", deleteError)
      return NextResponse.json({ error: "Failed to clear existing roles" }, { status: 500 })
    }

    // Insert new roles
    const rolesToInsert = discordRoles.map((role) => ({
      role_id: role.id,
      guild_id: guildId,
      name: role.name,
      color: role.color,
      permissions: Number.parseInt(role.permissions),
      position: role.position,
      hoist: role.hoist,
      managed: role.managed,
      mentionable: role.mentionable,
    }))

    const { error: insertError } = await supabase.from("roles").insert(rolesToInsert)

    if (insertError) {
      console.error("Error inserting roles:", insertError)
      return NextResponse.json({ error: "Failed to insert roles into database" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${discordRoles.length} roles from Discord`,
      rolesCount: discordRoles.length,
    })
  } catch (error) {
    console.error("Error syncing Discord roles:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
