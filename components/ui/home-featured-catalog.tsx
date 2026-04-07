"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/components/ui/locale-provider";
import { CatalogProductCard } from "@/components/ui/catalog-product-card";
import { localizePathname } from "@/i18n/config";
import { featuredTrackProducts } from "@/lib/mock-track-products";
import { buildProductPath } from "@/lib/seo";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase-client";

type LocaleKey = "en" | "ru" | "el" | "lv";
type ProductListRow = {
  id: string;
  slug: string;
  category_id: string | null;
  price_cents: number;
  currency: string;
  primary_image_url: string | null;
  product_translations?: Array<{
    locale: LocaleKey;
    name: string | null;
    slug?: string | null;
    short_description: string | null;
  }>;
  categories?: {
    slug: string;
    category_translations?: Array<{
      locale: LocaleKey;
      name: string | null;
      slug?: string | null;
    }>;
  } | null;
};

const copy = {
  en: {
    eyebrow: "Recommended products",
    title: "A selection of products from our team",
    text: "These items were selected by the seller as the best solutions for modern interiors.",
    more: "Open full catalog",
  },
  ru: {
    eyebrow: "Рекомендованные товары",
    title: "Подборка товаров от нашей команды",
    text: "Эти позиции выбраны продавцом как лучшие решения для современных интерьеров.",
    more: "Открыть полный каталог",
  },
  el: {
    eyebrow: "Προτεινόμενα προϊόντα",
    title: "Επιλογή προϊόντων από την ομάδα μας",
    text: "Αυτά τα προϊόντα επιλέχθηκαν από τον πωλητή ως οι καλύτερες λύσεις για σύγχρονους εσωτερικούς χώρους.",
    more: "Άνοιγμα πλήρους καταλόγου",
  },
  lv: {
    eyebrow: "Ieteiktie produkti",
    title: "Mūsu komandas atlasīta produktu izlase",
    text: "Šīs preces pārdevējs ir izvēlējies kā labākos risinājumus mūsdienīgiem interjeriem.",
    more: "Atvērt pilnu katalogu",
  },
} as const;

const FEATURED_CATALOG_CACHE_KEY = "mdb-featured-catalog-v1";

function readCachedProducts() {
  if (typeof window === "undefined") return [];

  try {
    const cached = window.sessionStorage.getItem(FEATURED_CATALOG_CACHE_KEY);
    if (!cached) return [];

    const parsed = JSON.parse(cached) as { products?: ProductListRow[] };
    return parsed.products ?? [];
  } catch {
    return [];
  }
}

export function HomeFeaturedCatalog() {
  const { locale } = useLocale();
  const t = copy[locale];
  const supabaseReady = useMemo(() => isSupabaseConfigured(), []);
  const [products, setProducts] = useState<ProductListRow[]>([]);
  const [loading, setLoading] = useState(supabaseReady);

  useEffect(() => {
    if (!supabaseReady) return;
    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    const load = async () => {
      try {
        const cachedProducts = readCachedProducts();
        if (cachedProducts.length > 0) {
          setProducts(cachedProducts);
          setLoading(false);
        }

        if (cachedProducts.length === 0 && products.length === 0) {
          setLoading(true);
        }

        const productsQuery = await supabase
          .from("products")
          .select(
            "id, slug, category_id, price_cents, currency, primary_image_url, sort_order, product_translations(locale, name, slug, short_description), categories(slug, category_translations(locale, name, slug))",
          )
          .eq("is_active", true)
          .eq("is_featured", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false })
          .limit(4);
        let data: ProductListRow[] | null = (productsQuery.data as ProductListRow[] | null) ?? null;
        const error = productsQuery.error;

        if (error?.message.includes("slug does not exist") || error?.message.includes("sort_order does not exist")) {
          const fallback = await supabase
            .from("products")
            .select(
              "id, slug, category_id, price_cents, currency, primary_image_url, product_translations(locale, name, short_description), categories(slug, category_translations(locale, name))",
            )
            .eq("is_active", true)
            .eq("is_featured", true)
            .order("created_at", { ascending: false })
            .limit(4);
          data = (fallback.data as ProductListRow[] | null) ?? null;
        }

        if (!mounted) return;
        const nextProducts = (data as ProductListRow[] | null) ?? [];
        setProducts(nextProducts);
        setLoading(false);

        if (typeof window !== "undefined") {
          try {
            window.sessionStorage.setItem(
              FEATURED_CATALOG_CACHE_KEY,
              JSON.stringify({ products: nextProducts }),
            );
          } catch {
            // Ignore cache write failures.
          }
        }
      } catch {
        if (!mounted) return;
        setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [products.length, supabaseReady]);

  const displayProducts =
    products.length > 0
      ? products.map((product) => {
          const translation =
            product.product_translations?.find((item) => item.locale === locale) ||
            product.product_translations?.find((item) => item.locale === "en") ||
            product.product_translations?.[0];
          const categoryTranslation =
            product.categories?.category_translations?.find((item) => item.locale === locale) ||
            product.categories?.category_translations?.find((item) => item.locale === "en") ||
            product.categories?.category_translations?.[0];

          return {
            id: product.id,
            slug: product.slug,
            name: translation?.name || product.slug,
            teaser: translation?.short_description || "",
            price: new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: product.currency || "EUR",
            }).format(product.price_cents / 100),
            imageUrl: product.primary_image_url,
            category: categoryTranslation?.name || product.categories?.slug || "",
          };
        })
      : featuredTrackProducts.map((product) => ({
          id: product.id,
          slug: product.slug,
          name: product.name[locale],
          teaser: product.teaser[locale],
          price: product.price,
          imageUrl: null,
          category: product.category,
        }));

  return (
    <section className="mx-auto max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
      <div className="rounded-[2rem] border border-[#e5e8ee] bg-white p-6 shadow-[0_20px_60px_rgba(27,42,74,0.06)] sm:p-8">
        <div className="flex flex-col gap-4 border-b border-[#efe6dd] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f4c64f]">{t.eyebrow}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.05em] text-[color:var(--headline)] sm:text-4xl">
              {t.title}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">{t.text}</p>
          </div>
          <Link
            href={localizePathname("/catalog", locale)}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#f4c64f] px-5 text-sm font-semibold text-[#1e2f4e] shadow-[0_14px_28px_rgba(244,198,79,0.28)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#efbf3e]"
          >
            {t.more}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {loading && supabaseReady
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`featured-skeleton-${index}`}
                  className="overflow-hidden rounded-[1.5rem] border border-[#ece3d9] bg-white shadow-[0_16px_36px_rgba(27,42,74,0.06)]"
                >
                  <div className="aspect-[4/3] animate-pulse bg-[linear-gradient(180deg,#fffdfa_0%,#f7f1e7_100%)]" />
                  <div className="space-y-3 px-5 py-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="h-3 w-24 rounded bg-[#efe4d5]" />
                      <div className="h-4 w-4 rounded-full bg-[#efe4d5]" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 w-20 rounded bg-[#efe4d5]" />
                      <div className="h-6 w-3/4 rounded bg-[#efe4d5]" />
                      <div className="h-4 w-full rounded bg-[#f4ecdf]" />
                      <div className="h-4 w-2/3 rounded bg-[#f4ecdf]" />
                    </div>
                  </div>
                </div>
              ))
            : displayProducts.map((product, index) => (
                <CatalogProductCard
                  key={product.id}
                  href={
                    products.length > 0 && products[index]?.categories
                      ? buildProductPath(locale, products[index].categories, products[index])
                      : localizePathname(`/products/${product.slug}`, locale)
                  }
                  name={product.name}
                  teaser={product.teaser}
                  price={product.price}
                  category={product.category}
                  imageUrl={product.imageUrl}
                  imageLoading={index < 2 ? "eager" : "lazy"}
                  imageFetchPriority={index < 2 ? "high" : "auto"}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
