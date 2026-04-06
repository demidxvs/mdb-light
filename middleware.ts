import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, getLocaleFromPathname, isLocale, localizePathname, stripLocalePrefix } from "@/i18n/config";

const PUBLIC_FILE = /\.(.*)$/;
const LOCALE_HEADER = "x-mdb-locale";
const REWRITTEN_PREFIXES = new Set([
  "account",
  "admin-auth",
  "auth",
  "cart",
  "catalog",
  "checkout",
  "collections",
  "contacts",
  "forgot-password",
  "lighting",
  "login",
  "orders",
  "panel-x9k2m4q7r2a",
  "products",
  "projects",
  "register",
  "security",
]);

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

  const strippedPathname = stripLocalePrefix(pathname);
  const firstSegment = strippedPathname.split("/").filter(Boolean)[0] || "";
  const shouldRewrite = REWRITTEN_PREFIXES.has(firstSegment);

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = strippedPathname;
  rewriteUrl.search = search;

  const response = shouldRewrite
    ? NextResponse.rewrite(rewriteUrl, {
        request: {
          headers: requestHeaders,
        },
      })
    : NextResponse.next({
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
