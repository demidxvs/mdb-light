export const locales = ["en", "ru", "el", "lv"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: string | null | undefined): value is Locale {
  return locales.includes((value ?? "") as Locale);
}

export function getLocaleFromPathname(pathname: string) {
  const segments = pathname.split("/");
  const maybeLocale = segments[1];
  return isLocale(maybeLocale) ? maybeLocale : null;
}

export function stripLocalePrefix(pathname: string) {
  const locale = getLocaleFromPathname(pathname);
  if (!locale) return pathname || "/";

  const stripped = pathname.slice(locale.length + 1);
  return stripped.startsWith("/") ? stripped : stripped ? `/${stripped}` : "/";
}

export function localizePathname(pathname: string, locale: Locale) {
  const normalized = stripLocalePrefix(pathname || "/");
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}
