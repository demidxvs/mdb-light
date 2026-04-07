"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, LoaderCircle, PackagePlus, ShieldAlert } from "lucide-react";
import { AdminShell } from "@/components/ui/admin-shell";
import { useLocale } from "@/components/ui/locale-provider";
import { isAdminSupabaseConfigured } from "@/lib/admin-supabase-client";
import { localizePathname } from "@/i18n/config";
import { generateProductSku } from "@/lib/product-utils";
import { slugify } from "@/lib/seo";

type LocaleKey = "en" | "ru" | "el" | "lv";
type TranslationFields = { name: string; slug: string };
type FormState = {
  sortOrder: string;
  translations: Record<LocaleKey, TranslationFields>;
};
type ProductRow = {
  id: string;
  sku: string;
  slug: string;
  price_cents: number;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  product_translations?: Array<{ locale: LocaleKey; name: string }>;
};

const locales: LocaleKey[] = ["en", "ru", "el", "lv"];
const labels = {
  en: "English",
  ru: "Русский",
  el: "Ελληνικά",
  lv: "Latviešu",
} as const;

const copy = {
  en: {
    top: "Protected catalog management area",
    title: "Add product",
    description: "Create a product in one step using only the 4 storefront names. Fill the rest after creation.",
    loading: "Checking admin access...",
    denied: "Admin access required",
    noAccess: "You do not have access to this page.",
    signIn: "Sign in first to open the admin panel.",
    back: "Back to products",
    formEyebrow: "Quick create",
    formTitle: "Create product with 4 names",
    formText: "SKU, slug, price, media, category, and attributes will be configured on the product page after creation.",
    translations: "Product names",
    productName: "Product name",
    missingTranslations: "Fill product name for all 4 languages.",
    success: "Product created successfully.",
    genericError: "Could not create product. Check the names and try again.",
    save: "Create product",
    saving: "Creating product...",
    latestEyebrow: "Latest products",
    latestTitle: "Recent catalog records created through the admin panel.",
    emptyProducts: "No products yet. The first created item will appear here.",
    active: "Active",
    draft: "Draft",
    featuredBadge: "Featured",
    priceLabel: "Price",
    stockLabel: "Stock",
    createdLabel: "Created",
  },
  ru: {
    top: "Защищенная зона управления каталогом",
    title: "Добавить товар",
    description: "Быстро создайте товар только по 4 названиям. Всё остальное заполните уже в карточке товара.",
    loading: "Проверяю права администратора...",
    denied: "Требуется доступ администратора",
    noAccess: "У вас нет доступа к этой странице.",
    signIn: "Сначала войдите, чтобы открыть админку.",
    back: "Назад к товарам",
    formEyebrow: "Быстрое создание",
    formTitle: "Создание товара по 4 названиям",
    formText: "SKU, slug, цена, медиа, категория и характеристики будут настраиваться уже после создания на странице товара.",
    translations: "Названия товара",
    productName: "Название товара",
    missingTranslations: "Заполните название товара для всех 4 языков.",
    success: "Товар успешно создан.",
    genericError: "Не удалось создать товар. Проверьте названия и попробуйте снова.",
    save: "Создать товар",
    saving: "Создаю товар...",
    latestEyebrow: "Последние товары",
    latestTitle: "Последние позиции каталога, созданные через админку.",
    emptyProducts: "Товаров пока нет. Первая созданная позиция появится здесь.",
    active: "Активен",
    draft: "Черновик",
    featuredBadge: "Главная",
    priceLabel: "Цена",
    stockLabel: "Остаток",
    createdLabel: "Создан",
  },
  el: {
    top: "Προστατευμένη διαχείριση καταλόγου",
    title: "Προσθήκη προϊόντος",
    description: "Δημιουργήστε γρήγορα προϊόν με μόνο τα 4 ονόματα. Τα υπόλοιπα θα συμπληρωθούν μετά.",
    loading: "Έλεγχος δικαιωμάτων διαχειριστή...",
    denied: "Απαιτείται πρόσβαση διαχειριστή",
    noAccess: "Δεν έχετε πρόσβαση σε αυτή τη σελίδα.",
    signIn: "Συνδεθείτε πρώτα για να ανοίξετε το admin panel.",
    back: "Πίσω στα προϊόντα",
    formEyebrow: "Γρήγορη δημιουργία",
    formTitle: "Δημιουργία προϊόντος με 4 ονόματα",
    formText: "SKU, slug, τιμή, media, κατηγορία και χαρακτηριστικά θα ρυθμιστούν μετά τη δημιουργία στη σελίδα προϊόντος.",
    translations: "Ονόματα προϊόντος",
    productName: "Όνομα προϊόντος",
    missingTranslations: "Συμπληρώστε το όνομα προϊόντος και στις 4 γλώσσες.",
    success: "Το προϊόν δημιουργήθηκε με επιτυχία.",
    genericError: "Δεν ήταν δυνατή η δημιουργία του προϊόντος. Ελέγξτε τα ονόματα και δοκιμάστε ξανά.",
    save: "Δημιουργία προϊόντος",
    saving: "Δημιουργία προϊόντος...",
    latestEyebrow: "Τελευταία προϊόντα",
    latestTitle: "Πρόσφατες καταχωρήσεις καταλόγου που δημιουργήθηκαν από το admin panel.",
    emptyProducts: "Δεν υπάρχουν ακόμη προϊόντα. Το πρώτο που θα δημιουργηθεί θα εμφανιστεί εδώ.",
    active: "Ενεργό",
    draft: "Πρόχειρο",
    featuredBadge: "Αρχική",
    priceLabel: "Τιμή",
    stockLabel: "Απόθεμα",
    createdLabel: "Δημιουργήθηκε",
  },
  lv: {
    top: "Aizsargāta kataloga pārvaldība",
    title: "Pievienot produktu",
    description: "Ātri izveidojiet produktu tikai ar 4 nosaukumiem. Pārējo aizpildīsiet vēlāk produkta kartītē.",
    loading: "Tiek pārbaudītas administratora tiesības...",
    denied: "Nepieciešama administratora piekļuve",
    noAccess: "Jums nav piekļuves šai lapai.",
    signIn: "Lai atvērtu admin paneli, vispirms pieslēdzieties.",
    back: "Atpakaļ uz produktiem",
    formEyebrow: "Ātrā izveide",
    formTitle: "Produkta izveide ar 4 nosaukumiem",
    formText: "SKU, slug, cena, mediji, kategorija un raksturlielumi tiks iestatīti vēlāk produkta lapā.",
    translations: "Produkta nosaukumi",
    productName: "Produkta nosaukums",
    missingTranslations: "Aizpildiet produkta nosaukumu visās 4 valodās.",
    success: "Produkts veiksmīgi izveidots.",
    genericError: "Neizdevās izveidot produktu. Pārbaudiet nosaukumus un mēģiniet vēlreiz.",
    save: "Izveidot produktu",
    saving: "Izveido produktu...",
    latestEyebrow: "Jaunākie produkti",
    latestTitle: "Jaunākie kataloga ieraksti, kas izveidoti caur admin paneli.",
    emptyProducts: "Produktu vēl nav. Pirmais izveidotais ieraksts parādīsies šeit.",
    active: "Aktīvs",
    draft: "Melnraksts",
    featuredBadge: "Sākumlapa",
    priceLabel: "Cena",
    stockLabel: "Atlikums",
    createdLabel: "Izveidots",
  },
} as const;

function createInitialForm(): FormState {
  return {
    sortOrder: "0",
    translations: {
      en: { name: "", slug: "" },
      ru: { name: "", slug: "" },
      el: { name: "", slug: "" },
      lv: { name: "", slug: "" },
    },
  };
}

function formatMoney(priceCents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(priceCents / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function AdminProductNewPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = copy[locale];
  const supabaseReady = useMemo(() => isAdminSupabaseConfigured(), []);
  const [loading, setLoading] = useState(supabaseReady);
  const [submitting, setSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(supabaseReady ? "" : "Supabase is not configured.");
  const [success, setSuccess] = useState("");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [form, setForm] = useState<FormState>(createInitialForm());

  const loadProducts = async () => {
    const response = await fetch("/api/admin/products", {
      credentials: "include",
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      products?: ProductRow[];
    };

    if (response.status === 401) {
      router.replace(localizePathname("/panel-x9k2m4q7r2a/login", locale));
      return;
    }

    if (!response.ok) {
      setError(payload.error || t.noAccess);
      return;
    }

    setProducts((payload.products ?? []).slice(0, 12));
  };

  useEffect(() => {
    if (!supabaseReady) return;
    let mounted = true;

    const hydrate = async () => {
      const response = await fetch("/api/admin/products", {
        credentials: "include",
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        products?: ProductRow[];
      };

      if (!mounted) return;
      if (response.status === 401) {
        setError(t.signIn);
        setLoading(false);
        router.replace(localizePathname("/panel-x9k2m4q7r2a/login", locale));
        return;
      }

      if (!response.ok) {
        setError(payload.error || t.noAccess);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      setProducts((payload.products ?? []).slice(0, 12));
      if (mounted) {
        setLoading(false);
      }
    };

    void hydrate();
    return () => {
      mounted = false;
    };
  }, [locale, router, supabaseReady, t.noAccess, t.signIn]);

  const handleTranslationChange = (localeKey: LocaleKey, value: string) => {
    setForm((current) => ({
      ...current,
      translations: {
        ...current.translations,
        [localeKey]: {
          ...current.translations[localeKey],
          name: value,
          slug: current.translations[localeKey].slug || slugify(value),
        },
      },
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const missingTranslation = locales.some((localeKey) => !form.translations[localeKey].name.trim());
    if (missingTranslation) {
      setError(t.missingTranslations);
      return;
    }

    const sku = generateProductSku();
    const finalSlug =
      form.translations.en.slug.trim() ||
      slugify(form.translations.en.name) ||
      slugify(form.translations.ru.name) ||
      sku.toLowerCase();

    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          sku,
          slug: finalSlug,
          sortOrder: Number.parseInt(form.sortOrder || "0", 10) || 0,
          translations: locales.map((localeKey) => ({
            locale: localeKey,
            name: form.translations[localeKey].name.trim(),
            slug: form.translations[localeKey].slug.trim(),
          })),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        id?: string;
      };

      if (response.status === 401) {
        router.replace(localizePathname("/panel-x9k2m4q7r2a/login", locale));
        return;
      }

      if (!response.ok || !payload.id) {
        setError(payload.error || t.genericError);
        return;
      }

      setSuccess(t.success);
      setForm(createInitialForm());
      await loadProducts();
      router.push(localizePathname(`/panel-x9k2m4q7r2a/products/${payload.id}`, locale));
    } catch {
      setError(t.genericError);
    } finally {
      setSubmitting(false);
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
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#efe6dd] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{t.formEyebrow}</p>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">{t.formTitle}</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[color:var(--muted)]">{t.formText}</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--accent)]/15 text-[color:var(--headline)]">
                <PackagePlus className="h-6 w-6" />
              </div>
            </div>

            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            {success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

            <section className="space-y-4">
              <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                <span>Position</span>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))}
                  className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]"
                />
              </label>
              <div className="text-sm font-semibold text-[color:var(--headline)]">{t.translations}</div>
              <div className="grid gap-4">
                {locales.map((localeKey) => (
                  <label key={localeKey} className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                    <span>{labels[localeKey]}</span>
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        value={form.translations[localeKey].name}
                        onChange={(event) => handleTranslationChange(localeKey, event.target.value)}
                        className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]"
                      />
                      <input
                        value={form.translations[localeKey].slug}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            translations: {
                              ...current.translations,
                              [localeKey]: {
                                ...current.translations[localeKey],
                                slug: slugify(event.target.value),
                              },
                            },
                          }))
                        }
                        placeholder={`Slug (${localeKey.toUpperCase()})`}
                        className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]"
                      />
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={submitting} className="inline-flex h-12 items-center gap-2 rounded-xl bg-[color:var(--accent)] px-6 text-sm font-medium text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)] transition hover:bg-[#efbf3e] disabled:cursor-not-allowed disabled:opacity-70">
                {submitting ? t.saving : t.save}
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link href={localizePathname("/panel-x9k2m4q7r2a/products", locale)} className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-6 text-sm font-medium text-[color:var(--headline)]">
                <ArrowLeft className="h-4 w-4" />
                {t.back}
              </Link>
            </div>
          </form>

          <aside className="space-y-6 rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
            <div className="border-b border-[#efe6dd] pb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{t.latestEyebrow}</p>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">{t.latestTitle}</h2>
            </div>

            <div className="space-y-3">
              {products.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#e8dccf] bg-[#fffcf7] px-4 py-5 text-sm text-[color:var(--muted)]">{t.emptyProducts}</div>
              ) : (
                products.map((product) => {
                  const localizedName =
                    product.product_translations?.find((item) => item.locale === locale)?.name ||
                    product.product_translations?.find((item) => item.locale === "en")?.name ||
                    product.product_translations?.[0]?.name ||
                    product.slug;
                  return (
                    <div key={product.id} className="rounded-[1.35rem] border border-[#ece3d9] bg-[#fffcf7] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[color:var(--headline)]">{localizedName}</p>
                          <p className="mt-1 text-xs text-[color:var(--muted)]">{product.sku} · {product.slug}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-right">
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${product.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{product.is_active ? t.active : t.draft}</span>
                          {product.is_featured ? <span className="rounded-full bg-[color:var(--accent)]/20 px-2.5 py-1 text-[11px] font-semibold text-[#8a5d00]">{t.featuredBadge}</span> : null}
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-[color:var(--headline)]">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">{t.priceLabel}</p>
                          <p className="mt-1 font-semibold">{formatMoney(product.price_cents, "EUR")}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">{t.stockLabel}</p>
                          <p className="mt-1 font-semibold">{product.stock_quantity}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">{t.createdLabel}</p>
                          <p className="mt-1 font-semibold">{formatDate(product.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        </div>
      )}
    </AdminShell>
  );
}
