import { Database } from "@/types";
import { createBrowserClient } from "@supabase/ssr";
import { useMemo } from "react";

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  throw new Error(
    "Supabase environment variables are not configured. Please check your .env file."
  );
}

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function useSupabaseBrowser() {
  return useMemo(() => createClient(), []);
}
