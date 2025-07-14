import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId, action, reason, duration, deleteMessages } = await request.json()

    if (!process.env.DISCORD_BOT_TOKEN) {
      return NextResponse.json({ error: "Discord bot token not configured" }, { status: 500 })
    }

    const guildId = process.env.DISCORD_GUILD_ID || "YOUR_GUILD_ID"

    let endpoint = ""
    let method = "PUT"
    const body: any = { reason }

    switch (action) {
      case "ban":
        endpoint = `https://discord.com/api/v10/guilds/${guildId}/bans/${userId}`
        if (deleteMessages) {
          body.delete_message_seconds = 7 * 24 * 60 * 60 // 7 days
        }
        break
      case "kick":
        endpoint = `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`
        method = "DELETE"
        break
      case "timeout":
        endpoint = `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`
        method = "PATCH"
        if (duration) {
          const durationMs = parseDuration(duration)
          body.communication_disabled_until = new Date(Date.now() + durationMs).toISOString()
        }
        break
      case "warn":
        // For warnings, we'll just log it (no Discord API action needed)
        return NextResponse.json({ success: true, message: "Warning logged successfully" })
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const response = await fetch(endpoint, {
      method,
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("Discord API error:", error)
      return NextResponse.json({ error: `Failed to ${action} user: ${error}` }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ${action}ned user`,
    })
  } catch (error) {
    console.error("Error punishing user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/)
  if (!match) return 0

  const value = Number.parseInt(match[1])
  const unit = match[2]

  switch (unit) {
    case "s":
      return value * 1000
    case "m":
      return value * 60 * 1000
    case "h":
      return value * 60 * 60 * 1000
    case "d":
      return value * 24 * 60 * 60 * 1000
    default:
      return 0
  }
}
