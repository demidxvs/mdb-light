import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { defaultLocale, isLocale, localizePathname } from "@/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function buildFallbackUrl(requestUrl: URL) {
  return new URL(localizePathname("/login", defaultLocale), requestUrl.origin);
}

function normalizeRedirectUrl(requestUrl: URL, redirectTo: string | null) {
  if (!redirectTo) {
    return buildFallbackUrl(requestUrl);
  }

  try {
    const nextUrl = new URL(redirectTo, requestUrl.origin);

    if (nextUrl.origin !== requestUrl.origin) {
      return buildFallbackUrl(requestUrl);
    }

    return nextUrl;
  } catch {
    return buildFallbackUrl(requestUrl);
  }
}

function ensureLocaleOnPath(requestUrl: URL, targetUrl: URL) {
  const segments = targetUrl.pathname.split("/");
  const firstSegment = segments[1];

  if (isLocale(firstSegment)) {
    return targetUrl;
  }

  const requestLocale = requestUrl.pathname.split("/")[1];
  const locale = isLocale(requestLocale) ? requestLocale : defaultLocale;
  targetUrl.pathname = localizePathname(targetUrl.pathname || "/", locale);
  return targetUrl;
}

function appendMode(targetUrl: URL, mode: string) {
  targetUrl.searchParams.set("mode", mode);
  return targetUrl;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const redirectTo = requestUrl.searchParams.get("redirect_to");

  if (!tokenHash || !type) {
    return NextResponse.redirect(buildFallbackUrl(requestUrl));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  const nextUrl = ensureLocaleOnPath(
    requestUrl,
    normalizeRedirectUrl(requestUrl, redirectTo),
  );

  if (error) {
    nextUrl.searchParams.set("authError", "recovery_failed");
    return NextResponse.redirect(nextUrl);
  }

  if (type === "recovery") {
    appendMode(nextUrl, "recovery");
  }

  return NextResponse.redirect(nextUrl);
}
