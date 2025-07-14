import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { guildId: string } }) {
  try {
    const body = await request.json()
    const supabase = await createClient()
    const { guildId } = params

    const { commands } = body

    if (!commands || !Array.isArray(commands)) {
      return NextResponse.json({ error: "Commands array is required" }, { status: 400 })
    }

    // Sync commands to database
    const results = []
    for (const command of commands) {
      const { data, error } = await supabase
        .from("commands")
        .upsert({
          name: command.name,
          type: command.type || "command",
          description: command.description,
          category: command.category,
          usage_count: command.usage_count || 0,
          last_used: command.last_used,
          is_enabled: command.is_enabled !== false, // Default to true
          cooldown: command.cooldown || 0,
          permissions: command.permissions || [],
          added_at: command.added_at || new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error(`Error syncing command ${command.name}:`, error)
        results.push({ command: command.name, success: false, error: error.message })
      } else {
        results.push({ command: command.name, success: true, data })
      }
    }

    // Update guild commands table if it exists
    try {
      await supabase.from("guild_commands").upsert({
        guild_id: guildId,
        commands_synced: commands.length,
        last_sync: new Date().toISOString(),
      })
    } catch (guildCommandError) {
      // Guild commands table might not exist, that's okay
      console.log("Guild commands table not found, skipping...")
    }

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.filter((r) => !r.success).length

    return NextResponse.json({
      success: true,
      synced: successCount,
      failed: failureCount,
      results,
    })
  } catch (error) {
    console.error("Command sync error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
