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
    const body = await request.json()
    const { guildId } = body

    if (!guildId) {
      return NextResponse.json({ error: "Guild ID is required" }, { status: 400 })
    }

    // This grabs from Vercel environment variables, not local .env
    const botToken = process.env.DISCORD_BOT_TOKEN
    if (!botToken) {
      console.error("Discord bot token not configured")
      return NextResponse.json(
        {
          error: "Discord bot token not configured. Please add DISCORD_BOT_TOKEN to your Vercel environment variables.",
        },
        { status: 500 },
      )
    }

    console.log(`Fetching roles for guild: ${guildId}`)

    // Fetch roles from Discord API
    const discordResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text()
      console.error("Discord API error:", {
        status: discordResponse.status,
        statusText: discordResponse.statusText,
        body: errorText,
      })

      if (discordResponse.status === 401) {
        return NextResponse.json(
          { error: "Invalid Discord bot token. Please check your DISCORD_BOT_TOKEN environment variable in Vercel." },
          { status: 401 },
        )
      } else if (discordResponse.status === 403) {
        return NextResponse.json(
          {
            error:
              "Bot does not have permission to access this guild. Make sure the bot is added to your Discord server with proper permissions.",
          },
          { status: 403 },
        )
      } else if (discordResponse.status === 404) {
        return NextResponse.json({ error: "Guild not found. Please check the guild ID." }, { status: 404 })
      } else {
        return NextResponse.json(
          { error: `Discord API error: ${discordResponse.status} ${discordResponse.statusText}` },
          { status: discordResponse.status },
        )
      }
    }

    const discordRoles: DiscordRole[] = await discordResponse.json()
    console.log(`Fetched ${discordRoles.length} roles from Discord`)

    // Get Supabase client
    const supabase = await createClient()
    if (!supabase) {
      console.error("Failed to create Supabase client")
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Clear existing roles for this guild (except user-created ones)
    console.log(`Clearing existing roles for guild: ${guildId}`)
    const { error: deleteError } = await supabase
      .from("roles")
      .delete()
      .eq("guild_id", guildId)
      .not("role_id", "like", "custom_%")

    if (deleteError) {
      console.error("Error deleting existing roles:", deleteError)
      return NextResponse.json({ error: "Failed to clean existing roles" }, { status: 500 })
    }

    // Transform Discord roles to our format
    const rolesToInsert = discordRoles.map((role) => ({
      role_id: role.id,
      guild_id: guildId,
      name: role.name,
      color: role.color.toString(16).padStart(6, "0"), // Convert to hex string
      position: role.position,
      permissions: role.permissions,
      hoist: role.hoist,
      mentionable: role.mentionable,
      managed: role.managed,
      created_at: new Date().toISOString(),
    }))

    console.log(`Inserting ${rolesToInsert.length} roles into database`)

    // Insert roles into database
    const { error: insertError } = await supabase.from("roles").insert(rolesToInsert)

    if (insertError) {
      console.error("Database insert error:", insertError)
      return NextResponse.json({ error: "Failed to save roles to database" }, { status: 500 })
    }

    console.log(`Successfully synced ${discordRoles.length} roles`)

    return NextResponse.json({
      success: true,
      count: discordRoles.length,
      message: `Successfully synced ${discordRoles.length} roles from Discord`,
    })
  } catch (error) {
    console.error("Sync roles error:", error)
    return NextResponse.json(
      {
        error: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST to sync roles from Discord" }, { status: 405 })
}
