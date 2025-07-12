import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables")
    throw new Error(
      "Missing Supabase environment variables. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
    )
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch {
    console.error("Invalid Supabase URL format:", supabaseUrl)
    throw new Error("Invalid Supabase URL format. Please check your NEXT_PUBLIC_SUPABASE_URL environment variable.")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
