import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

export function isAdminSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_ADMIN_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_ADMIN_SUPABASE_ANON_KEY,
  );
}

export function createAdminSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_ADMIN_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_ADMIN_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_ADMIN_SUPABASE_URL or NEXT_PUBLIC_ADMIN_SUPABASE_ANON_KEY.",
    );
  }

  if (!adminClient) {
    adminClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      cookieOptions: {
        name: "mdb-light-admin-auth",
      },
    });
  }

  return adminClient;
}
