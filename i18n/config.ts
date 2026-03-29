export const locales = ["en", "ru", "el", "lv"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: string | null | undefined): value is Locale {
  return locales.includes((value ?? "") as Locale);
}
