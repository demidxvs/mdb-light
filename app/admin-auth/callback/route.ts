import { NextResponse } from "next/server";
import { createAdminSupabaseServerClient } from "@/lib/admin-supabase-server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const redirectTo =
    requestUrl.searchParams.get("redirect_to") || "/panel-x9k2m4q7r2a/login";

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
  }

  const supabase = await createAdminSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as
      | "signup"
      | "invite"
      | "magiclink"
      | "recovery"
      | "email_change"
      | "email",
  });

  const nextUrl = new URL(redirectTo, requestUrl.origin);
  if (!error && type === "recovery") {
    nextUrl.searchParams.set("mode", "recovery");
  }

  return NextResponse.redirect(nextUrl);
}
