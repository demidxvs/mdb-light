"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle, MapPin, PackageSearch } from "lucide-react";
import { AuthShell } from "@/components/ui/auth-shell";
import { useLocale } from "@/components/ui/locale-provider";
import { localizePathname, type Locale } from "@/i18n/config";
import { getPaymentMethodLabel, type OrderPaymentMethod } from "@/lib/order-utils";
import { formatShippingAddress, type ShippingAddress } from "@/lib/shipping-address";

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
  shipping_cents: number;
  delivery_type: "parcel_locker" | "home_delivery" | null;
  total_cents: number;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  shipping_address: ShippingAddress | Record<string, never>;
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
    delivery: "Delivery",
    deliveryAddress: "Delivery address",
    parcelLocker: "Parcel locker",
    homeDelivery: "Home delivery",
    deliveryNotSpecified: "Not specified",
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
    delivery: "Доставка",
    deliveryAddress: "Адрес доставки",
    parcelLocker: "Пакомат",
    homeDelivery: "Доставка на дом",
    deliveryNotSpecified: "Не указана",
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
    delivery: "Παράδοση",
    deliveryAddress: "Διεύθυνση παράδοσης",
    parcelLocker: "Parcel locker",
    homeDelivery: "Παράδοση στο σπίτι",
    deliveryNotSpecified: "Δεν ορίστηκε",
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
    delivery: "Piegāde",
    deliveryAddress: "Piegādes adrese",
    parcelLocker: "Pakomāts",
    homeDelivery: "Piegāde uz mājām",
    deliveryNotSpecified: "Nav norādīta",
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

const localeTags: Record<Locale, string> = {
  en: "en-GB",
  ru: "ru-RU",
  el: "el-GR",
  lv: "lv-LV",
};

function formatDate(value: string | null, locale: Locale) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(localeTags[locale], {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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
          <Link href={localizePathname("/catalog", locale)} className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 text-sm font-medium text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)] transition hover:bg-[#efbf3e]">
            {t.openCatalog}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {orders.map((order) => {
          const shippingAddress = formatShippingAddress(order.shipping_address);
          const deliveryLabel =
            order.delivery_type === "home_delivery"
              ? t.homeDelivery
              : order.delivery_type === "parcel_locker"
                ? t.parcelLocker
                : t.deliveryNotSpecified;

          return (
            <article
              key={order.id}
              className="overflow-hidden rounded-2xl border border-[#e8ded3] bg-white shadow-[0_12px_32px_rgba(27,42,74,0.04)]"
            >
              <header className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5 lg:p-6">
                <div className="min-w-0">
                  <p className="break-words text-xs font-semibold uppercase leading-5 text-[color:var(--accent)] [overflow-wrap:anywhere]">
                    {t.orderNumber}: {order.order_code || `#${order.order_number}`}
                  </p>
                  <h2 className="mt-1 break-words text-lg font-semibold leading-7 text-[color:var(--headline)] sm:text-xl">
                    {order.customer_name || order.customer_email || `Order ${order.order_code || order.order_number}`}
                  </h2>
                </div>
                <div className="shrink-0 sm:text-right">
                  <p className="text-xl font-semibold text-[color:var(--headline)]">
                    {formatMoney(order.total_cents, order.currency)}
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">
                    {t.itemCount}: {order.order_items.length}
                  </p>
                </div>
              </header>

              <div className="grid gap-px border-y border-[#ece3d9] bg-[#ece3d9] text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div className="min-w-0 bg-[#fffaf4] p-4">
                  <p className="text-[11px] font-semibold uppercase leading-4 text-[color:var(--muted)]">{t.status}</p>
                  <p className="mt-2 break-words font-medium leading-6 text-[color:var(--headline)]">
                    {labels[order.status as keyof typeof labels] || order.status}
                  </p>
                </div>
                <div className="min-w-0 bg-[#fffaf4] p-4">
                  <p className="text-[11px] font-semibold uppercase leading-4 text-[color:var(--muted)]">{t.payment}</p>
                  <p className="mt-2 break-words font-medium leading-6 text-[color:var(--headline)]">
                    {labels[order.payment_status as keyof typeof labels] || order.payment_status}
                  </p>
                </div>
                <div className="min-w-0 bg-[#fffaf4] p-4">
                  <p className="text-[11px] font-semibold uppercase leading-4 text-[color:var(--muted)]">{t.fulfillment}</p>
                  <p className="mt-2 break-words font-medium leading-6 text-[color:var(--headline)]">
                    {labels[order.fulfillment_status as keyof typeof labels] || order.fulfillment_status}
                  </p>
                </div>
                <div className="min-w-0 bg-[#fffaf4] p-4">
                  <p className="text-[11px] font-semibold uppercase leading-4 text-[color:var(--muted)]">{t.paymentMethod}</p>
                  <p className="mt-2 break-words font-medium leading-6 text-[color:var(--headline)]">
                    {getPaymentMethodLabel(locale, order.payment_method)}
                  </p>
                </div>
                <div className="min-w-0 bg-[#fffaf4] p-4">
                  <p className="text-[11px] font-semibold uppercase leading-4 text-[color:var(--muted)]">{t.delivery}</p>
                  <p className="mt-2 break-words font-medium leading-6 text-[color:var(--headline)]">
                    {deliveryLabel}
                    {order.delivery_type ? ` · ${formatMoney(order.shipping_cents, order.currency)}` : ""}
                  </p>
                </div>
                <div className="min-w-0 bg-[#fffaf4] p-4">
                  <p className="text-[11px] font-semibold uppercase leading-4 text-[color:var(--muted)]">{t.paid}</p>
                  <p className="mt-2 break-words font-medium leading-6 text-[color:var(--headline)]">
                    {formatDate(order.paid_at, locale)}
                  </p>
                </div>
              </div>

              {shippingAddress ? (
                <div className="flex items-start gap-3 border-b border-[#ece3d9] px-4 py-4 sm:px-5 lg:px-6">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--accent)]" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[color:var(--headline)]">{t.deliveryAddress}</p>
                    <address className="mt-1 break-words text-sm not-italic leading-6 text-[color:var(--muted)]">
                      {shippingAddress}
                    </address>
                  </div>
                </div>
              ) : null}

              <div className="divide-y divide-[#ece3d9]">
                {order.order_items.map((item) => {
                  const variants = getVariantLines(item);
                  return (
                    <div
                      key={item.id}
                      className="grid min-w-0 gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-5 lg:px-6"
                    >
                      <div className="min-w-0">
                        <p className="break-words font-medium leading-6 text-[color:var(--headline)]">
                          {item.product_name}
                        </p>
                        {item.product_sku ? (
                          <p className="mt-1 break-words text-xs text-[color:var(--muted)]">{item.product_sku}</p>
                        ) : null}
                        {variants.length > 0 ? (
                          <div className="mt-2 space-y-1">
                            {variants.map((line) => (
                              <p key={line} className="break-words text-xs leading-5 text-[color:var(--muted)]">
                                {line}
                              </p>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="shrink-0 sm:text-right">
                        <p className="font-medium text-[color:var(--headline)]">
                          {formatMoney(item.total_price_cents, order.currency)}
                        </p>
                        <p className="mt-1 text-xs text-[color:var(--muted)]">× {item.quantity}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <footer className="border-t border-[#ece3d9] bg-[#fffaf4] px-4 py-3 text-xs leading-5 text-[color:var(--muted)] sm:px-5 lg:px-6">
                {t.created}: {formatDate(order.created_at, locale)}
              </footer>
            </article>
          );
        })}
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
      containerClassName="max-w-[1180px]"
      panelClassName="overflow-visible border-0 bg-transparent p-0 shadow-none sm:p-0"
    >
      {content}
    </AuthShell>
  );
}
