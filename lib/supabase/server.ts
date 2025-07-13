import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables:")
    console.error("NEXT_PUBLIC_SUPABASE_URL:", !!supabaseUrl)
    console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", !!supabaseAnonKey)
    throw new Error("Supabase environment variables not configured")
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch {
    console.error("Invalid Supabase URL format:", supabaseUrl)
    throw new Error("Invalid Supabase URL format")
  }

  try {
    const cookieStore = await cookies()

    const client = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    })

    return client
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
    throw new Error("Failed to create Supabase client")
  }
}
