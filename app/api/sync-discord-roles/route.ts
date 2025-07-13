import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface DiscordRole {
  id: string
  name: string
  color: number
  hoist: boolean
  position: number
  permissions: string
  managed: boolean
  mentionable: boolean
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
    const discordResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text()
      console.error("Discord API error:", errorText)
      return NextResponse.json({ error: "Failed to fetch roles from Discord" }, { status: 500 })
    }

    const discordRoles = await discordResponse.json()

    // Get Supabase client
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Clear existing roles for this guild
    await supabase.from("roles").delete().eq("guild_id", guildId)

    // Transform Discord roles to our format
    const rolesToInsert = discordRoles.map((role: any) => ({
      role_id: role.id,
      guild_id: guildId,
      name: role.name,
      color: role.color.toString(),
      position: role.position,
      permissions: role.permissions,
      hoist: role.hoist,
      mentionable: role.mentionable,
      managed: role.managed,
      created_at: new Date().toISOString(),
    }))

    // Insert roles into database
    const { error: insertError } = await supabase.from("roles").insert(rolesToInsert)

    if (insertError) {
      console.error("Database insert error:", insertError)
      return NextResponse.json({ error: "Failed to save roles to database" }, { status: 500 })
    }

    return NextResponse.json({
      message: `Successfully synced ${discordRoles.length} roles from Discord`,
      count: discordRoles.length,
    })
  } catch (error) {
    console.error("Sync roles error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST to sync roles" }, { status: 405 })
}
