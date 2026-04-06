"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase-client";
import { useLocale } from "@/components/ui/locale-provider";
import { buildCategoryPath } from "@/lib/seo";

type LocaleKey = "en" | "ru" | "el" | "lv";

type CategoryRow = {
  id: string;
  slug: string;
  sort_order: number;
  cover_image_url: string | null;
  category_translations?: Array<{
    locale: LocaleKey;
    name: string;
    description: string | null;
  }>;
};

type ProductCountRow = {
  category_id: string | null;
};

type HomeCategoriesProps = {
  eyebrow: string;
  title: string;
  fallbackCards: ReadonlyArray<{ title: string; description: string }>;
  limit?: number;
};

const itemWord = {
  en: "items",
  ru: "товаров",
  el: "προϊόντα",
  lv: "preces",
} as const;

const CATEGORY_CACHE_KEY = "mdb-catalog-categories-v2";

function readCachedCategories(limit: number) {
  if (typeof window === "undefined") return [];

  try {
    const cached = window.sessionStorage.getItem(CATEGORY_CACHE_KEY);
    if (!cached) return [];

    const parsed = JSON.parse(cached) as { categories?: CategoryRow[] };
    return parsed.categories?.slice(0, limit) ?? [];
  } catch {
    return [];
  }
}

export function HomeCategories({
  eyebrow,
  title,
  fallbackCards,
  limit = 4,
}: HomeCategoriesProps) {
  const { locale } = useLocale();
  const supabaseReady = useMemo(() => isSupabaseConfigured(), []);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [countsLoaded, setCountsLoaded] = useState(false);
  const [loading, setLoading] = useState(supabaseReady);

  useEffect(() => {
    if (!supabaseReady) return;
    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    const load = async () => {
      const cachedCategories = readCachedCategories(limit);

      if (!mounted) return;

      if (cachedCategories.length > 0) {
        setCategories(cachedCategories);
        setLoading(false);
      } else {
        setLoading(true);
      }

      const { data: categoryData } = await supabase
        .from("categories")
        .select(
          "id, slug, sort_order, cover_image_url, category_translations(locale, name, description)",
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(limit);

      if (!mounted) return;

      const nextCategories = (categoryData as CategoryRow[] | null) ?? [];
      setCategories(nextCategories);
      setLoading(false);

      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(
            CATEGORY_CACHE_KEY,
            JSON.stringify({ categories: nextCategories }),
          );
        } catch {
          // Ignore cache write failures.
        }
      }

      const { data: productRows } = await supabase
        .from("products")
        .select("category_id")
        .eq("is_active", true);

      if (!mounted) return;

      const nextCounts: Record<string, number> = {};
      ((productRows as ProductCountRow[] | null) ?? []).forEach((row) => {
        if (!row.category_id) return;
        nextCounts[row.category_id] = (nextCounts[row.category_id] || 0) + 1;
      });

      setCounts(nextCounts);
      setCountsLoaded(true);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [limit, supabaseReady]);

  const displayCards =
    categories.length > 0
      ? categories.map((category) => {
          const translation =
            category.category_translations?.find((item) => item.locale === locale) ||
            category.category_translations?.find((item) => item.locale === "en") ||
            category.category_translations?.[0];

          return {
            id: category.id,
            slug: category.slug,
            title: translation?.name || category.slug,
            imageUrl: category.cover_image_url,
            count: counts[category.id] || 0,
          };
        })
      : !supabaseReady
        ? fallbackCards.map((card, index) => ({
            id: String(index),
            slug: "catalog",
            title: card.title,
            imageUrl: null,
            count: 0,
          }))
        : [];

  return (
    <section id="catalog" className="mx-auto max-w-7xl px-4 py-2 sm:px-10 lg:px-12">
      <div className="rounded-[2rem] border border-[#e5e8ee] bg-white p-6 sm:p-8">
        {eyebrow ? (
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--accent)]">
            {eyebrow}
          </p>
        ) : null}

        {title ? (
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.05em] text-[color:var(--headline)] sm:text-4xl">
            {title}
          </h2>
        ) : null}

        <div className={`${eyebrow || title ? "mt-8" : ""} grid gap-4 md:grid-cols-2 xl:grid-cols-4`}>
          {loading && supabaseReady
            ? Array.from({ length: Math.min(limit, 8) }).map((_, index) => (
                <div
                  key={`category-skeleton-${index}`}
                  className="overflow-hidden rounded-[1.45rem] border border-[#e9e0d3] bg-white shadow-[0_18px_40px_rgba(27,42,74,0.08)]"
                >
                  <div className="aspect-[1.18/1] animate-pulse bg-[linear-gradient(180deg,#f7f1e7_0%,#efe6d9_100%)]" />
                  <div className="space-y-2 bg-[#111111] px-4 py-3">
                    <div className="h-3 w-3/4 rounded bg-white/20" />
                    <div className="h-3 w-1/3 rounded bg-white/10" />
                  </div>
                </div>
              ))
            : displayCards.map((card, index) => (
                <Link
                  key={card.id}
                  href={categories.length > 0 ? buildCategoryPath(locale, categories[index]) : "/catalog"}
                  className="block"
                >
                  <article className="group overflow-hidden rounded-[1.45rem] border border-[#e9e0d3] bg-[#111111] shadow-[0_18px_40px_rgba(27,42,74,0.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(27,42,74,0.18)]">
                    <div className="relative aspect-[1.18/1] overflow-hidden bg-[linear-gradient(180deg,#d8d1c7_0%,#f4efe7_100%)]">
                      {card.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={card.imageUrl}
                          alt={card.title}
                          loading={index < 4 ? "eager" : "lazy"}
                          fetchPriority={index < 4 ? "high" : undefined}
                          decoding="async"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(244,198,79,0.18),transparent_38%),linear-gradient(180deg,#dcd6cb_0%,#f4efe7_100%)] px-6 text-center text-sm uppercase tracking-[0.22em] text-[#7f7159]">
                          Add category photo in admin
                        </div>
                      )}
                    </div>

                    <div className="bg-[#111111] px-4 py-3 text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white sm:text-[11px]">
                        {card.title}
                      </p>
                      {countsLoaded ? (
                        <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/52">
                          {card.count} {itemWord[locale]}
                        </p>
                      ) : null}
                    </div>
                  </article>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
