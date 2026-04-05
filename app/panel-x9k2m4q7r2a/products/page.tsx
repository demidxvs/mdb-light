"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  LoaderCircle,
  PencilLine,
  Search,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { AdminShell } from "@/components/ui/admin-shell";
import { useLocale } from "@/components/ui/locale-provider";
import { isAdminSupabaseConfigured } from "@/lib/admin-supabase-client";
import { localizePathname } from "@/i18n/config";

type LocaleKey = "en" | "ru" | "el" | "lv";
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

const copy = {
  en: {
    top: "Protected products management area",
    support: "Contact",
    title: "Products",
    description:
      "This section shows your catalog items. Open a separate product page to add or edit listings stored in the database.",
    loading: "Loading products...",
    denied: "Admin access required",
    signIn: "Sign in first to open the admin panel.",
    noAccess: "You do not have access to this page.",
    back: "Back to dashboard",
    add: "Add product",
    product: "Product",
    sku: "SKU",
    price: "Price",
    stock: "Stock",
    status: "Status",
    created: "Created",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    deleting: "Deleting...",
    confirmDelete: "Delete this product?",
    deleteError: "Could not delete the product.",
    empty: "No products yet. Use Add product to create the first item.",
    search: "Search by product name or SKU",
    noSearchResults: "No products match your search.",
    active: "Active",
    draft: "Draft",
  },
  ru: {
    top: "Защищенная зона управления товарами",
    support: "Контакты",
    title: "Товары",
    description:
      "Здесь отображаются позиции каталога. Откройте отдельную страницу товара, чтобы добавить или отредактировать объявление из базы данных.",
    loading: "Загружаю товары...",
    denied: "Требуется доступ администратора",
    signIn: "Сначала войдите, чтобы открыть админку.",
    noAccess: "У вас нет доступа к этой странице.",
    back: "Назад к дэшборду",
    add: "Добавить товар",
    product: "Товар",
    sku: "SKU",
    price: "Цена",
    stock: "Остаток",
    status: "Статус",
    created: "Создан",
    actions: "Действия",
    edit: "Редактировать",
    delete: "Удалить",
    deleting: "Удаляю...",
    confirmDelete: "Удалить этот товар?",
    deleteError: "Не удалось удалить товар.",
    empty: "Товаров пока нет. Используйте кнопку добавления, чтобы создать первую позицию.",
    search: "Поиск по названию товара или SKU",
    noSearchResults: "По вашему запросу товары не найдены.",
    active: "Активен",
    draft: "Черновик",
  },
  el: {
    top: "Προστατευμένη διαχείριση προϊόντων",
    support: "Επικοινωνία",
    title: "Προϊόντα",
    description:
      "Αυτή η ενότητα εμφανίζει τα προϊόντα του καταλόγου. Ανοίξτε ξεχωριστή σελίδα προϊόντος για να προσθέσετε ή να επεξεργαστείτε καταχωρήσεις από τη βάση δεδομένων.",
    loading: "Φόρτωση προϊόντων...",
    denied: "Απαιτείται πρόσβαση διαχειριστή",
    signIn: "Συνδεθείτε πρώτα για να ανοίξετε το admin panel.",
    noAccess: "Δεν έχετε πρόσβαση σε αυτή τη σελίδα.",
    back: "Πίσω στο dashboard",
    add: "Προσθήκη προϊόντος",
    product: "Προϊόν",
    sku: "SKU",
    price: "Τιμή",
    stock: "Απόθεμα",
    status: "Κατάσταση",
    created: "Δημιουργήθηκε",
    actions: "Ενέργειες",
    edit: "Επεξεργασία",
    delete: "Διαγραφή",
    deleting: "Διαγραφή...",
    confirmDelete: "Να διαγραφεί αυτό το προϊόν;",
    deleteError: "Δεν ήταν δυνατή η διαγραφή του προϊόντος.",
    empty: "Δεν υπάρχουν ακόμη προϊόντα. Χρησιμοποιήστε το κουμπί προσθήκης για να δημιουργήσετε το πρώτο.",
    search: "Αναζήτηση με όνομα προϊόντος ή SKU",
    noSearchResults: "Δεν βρέθηκαν προϊόντα για αυτή την αναζήτηση.",
    active: "Ενεργό",
    draft: "Πρόχειρο",
  },
  lv: {
    top: "Aizsargāta produktu pārvaldība",
    support: "Kontakti",
    title: "Produkti",
    description:
      "Šajā sadaļā redzami kataloga produkti. Atveriet atsevišķu produkta lapu, lai pievienotu vai rediģētu sludinājumus, kas glabājas datubāzē.",
    loading: "Ielādē produktus...",
    denied: "Nepieciešama administratora piekļuve",
    signIn: "Lai atvērtu admin paneli, vispirms pieslēdzieties.",
    noAccess: "Jums nav piekļuves šai lapai.",
    back: "Atpakaļ uz paneli",
    add: "Pievienot produktu",
    product: "Produkts",
    sku: "SKU",
    price: "Cena",
    stock: "Atlikums",
    status: "Statuss",
    created: "Izveidots",
    actions: "Darbības",
    edit: "Rediģēt",
    delete: "Dzēst",
    deleting: "Dzēš...",
    confirmDelete: "Dzēst šo produktu?",
    deleteError: "Neizdevās dzēst produktu.",
    empty: "Produktu vēl nav. Izmantojiet pievienošanas pogu, lai izveidotu pirmo ierakstu.",
    search: "Meklēt pēc produkta nosaukuma vai SKU",
    noSearchResults: "Šim meklējumam produkti netika atrasti.",
    active: "Aktīvs",
    draft: "Melnraksts",
  },
} as const;

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

export default function AdminProductsPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = copy[locale];
  const supabaseReady = useMemo(() => isAdminSupabaseConfigured(), []);
  const [loading, setLoading] = useState(supabaseReady);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(
    supabaseReady ? "" : "Supabase is not configured.",
  );
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!supabaseReady) return;
    let mounted = true;

    const hydrate = async () => {
      const response = await fetch("/api/admin/products", {
        credentials: "include",
      });

      if (!mounted) return;
      if (response.status === 401) {
        setError(t.signIn);
        setLoading(false);
        router.replace(localizePathname("/panel-x9k2m4q7r2a/login", locale));
        return;
      }

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        products?: ProductRow[];
      };

      if (!response.ok) {
        setError(payload.error || t.noAccess);
        setLoading(false);
        return;
      }

      if (!mounted) return;
      setIsAdmin(true);
      setProducts(payload.products ?? []);
      setLoading(false);
    };

    void hydrate();
    return () => {
      mounted = false;
    };
  }, [locale, router, supabaseReady, t.noAccess, t.signIn]);

  const handleDelete = async (productId: string) => {
    if (!window.confirm(t.confirmDelete)) return;

    setError("");
    setDeletingId(productId);

    try {
      const response = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id: productId }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (response.status === 401) {
        router.replace(localizePathname("/panel-x9k2m4q7r2a/login", locale));
        return;
      }

      if (!response.ok) {
        setError(payload.error || t.deleteError);
        return;
      }

      setProducts((current) => current.filter((product) => product.id !== productId));
    } catch {
      setError(t.deleteError);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return products;

    return products.filter((product) => {
      const localizedName =
        product.product_translations?.find((item) => item.locale === locale)?.name ||
        product.product_translations?.find((item) => item.locale === "en")?.name ||
        product.product_translations?.[0]?.name ||
        product.slug;

      return [localizedName, product.sku, product.slug]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [locale, products, query]);

  return (
    <AdminShell
      topLabel={t.top}
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
                {error}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Link
              href={localizePathname("/panel-x9k2m4q7r2a", locale)}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-5 text-sm font-medium text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/25"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.back}
            </Link>
            <Link
              href={localizePathname("/panel-x9k2m4q7r2a/products/new", locale)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 text-sm font-medium text-[#203153] shadow-[0_12px_28px_rgba(244,198,79,0.28)]"
            >
              <Plus className="h-4 w-4" />
              {t.add}
            </Link>
          </div>

          <section className="rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#ece3d9] bg-[#fffcf7] px-4 py-3">
              <Search className="h-4 w-4 text-[color:var(--muted)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.search}
                className="w-full bg-transparent text-sm outline-none placeholder:text-[color:var(--muted)]"
              />
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#ece3d9]">
              <table className="min-w-full divide-y divide-[#efe6dd] text-sm">
                <thead className="bg-[#fffcf7] text-left text-[color:var(--muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">{t.product}</th>
                    <th className="px-4 py-3 font-medium">{t.sku}</th>
                    <th className="px-4 py-3 font-medium">{t.price}</th>
                    <th className="px-4 py-3 font-medium">{t.stock}</th>
                    <th className="px-4 py-3 font-medium">{t.status}</th>
                    <th className="px-4 py-3 font-medium">{t.created}</th>
                    <th className="px-4 py-3 font-medium">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f4ece3] bg-white text-[color:var(--headline)]">
                  {products.length === 0 ? (
                    <tr>
                      <td className="px-4 py-5 text-[color:var(--muted)]" colSpan={7}>
                        {t.empty}
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td className="px-4 py-5 text-[color:var(--muted)]" colSpan={7}>
                        {t.noSearchResults}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const localizedName =
                        product.product_translations?.find(
                          (item) => item.locale === locale,
                        )?.name ||
                        product.product_translations?.find(
                          (item) => item.locale === "en",
                        )?.name ||
                        product.product_translations?.[0]?.name ||
                        product.slug;

                      return (
                        <tr key={product.id}>
                          <td className="px-4 py-4 font-medium">{localizedName}</td>
                          <td className="px-4 py-4 text-[color:var(--muted)]">
                            {product.sku}
                          </td>
                          <td className="px-4 py-4 text-[color:var(--muted)]">
                            {formatMoney(product.price_cents, "EUR")}
                          </td>
                          <td className="px-4 py-4 text-[color:var(--muted)]">
                            {product.stock_quantity}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${product.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                            >
                              {product.is_active ? t.active : t.draft}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-[color:var(--muted)]">
                            {formatDate(product.created_at)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <Link
                                href={localizePathname(`/panel-x9k2m4q7r2a/products/${product.id}`, locale)}
                                className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-3 text-sm font-medium text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/25"
                              >
                                <PencilLine className="h-4 w-4" />
                                {t.edit}
                              </Link>
                              <button
                                type="button"
                                onClick={() => void handleDelete(product.id)}
                                disabled={deletingId === product.id}
                                className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Trash2 className="h-4 w-4" />
                                {deletingId === product.id ? t.deleting : t.delete}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  );
}
