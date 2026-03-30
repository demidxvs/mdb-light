"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, PencilLine, ShieldAlert } from "lucide-react";
import { AdminShell } from "@/components/ui/admin-shell";
import { useLocale } from "@/components/ui/locale-provider";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase-client";
import { uploadAdminImage } from "@/lib/storage";

type LocaleKey = "en" | "ru" | "el" | "lv";
type TranslationFields = {
  name: string;
  shortDescription: string;
  description: string;
};
type FormState = {
  sku: string;
  slug: string;
  brand: string;
  categoryId: string;
  currency: string;
  price: string;
  compareAtPrice: string;
  stockQuantity: string;
  primaryImageUrl: string;
  isActive: boolean;
  isFeatured: boolean;
  trackInventory: boolean;
  translations: Record<LocaleKey, TranslationFields>;
};
type CategoryRow = {
  id: string;
  slug: string;
  category_translations?: Array<{ locale: LocaleKey; name: string }>;
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
    support: "Contact",
    title: "Edit product",
    description: "Update the product data, translations, price, and storefront visibility.",
    loading: "Loading product...",
    denied: "Admin access required",
    signIn: "Sign in first to open the admin panel.",
    noAccess: "You do not have access to this page.",
    missing: "Product not found.",
    back: "Back to products",
    save: "Update product",
    saving: "Saving changes...",
    success: "Product updated successfully.",
    genericError: "Could not update product. Check the fields and try again.",
    skuRequired: "Enter SKU.",
    slugRequired: "Enter slug or an English product name to generate it.",
    priceInvalid: "Enter a valid price.",
    compareInvalid: "Compare at price must be empty or greater than zero.",
    missingTranslations: "Fill product name for all 4 languages.",
    baseInfo: "Base product info",
    sku: "SKU",
    slug: "Slug",
    brand: "Brand",
    category: "Category",
    noCategory: "No category",
    commercial: "Commercial settings",
    currency: "Currency",
    price: "Price",
    compareAtPrice: "Compare at price",
    stock: "Stock quantity",
    image: "Product image",
    uploadImage: "Upload image",
    uploading: "Uploading image...",
    trackInventory: "Track inventory",
    visible: "Visible in storefront",
    featured: "Featured on homepage",
    translations: "Translations",
    productName: "Product name",
    shortDescription: "Short description",
    fullDescription: "Full description",
  },
  ru: {
    top: "Защищенная зона управления каталогом",
    support: "Контакты",
    title: "Редактировать товар",
    description: "Обновите данные товара, переводы, цену и видимость на витрине.",
    loading: "Загружаю товар...",
    denied: "Требуется доступ администратора",
    signIn: "Сначала войдите, чтобы открыть админку.",
    noAccess: "У вас нет доступа к этой странице.",
    missing: "Товар не найден.",
    back: "Назад к товарам",
    save: "Обновить товар",
    saving: "Сохраняю изменения...",
    success: "Товар успешно обновлен.",
    genericError: "Не удалось обновить товар. Проверьте поля и попробуйте снова.",
    skuRequired: "Введите SKU.",
    slugRequired: "Введите slug или английское имя товара для автогенерации.",
    priceInvalid: "Введите корректную цену.",
    compareInvalid: "Старая цена должна быть пустой или больше нуля.",
    missingTranslations: "Заполните название товара для всех 4 языков.",
    baseInfo: "Основная информация",
    sku: "SKU",
    slug: "Slug",
    brand: "Бренд",
    category: "Категория",
    noCategory: "Без категории",
    commercial: "Коммерческие настройки",
    currency: "Валюта",
    price: "Цена",
    compareAtPrice: "Старая цена",
    stock: "Количество на складе",
    image: "Изображение товара",
    uploadImage: "Загрузить изображение",
    uploading: "Загружаю изображение...",
    trackInventory: "Отслеживать остатки",
    visible: "Показывать на витрине",
    featured: "Показывать на главной",
    translations: "Переводы",
    productName: "Название товара",
    shortDescription: "Короткое описание",
    fullDescription: "Полное описание",
  },
  el: {
    top: "Προστατευμένη διαχείριση καταλόγου",
    support: "Επικοινωνία",
    title: "Επεξεργασία προϊόντος",
    description: "Ενημερώστε τα στοιχεία του προϊόντος, τις μεταφράσεις, την τιμή και την ορατότητα στη βιτρίνα.",
    loading: "Φόρτωση προϊόντος...",
    denied: "Απαιτείται πρόσβαση διαχειριστή",
    signIn: "Συνδεθείτε πρώτα για να ανοίξετε το admin panel.",
    noAccess: "Δεν έχετε πρόσβαση σε αυτή τη σελίδα.",
    missing: "Το προϊόν δεν βρέθηκε.",
    back: "Πίσω στα προϊόντα",
    save: "Ενημέρωση προϊόντος",
    saving: "Αποθήκευση αλλαγών...",
    success: "Το προϊόν ενημερώθηκε με επιτυχία.",
    genericError: "Δεν ήταν δυνατή η ενημέρωση του προϊόντος. Ελέγξτε τα πεδία και δοκιμάστε ξανά.",
    skuRequired: "Συμπληρώστε το SKU.",
    slugRequired: "Συμπληρώστε slug ή αγγλικό όνομα προϊόντος για αυτόματη δημιουργία.",
    priceInvalid: "Συμπληρώστε έγκυρη τιμή.",
    compareInvalid: "Η αρχική τιμή πρέπει να είναι κενή ή μεγαλύτερη από το μηδέν.",
    missingTranslations: "Συμπληρώστε το όνομα προϊόντος και στις 4 γλώσσες.",
    baseInfo: "Βασικές πληροφορίες",
    sku: "SKU",
    slug: "Slug",
    brand: "Μάρκα",
    category: "Κατηγορία",
    noCategory: "Χωρίς κατηγορία",
    commercial: "Εμπορικές ρυθμίσεις",
    currency: "Νόμισμα",
    price: "Τιμή",
    compareAtPrice: "Αρχική τιμή",
    stock: "Ποσότητα αποθέματος",
    image: "Εικόνα προϊόντος",
    uploadImage: "Μεταφόρτωση εικόνας",
    uploading: "Μεταφόρτωση εικόνας...",
    trackInventory: "Παρακολούθηση αποθέματος",
    visible: "Ορατό στη βιτρίνα",
    featured: "Εμφάνιση στην αρχική",
    translations: "Μεταφράσεις",
    productName: "Όνομα προϊόντος",
    shortDescription: "Σύντομη περιγραφή",
    fullDescription: "Πλήρης περιγραφή",
  },
  lv: {
    top: "Aizsargāta kataloga pārvaldība",
    support: "Kontakti",
    title: "Rediģēt produktu",
    description: "Atjauniniet produkta datus, tulkojumus, cenu un redzamību vitrīnā.",
    loading: "Ielādē produktu...",
    denied: "Nepieciešama administratora piekļuve",
    signIn: "Lai atvērtu admin paneli, vispirms pieslēdzieties.",
    noAccess: "Jums nav piekļuves šai lapai.",
    missing: "Produkts nav atrasts.",
    back: "Atpakaļ uz produktiem",
    save: "Atjaunināt produktu",
    saving: "Saglabā izmaiņas...",
    success: "Produkts veiksmīgi atjaunināts.",
    genericError: "Neizdevās atjaunināt produktu. Pārbaudiet laukus un mēģiniet vēlreiz.",
    skuRequired: "Ievadiet SKU.",
    slugRequired: "Ievadiet slug vai produkta nosaukumu angļu valodā automātiskai ģenerēšanai.",
    priceInvalid: "Ievadiet korektu cenu.",
    compareInvalid: "Salīdzinājuma cenai jābūt tukšai vai lielākai par nulli.",
    missingTranslations: "Aizpildiet produkta nosaukumu visās 4 valodās.",
    baseInfo: "Pamata informācija",
    sku: "SKU",
    slug: "Slug",
    brand: "Zīmols",
    category: "Kategorija",
    noCategory: "Bez kategorijas",
    commercial: "Komerciālie iestatījumi",
    currency: "Valūta",
    price: "Cena",
    compareAtPrice: "Salīdzinājuma cena",
    stock: "Atlikuma daudzums",
    image: "Produkta attēls",
    uploadImage: "Augšupielādēt attēlu",
    uploading: "Augšupielādē attēlu...",
    trackInventory: "Sekot atlikumam",
    visible: "Rādīt vitrīnā",
    featured: "Rādīt sākumlapā",
    translations: "Tulkojumi",
    productName: "Produkta nosaukums",
    shortDescription: "Īss apraksts",
    fullDescription: "Pilns apraksts",
  },
} as const;

function createInitialForm(): FormState {
  return {
    sku: "",
    slug: "",
    brand: "",
    categoryId: "",
    currency: "EUR",
    price: "",
    compareAtPrice: "",
    stockQuantity: "0",
    primaryImageUrl: "",
    isActive: true,
    isFeatured: false,
    trackInventory: true,
    translations: {
      en: { name: "", shortDescription: "", description: "" },
      ru: { name: "", shortDescription: "", description: "" },
      el: { name: "", shortDescription: "", description: "" },
      lv: { name: "", shortDescription: "", description: "" },
    },
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function AdminProductEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { locale } = useLocale();
  const t = copy[locale];
  const supabaseReady = useMemo(() => isSupabaseConfigured(), []);
  const [loading, setLoading] = useState(supabaseReady);
  const [submitting, setSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(supabaseReady ? "" : "Supabase is not configured.");
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [form, setForm] = useState<FormState>(createInitialForm());
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!supabaseReady || !params?.id) return;
    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    const hydrate = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      const user = session?.user;
      if (!user) {
        setError(t.signIn);
        setLoading(false);
        router.replace(`/login?next=${encodeURIComponent(`/panel-x9k2m4q7r2a/products/${params.id}`)}`);
        return;
      }

      const { data: adminRow } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!mounted) return;
      if (!adminRow) {
        setError(t.noAccess);
        setLoading(false);
        return;
      }

      const [{ data: categoryData }, { data: productData, error: productError }] = await Promise.all([
        supabase
          .from("categories")
          .select("id, slug, category_translations(locale, name)")
          .order("sort_order", { ascending: true }),
        supabase
          .from("products")
          .select(
            "id, sku, slug, brand, category_id, currency, price_cents, compare_at_price_cents, stock_quantity, primary_image_url, is_active, is_featured, track_inventory, product_translations(locale, name, short_description, description)",
          )
          .eq("id", params.id)
          .maybeSingle(),
      ]);

      if (!mounted) return;
      if (productError || !productData) {
        setError(productError?.message || t.missing);
        setLoading(false);
        return;
      }

      const nextForm = createInitialForm();
      nextForm.sku = productData.sku;
      nextForm.slug = productData.slug;
      nextForm.brand = productData.brand || "";
      nextForm.categoryId = productData.category_id || "";
      nextForm.currency = productData.currency || "EUR";
      nextForm.price = String(productData.price_cents / 100);
      nextForm.compareAtPrice = productData.compare_at_price_cents ? String(productData.compare_at_price_cents / 100) : "";
      nextForm.stockQuantity = String(productData.stock_quantity ?? 0);
      nextForm.primaryImageUrl = productData.primary_image_url || "";
      nextForm.isActive = productData.is_active;
      nextForm.isFeatured = productData.is_featured;
      nextForm.trackInventory = productData.track_inventory;

      for (const localeKey of locales) {
        const translation = productData.product_translations?.find((item) => item.locale === localeKey);
        nextForm.translations[localeKey] = {
          name: translation?.name || "",
          shortDescription: translation?.short_description || "",
          description: translation?.description || "",
        };
      }

      setCategories((categoryData as CategoryRow[] | null) ?? []);
      setForm(nextForm);
      setIsAdmin(true);
      setLoading(false);
    };

    void hydrate();
    return () => {
      mounted = false;
    };
  }, [params?.id, router, supabaseReady, t.missing, t.noAccess, t.signIn]);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        id: category.id,
        label:
          category.category_translations?.find((item) => item.locale === locale)?.name ||
          category.category_translations?.find((item) => item.locale === "en")?.name ||
          category.category_translations?.[0]?.name ||
          category.slug,
      })),
    [categories, locale],
  );

  const handleFieldChange = (
    field: keyof Omit<FormState, "translations">,
    value: string | boolean,
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleTranslationChange = (
    localeKey: LocaleKey,
    field: keyof TranslationFields,
    value: string,
  ) => {
    setForm((current) => {
      const next = {
        ...current,
        translations: {
          ...current.translations,
          [localeKey]: {
            ...current.translations[localeKey],
            [field]: value,
          },
        },
      };
      if (localeKey === "en" && field === "name" && !current.slug.trim()) {
        next.slug = slugify(value);
      }
      return next;
    });
  };


  const handleProductImageChange = async (file: File | null) => {
    if (!file) return;
    setError("");
    setSuccess("");
    setUploadingImage(true);

    try {
      const upload = await uploadAdminImage({
        file,
        folder: "products",
        slug: form.slug || form.translations.en.name || form.sku || "product",
      });
      setForm((current) => ({ ...current, primaryImageUrl: upload.publicUrl }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : t.genericError);
    } finally {
      setUploadingImage(false);
    }
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.sku.trim()) {
      setError(t.skuRequired);
      return;
    }

    const finalSlug = form.slug.trim() || slugify(form.translations.en.name || form.sku);
    if (!finalSlug) {
      setError(t.slugRequired);
      return;
    }

    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) {
      setError(t.priceInvalid);
      return;
    }

    const compareAtPrice = form.compareAtPrice.trim() ? Number(form.compareAtPrice) : null;
    if (compareAtPrice !== null && (!Number.isFinite(compareAtPrice) || compareAtPrice <= 0)) {
      setError(t.compareInvalid);
      return;
    }

    const missingTranslation = locales.some((localeKey) => !form.translations[localeKey].name.trim());
    if (missingTranslation) {
      setError(t.missingTranslations);
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase
        .from("products")
        .update({
          category_id: form.categoryId || null,
          sku: form.sku.trim(),
          slug: finalSlug,
          brand: form.brand.trim() || null,
          currency: form.currency.trim().toUpperCase() || "EUR",
          price_cents: Math.round(price * 100),
          compare_at_price_cents: compareAtPrice === null ? null : Math.round(compareAtPrice * 100),
          stock_quantity: Math.max(0, Number.parseInt(form.stockQuantity || "0", 10) || 0),
          track_inventory: form.trackInventory,
          is_active: form.isActive,
          is_featured: form.isFeatured,
          primary_image_url: form.primaryImageUrl.trim() || null,
        })
        .eq("id", params.id);

      if (updateError) {
        setError(updateError.message || t.genericError);
        return;
      }

      const { error: translationError } = await supabase
        .from("product_translations")
        .upsert(
          locales.map((localeKey) => ({
            product_id: params.id,
            locale: localeKey,
            name: form.translations[localeKey].name.trim(),
            short_description: form.translations[localeKey].shortDescription.trim() || null,
            description: form.translations[localeKey].description.trim() || null,
          })),
          { onConflict: "product_id,locale" },
        );

      if (translationError) {
        setError(translationError.message || t.genericError);
        return;
      }

      setSuccess(t.success);
    } catch {
      setError(t.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell topLabel={t.top} supportLabel={t.support} title={t.title} description={t.description}>
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
              <h2 className="font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">
                {t.denied}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/panel-x9k2m4q7r2a/products"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-5 text-sm font-medium text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/25"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.back}
            </Link>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#efe6dd] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{t.title}</p>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">
                  {form.translations[locale].name || form.sku || t.title}
                </h2>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--accent)]/15 text-[color:var(--headline)]">
                <PencilLine className="h-6 w-6" />
              </div>
            </div>

            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            {success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

            <section className="space-y-4">
              <div className="text-sm font-semibold text-[color:var(--headline)]">{t.baseInfo}</div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                  <span>{t.sku}</span>
                  <input value={form.sku} onChange={(event) => handleFieldChange("sku", event.target.value)} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]" />
                </label>
                <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                  <span>{t.slug}</span>
                  <input value={form.slug} onChange={(event) => handleFieldChange("slug", slugify(event.target.value))} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]" />
                </label>
                <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                  <span>{t.brand}</span>
                  <input value={form.brand} onChange={(event) => handleFieldChange("brand", event.target.value)} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]" />
                </label>
                <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                  <span>{t.category}</span>
                  <select value={form.categoryId} onChange={(event) => handleFieldChange("categoryId", event.target.value)} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]">
                    <option value="">{t.noCategory}</option>
                    {categoryOptions.map((category) => (
                      <option key={category.id} value={category.id}>{category.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className="space-y-4">
              <div className="text-sm font-semibold text-[color:var(--headline)]">{t.commercial}</div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                  <span>{t.currency}</span>
                  <input value={form.currency} maxLength={3} onChange={(event) => handleFieldChange("currency", event.target.value.toUpperCase())} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]" />
                </label>
                <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                  <span>{t.price}</span>
                  <input type="number" min="0" step="0.01" value={form.price} onChange={(event) => handleFieldChange("price", event.target.value)} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]" />
                </label>
                <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                  <span>{t.compareAtPrice}</span>
                  <input type="number" min="0" step="0.01" value={form.compareAtPrice} onChange={(event) => handleFieldChange("compareAtPrice", event.target.value)} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]" />
                </label>
                <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                  <span>{t.stock}</span>
                  <input type="number" min="0" step="1" value={form.stockQuantity} onChange={(event) => handleFieldChange("stockQuantity", event.target.value)} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]" />
                </label>
                <div className="space-y-2 text-sm font-medium text-[color:var(--headline)] md:col-span-2 xl:col-span-2">
                  <span>{t.image}</span>
                  <div className="rounded-2xl border border-[#ece3d9] bg-[#fffcf7] p-4">
                    <input type="file" accept="image/*" onChange={(event) => void handleProductImageChange(event.target.files?.[0] ?? null)} className="block w-full text-sm text-[color:var(--muted)] file:mr-4 file:rounded-xl file:border-0 file:bg-[color:var(--accent)] file:px-4 file:py-2 file:font-medium file:text-[#203153]" />
                    {uploadingImage ? <p className="mt-3 text-sm text-[color:var(--muted)]">{t.uploading}</p> : null}
                    {form.primaryImageUrl ? (
                      <div className="mt-4 overflow-hidden rounded-2xl border border-[#ece3d9] bg-white">
                        <img src={form.primaryImageUrl} alt="Product preview" className="h-48 w-full object-cover" />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <label className="flex items-center gap-3 rounded-2xl border border-[#ece3d9] bg-[#fffcf7] px-4 py-3 text-sm font-medium text-[color:var(--headline)]">
                  <input type="checkbox" checked={form.trackInventory} onChange={(event) => handleFieldChange("trackInventory", event.target.checked)} className="accent-[color:var(--accent)]" />
                  <span>{t.trackInventory}</span>
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-[#ece3d9] bg-[#fffcf7] px-4 py-3 text-sm font-medium text-[color:var(--headline)]">
                  <input type="checkbox" checked={form.isActive} onChange={(event) => handleFieldChange("isActive", event.target.checked)} className="accent-[color:var(--accent)]" />
                  <span>{t.visible}</span>
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-[#ece3d9] bg-[#fffcf7] px-4 py-3 text-sm font-medium text-[color:var(--headline)]">
                  <input type="checkbox" checked={form.isFeatured} onChange={(event) => handleFieldChange("isFeatured", event.target.checked)} className="accent-[color:var(--accent)]" />
                  <span>{t.featured}</span>
                </label>
              </div>
            </section>

            <section className="space-y-4">
              <div className="text-sm font-semibold text-[color:var(--headline)]">{t.translations}</div>
              <div className="grid gap-4 xl:grid-cols-2">
                {locales.map((localeKey) => (
                  <div key={localeKey} className="space-y-3 rounded-[1.4rem] border border-[#ece3d9] bg-[#fffcf7] p-4">
                    <p className="text-sm font-semibold text-[color:var(--headline)]">{labels[localeKey]}</p>
                    <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                      <span>{t.productName}</span>
                      <input value={form.translations[localeKey].name} onChange={(event) => handleTranslationChange(localeKey, "name", event.target.value)} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-white px-4 outline-none transition focus:border-[color:var(--accent)]" />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                      <span>{t.shortDescription}</span>
                      <input value={form.translations[localeKey].shortDescription} onChange={(event) => handleTranslationChange(localeKey, "shortDescription", event.target.value)} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-white px-4 outline-none transition focus:border-[color:var(--accent)]" />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                      <span>{t.fullDescription}</span>
                      <textarea value={form.translations[localeKey].description} onChange={(event) => handleTranslationChange(localeKey, "description", event.target.value)} rows={5} className="w-full rounded-xl border border-[#ece3d9] bg-white px-4 py-3 outline-none transition focus:border-[color:var(--accent)]" />
                    </label>
                  </div>
                ))}
              </div>
            </section>

            <button type="submit" disabled={submitting} className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[color:var(--accent)] px-6 text-sm font-medium text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)] transition hover:bg-[#efbf3e] disabled:cursor-not-allowed disabled:opacity-70">
              {submitting ? t.saving : t.save}
            </button>
          </form>
        </div>
      )}
    </AdminShell>
  );
}




