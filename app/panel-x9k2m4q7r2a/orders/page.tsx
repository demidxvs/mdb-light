"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  LoaderCircle,
  ReceiptText,
  Search,
  ShieldAlert,
} from "lucide-react";
import { AdminShell } from "@/components/ui/admin-shell";
import { useLocale } from "@/components/ui/locale-provider";
import { isAdminSupabaseConfigured } from "@/lib/admin-supabase-client";
import { localizePathname } from "@/i18n/config";
import { getAdminInvoicePdfUrl } from "@/lib/storage";
import {
  buildOrderCode,
  formatOrderMoney,
  getPaymentMethodLabel,
  type OrderPaymentMethod,
} from "@/lib/order-utils";

type OrderItemRow = {
  id: string;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  unit_price_cents: number;
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
  payment_id: string | null;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  currency: string;
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  created_at: string;
  paid_at: string | null;
  order_items: OrderItemRow[];
  invoice: {
    id: string;
    invoice_number: string;
    pdf_path: string | null;
    pdf_generated_at: string | null;
    status: string;
  } | null;
};

const copy = {
  en: {
    top: "Protected order management area",
    title: "Orders",
    description: "Review successful payments, order lines, and update statuses from the admin panel.",
    loading: "Loading orders...",
    denied: "Admin access required",
    signIn: "Sign in first to open the admin panel.",
    noAccess: "You do not have access to this page.",
    back: "Back to dashboard",
    eyebrow: "Orders",
    sectionTitle: "Paid orders",
    search: "Search by order, email, or name",
    empty: "No orders found.",
    customer: "Customer",
    payment: "Payment",
    paymentMethod: "Payment method",
    statusLabel: "Status",
    fulfillment: "Fulfillment",
    total: "Total",
    created: "Created",
    paid: "Paid",
    orderNumber: "Order number",
    phone: "Phone",
    paymentId: "Payment ID",
    items: "Items",
    unnamed: "Customer without name",
    qty: "Qty",
    perItem: "per item",
    markPaid: "Mark as paid",
    downloadPdf: "Open invoice PDF",
    payingByTransfer: "Bank transfer",
  },
  ru: {
    top: "Защищенная зона управления заказами",
    title: "Заказы",
    description: "Просматривайте успешные оплаты, состав заказа и обновляйте статусы прямо из админки.",
    loading: "Загружаю заказы...",
    denied: "Требуется доступ администратора",
    signIn: "Сначала войдите, чтобы открыть админку.",
    noAccess: "У вас нет доступа к этой странице.",
    back: "Назад к дэшборду",
    eyebrow: "Заказы",
    sectionTitle: "Оплаченные заказы",
    search: "Поиск по заказу, email или имени",
    empty: "Заказы не найдены.",
    customer: "Клиент",
    payment: "Оплата",
    paymentMethod: "Способ оплаты",
    statusLabel: "Статус",
    fulfillment: "Выполнение",
    total: "Итого",
    created: "Создан",
    paid: "Оплачен",
    orderNumber: "Номер заказа",
    phone: "Телефон",
    paymentId: "ID платежа",
    items: "Товары",
    unnamed: "Клиент без имени",
    qty: "Кол-во",
    perItem: "за шт.",
    markPaid: "Отметить как оплаченный",
    downloadPdf: "Открыть PDF счета",
    payingByTransfer: "Банковский перевод",
  },
  el: {
    top: "Προστατευμένη διαχείριση παραγγελιών",
    title: "Παραγγελίες",
    description: "Δείτε επιτυχημένες πληρωμές, γραμμές παραγγελίας και ενημερώστε καταστάσεις από το admin panel.",
    loading: "Φόρτωση παραγγελιών...",
    denied: "Απαιτείται πρόσβαση διαχειριστή",
    signIn: "Συνδεθείτε πρώτα για να ανοίξετε το admin panel.",
    noAccess: "Δεν έχετε πρόσβαση σε αυτή τη σελίδα.",
    back: "Πίσω στο dashboard",
    eyebrow: "Παραγγελίες",
    sectionTitle: "Πληρωμένες παραγγελίες",
    search: "Αναζήτηση με αριθμό, email ή όνομα",
    empty: "Δεν βρέθηκαν παραγγελίες.",
    customer: "Πελάτης",
    payment: "Πληρωμή",
    paymentMethod: "Τρόπος πληρωμής",
    statusLabel: "Κατάσταση",
    fulfillment: "Εκτέλεση",
    total: "Σύνολο",
    created: "Δημιουργήθηκε",
    paid: "Πληρώθηκε",
    orderNumber: "Αριθμός παραγγελίας",
    phone: "Τηλέφωνο",
    paymentId: "ID πληρωμής",
    items: "Προϊόντα",
    unnamed: "Πελάτης χωρίς όνομα",
    qty: "Ποσότητα",
    perItem: "ανά τεμάχιο",
    markPaid: "Σήμανση ως πληρωμένο",
    downloadPdf: "Άνοιγμα PDF τιμολογίου",
    payingByTransfer: "Τραπεζική μεταφορά",
  },
  lv: {
    top: "Aizsargāta pasūtījumu pārvaldība",
    title: "Pasūtījumi",
    description: "Skatiet veiksmīgos maksājumus, pasūtījuma pozīcijas un atjauniniet statusus no admin paneļa.",
    loading: "Ielādē pasūtījumus...",
    denied: "Nepieciešama administratora piekļuve",
    signIn: "Lai atvērtu admin paneli, vispirms pieslēdzieties.",
    noAccess: "Jums nav piekļuves šai lapai.",
    back: "Atpakaļ uz paneli",
    eyebrow: "Pasūtījumi",
    sectionTitle: "Apmaksātie pasūtījumi",
    search: "Meklēt pēc pasūtījuma, email vai vārda",
    empty: "Pasūtījumi nav atrasti.",
    customer: "Klients",
    payment: "Maksājums",
    paymentMethod: "Apmaksas veids",
    statusLabel: "Statuss",
    fulfillment: "Izpilde",
    total: "Kopā",
    created: "Izveidots",
    paid: "Apmaksāts",
    orderNumber: "Pasūtījuma numurs",
    phone: "Tālrunis",
    paymentId: "Maksājuma ID",
    items: "Preces",
    unnamed: "Klients bez vārda",
    qty: "Daudzums",
    perItem: "par gab.",
    markPaid: "Atzīmēt kā apmaksātu",
    downloadPdf: "Atvērt rēķina PDF",
    payingByTransfer: "Bankas pārskaitījums",
  },
} as const;

const orderStatuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;
const paymentStatuses = ["unpaid", "authorized", "paid", "failed", "refunded"] as const;
const fulfillmentStatuses = ["unfulfilled", "processing", "shipped", "delivered", "cancelled"] as const;

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
  return formatOrderMoney(cents, currency);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = copy[locale];
  const labels = statusLabels[locale];
  const supabaseReady = useMemo(() => isAdminSupabaseConfigured(), []);
  const [loading, setLoading] = useState(supabaseReady);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(supabaseReady ? "" : "Supabase is not configured.");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [pdfId, setPdfId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabaseReady) return;
    let mounted = true;

    const hydrate = async () => {
      const response = await fetch("/api/admin/orders", {
        credentials: "include",
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        orders?: OrderRow[];
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
      setOrders(payload.orders ?? []);
      setLoading(false);
    };

    void hydrate();
    return () => {
      mounted = false;
    };
  }, [locale, router, supabaseReady, t.noAccess, t.signIn]);

  const filteredOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return orders;

    return orders.filter((order) =>
      [
        String(order.order_number),
        order.order_code || "",
        order.customer_email || "",
        order.customer_name || "",
        order.customer_phone || "",
        order.payment_method,
        order.status,
        order.payment_status,
        order.fulfillment_status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [orders, query]);

  const updateOrder = async (
    orderId: string,
    next: {
      status: string;
      payment_status: string;
      fulfillment_status: string;
    },
  ) => {
    setSavingId(orderId);
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: orderId,
          locale,
          status: next.status,
          paymentStatus: next.payment_status,
          fulfillmentStatus: next.fulfillment_status,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Failed to update order");
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, ...next } : order,
        ),
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : t.noAccess);
    } finally {
      setSavingId(null);
    }
  };

  const markPaid = async (orderId: string) => {
    setSavingId(orderId);
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: orderId,
          action: "mark_paid",
          locale,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        order?: Partial<OrderRow>;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Failed to update order");
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                ...payload.order,
                order_code: payload.order?.order_code || order.order_code,
                payment_method:
                  (payload.order?.payment_method as OrderPaymentMethod | undefined) ||
                  order.payment_method,
                payment_id: payload.order?.payment_id ?? order.payment_id,
              }
            : order,
        ),
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : t.noAccess);
    } finally {
      setSavingId(null);
    }
  };

  const openInvoicePdf = async (order: OrderRow) => {
    setPdfId(order.id);
    try {
      if (!order.invoice?.pdf_path) {
        throw new Error("Invoice PDF is not available yet");
      }

      const signedUrl = await getAdminInvoicePdfUrl(order.invoice.pdf_path);
      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : t.noAccess);
    } finally {
      setPdfId(null);
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
          </div>

          <section className="rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#efe6dd] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">
                  {t.eyebrow}
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">
                  {t.sectionTitle}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--accent)]/15 text-[color:var(--headline)]">
                <ReceiptText className="h-6 w-6" />
              </div>
            </div>

            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#ece3d9] bg-[#fffcf7] px-4 py-3">
              <Search className="h-4 w-4 text-[color:var(--muted)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.search}
                className="w-full bg-transparent text-sm text-[color:var(--headline)] outline-none placeholder:text-[color:var(--muted)]"
              />
            </div>

            {error && isAdmin ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#ece3d9] bg-[#fffcf7] px-6 py-10 text-center text-sm text-[color:var(--muted)]">
                {t.empty}
              </div>
            ) : (
              <div className="space-y-5">
                {filteredOrders.map((order) => (
                  <article key={order.id} className="rounded-2xl border border-[#ece3d9] bg-[#fffcf7] p-5">
                    <div className="flex flex-col gap-5 border-b border-[#efe6dd] pb-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <h3 className="font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">
                          {order.order_code || buildOrderCode(order.order_number)}
                        </h3>
                        <p className="text-sm text-[color:var(--muted)]">
                          {t.customer}: {order.customer_name || t.unnamed}
                        </p>
                        {order.customer_email ? (
                          <p className="text-sm text-[color:var(--muted)]">{order.customer_email}</p>
                        ) : null}
                        {order.customer_phone ? (
                          <p className="text-sm text-[color:var(--muted)]">
                            {t.phone}: {order.customer_phone}
                          </p>
                        ) : null}
                        <div className="grid gap-2 text-sm text-[color:var(--muted)] sm:grid-cols-3">
                          <p>{t.total}: <span className="font-medium text-[color:var(--headline)]">{formatMoney(order.total_cents, order.currency)}</span></p>
                          <p>{t.created}: <span className="font-medium text-[color:var(--headline)]">{formatDate(order.created_at)}</span></p>
                          <p>{t.paid}: <span className="font-medium text-[color:var(--headline)]">{formatDate(order.paid_at)}</span></p>
                        </div>
                        <div className="grid gap-2 text-sm text-[color:var(--muted)] sm:grid-cols-2">
                          <p>
                            {t.paymentMethod}:{" "}
                            <span className="font-medium text-[color:var(--headline)]">
                              {getPaymentMethodLabel(locale, order.payment_method)}
                            </span>
                          </p>
                          {order.invoice?.invoice_number ? (
                            <p>
                              {t.orderNumber}:{" "}
                              <span className="font-medium text-[color:var(--headline)]">
                                {order.invoice.invoice_number}
                              </span>
                            </p>
                          ) : null}
                          {order.payment_id ? (
                            <p>
                              {t.paymentId}:{" "}
                              <span className="font-medium text-[color:var(--headline)]">
                                {order.payment_id}
                              </span>
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="space-y-4 lg:min-w-[520px]">
                        <div className="flex flex-wrap justify-end gap-3">
                          {order.payment_method === "bank_transfer" && order.payment_status !== "paid" ? (
                            <button
                              type="button"
                              onClick={() => void markPaid(order.id)}
                              disabled={savingId === order.id}
                              className="inline-flex h-11 items-center justify-center rounded-xl bg-[color:var(--accent)] px-4 text-sm font-medium text-[#203153] transition hover:bg-[#efbf3e] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {savingId === order.id ? t.payment : t.markPaid}
                            </button>
                          ) : null}
                          {order.invoice?.pdf_path ? (
                            <button
                              type="button"
                              onClick={() => void openInvoicePdf(order)}
                              disabled={pdfId === order.id}
                              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-4 text-sm font-medium text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/30 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {pdfId === order.id ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                              {t.downloadPdf}
                            </button>
                          ) : null}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                        <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                          <span>{t.statusLabel}</span>
                          <select
                            value={order.status}
                            onChange={(event) =>
                              void updateOrder(order.id, {
                                status: event.target.value,
                                payment_status: order.payment_status,
                                fulfillment_status: order.fulfillment_status,
                              })
                            }
                            disabled={savingId === order.id}
                            className="h-11 w-full rounded-xl border border-[#ece3d9] bg-white px-4 outline-none transition focus:border-[color:var(--accent)]"
                          >
                            {orderStatuses.map((value) => (
                              <option key={value} value={value}>{labels[value]}</option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                          <span>{t.payment}</span>
                          <select
                            value={order.payment_status}
                            onChange={(event) =>
                              void updateOrder(order.id, {
                                status: order.status,
                                payment_status: event.target.value,
                                fulfillment_status: order.fulfillment_status,
                              })
                            }
                            disabled={savingId === order.id}
                            className="h-11 w-full rounded-xl border border-[#ece3d9] bg-white px-4 outline-none transition focus:border-[color:var(--accent)]"
                          >
                            {paymentStatuses.map((value) => (
                              <option key={value} value={value}>{labels[value]}</option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                          <span>{t.fulfillment}</span>
                          <select
                            value={order.fulfillment_status}
                            onChange={(event) =>
                              void updateOrder(order.id, {
                                status: order.status,
                                payment_status: order.payment_status,
                                fulfillment_status: event.target.value,
                              })
                            }
                            disabled={savingId === order.id}
                            className="h-11 w-full rounded-xl border border-[#ece3d9] bg-white px-4 outline-none transition focus:border-[color:var(--accent)]"
                          >
                            {fulfillmentStatuses.map((value) => (
                              <option key={value} value={value}>{labels[value]}</option>
                            ))}
                          </select>
                        </label>
                        </div>
                      </div>
                    </div>

                    <div className="pt-5">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">
                        {t.items}
                      </p>
                      <div className="space-y-3">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="rounded-2xl border border-[#ece3d9] bg-white p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="font-medium text-[color:var(--headline)]">{item.product_name}</p>
                                {item.product_sku ? (
                                  <p className="mt-1 text-xs text-[color:var(--muted)]">{item.product_sku}</p>
                                ) : null}
                                <div className="mt-2 space-y-1 text-xs text-[color:var(--muted)]">
                                  {item.selected_color ? <p>Color: {item.selected_color}</p> : null}
                                  {item.selected_length ? <p>Length: {item.selected_length}</p> : null}
                                  {item.selected_material ? <p>Material: {item.selected_material}</p> : null}
                                  {Object.entries(item.selected_options ?? {}).map(([key, value]) => (
                                    <p key={key}>{key}: {value}</p>
                                  ))}
                                </div>
                              </div>
                              <div className="text-sm text-[color:var(--headline)] sm:text-right">
                                <p>{t.qty}: {item.quantity}</p>
                                <p className="mt-1">{formatMoney(item.unit_price_cents, order.currency)} / {t.perItem}</p>
                                <p className="mt-1 font-semibold">{formatMoney(item.total_price_cents, order.currency)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </AdminShell>
  );
}
