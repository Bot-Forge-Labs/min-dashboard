import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Test database connection
    const { data, error } = await supabase.from("guilds").select("count").limit(1).single()

    if (error) {
      console.error("Database health check failed:", error)
      return NextResponse.json(
        {
          status: "unhealthy",
          database: "disconnected",
          error: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
