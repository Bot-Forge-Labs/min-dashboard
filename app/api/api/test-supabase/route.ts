import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Check environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          status: "error",
          message: "Environment variables not configured",
          details: {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseAnonKey,
          },
        },
        { status: 500 },
      )
    }

    // Test Supabase client creation
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to create Supabase client",
        },
        { status: 500 },
      )
    }

    // Test database connection
    const { data, error } = await supabase.from("guilds").select("count", { count: "exact", head: true })

    if (error) {
      return NextResponse.json({
        status: "configured",
        message: "Supabase connected but database schema needs setup",
        error: error.message,
      })
    }

    return NextResponse.json({
      status: "connected",
      message: "Supabase is fully connected and working",
      count: data || 0,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Connection test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
