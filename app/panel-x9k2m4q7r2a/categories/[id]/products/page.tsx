"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowUp, Boxes, LoaderCircle, PencilLine, ShieldAlert } from "lucide-react";
import { AdminShell } from "@/components/ui/admin-shell";
import { useLocale } from "@/components/ui/locale-provider";
import { isAdminSupabaseConfigured } from "@/lib/admin-supabase-client";
import { localizePathname } from "@/i18n/config";

type LocaleKey = "en" | "ru" | "el" | "lv";

type CategoryRow = {
  id: string;
  slug: string;
  sort_order?: number;
  category_translations?: Array<{ locale: LocaleKey; name: string; slug?: string | null }>;
};

type ProductRow = {
  id: string;
  sku: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  product_translations?: Array<{ locale: LocaleKey; name: string; slug?: string | null }>;
};

const copy = {
  en: {
    top: "Protected category product ordering area",
    title: "Category products",
    description: "Open a category and change the order of products inside it.",
    loading: "Loading category products...",
    denied: "Admin access required",
    signIn: "Sign in first to open the admin panel.",
    noAccess: "You do not have access to this page.",
    back: "Back to categories",
    category: "Category",
    choose: "Choose category",
    empty: "No products in this category yet.",
    moveUp: "Up",
    moveDown: "Down",
    edit: "Edit product",
    active: "Active",
    hidden: "Draft",
    order: "Position",
    slug: "Slug",
  },
  ru: {
    top: "Защищенная зона сортировки товаров по категориям",
    title: "Товары категории",
    description: "Откройте категорию и меняйте порядок товаров внутри нее.",
    loading: "Загружаю товары категории...",
    denied: "Требуется доступ администратора",
    signIn: "Сначала войдите, чтобы открыть админку.",
    noAccess: "У вас нет доступа к этой странице.",
    back: "Назад к категориям",
    category: "Категория",
    choose: "Выберите категорию",
    empty: "В этой категории пока нет товаров.",
    moveUp: "Вверх",
    moveDown: "Вниз",
    edit: "Редактировать товар",
    active: "Активен",
    hidden: "Черновик",
    order: "Позиция",
    slug: "Slug",
  },
  el: {
    top: "Προστατευμένη ταξινόμηση προϊόντων κατηγορίας",
    title: "Προϊόντα κατηγορίας",
    description: "Ανοίξτε μια κατηγορία και αλλάξτε τη σειρά των προϊόντων μέσα σε αυτή.",
    loading: "Φόρτωση προϊόντων κατηγορίας...",
    denied: "Απαιτείται πρόσβαση διαχειριστή",
    signIn: "Συνδεθείτε πρώτα για να ανοίξετε το admin panel.",
    noAccess: "Δεν έχετε πρόσβαση σε αυτή τη σελίδα.",
    back: "Πίσω στις κατηγορίες",
    category: "Κατηγορία",
    choose: "Επιλέξτε κατηγορία",
    empty: "Δεν υπάρχουν ακόμη προϊόντα σε αυτή την κατηγορία.",
    moveUp: "Πάνω",
    moveDown: "Κάτω",
    edit: "Επεξεργασία προϊόντος",
    active: "Ενεργό",
    hidden: "Πρόχειρο",
    order: "Θέση",
    slug: "Slug",
  },
  lv: {
    top: "Aizsargāta kategorijas produktu šķirošana",
    title: "Kategorijas produkti",
    description: "Atveriet kategoriju un mainiet produktu secību tās iekšienē.",
    loading: "Ielādē kategorijas produktus...",
    denied: "Nepieciešama administratora piekļuve",
    signIn: "Lai atvērtu admin paneli, vispirms pieslēdzieties.",
    noAccess: "Jums nav piekļuves šai lapai.",
    back: "Atpakaļ uz kategorijām",
    category: "Kategorija",
    choose: "Izvēlieties kategoriju",
    empty: "Šajā kategorijā vēl nav produktu.",
    moveUp: "Uz augšu",
    moveDown: "Uz leju",
    edit: "Rediģēt produktu",
    active: "Aktīvs",
    hidden: "Melnraksts",
    order: "Pozīcija",
    slug: "Slug",
  },
} as const;

function getCategoryLabel(category: CategoryRow, locale: LocaleKey) {
  return (
    category.category_translations?.find((item) => item.locale === locale)?.name ||
    category.category_translations?.find((item) => item.locale === "en")?.name ||
    category.category_translations?.[0]?.name ||
    category.slug
  );
}

function getProductLabel(product: ProductRow, locale: LocaleKey) {
  return (
    product.product_translations?.find((item) => item.locale === locale)?.name ||
    product.product_translations?.find((item) => item.locale === "en")?.name ||
    product.product_translations?.[0]?.name ||
    product.slug
  );
}

export default function AdminCategoryProductsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { locale } = useLocale();
  const t = copy[locale];
  const supabaseReady = useMemo(() => isAdminSupabaseConfigured(), []);
  const [loading, setLoading] = useState(supabaseReady);
  const [error, setError] = useState(supabaseReady ? "" : "Admin Supabase is not configured.");
  const [isAdmin, setIsAdmin] = useState(false);
  const [category, setCategory] = useState<CategoryRow | null>(null);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [movingId, setMovingId] = useState<string | null>(null);

  const categoryId = params?.id || "";

  const load = useCallback(async (selectedCategoryId = categoryId) => {
    const response = await fetch(`/api/admin/categories/${selectedCategoryId}/products`, {
      credentials: "include",
    });

    if (response.status === 401) {
      setError(t.signIn);
      setLoading(false);
      router.replace(localizePathname("/panel-x9k2m4q7r2a/login", locale));
      return;
    }

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      category?: CategoryRow;
      categories?: CategoryRow[];
      products?: ProductRow[];
    };

    if (!response.ok) {
      setError(payload.error || t.noAccess);
      setLoading(false);
      return;
    }

    setCategory(payload.category ?? null);
    setCategories(payload.categories ?? []);
    setProducts(payload.products ?? []);
    setIsAdmin(true);
    setLoading(false);
  }, [categoryId, locale, router, t.noAccess, t.signIn]);

  useEffect(() => {
    if (!supabaseReady || !categoryId) return;
    let mounted = true;

    const hydrate = async () => {
      await load(categoryId);
      if (!mounted) return;
    };

    void hydrate();
    return () => {
      mounted = false;
    };
  }, [categoryId, load, supabaseReady]);

  const handleCategoryChange = (nextCategoryId: string) => {
    if (!nextCategoryId) return;
    router.push(localizePathname(`/panel-x9k2m4q7r2a/categories/${nextCategoryId}/products`, locale));
  };

  const moveProduct = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    const current = products[index];
    const target = products[targetIndex];
    setMovingId(current.id);
    setError("");

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}/products`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstId: current.id,
          firstSortOrder: target.sort_order,
          secondId: target.id,
          secondSortOrder: current.sort_order,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(payload.error || t.noAccess);
        return;
      }

      await load(categoryId);
    } finally {
      setMovingId(null);
    }
  };

  return (
    <AdminShell topLabel={t.top} title={t.title} description={t.description}>
      {loading ? (
        <div className="flex min-h-[420px] items-center justify-center rounded-[1.75rem] border border-[#ece3d9] bg-white shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
          <div className="flex items-center gap-3 text-sm font-medium text-[color:var(--muted)]">
            <LoaderCircle className="h-5 w-5 animate-spin text-[color:var(--headline)]" />
            {t.loading}
          </div>
        </div>
      ) : !isAdmin ? (
        <div className="rounded-[1.75rem] border border-[#f1d7ca] bg-[#fff7f2] p-8 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ffe2d8] text-[#af4b2b]">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">{t.denied}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Link
              href={localizePathname("/panel-x9k2m4q7r2a/categories", locale)}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-5 text-sm font-medium text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/25"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.back}
            </Link>
          </div>

          <section className="rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                <span>{t.category}</span>
                <select
                  value={categoryId}
                  onChange={(event) => handleCategoryChange(event.target.value)}
                  className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]"
                >
                  <option value="">{t.choose}</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {getCategoryLabel(item, locale)}
                    </option>
                  ))}
                </select>
              </label>
              {category ? (
                <div className="inline-flex h-11 items-center rounded-xl bg-[color:var(--accent)]/12 px-4 text-sm font-medium text-[color:var(--headline)]">
                  <Boxes className="mr-2 h-4 w-4" />
                  {getCategoryLabel(category, locale)}
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
            {error ? <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

            <div className="space-y-3">
              {products.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#e8dccf] bg-[#fffcf7] px-4 py-5 text-sm text-[color:var(--muted)]">{t.empty}</div>
              ) : (
                products.map((product, index) => (
                  <div key={product.id} className="rounded-[1.35rem] border border-[#ece3d9] bg-[#fffcf7] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--accent)]/75">
                          {t.order} {String(index + 1).padStart(2, "0")}
                        </p>
                        <h3 className="mt-2 font-display text-xl font-semibold text-[color:var(--headline)]">
                          {getProductLabel(product, locale)}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                          {product.sku}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#8c9bb6]">
                          {t.slug}: {product.slug}
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${product.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {product.is_active ? t.active : t.hidden}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void moveProduct(index, -1)}
                        disabled={movingId === product.id}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-3 text-sm font-medium text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/25 disabled:opacity-50"
                      >
                        <ArrowUp className="h-4 w-4" />
                        {t.moveUp}
                      </button>
                      <button
                        type="button"
                        onClick={() => void moveProduct(index, 1)}
                        disabled={movingId === product.id}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-3 text-sm font-medium text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/25 disabled:opacity-50"
                      >
                        <ArrowDown className="h-4 w-4" />
                        {t.moveDown}
                      </button>
                      <Link
                        href={localizePathname(`/panel-x9k2m4q7r2a/products/${product.id}`, locale)}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-3 text-sm font-medium text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/25"
                      >
                        <PencilLine className="h-4 w-4" />
                        {t.edit}
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  );
}
