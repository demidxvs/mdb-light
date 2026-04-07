import type { SupabaseClient } from "@supabase/supabase-js";
import { locales, type Locale } from "@/i18n/config";
import { resolveLocalizedSlugMap, type LocaleSlugMap } from "@/lib/localized-slugs";

type EntityType = "category" | "product";

function getTableName(entity: EntityType) {
  return entity === "category" ? "category_translations" : "product_translations";
}

function getBaseTableName(entity: EntityType) {
  return entity === "category" ? "categories" : "products";
}

function getIdColumn(entity: EntityType) {
  return entity === "category" ? "category_id" : "product_id";
}

export async function ensureUniqueLocalizedSlugs(
  storefront: SupabaseClient,
  {
    entity,
    currentId,
    names,
    slugs,
    fallback,
  }: {
    entity: EntityType;
    currentId?: string | null;
    names: Record<Locale, string>;
    slugs?: Partial<Record<Locale, string>>;
    fallback: string;
  },
) {
  const resolved = resolveLocalizedSlugMap({ names, slugs, fallback });
  const tableName = getTableName(entity);
  const idColumn = getIdColumn(entity);
  const requestedSlugs = Array.from(new Set(Object.values(resolved.slugs).filter(Boolean)));

  const { data, error } = await storefront
    .from(tableName)
    .select(`${idColumn}, locale, slug`)
    .in("locale", [...locales])
    .in("slug", requestedSlugs);

  if (error) {
    throw new Error(error.message);
  }

  const existingByLocale = new Map<Locale, Set<string>>();

  for (const locale of locales) {
    existingByLocale.set(locale, new Set<string>());
  }

  for (const row of (data ?? []) as Array<Record<string, string | null>>) {
    const rowLocale = row.locale as Locale | undefined;
    const rowSlug = typeof row.slug === "string" ? row.slug : "";
    const rowId = typeof row[idColumn] === "string" ? row[idColumn] : "";
    if (!rowLocale || !rowSlug || (currentId && rowId === currentId)) continue;
    existingByLocale.get(rowLocale)?.add(rowSlug);
  }

  const finalSlugs = { ...resolved.slugs } as LocaleSlugMap;

  for (const locale of locales) {
    const requested = finalSlugs[locale];
    const isManual = Boolean(resolved.manual[locale]);
    const used = existingByLocale.get(locale) ?? new Set<string>();

    if (isManual && used.has(requested)) {
      throw new Error("Этот slug уже используется");
    }

    if (!isManual && used.has(requested)) {
      const base = requested;
      let counter = 1;
      let next = `${base}-${counter}`;
      while (used.has(next)) {
        counter += 1;
        next = `${base}-${counter}`;
      }
      finalSlugs[locale] = next;
      used.add(next);
      continue;
    }

    used.add(requested);
  }

  return finalSlugs;
}

export async function ensureUniqueBaseSlug(
  storefront: SupabaseClient,
  {
    entity,
    currentId,
    slug,
  }: {
    entity: EntityType;
    currentId?: string | null;
    slug: string;
  },
) {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    return "";
  }

  const tableName = getBaseTableName(entity);
  const { data, error } = await storefront
    .from(tableName)
    .select("id, slug")
    .eq("slug", normalizedSlug);

  if (error) {
    throw new Error(error.message);
  }

  const conflict = (data ?? []).some((row) => row.id !== currentId);
  if (conflict) {
    throw new Error("Этот slug уже используется");
  }

  return normalizedSlug;
}
