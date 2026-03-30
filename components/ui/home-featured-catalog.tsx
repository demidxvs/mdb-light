"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/components/ui/locale-provider";
import { CatalogProductCard } from "@/components/ui/catalog-product-card";
import { featuredTrackProducts } from "@/lib/mock-track-products";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase-client";

type LocaleKey = "en" | "ru" | "el" | "lv";
type ProductListRow = {
  id: string;
  sku: string;
  slug: string;
  price_cents: number;
  currency: string;
  primary_image_url: string | null;
  product_translations?: Array<{
    locale: LocaleKey;
    name: string | null;
    short_description: string | null;
  }>;
};

const copy = {
  en: {
    eyebrow: "Featured catalog",
    title: "Start with 4 bestseller track lights that instantly sell the mood of the project.",
    text: "This opening set is built for modern apartments, boutique retail, compact hospitality spaces, and premium accent scenarios where the first visual impression matters.",
    more: "Open full catalog",
  },
  ru: {
    eyebrow: "Избранный каталог",
    title: "Начни с 4 сильных трековых моделей, которые сразу продают атмосферу пространства.",
    text: "Этот стартовый набор собран для современных квартир, boutique retail, камерных HoReCa-сцен и интерьерных акцентов, где важна первая визуальная эмоция.",
    more: "Открыть полный каталог",
  },
  el: {
    eyebrow: "Προτεινόμενος κατάλογος",
    title: "Ξεκινήστε με 4 βασικά track μοντέλα που πουλάνε αμέσως τη διάθεση του έργου.",
    text: "Αυτή η αρχική επιλογή ταιριάζει σε σύγχρονα διαμερίσματα, boutique retail, compact hospitality χώρους και premium accent σενάρια όπου η πρώτη εντύπωση μετράει.",
    more: "Άνοιγμα πλήρους καταλόγου",
  },
  lv: {
    eyebrow: "Izceltais katalogs",
    title: "Sāc ar 4 spēcīgiem treka modeļiem, kas uzreiz pārdod telpas noskaņu.",
    text: "Šis sākuma komplekts domāts moderniem dzīvokļiem, boutique retail, kompaktām HoReCa zonām un interjera akcentiem, kur svarīgs ir pirmais vizuālais iespaids.",
    more: "Atvērt pilnu katalogu",
  },
} as const;

export function HomeFeaturedCatalog() {
  const { locale } = useLocale();
  const t = copy[locale];
  const supabaseReady = useMemo(() => isSupabaseConfigured(), []);
  const [products, setProducts] = useState<ProductListRow[]>([]);

  useEffect(() => {
    if (!supabaseReady) return;
    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    const load = async () => {
      const { data } = await supabase
        .from("products")
        .select(
          "id, sku, slug, price_cents, currency, primary_image_url, product_translations(locale, name, short_description)",
        )
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(4);

      if (!mounted) return;
      setProducts((data as ProductListRow[] | null) ?? []);
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [supabaseReady]);

  const displayProducts =
    products.length > 0
      ? products.map((product) => {
          const translation =
            product.product_translations?.find((item) => item.locale === locale) ||
            product.product_translations?.find((item) => item.locale === "en") ||
            product.product_translations?.[0];

          return {
            id: product.id,
            slug: product.slug,
            name: translation?.name || product.slug,
            teaser: translation?.short_description || "",
            sku: product.sku,
            price: new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: product.currency || "EUR",
            }).format(product.price_cents / 100),
            imageUrl: product.primary_image_url,
            category:
              locale === "ru"
                ? "Трековый свет"
                : locale === "lv"
                  ? "Treka gaisma"
                  : locale === "el"
                    ? "Φωτισμός ράγας"
                    : "Track lighting",
          };
        })
      : featuredTrackProducts.map((product) => ({
          id: product.id,
          slug: product.slug,
          name: product.name[locale],
          teaser: product.teaser[locale],
          sku: product.sku,
          price: product.price,
          imageUrl: null,
          category:
            locale === "ru"
              ? "Трековый свет"
              : locale === "lv"
                ? "Treka gaisma"
                : locale === "el"
                  ? "Φωτισμός ράγας"
                  : "Track lighting",
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
            href="/catalog"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#f4c64f] px-5 text-sm font-semibold text-[#1e2f4e] shadow-[0_14px_28px_rgba(244,198,79,0.28)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#efbf3e]"
          >
            {t.more}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {displayProducts.map((product) => (
            <CatalogProductCard
              key={product.id}
              href={`/products/${product.slug}`}
              name={product.name}
              teaser={product.teaser}
              sku={product.sku}
              price={product.price}
              category={product.category}
              imageUrl={product.imageUrl}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
