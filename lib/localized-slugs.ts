import { locales, type Locale } from "@/i18n/config";
import { slugify } from "@/lib/seo";

export type LocaleSlugMap = Record<Locale, string>;

export function createEmptyLocaleSlugMap(): LocaleSlugMap {
  return {
    en: "",
    ru: "",
    el: "",
    lv: "",
  };
}

export function normalizeSlugInput(value: unknown) {
  return typeof value === "string" ? slugify(value.trim()) : "";
}

export function resolveLocalizedSlugMap({
  names,
  slugs,
  fallback,
}: {
  names: Record<Locale, string>;
  slugs?: Partial<Record<Locale, string>>;
  fallback: string;
}) {
  const fallbackSlug = normalizeSlugInput(fallback) || "item";
  const englishFallback = normalizeSlugInput(slugs?.en || names.en) || fallbackSlug;
  const nextSlugs = createEmptyLocaleSlugMap();
  const manual = createEmptyLocaleSlugMap();

  for (const locale of locales) {
    const explicitSlug = normalizeSlugInput(slugs?.[locale]);
    const generatedSlug =
      normalizeSlugInput(names[locale]) ||
      normalizeSlugInput(names.en) ||
      englishFallback ||
      fallbackSlug;

    nextSlugs[locale] = explicitSlug || generatedSlug || fallbackSlug;
    manual[locale] = explicitSlug;
  }

  return { slugs: nextSlugs, manual };
}
