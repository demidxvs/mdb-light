"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, Search, ShieldAlert, ShoppingCart } from "lucide-react";
import { AdminShell } from "@/components/ui/admin-shell";
import { useLocale } from "@/components/ui/locale-provider";
import { isAdminSupabaseConfigured } from "@/lib/admin-supabase-client";
import { localizePathname } from "@/i18n/config";

type CartRow = {
  id: string;
  user_id: string;
  status: string;
  currency: string;
  discount_cents: number;
  created_at: string;
  profiles?: {
    email: string | null;
    full_name: string | null;
  } | null;
  cart_items?: Array<{
    id: string;
    quantity: number;
    unit_price_cents: number;
    selected_color?: string | null;
    selected_length?: string | null;
    selected_material?: string | null;
    selected_options?: Record<string, string> | null;
    product_snapshot: {
      name?: string;
      sku?: string;
      selected_color?: string | null;
      selected_length?: string | null;
      selected_material?: string | null;
      selected_options?: Record<string, string> | null;
    } | null;
  }>;
};

const copy = {
  en: {
    top: "Protected carts management area",
    title: "Carts",
    description: "Review active user carts and set a discount amount for each one.",
    loading: "Loading carts...",
    denied: "Admin access required",
    signIn: "Sign in first to open the admin panel.",
    noAccess: "You do not have access to this page.",
    back: "Back to dashboard",
    empty: "No carts yet.",
    customer: "Customer",
    items: "Items",
    subtotal: "Subtotal",
    discount: "Discount",
    total: "Total",
    save: "Save discount",
    saving: "Saving...",
    discountNotReady: "Discounts are not available yet in this database. Apply the latest carts migration in Supabase.",
    search: "Search carts and users",
    noResults: "No carts match your search.",
    color: "Color",
    length: "Length",
    material: "Material",
  },
  ru: {
    top: "Защищенная зона управления корзинами",
    title: "Корзины",
    description: "Просматривайте активные корзины пользователей и задавайте скидку для каждой.",
    loading: "Загружаю корзины...",
    denied: "Требуется доступ администратора",
    signIn: "Сначала войдите, чтобы открыть админку.",
    noAccess: "У вас нет доступа к этой странице.",
    back: "Назад к дэшборду",
    empty: "Корзин пока нет.",
    customer: "Покупатель",
    items: "Товары",
    subtotal: "Сумма",
    discount: "Скидка",
    total: "Итого",
    save: "Сохранить скидку",
    saving: "Сохраняю...",
    discountNotReady: "Скидки ещё не доступны в этой базе. Примените последнюю миграцию корзин в Supabase.",
    search: "Поиск корзин и пользователей",
    noResults: "По вашему запросу корзины не найдены.",
    color: "Цвет",
    length: "Длина",
    material: "Материал",
  },
  el: {
    top: "Προστατευμένη διαχείριση καλαθιών",
    title: "Καλάθια",
    description: "Δείτε τα ενεργά καλάθια χρηστών και ορίστε έκπτωση για το καθένα.",
    loading: "Φόρτωση καλαθιών...",
    denied: "Απαιτείται πρόσβαση διαχειριστή",
    signIn: "Συνδεθείτε πρώτα για να ανοίξετε το admin panel.",
    noAccess: "Δεν έχετε πρόσβαση σε αυτή τη σελίδα.",
    back: "Πίσω στο dashboard",
    empty: "Δεν υπάρχουν ακόμη καλάθια.",
    customer: "Πελάτης",
    items: "Προϊόντα",
    subtotal: "Υποσύνολο",
    discount: "Έκπτωση",
    total: "Σύνολο",
    save: "Αποθήκευση έκπτωσης",
    saving: "Αποθήκευση...",
    discountNotReady: "Οι εκπτώσεις δεν είναι ακόμη διαθέσιμες σε αυτή τη βάση. Εφαρμόστε το τελευταίο migration καλαθιών στο Supabase.",
    search: "Search carts and users",
    noResults: "No carts match your search.",
    color: "Χρώμα",
    length: "Μήκος",
    material: "Υλικό",
  },
  lv: {
    top: "Aizsargāta grozu pārvaldība",
    title: "Grozi",
    description: "Skatiet lietotāju aktīvos grozus un pievienojiet atlaidi katram no tiem.",
    loading: "Ielādē grozus...",
    denied: "Nepieciešama administratora piekļuve",
    signIn: "Lai atvērtu admin paneli, vispirms pieslēdzieties.",
    noAccess: "Jums nav piekļuves šai lapai.",
    back: "Atpakaļ uz paneli",
    empty: "Grozu vēl nav.",
    customer: "Pircējs",
    items: "Preces",
    subtotal: "Starpsumma",
    discount: "Atlaide",
    total: "Kopā",
    save: "Saglabāt atlaidi",
    saving: "Saglabā...",
    discountNotReady: "Atlaides šajā datubāzē vēl nav pieejamas. Pielietojiet jaunāko grozu migrāciju Supabase.",
    search: "Meklēt grozus un lietotājus",
    noResults: "Grozi pēc šī vaicājuma netika atrasti.",
    color: "Krāsa",
    length: "Garums",
    material: "Materiāls",
  },
} as const;

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "EUR",
  }).format(cents / 100);
}

export default function AdminCartsPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = copy[locale];
  const supabaseReady = useMemo(() => isAdminSupabaseConfigured(), []);
  const [loading, setLoading] = useState(supabaseReady);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(supabaseReady ? "" : "Supabase is not configured.");
  const [carts, setCarts] = useState<CartRow[]>([]);
  const [discounts, setDiscounts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const loadCarts = async () => {
    setError("");
    const response = await fetch("/api/admin/carts", {
      credentials: "include",
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      carts?: CartRow[];
    };

    if (response.status === 401) {
      router.replace(localizePathname("/panel-x9k2m4q7r2a/login", locale));
      return;
    }

    if (!response.ok) {
      setError(payload.error || t.noAccess);
      return;
    }

    const next = payload.carts ?? [];
    setCarts(next);
    setDiscounts(
      Object.fromEntries(
        next.map((cart) => [cart.id, String((cart.discount_cents ?? 0) / 100)]),
      ),
    );
  };

  useEffect(() => {
    if (!supabaseReady) return;
    let mounted = true;

    const hydrate = async () => {
      const response = await fetch("/api/admin/carts", {
        credentials: "include",
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        carts?: CartRow[];
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
      const next = payload.carts ?? [];
      setCarts(next);
      setDiscounts(
        Object.fromEntries(
          next.map((cart) => [cart.id, String((cart.discount_cents ?? 0) / 100)]),
        ),
      );
      if (mounted) {
        setLoading(false);
      }
    };

    void hydrate();
    return () => {
      mounted = false;
    };
  }, [locale, router, supabaseReady, t.noAccess, t.signIn]);

  const filteredCarts = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    const sorted = [...carts].sort((left, right) => {
      const leftCount = (left.cart_items ?? []).reduce((sum, item) => sum + item.quantity, 0);
      const rightCount = (right.cart_items ?? []).reduce((sum, item) => sum + item.quantity, 0);

      if (leftCount === 0 && rightCount > 0) return 1;
      if (leftCount > 0 && rightCount === 0) return -1;
      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
    });

    if (!normalized) return sorted;

    return sorted.filter((cart) => {
      const items = cart.cart_items ?? [];
      const itemText = items
        .map((item) => `${item.product_snapshot?.name || ""} ${item.product_snapshot?.sku || ""}`)
        .join(" ");

      return [
        cart.profiles?.full_name || "",
        cart.profiles?.email || "",
        cart.user_id,
        cart.id,
        itemText,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [carts, query]);

  const handleSaveDiscount = async (cart: CartRow) => {
    const value = Number(discounts[cart.id] ?? "0");
    if (!Number.isFinite(value) || value < 0) return;

    setSavingId(cart.id);
    setError("");
    const response = await fetch("/api/admin/carts", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: cart.id,
        discountCents: Math.round(value * 100),
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (response.status === 401) {
      router.replace(localizePathname("/panel-x9k2m4q7r2a/login", locale));
      setSavingId(null);
      return;
    }

    if (!response.ok) {
      if ((payload.error || "").includes("discount_cents")) {
        setError(t.discountNotReady);
      } else {
        setError(payload.error || t.discountNotReady);
      }
      setSavingId(null);
      return;
    }

    setCarts((current) =>
      current.map((item) =>
        item.id === cart.id
          ? { ...item, discount_cents: Math.round(value * 100) }
          : item,
      ),
    );
    await loadCarts();
    setSavingId(null);
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
          <Link href={localizePathname("/panel-x9k2m4q7r2a", locale)} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-5 text-sm font-medium text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/25">
            <ArrowLeft className="h-4 w-4" />
            {t.back}
          </Link>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex items-center gap-3 rounded-2xl border border-[#ece3d9] bg-white px-4 py-3 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
            <Search className="h-4 w-4 text-[color:var(--muted)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.search}
              className="w-full bg-transparent text-sm outline-none placeholder:text-[color:var(--muted)]"
            />
          </div>

          {carts.length === 0 ? (
            <div className="rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 text-sm text-[color:var(--muted)] shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
              {t.empty}
            </div>
          ) : filteredCarts.length === 0 ? (
            <div className="rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 text-sm text-[color:var(--muted)] shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
              {t.noResults}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCarts.map((cart) => {
                const items = cart.cart_items ?? [];
                const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
                const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price_cents, 0);
                const enteredDiscountValue = Number(discounts[cart.id] ?? "0");
                const previewDiscountCents =
                  Number.isFinite(enteredDiscountValue) && enteredDiscountValue >= 0
                    ? Math.round(enteredDiscountValue * 100)
                    : cart.discount_cents ?? 0;
                const discount = Math.min(previewDiscountCents, subtotal);
                const total = Math.max(subtotal - discount, 0);

                return (
                  <article key={cart.id} className="rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--accent)]/15 text-[color:var(--headline)]">
                            <ShoppingCart className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[color:var(--headline)]">{cart.profiles?.full_name || cart.profiles?.email || cart.user_id}</p>
                            <p className="text-xs text-[color:var(--muted)]">{cart.profiles?.email || cart.user_id}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3 text-sm">
                          <span className="rounded-full border border-[#ece3d9] bg-[#fffcf7] px-3 py-1 text-[color:var(--headline)]">{t.items}: {itemCount}</span>
                          <span className="rounded-full border border-[#ece3d9] bg-[#fffcf7] px-3 py-1 text-[color:var(--headline)]">{t.subtotal}: {formatMoney(subtotal, cart.currency)}</span>
                          <span className="rounded-full border border-[#ece3d9] bg-[#fffcf7] px-3 py-1 text-[color:var(--headline)]">{t.total}: {formatMoney(total, cart.currency)}</span>
                        </div>
                      </div>

                      <div className="w-full max-w-sm space-y-2">
                        <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                          <span>{t.discount}</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={discounts[cart.id] ?? "0"}
                            onChange={(event) => setDiscounts((current) => ({ ...current, [cart.id]: event.target.value }))}
                            className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => void handleSaveDiscount(cart)}
                          disabled={savingId === cart.id}
                          className="inline-flex h-11 items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 text-sm font-medium text-[#203153] shadow-[0_12px_28px_rgba(244,198,79,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {savingId === cart.id ? t.saving : t.save}
                        </button>
                      </div>
                    </div>

                    {items.length > 0 ? (
                      <div className="mt-5 space-y-2 rounded-2xl border border-[#ece3d9] bg-[#fffcf7] p-4">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-[color:var(--headline)]">{item.product_snapshot?.name || item.product_snapshot?.sku || item.id}</p>
                              {item.product_snapshot?.sku ? <p className="text-xs text-[color:var(--muted)]">{item.product_snapshot.sku}</p> : null}
                              {(item.selected_color || item.product_snapshot?.selected_color) ? (
                                <p className="text-xs text-[color:var(--muted)]">
                                  {t.color}: {item.selected_color || item.product_snapshot?.selected_color}
                                </p>
                              ) : null}
                              {(item.selected_length || item.product_snapshot?.selected_length) ? (
                                <p className="text-xs text-[color:var(--muted)]">
                                  {t.length}: {item.selected_length || item.product_snapshot?.selected_length}
                                </p>
                              ) : null}
                              {(item.selected_material || item.product_snapshot?.selected_material) ? (
                                <p className="text-xs text-[color:var(--muted)]">
                                  {t.material}: {item.selected_material || item.product_snapshot?.selected_material}
                                </p>
                              ) : null}
                              {Object.entries(item.product_snapshot?.selected_options ?? {}).map(([key, value]) => (
                                <p key={key} className="text-xs text-[color:var(--muted)]">
                                  {key}: {value}
                                </p>
                              ))}
                            </div>
                            <div className="shrink-0 text-[color:var(--muted)]">
                              {item.quantity} × {formatMoney(item.unit_price_cents, cart.currency)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
