"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLocale } from "@/components/ui/locale-provider";
import { SiteNavigation } from "@/components/ui/site-navigation";
import { AccountControls } from "@/components/ui/account-controls";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase-client";

type LocaleKey = "en" | "ru" | "el" | "lv";
type ProductRow = {
  id: string;
  sku: string;
  slug: string;
  brand: string | null;
  currency: string;
  price_cents: number;
  compare_at_price_cents: number | null;
  primary_image_url: string | null;
  category_id: string | null;
  product_translations?: Array<{
    locale: LocaleKey;
    name: string | null;
    short_description: string | null;
    description: string | null;
  }>;
};
type CategoryRow = {
  id: string;
  slug: string;
  category_translations?: Array<{
    locale: LocaleKey;
    name: string;
  }>;
};

const copy = {
  en: { top: "Multilingual LED marketplace", support: "Contact", loading: "Loading product...", backCatalog: "Back to catalog", addToCart: "Add to cart", sku: "SKU", brand: "Brand", category: "Category", description: "Description", imagePlaceholder: "Add product photo in admin" },
  ru: { top: "Мультиязычный LED marketplace", support: "Контакты", loading: "Загружаю товар...", backCatalog: "Назад в каталог", addToCart: "В корзину", sku: "SKU", brand: "Бренд", category: "Категория", description: "Описание", imagePlaceholder: "Добавьте фото товара в админке" },
  el: { top: "Πολυγλωσσικό LED marketplace", support: "Επικοινωνία", loading: "Φόρτωση προϊόντος...", backCatalog: "Πίσω στον κατάλογο", addToCart: "Προσθήκη στο καλάθι", sku: "SKU", brand: "Μάρκα", category: "Κατηγορία", description: "Περιγραφή", imagePlaceholder: "Προσθέστε φωτογραφία προϊόντος στο admin" },
  lv: { top: "Daudzvalodu LED marketplace", support: "Kontakti", loading: "Ielādē produktu...", backCatalog: "Atpakaļ uz katalogu", addToCart: "Pievienot grozam", sku: "SKU", brand: "Zīmols", category: "Kategorija", description: "Apraksts", imagePlaceholder: "Pievienojiet produkta foto admin panelī" },
} as const;

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { locale } = useLocale();
  const t = copy[locale];
  const supabaseReady = useMemo(() => isSupabaseConfigured(), []);
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductRow | null>(null);
  const [category, setCategory] = useState<CategoryRow | null>(null);

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
      const { data: productData } = await supabase
        .from("products")
        .select("id, sku, slug, brand, currency, price_cents, compare_at_price_cents, primary_image_url, category_id, product_translations(locale, name, short_description, description)")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (!mounted) return;
      if (!productData) {
        setProduct(null);
        setCategory(null);
        setLoading(false);
        return;
      }

      const typedProduct = productData as ProductRow;
      setProduct(typedProduct);

      if (typedProduct.category_id) {
        const { data: categoryData } = await supabase
          .from("categories")
          .select("id, slug, category_translations(locale, name)")
          .eq("id", typedProduct.category_id)
          .maybeSingle();

        if (!mounted) return;
        setCategory((categoryData as CategoryRow | null) ?? null);
      } else {
        setCategory(null);
      }

      setLoading(false);
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [slug, supabaseReady]);

  const translation =
    product?.product_translations?.find((item) => item.locale === locale) ||
    product?.product_translations?.find((item) => item.locale === "en") ||
    product?.product_translations?.[0];
  const categoryName =
    category?.category_translations?.find((item) => item.locale === locale)?.name ||
    category?.category_translations?.find((item) => item.locale === "en")?.name ||
    category?.category_translations?.[0]?.name ||
    category?.slug;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_30%),linear-gradient(180deg,#fffdfa_0%,#f8f3eb_100%)]">
      <div className="border-b border-[color:var(--line)] bg-white/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 text-xs text-[color:var(--muted)] sm:px-10 lg:px-12">
          <div className="hidden md:block">+370 (000) 000-00-00 · hello@mdblight.com</div>
          <div className="ml-auto">{t.top}</div>
        </div>
      </div>
      <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-white/92 backdrop-blur-xl">
        <div className="flex w-full items-center gap-4 py-1 pl-1 pr-6 sm:pl-2 sm:pr-10 lg:pl-2 lg:pr-12">
          <Link href="/" className="flex min-w-0 items-center overflow-visible xl:ml-[360px] 2xl:ml-[380px]">
            <Image src="/logo/mdb-light-logo.svg" alt="MDB Light logo" width={1080} height={182} priority className="h-14 w-auto origin-left scale-150 object-contain sm:h-16" />
          </Link>
          <div className="ml-auto hidden xl:block"><SiteNavigation /></div>
          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher />
            <AccountControls />
            <Link href="/contacts" className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-[#203153] shadow-[0_12px_28px_rgba(244,198,79,0.28)] hover:bg-[#f1bc36]">{t.support}</Link>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
        {loading || !product ? (
          <div className="rounded-[2rem] border border-[#e5e8ee] bg-white px-6 py-12 text-sm text-[color:var(--muted)] shadow-[0_20px_60px_rgba(27,42,74,0.06)]">{t.loading}</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="overflow-hidden rounded-[2rem] border border-[#e5e8ee] bg-white shadow-[0_20px_60px_rgba(27,42,74,0.06)]">
              <div className="relative aspect-[1.04/1] bg-[linear-gradient(180deg,#fffdfa_0%,#f7f1e7_100%)]">
                {product.primary_image_url ? (
                  <img src={product.primary_image_url} alt={translation?.name || product.slug} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm uppercase tracking-[0.22em] text-[#9c8b6b]">{t.imagePlaceholder}</div>
                )}
              </div>
            </div>
            <div className="rounded-[2rem] border border-[#e5e8ee] bg-white p-6 shadow-[0_20px_60px_rgba(27,42,74,0.06)] sm:p-8">
              <Link href={category ? `/catalog/${category.slug}` : "/catalog"} className="inline-flex items-center gap-2 rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 py-2 text-sm font-medium text-[color:var(--headline)]"><ArrowLeft className="h-4 w-4" />{t.backCatalog}</Link>
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{categoryName || t.category}</p>
                <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.05em] text-[color:var(--headline)]">{translation?.name || product.slug}</h1>
                <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">{translation?.short_description || ""}</p>
              </div>
              <div className="mt-8 flex flex-wrap items-end gap-4">
                <div>
                  {product.compare_at_price_cents ? <p className="text-sm text-[#99a6be] line-through">{new Intl.NumberFormat("en-US", { style: "currency", currency: product.currency || "EUR" }).format(product.compare_at_price_cents / 100)}</p> : null}
                  <p className="font-display text-4xl font-semibold tracking-[-0.05em] text-[color:var(--headline)]">{new Intl.NumberFormat("en-US", { style: "currency", currency: product.currency || "EUR" }).format(product.price_cents / 100)}</p>
                </div>
                <button type="button" className="inline-flex h-14 items-center gap-2 rounded-xl bg-[color:var(--accent)] px-6 text-sm font-semibold text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)]"><ShoppingCart className="h-4 w-4" />{t.addToCart}</button>
              </div>
              <div className="mt-8 grid gap-3 rounded-[1.5rem] border border-[#ece3d9] bg-[#fffcf7] p-5 text-sm text-[color:var(--headline)]">
                <div className="flex items-center justify-between gap-4 border-b border-[#efe6dd] pb-3"><span className="text-[color:var(--muted)]">{t.sku}</span><span className="font-medium">{product.sku}</span></div>
                {product.brand ? <div className="flex items-center justify-between gap-4 border-b border-[#efe6dd] pb-3"><span className="text-[color:var(--muted)]">{t.brand}</span><span className="font-medium">{product.brand}</span></div> : null}
                {categoryName ? <div className="flex items-center justify-between gap-4"><span className="text-[color:var(--muted)]">{t.category}</span><span className="font-medium">{categoryName}</span></div> : null}
              </div>
              {translation?.description ? <div className="mt-8"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)]">{t.description}</p><div className="mt-3 text-sm leading-8 text-[color:var(--muted)]">{translation.description}</div></div> : null}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
