"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLocale } from "@/components/ui/locale-provider";
import { SiteNavigation } from "@/components/ui/site-navigation";
import { AccountControls } from "@/components/ui/account-controls";
import { MobileScrollHeader } from "@/components/ui/mobile-scroll-header";
import { CatalogProductCard } from "@/components/ui/catalog-product-card";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase-client";

type LocaleKey = "en" | "ru" | "el" | "lv";
type CategoryRow = {
  id: string;
  slug: string;
  cover_image_url: string | null;
  category_translations?: Array<{
    locale: LocaleKey;
    name: string;
    description: string | null;
  }>;
};
type ProductRow = {
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
  en: { top: "Multilingual LED marketplace", support: "Contact", back: "Back to catalog", loading: "Loading category...", empty: "No products in this category yet.", allCategories: "All categories" },
  ru: { top: "Мультиязычный LED marketplace", support: "Контакты", back: "Назад в каталог", loading: "Загружаю категорию...", empty: "В этой категории пока нет товаров.", allCategories: "Все категории" },
  el: { top: "Πολυγλωσσικό LED marketplace", support: "Επικοινωνία", back: "Πίσω στον κατάλογο", loading: "Φόρτωση κατηγορίας...", empty: "Δεν υπάρχουν ακόμη προϊόντα σε αυτή την κατηγορία.", allCategories: "Όλες οι κατηγορίες" },
  lv: { top: "Daudzvalodu LED marketplace", support: "Kontakti", back: "Atpakaļ uz katalogu", loading: "Ielādē kategoriju...", empty: "Šajā kategorijā vēl nav produktu.", allCategories: "Visas kategorijas" },
} as const;

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { locale } = useLocale();
  const t = copy[locale];
  const supabaseReady = useMemo(() => isSupabaseConfigured(), []);
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CategoryRow | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);

  useEffect(() => {
    let mounted = true;
    void params.then((resolved) => {
      if (!mounted) return;
      setSlug(resolved.slug);
    });
    return () => {
      mounted = false;
    };
  }, [params]);

  useEffect(() => {
    if (!supabaseReady || !slug) return;
    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const { data: categoryData } = await supabase
        .from("categories")
        .select("id, slug, cover_image_url, category_translations(locale, name, description)")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (!mounted) return;
      if (!categoryData) {
        setCategory(null);
        setProducts([]);
        setLoading(false);
        return;
      }

      const typedCategory = categoryData as CategoryRow;
      setCategory(typedCategory);

      const { data: productData } = await supabase
        .from("products")
        .select("id, sku, slug, price_cents, currency, primary_image_url, product_translations(locale, name, short_description)")
        .eq("category_id", typedCategory.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!mounted) return;
      setProducts((productData as ProductRow[] | null) ?? []);
      setLoading(false);
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [slug, supabaseReady]);

  const categoryTranslation =
    category?.category_translations?.find((item) => item.locale === locale) ||
    category?.category_translations?.find((item) => item.locale === "en") ||
    category?.category_translations?.[0];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_30%),linear-gradient(180deg,#fffdfa_0%,#f8f3eb_100%)]">
      <div className="border-b border-[color:var(--line)] bg-white/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 text-xs text-[color:var(--muted)] sm:px-10 lg:px-12">
          <div className="hidden md:block">+371 24443333 · info@mdbgroup.lv</div>
          <div className="ml-auto">{t.top}</div>
        </div>
      </div>
      <MobileScrollHeader>
        <header className="border-b border-[color:var(--line)] bg-white/92 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-1 sm:px-10 lg:px-12">
            <Link href="/" className="flex min-w-0 items-center overflow-visible">
              <Image src="/logo/mdb-light-logo.svg" alt="MDB Light logo" width={1080} height={182} priority className="h-14 w-auto origin-left scale-150 object-contain sm:h-16" />
            </Link>
            <div className="ml-auto hidden xl:block"><SiteNavigation /></div>
            <div className="hidden items-center gap-3 lg:flex">
              <LanguageSwitcher />
              <AccountControls />
            </div>
          </div>
          <div className="border-t border-[color:var(--line)] px-4 py-3 lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-3">
              <div className="flex items-center gap-2">
                <SiteNavigation compact className="min-w-0 flex-1" />
                <LanguageSwitcher className="shrink-0" />
              </div>
              <div className="overflow-x-auto pb-1">
                <AccountControls />
              </div>
            </div>
          </div>
        </header>
      </MobileScrollHeader>
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-10 sm:py-8 lg:px-12">
        <div className="overflow-hidden rounded-[2rem] border border-[#e5e8ee] bg-white shadow-[0_20px_60px_rgba(27,42,74,0.06)]">
          <div className="relative min-h-[220px] overflow-hidden sm:min-h-[260px]">
            {category?.cover_image_url ? (
              <Image
                src={category.cover_image_url}
                alt={categoryTranslation?.name || slug}
                fill
                sizes="100vw"
                className="absolute inset-0 object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#1f2633,#454f62,#0f1116)]" />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,10,14,0.82)_0%,rgba(8,10,14,0.68)_40%,rgba(8,10,14,0.28)_70%,rgba(8,10,14,0.08)_100%)]" />
            <div className="relative px-5 py-6 text-white sm:px-8 sm:py-10">
              <Link href="/catalog" className="inline-flex items-center gap-2 rounded-xl border border-white/18 bg-white/10 px-4 py-2 text-sm font-medium text-white/90"><ArrowLeft className="h-4 w-4" />{t.back}</Link>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#f4c64f]">{t.allCategories}</p>
              <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">{categoryTranslation?.name || slug}</h1>
              <p className="mt-4 max-w-4xl text-sm leading-6 text-white/82 sm:text-base sm:leading-7">{categoryTranslation?.description || ""}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-10 sm:pb-16 lg:px-12">
        {loading ? (
          <div className="rounded-[2rem] border border-[#e5e8ee] bg-white px-6 py-12 text-sm text-[color:var(--muted)] shadow-[0_20px_60px_rgba(27,42,74,0.06)]">{t.loading}</div>
        ) : products.length === 0 ? (
          <div className="rounded-[2rem] border border-[#e5e8ee] bg-white px-6 py-12 text-sm text-[color:var(--muted)] shadow-[0_20px_60px_rgba(27,42,74,0.06)]">{t.empty}</div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const translation =
                product.product_translations?.find((item) => item.locale === locale) ||
                product.product_translations?.find((item) => item.locale === "en") ||
                product.product_translations?.[0];

              return (
                <CatalogProductCard
                  key={product.id}
                  href={`/products/${product.slug}`}
                  name={translation?.name || product.slug}
                  teaser={translation?.short_description || ""}
                  sku={product.sku}
                  price={new Intl.NumberFormat("en-US", { style: "currency", currency: product.currency || "EUR" }).format(product.price_cents / 100)}
                  category={categoryTranslation?.name || slug}
                  imageUrl={product.primary_image_url}
                />
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
