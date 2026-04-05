import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, getLocaleFromPathname, isLocale, localizePathname, stripLocalePrefix } from "@/i18n/config";

const PUBLIC_FILE = /\.(.*)$/;
const LOCALE_HEADER = "x-mdb-locale";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const localeFromPath = getLocaleFromPathname(pathname);

  if (!localeFromPath) {
    const cookieLocale = request.cookies.get("mdb-light-locale")?.value;
    const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = localizePathname(pathname, locale);
    redirectUrl.search = search;
    return NextResponse.redirect(redirectUrl);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, localeFromPath);

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = stripLocalePrefix(pathname);
  rewriteUrl.search = search;

  const response = NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders,
    },
  });

  response.cookies.set("mdb-light-locale", localeFromPath, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
