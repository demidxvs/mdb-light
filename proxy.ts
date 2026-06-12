import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, getLocaleFromPathname, isLocale, localizePathname, stripLocalePrefix } from "@/i18n/config";

const PUBLIC_FILE = /\.(?:avif|css|eot|gif|ico|jpeg|jpg|js|json|map|pdf|png|svg|ttf|txt|webmanifest|webp|woff|woff2|xml)$/i;
const LOCALIZED_PUBLIC_FILES = new Set([
  "/apple-icon.png",
  "/brand-icon.png",
  "/icon.png",
  "/site.webmanifest",
]);
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
  "cookies",
  "delivery",
  "forgot-password",
  "login",
  "orders",
  "panel-x9k2m4q7r2a",
  "privacy",
  "products",
  "projects",
  "register",
  "security",
  "terms",
]);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const localeFromPath = getLocaleFromPathname(pathname);
  const strippedPathname = localeFromPath ? stripLocalePrefix(pathname) : pathname;

  if (
    localeFromPath &&
    (LOCALIZED_PUBLIC_FILES.has(strippedPathname) || strippedPathname.startsWith("/icons/"))
  ) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = strippedPathname;
    rewriteUrl.search = search;
    return NextResponse.rewrite(rewriteUrl);
  }

  if (PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

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
