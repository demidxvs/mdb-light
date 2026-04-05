import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createAdminSupabaseServerClient } from "@/lib/admin-supabase-server";

export function createStorefrontServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function requireAdminUser() {
  const adminSupabase = await createAdminSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await adminSupabase.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const [{ data: adminProfile, error: adminProfileError }, { data: aal, error: aalError }] =
    await Promise.all([
      adminSupabase
        .from("admin_profiles")
        .select("id, role, is_active")
        .eq("id", user.id)
        .maybeSingle(),
      adminSupabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    ]);

  if (adminProfileError || !adminProfile || !adminProfile.is_active) {
    return {
      user: null,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  if (aalError || aal?.currentLevel !== "aal2") {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Multi-factor authentication required", code: "mfa_required" },
        { status: 401 },
      ),
    };
  }

  return { user, response: null };
}
