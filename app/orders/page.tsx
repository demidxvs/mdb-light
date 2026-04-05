"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle, PackageSearch } from "lucide-react";
import { AuthShell } from "@/components/ui/auth-shell";
import { useLocale } from "@/components/ui/locale-provider";
import { getPaymentMethodLabel, type OrderPaymentMethod } from "@/lib/order-utils";

type OrderItemRow = {
  id: string;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  total_price_cents: number;
  selected_color: string | null;
  selected_length: string | null;
  selected_material: string | null;
  selected_options: Record<string, string> | null;
};

type OrderRow = {
  id: string;
  order_number: number;
  order_code: string | null;
  payment_method: OrderPaymentMethod;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  currency: string;
  total_cents: number;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  created_at: string;
  paid_at: string | null;
  order_items: OrderItemRow[];
};

const copy = {
  en: {
    top: "Multilingual LED marketplace",
    back: "Back to account",
    login: "Login",
    register: "Register",
    title: "Your orders",
    description: "Track paid orders, item details, and fulfillment status.",
    orderNumber: "Order number",
    paymentMethod: "Payment method",
    loading: "Loading orders...",
    empty: "No orders yet.",
    openCatalog: "Open catalog",
    status: "Order status",
    payment: "Payment",
    fulfillment: "Fulfillment",
    created: "Created",
    paid: "Paid",
    itemCount: "Items",
    unauthorized: "Sign in to view your orders.",
  },
  ru: {
    top: "Мультиязычный маркетплейс LED-освещения",
    back: "Назад в аккаунт",
    login: "Вход",
    register: "Регистрация",
    title: "Ваши заказы",
    description: "Отслеживайте оплаченные заказы, состав товаров и статус выполнения.",
    orderNumber: "Номер заказа",
    paymentMethod: "Способ оплаты",
    loading: "Загружаем заказы...",
    empty: "Заказов пока нет.",
    openCatalog: "Открыть каталог",
    status: "Статус заказа",
    payment: "Оплата",
    fulfillment: "Выполнение",
    created: "Создан",
    paid: "Оплачен",
    itemCount: "Товары",
    unauthorized: "Войдите в аккаунт, чтобы видеть свои заказы.",
  },
  el: {
    top: "Πολύγλωσσο marketplace LED φωτισμού",
    back: "Πίσω στον λογαριασμό",
    login: "Σύνδεση",
    register: "Εγγραφή",
    title: "Οι παραγγελίες σας",
    description: "Παρακολουθήστε τις πληρωμένες παραγγελίες, τα είδη και την κατάσταση εκτέλεσης.",
    orderNumber: "Αριθμός παραγγελίας",
    paymentMethod: "Τρόπος πληρωμής",
    loading: "Φόρτωση παραγγελιών...",
    empty: "Δεν υπάρχουν ακόμη παραγγελίες.",
    openCatalog: "Άνοιγμα καταλόγου",
    status: "Κατάσταση παραγγελίας",
    payment: "Πληρωμή",
    fulfillment: "Εκτέλεση",
    created: "Δημιουργήθηκε",
    paid: "Πληρώθηκε",
    itemCount: "Προϊόντα",
    unauthorized: "Συνδεθείτε για να δείτε τις παραγγελίες σας.",
  },
  lv: {
    top: "Daudzvalodu LED apgaismojuma marketplace",
    back: "Atpakaļ uz kontu",
    login: "Pieslēgties",
    register: "Reģistrēties",
    title: "Jūsu pasūtījumi",
    description: "Sekojiet apmaksātajiem pasūtījumiem, precēm un izpildes statusam.",
    orderNumber: "Pasūtījuma numurs",
    paymentMethod: "Apmaksas veids",
    loading: "Ielādējam pasūtījumus...",
    empty: "Pasūtījumu vēl nav.",
    openCatalog: "Atvērt katalogu",
    status: "Pasūtījuma statuss",
    payment: "Maksājums",
    fulfillment: "Izpilde",
    created: "Izveidots",
    paid: "Apmaksāts",
    itemCount: "Preces",
    unauthorized: "Pieslēdzieties, lai redzētu savus pasūtījumus.",
  },
} as const;

const statusLabels = {
  en: {
    pending: "Pending",
    paid: "Paid",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    refunded: "Refunded",
    unpaid: "Unpaid",
    authorized: "Authorized",
    failed: "Failed",
    unfulfilled: "Unfulfilled",
  },
  ru: {
    pending: "Ожидает",
    paid: "Оплачен",
    processing: "В обработке",
    shipped: "Отправлен",
    delivered: "Доставлен",
    cancelled: "Отменён",
    refunded: "Возвращён",
    unpaid: "Не оплачен",
    authorized: "Авторизован",
    failed: "Ошибка оплаты",
    unfulfilled: "Не выполнен",
  },
  el: {
    pending: "Σε αναμονή",
    paid: "Πληρωμένο",
    processing: "Σε επεξεργασία",
    shipped: "Απεστάλη",
    delivered: "Παραδόθηκε",
    cancelled: "Ακυρώθηκε",
    refunded: "Επιστράφηκε",
    unpaid: "Απλήρωτο",
    authorized: "Εγκεκριμένο",
    failed: "Αποτυχία πληρωμής",
    unfulfilled: "Μη εκτελεσμένο",
  },
  lv: {
    pending: "Gaida",
    paid: "Apmaksāts",
    processing: "Apstrādē",
    shipped: "Izsūtīts",
    delivered: "Piegādāts",
    cancelled: "Atcelts",
    refunded: "Atmaksāts",
    unpaid: "Nav apmaksāts",
    authorized: "Autorizēts",
    failed: "Maksājums neizdevās",
    unfulfilled: "Nav izpildīts",
  },
} as const;

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "EUR",
  }).format((cents || 0) / 100);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function getVariantLines(item: OrderItemRow) {
  const lines: string[] = [];

  if (item.selected_color) lines.push(`Color: ${item.selected_color}`);
  if (item.selected_length) lines.push(`Length: ${item.selected_length}`);
  if (item.selected_material) lines.push(`Material: ${item.selected_material}`);

  for (const [key, value] of Object.entries(item.selected_options ?? {})) {
    if (value) lines.push(`${key}: ${value}`);
  }

  return lines;
}

export default function OrdersPage() {
  const { locale } = useLocale();
  const t = copy[locale];
  const labels = statusLabels[locale];
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/account/orders", { cache: "no-store" });
        const payload = (await response.json().catch(() => ({}))) as {
          orders?: OrderRow[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load orders.");
        }

        if (!cancelled) {
          setOrders(payload.orders ?? []);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : t.unauthorized);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, [t.unauthorized]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-[#ece3d9] bg-[#fffaf4]">
          <LoaderCircle className="h-6 w-6 animate-spin text-[color:var(--headline)]" />
        </div>
      );
    }

    if (error) {
      return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>;
    }

    if (orders.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-[#ece3d9] bg-[#fffaf4] px-6 py-12 text-center">
          <PackageSearch className="mx-auto h-10 w-10 text-[color:var(--muted)]" />
          <p className="mt-4 text-sm text-[color:var(--muted)]">{t.empty}</p>
          <Link href="/catalog" className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 text-sm font-medium text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)] transition hover:bg-[#efbf3e]">
            {t.openCatalog}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-[#ece3d9] bg-[#fffaf4] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">
                  {t.orderNumber}: {order.order_code || `#${order.order_number}`}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[color:var(--headline)]">
                  {order.customer_name || order.customer_email || `Order ${order.order_code || order.order_number}`}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-[color:var(--headline)]">{formatMoney(order.total_cents, order.currency)}</p>
                <p className="mt-1 text-xs text-[color:var(--muted)]">
                  {t.itemCount}: {order.order_items.length}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 rounded-2xl border border-[#ece3d9] bg-white p-4 text-sm sm:grid-cols-2 xl:grid-cols-5">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">{t.status}</p>
                <p className="mt-2 font-medium text-[color:var(--headline)]">{labels[order.status as keyof typeof labels] || order.status}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">{t.payment}</p>
                <p className="mt-2 font-medium text-[color:var(--headline)]">{labels[order.payment_status as keyof typeof labels] || order.payment_status}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">{t.paymentMethod}</p>
                <p className="mt-2 font-medium text-[color:var(--headline)]">{getPaymentMethodLabel(locale, order.payment_method)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">{t.fulfillment}</p>
                <p className="mt-2 font-medium text-[color:var(--headline)]">{labels[order.fulfillment_status as keyof typeof labels] || order.fulfillment_status}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">{t.paid}</p>
                <p className="mt-2 font-medium text-[color:var(--headline)]">{formatDate(order.paid_at || order.created_at)}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {order.order_items.map((item) => {
                const variants = getVariantLines(item);
                return (
                  <div key={item.id} className="rounded-2xl border border-[#ece3d9] bg-white px-4 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-[color:var(--headline)]">{item.product_name}</p>
                        {item.product_sku ? <p className="mt-1 text-xs text-[color:var(--muted)]">{item.product_sku}</p> : null}
                        {variants.length > 0 ? (
                          <div className="mt-2 space-y-1">
                            {variants.map((line) => (
                              <p key={line} className="text-xs text-[color:var(--muted)]">{line}</p>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[color:var(--headline)]">{formatMoney(item.total_price_cents, order.currency)}</p>
                        <p className="mt-1 text-xs text-[color:var(--muted)]">× {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-[color:var(--muted)]">
              {t.created}: {formatDate(order.created_at)}
            </p>
          </article>
        ))}
      </div>
    );
  }, [error, labels, loading, locale, orders, t]);

  return (
    <AuthShell
      topLabel={t.top}
      backLabel={t.back}
      title={t.title}
      description={t.description}
      activeTab="login"
      loginLabel={t.login}
      registerLabel={t.register}
    >
      {content}
    </AuthShell>
  );
}
