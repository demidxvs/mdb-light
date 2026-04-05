import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createAdminSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_ADMIN_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_ADMIN_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_ADMIN_SUPABASE_URL or NEXT_PUBLIC_ADMIN_SUPABASE_ANON_KEY.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      name: "mdb-light-admin-auth",
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Route handlers can ignore cookie write failures for read-only auth checks.
          }
        });
      },
    },
  });
}
