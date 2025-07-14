import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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

    // Check for required environment variables
    const botToken = process.env.DISCORD_BOT_TOKEN
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!botToken) {
      console.error("Discord bot token not configured")
      return NextResponse.json(
        {
          error: "Discord bot token not configured. Please add DISCORD_BOT_TOKEN to your Vercel environment variables.",
        },
        { status: 500 },
      )
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase configuration missing")
      return NextResponse.json(
        {
          error:
            "Supabase not configured. Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your Vercel environment variables.",
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

    if (discordRoles.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: "No roles found in Discord server",
      })
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Clear existing roles for this guild
    console.log(`Clearing existing roles for guild: ${guildId}`)
    const { error: deleteError } = await supabase.from("roles").delete().eq("guild_id", guildId)

    if (deleteError) {
      console.error("Error deleting existing roles:", deleteError)
      // Continue anyway - might be first sync
    }

    // Transform Discord roles to our format
    const rolesToInsert = discordRoles.map((role) => {
      // Ensure color is within valid range
      let colorValue = role.color || 0
      if (colorValue < 0) colorValue = 0
      if (colorValue > 16777215) colorValue = 16777215

      return {
        role_id: role.id,
        guild_id: guildId,
        name: role.name || "Unknown Role",
        color: colorValue,
        position: role.position || 0,
        permissions: role.permissions || "0",
        hoist: role.hoist || false,
        mentionable: role.mentionable || false,
        managed: role.managed || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    })

    console.log(`Inserting ${rolesToInsert.length} roles into database`)
    console.log("Sample role data:", {
      ...rolesToInsert[0],
      permissions: rolesToInsert[0]?.permissions?.substring(0, 20) + "...", // Truncate for logging
    })

    // Insert roles in batches to avoid timeout
    const batchSize = 50
    let insertedCount = 0

    for (let i = 0; i < rolesToInsert.length; i += batchSize) {
      const batch = rolesToInsert.slice(i, i + batchSize)

      const { data: insertData, error: insertError } = await supabase.from("roles").insert(batch).select("role_id")

      if (insertError) {
        console.error(`Database insert error for batch ${i / batchSize + 1}:`, insertError)
        return NextResponse.json(
          {
            error: `Failed to save roles to database: ${insertError.message}`,
            details: insertError,
            batch: i / batchSize + 1,
          },
          { status: 500 },
        )
      }

      insertedCount += insertData?.length || batch.length
      console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(rolesToInsert.length / batchSize)}`)
    }

    console.log(`Successfully synced ${insertedCount} roles`)

    return NextResponse.json({
      success: true,
      count: insertedCount,
      message: `Successfully synced ${insertedCount} roles from Discord`,
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
