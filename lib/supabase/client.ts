import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Missing Supabase environment variables")
    console.warn("NEXT_PUBLIC_SUPABASE_URL:", !!supabaseUrl)
    console.warn("NEXT_PUBLIC_SUPABASE_ANON_KEY:", !!supabaseAnonKey)

    // Return a mock client that won't cause runtime errors
    return null
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch {
    console.error("Invalid Supabase URL format:", supabaseUrl)
    return null
  }

  try {
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
    return null
  }
}
