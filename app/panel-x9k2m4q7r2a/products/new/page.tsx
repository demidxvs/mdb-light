
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  LoaderCircle,
  PackagePlus,
  ShieldAlert,
} from "lucide-react";
import { AdminShell } from "@/components/ui/admin-shell";
import { useLocale } from "@/components/ui/locale-provider";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase-client";

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
    support: "Contact",
    title: "Add product",
    description:
      "Create a new catalog item, fill all 4 translations, and publish it to the storefront.",
    loading: "Checking admin access...",
    denied: "Admin access required",
    noAccess: "You do not have access to this page.",
    signIn: "Sign in first to open the admin panel.",
    help: "Add your user id to public.admins in Supabase, then reopen this page.",
    back: "Back to account",
    createEyebrow: "Create product",
    createTitle:
      "Fill the base product data and all 4 translations before publishing to the catalog.",
    success: "Product created successfully.",
    genericError: "Could not create product. Check your fields and try again.",
    translationError: "Could not create product translations.",
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
    image: "Primary image URL",
    trackInventory: "Track inventory",
    visible: "Visible in storefront",
    featured: "Featured on homepage",
    translations: "Translations",
    productName: "Product name",
    shortDescription: "Short description",
    fullDescription: "Full description",
    save: "Save product",
    saving: "Saving product...",
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
    support: "Контакты",
    title: "Добавить товар",
    description:
      "Создайте новую позицию каталога, заполните все 4 перевода и опубликуйте товар на витрине.",
    loading: "Проверяю права администратора...",
    denied: "Требуется доступ администратора",
    noAccess: "У вас нет доступа к этой странице.",
    signIn: "Сначала войдите, чтобы открыть админку.",
    help: "Добавьте свой user id в public.admins в Supabase, затем откройте эту страницу снова.",
    back: "Назад в аккаунт",
    createEyebrow: "Создание товара",
    createTitle:
      "Заполните базовые данные товара и все 4 перевода перед публикацией в каталоге.",
    success: "Товар успешно создан.",
    genericError: "Не удалось создать товар. Проверьте поля и попробуйте снова.",
    translationError: "Не удалось сохранить переводы товара.",
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
    image: "URL главного изображения",
    trackInventory: "Отслеживать остатки",
    visible: "Показывать на витрине",
    featured: "Показывать на главной",
    translations: "Переводы",
    productName: "Название товара",
    shortDescription: "Короткое описание",
    fullDescription: "Полное описание",
    save: "Сохранить товар",
    saving: "Сохраняю товар...",
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
    support: "Επικοινωνία",
    title: "Προσθήκη προϊόντος",
    description:
      "Δημιουργήστε νέο προϊόν καταλόγου, συμπληρώστε και τις 4 μεταφράσεις και δημοσιεύστε το στη βιτρίνα.",
    loading: "Έλεγχος δικαιωμάτων διαχειριστή...",
    denied: "Απαιτείται πρόσβαση διαχειριστή",
    noAccess: "Δεν έχετε πρόσβαση σε αυτή τη σελίδα.",
    signIn: "Συνδεθείτε πρώτα για να ανοίξετε το admin panel.",
    help: "Προσθέστε το user id σας στο public.admins στο Supabase και ανοίξτε ξανά αυτή τη σελίδα.",
    back: "Πίσω στον λογαριασμό",
    createEyebrow: "Δημιουργία προϊόντος",
    createTitle:
      "Συμπληρώστε τα βασικά στοιχεία του προϊόντος και τις 4 μεταφράσεις πριν από τη δημοσίευση στον κατάλογο.",
    success: "Το προϊόν δημιουργήθηκε με επιτυχία.",
    genericError: "Δεν ήταν δυνατή η δημιουργία του προϊόντος. Ελέγξτε τα πεδία και δοκιμάστε ξανά.",
    translationError: "Δεν ήταν δυνατή η αποθήκευση των μεταφράσεων του προϊόντος.",
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
    image: "URL κύριας εικόνας",
    trackInventory: "Παρακολούθηση αποθέματος",
    visible: "Ορατό στη βιτρίνα",
    featured: "Εμφάνιση στην αρχική",
    translations: "Μεταφράσεις",
    productName: "Όνομα προϊόντος",
    shortDescription: "Σύντομη περιγραφή",
    fullDescription: "Πλήρης περιγραφή",
    save: "Αποθήκευση προϊόντος",
    saving: "Αποθήκευση προϊόντος...",
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
    support: "Kontakti",
    title: "Pievienot produktu",
    description:
      "Izveidojiet jaunu kataloga ierakstu, aizpildiet visus 4 tulkojumus un publicējiet produktu vitrīnā.",
    loading: "Tiek pārbaudītas administratora tiesības...",
    denied: "Nepieciešama administratora piekļuve",
    noAccess: "Jums nav piekļuves šai lapai.",
    signIn: "Lai atvērtu admin paneli, vispirms pieslēdzieties.",
    help: "Pievienojiet savu user id tabulai public.admins Supabase vidē un atveriet šo lapu vēlreiz.",
    back: "Atpakaļ uz kontu",
    createEyebrow: "Produkta izveide",
    createTitle:
      "Pirms publicēšanas katalogā aizpildiet produkta pamata datus un visus 4 tulkojumus.",
    success: "Produkts veiksmīgi izveidots.",
    genericError: "Neizdevās izveidot produktu. Pārbaudiet laukus un mēģiniet vēlreiz.",
    translationError: "Neizdevās saglabāt produkta tulkojumus.",
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
    image: "Galvenā attēla URL",
    trackInventory: "Sekot atlikumam",
    visible: "Rādīt vitrīnā",
    featured: "Rādīt sākumlapā",
    translations: "Tulkojumi",
    productName: "Produkta nosaukums",
    shortDescription: "Īss apraksts",
    fullDescription: "Pilns apraksts",
    save: "Saglabāt produktu",
    saving: "Saglabā produktu...",
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
  const supabaseReady = useMemo(() => isSupabaseConfigured(), []);
  const [loading, setLoading] = useState(supabaseReady);
  const [submitting, setSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(
    supabaseReady ? "" : "Supabase is not configured.",
  );
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState("");
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [form, setForm] = useState<FormState>(createInitialForm());

  const loadDashboard = async (nextUserId?: string) => {
    const supabase = createSupabaseBrowserClient();
    const [{ data: categoryData }, { data: productData }] = await Promise.all([
      supabase
        .from("categories")
        .select("id, slug, category_translations(locale, name)")
        .order("sort_order", { ascending: true }),
      supabase
        .from("products")
        .select(
          "id, sku, slug, price_cents, stock_quantity, is_active, is_featured, created_at, product_translations(locale, name)",
        )
        .order("created_at", { ascending: false })
        .limit(12),
    ]);

    setCategories((categoryData as CategoryRow[] | null) ?? []);
    setProducts((productData as ProductRow[] | null) ?? []);
    if (nextUserId) setUserId(nextUserId);
  };

  useEffect(() => {
    if (!supabaseReady) return;
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
        router.replace("/login");
        return;
      }
      const { data: adminRow, error: adminError } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!mounted) return;
      if (adminError) {
        setError(adminError.message);
        setLoading(false);
        return;
      }
      if (!adminRow) {
        setError(t.noAccess);
        setLoading(false);
        return;
      }
      setIsAdmin(true);
      setError("");
      await loadDashboard(user.id);
      if (!mounted) return;
      setLoading(false);
    };

    void hydrate();
    return () => {
      mounted = false;
    };
  }, [router, supabaseReady, t.noAccess, t.signIn]);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        id: category.id,
        label:
          category.category_translations?.find((item) => item.locale === locale)
            ?.name ||
          category.category_translations?.find((item) => item.locale === "en")
            ?.name ||
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

    const compareAtPrice = form.compareAtPrice.trim()
      ? Number(form.compareAtPrice)
      : null;
    if (
      compareAtPrice !== null &&
      (!Number.isFinite(compareAtPrice) || compareAtPrice <= 0)
    ) {
      setError(t.compareInvalid);
      return;
    }

    const missingTranslation = locales.some(
      (localeKey) => !form.translations[localeKey].name.trim(),
    );
    if (missingTranslation) {
      setError(t.missingTranslations);
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          category_id: form.categoryId || null,
          sku: form.sku.trim(),
          slug: finalSlug,
          brand: form.brand.trim() || null,
          currency: form.currency.trim().toUpperCase() || "EUR",
          price_cents: Math.round(price * 100),
          compare_at_price_cents:
            compareAtPrice === null ? null : Math.round(compareAtPrice * 100),
          stock_quantity:
            Math.max(0, Number.parseInt(form.stockQuantity || "0", 10) || 0),
          track_inventory: form.trackInventory,
          is_active: form.isActive,
          is_featured: form.isFeatured,
          primary_image_url: form.primaryImageUrl.trim() || null,
          created_by: userId || null,
          updated_by: userId || null,
        })
        .select("id")
        .single();

      if (productError || !product) {
        setError(productError?.message || t.genericError);
        return;
      }

      const { error: translationError } = await supabase
        .from("product_translations")
        .insert(
          locales.map((localeKey) => ({
            product_id: product.id,
            locale: localeKey,
            name: form.translations[localeKey].name.trim(),
            short_description:
              form.translations[localeKey].shortDescription.trim() || null,
            description: form.translations[localeKey].description.trim() || null,
          })),
        );

      if (translationError) {
        setError(translationError.message || t.translationError);
        return;
      }

      setSuccess(t.success);
      setForm(createInitialForm());
      await loadDashboard();
    } catch {
      setError(t.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell
      topLabel={t.top}
      supportLabel={t.support}
      title={t.title}
      description={t.description}
    >
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
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
                {error || t.noAccess}
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                {t.help}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/account")}
                  className="inline-flex h-11 items-center rounded-xl bg-[color:var(--accent)] px-5 text-sm font-medium text-[#203153]"
                >
                  {t.back}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#efe6dd] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">
                  {t.createEyebrow}
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">
                  {t.createTitle}
                </h2>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--accent)]/15 text-[color:var(--headline)]">
                <PackagePlus className="h-6 w-6" />
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            {success ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            ) : null}

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--headline)]">
                {t.baseInfo}
              </div>
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
              <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--headline)]">
                {t.commercial}
              </div>
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
                <label className="space-y-2 text-sm font-medium text-[color:var(--headline)] md:col-span-2 xl:col-span-2">
                  <span>{t.image}</span>
                  <input value={form.primaryImageUrl} onChange={(event) => handleFieldChange("primaryImageUrl", event.target.value)} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]" />
                </label>
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
              <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--headline)]">
                {t.translations}
              </div>
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

            <button type="submit" disabled={submitting} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-6 text-sm font-medium text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)] transition hover:bg-[#efbf3e] disabled:cursor-not-allowed disabled:opacity-70">
              {submitting ? t.saving : t.save}
              <ArrowRight className="h-4 w-4" />
            </button>
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
                  const localizedName = product.product_translations?.find((item) => item.locale === locale)?.name || product.product_translations?.find((item) => item.locale === "en")?.name || product.product_translations?.[0]?.name || product.slug;
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




