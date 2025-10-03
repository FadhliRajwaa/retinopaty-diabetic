import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with Service Role for admin operations
// IMPORTANT: requires SUPABASE_SERVICE_ROLE_KEY to be set in environment variables.
// Lazy creation to avoid throwing at module import time when envs are missing.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;

  if (!url || !key) {
    throw new Error("Supabase admin credentials are not configured");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
