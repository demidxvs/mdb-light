"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { useLocale } from "@/components/ui/locale-provider";
import { localizePathname } from "@/i18n/config";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-client";
import { getCurrentUserId, getOrCreateActiveCart } from "@/lib/cart";
import { getDeliveryCopy, type OrderPaymentMethod } from "@/lib/order-utils";

type CartItemRow = {
  id: string;
  product_id: string;
  quantity: number;
  unit_price_cents: number;
  currency: string;
  product_snapshot: {
    name?: string;
    sku?: string;
  } | null;
};

type CartRow = {
  currency: string;
  discount_cents: number;
};

const copy = {
  en: {
    title: "Checkout",
    description: "Choose the payment method and confirm your order.",
    loading: "Loading checkout...",
    paymentMethod: "Payment method",
    stripe: "Card payment",
    bankTransfer: "Bank transfer",
    placeOrder: "Place order",
    payCard: "Pay by card",
    processing: "Processing...",
    backToCart: "Back to cart",
    summary: "Order summary",
    subtotal: "Subtotal",
    discount: "Discount",
    total: "Total",
    error: "Could not create the order.",
    empty: "Your cart is empty.",
  },
  ru: {
    title: "Оформление заказа",
    description: "Выберите способ оплаты и подтвердите заказ.",
    loading: "Загружаем checkout...",
    paymentMethod: "Способ оплаты",
    stripe: "Оплата картой",
    bankTransfer: "Оплата переводом",
    placeOrder: "Оформить заказ",
    payCard: "Оплатить картой",
    processing: "Обрабатываем...",
    backToCart: "Назад в корзину",
    summary: "Состав заказа",
    subtotal: "Сумма",
    discount: "Скидка",
    total: "Итого",
    error: "Не удалось создать заказ.",
    empty: "Корзина пуста.",
  },
  el: {
    title: "Checkout",
    description: "Επιλέξτε τρόπο πληρωμής και επιβεβαιώστε την παραγγελία σας.",
    loading: "Φόρτωση checkout...",
    paymentMethod: "Τρόπος πληρωμής",
    stripe: "Πληρωμή με κάρτα",
    bankTransfer: "Τραπεζική μεταφορά",
    placeOrder: "Καταχώρηση παραγγελίας",
    payCard: "Πληρωμή με κάρτα",
    processing: "Επεξεργασία...",
    backToCart: "Πίσω στο καλάθι",
    summary: "Σύνοψη παραγγελίας",
    subtotal: "Υποσύνολο",
    discount: "Έκπτωση",
    total: "Σύνολο",
    error: "Δεν ήταν δυνατή η δημιουργία της παραγγελίας.",
    empty: "Το καλάθι είναι άδειο.",
  },
  lv: {
    title: "Checkout",
    description: "Izvēlieties apmaksas veidu un apstipriniet pasūtījumu.",
    loading: "Ielādē checkout...",
    paymentMethod: "Apmaksas veids",
    stripe: "Apmaksa ar karti",
    bankTransfer: "Bankas pārskaitījums",
    placeOrder: "Noformēt pasūtījumu",
    payCard: "Apmaksāt ar karti",
    processing: "Apstrādājam...",
    backToCart: "Atpakaļ uz grozu",
    summary: "Pasūtījuma kopsavilkums",
    subtotal: "Starpsumma",
    discount: "Atlaide",
    total: "Kopā",
    error: "Neizdevās izveidot pasūtījumu.",
    empty: "Grozs ir tukšs.",
  },
} as const;

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "EUR",
  }).format(cents / 100);
}

export default function CheckoutPage() {
  const { locale } = useLocale();
  const t = copy[locale];
  const deliveryCopy = getDeliveryCopy(locale);
  const supabaseReady = useMemo(() => isSupabaseConfigured(), []);
  const [loading, setLoading] = useState(supabaseReady);
  const [cart, setCart] = useState<CartRow | null>(null);
  const [items, setItems] = useState<CartItemRow[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>("stripe");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabaseReady) return;
    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    const load = async () => {
      try {
        const userId = await getCurrentUserId(supabase);
        if (!mounted) return;

        if (!userId) {
          window.location.href = localizePathname("/login", locale);
          return;
        }

        const activeCart = await getOrCreateActiveCart(supabase, userId);
        const { data: itemRows, error: itemError } = await supabase
          .from("cart_items")
          .select("id, product_id, quantity, unit_price_cents, currency, product_snapshot")
          .eq("cart_id", activeCart.id)
          .order("created_at", { ascending: true });

        if (itemError) {
          throw itemError;
        }

        if (!mounted) return;
        setCart({
          currency: activeCart.currency,
          discount_cents: activeCart.discount_cents ?? 0,
        });
        setItems((itemRows as CartItemRow[] | null) ?? []);
      } catch {
        if (mounted) setError(t.error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [locale, supabaseReady, t.error]);

  const subtotal = items.reduce((sum, item) => sum + item.unit_price_cents * item.quantity, 0);
  const discount = Math.min(cart?.discount_cents ?? 0, subtotal);
  const total = Math.max(subtotal - discount, 0);
  const currency = cart?.currency || items[0]?.currency || "EUR";

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ locale, paymentMethod }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        url?: string;
      };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || t.error);
      }

      window.location.href = payload.url;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t.error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-5xl items-center px-6 py-16">
        <div className="flex items-center gap-3 text-sm text-[color:var(--muted)]">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          {t.loading}
        </div>
      </main>
    );
  }

  if (!items.length) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-16">
        <section className="w-full rounded-[32px] border border-[#ece3d9] bg-[#fffaf4] p-8 shadow-[0_30px_80px_rgba(27,42,74,0.08)]">
          <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[color:var(--headline)]">{t.empty}</h1>
          <div className="mt-6">
            <Link href={localizePathname("/cart", locale)} className="inline-flex h-11 items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 text-sm font-medium text-[#203153]">
              {t.backToCart}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[32px] border border-[#ece3d9] bg-[#fffaf4] p-8 shadow-[0_30px_80px_rgba(27,42,74,0.08)]">
          <Link href={localizePathname("/cart", locale)} className="inline-flex h-11 items-center justify-center rounded-xl border border-[#ece3d9] bg-white px-5 text-sm font-medium text-[color:var(--headline)]">
            {t.backToCart}
          </Link>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-[color:var(--headline)]">{t.title}</h1>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{t.description}</p>
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{t.paymentMethod}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {([
                ["stripe", t.stripe],
                ["bank_transfer", t.bankTransfer],
              ] as Array<[OrderPaymentMethod, string]>).map(([value, label]) => {
                const active = paymentMethod === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPaymentMethod(value)}
                    className={`rounded-[24px] border p-5 text-left transition ${active ? "border-[color:var(--accent)] bg-white shadow-[0_14px_30px_rgba(244,198,79,0.14)]" : "border-[#ece3d9] bg-[#fffdf8]"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${active ? "bg-[color:var(--accent)] text-[#203153]" : "bg-[#f0e7db] text-[color:var(--muted)]"}`}>
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div className="text-base font-semibold text-[color:var(--headline)]">{label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <p className="mt-8 rounded-2xl border border-[#ece3d9] bg-white px-4 py-4 text-sm leading-6 text-[color:var(--muted)]">
            {deliveryCopy.cartCheckout}
          </p>
          {error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-6 text-sm font-medium text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)] transition hover:bg-[#efbf3e] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {submitting ? t.processing : paymentMethod === "stripe" ? t.payCard : t.placeOrder}
          </button>
        </section>
        <aside className="rounded-[32px] border border-[#ece3d9] bg-white p-8 shadow-[0_30px_80px_rgba(27,42,74,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{t.summary}</p>
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-[#ece3d9] bg-[#fffaf4] px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-[color:var(--headline)]">{item.product_snapshot?.name || item.product_snapshot?.sku || item.product_id}</p>
                    {item.product_snapshot?.sku ? <p className="mt-1 text-xs text-[color:var(--muted)]">{item.product_snapshot.sku}</p> : null}
                    <p className="mt-2 text-xs text-[color:var(--muted)]">× {item.quantity}</p>
                  </div>
                  <p className="font-medium text-[color:var(--headline)]">{formatMoney(item.unit_price_cents * item.quantity, item.currency)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3 border-t border-[#ece3d9] pt-6 text-sm">
            <div className="flex items-center justify-between text-[color:var(--muted)]"><span>{t.subtotal}</span><span>{formatMoney(subtotal, currency)}</span></div>
            <div className="flex items-center justify-between text-[color:var(--muted)]"><span>{t.discount}</span><span>{discount > 0 ? `-${formatMoney(discount, currency)}` : "—"}</span></div>
            <div className="flex items-center justify-between text-base font-semibold text-[color:var(--headline)]"><span>{t.total}</span><span>{formatMoney(total, currency)}</span></div>
          </div>
        </aside>
      </div>
    </main>
  );
}
