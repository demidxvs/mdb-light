"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useLocale } from "@/components/ui/locale-provider";
import { localizePathname } from "@/i18n/config";
import { getDeliveryCopy } from "@/lib/order-utils";

const copy = {
  en: {
    title: "Thank you for your order!",
    description: "Payment was received. We are confirming the order and sending notifications.",
    cart: "Back to cart",
    catalog: "Open catalog",
    confirming: "Confirming your order...",
    confirmed: "Your order was confirmed and saved.",
    fallback: "The payment succeeded, but the order is not confirmed on the server yet. Refresh this page in a few seconds.",
    orderNumber: "Order number",
  },
  ru: {
    title: "Спасибо за ваш заказ!",
    description: "Оплата получена. Подтверждаем заказ и отправляем уведомления.",
    cart: "Назад в корзину",
    catalog: "Открыть каталог",
    confirming: "Подтверждаем заказ...",
    confirmed: "Заказ подтверждён и сохранён.",
    fallback: "Платёж прошёл, но заказ ещё не подтверждён сервером. Обновите страницу через пару секунд.",
    orderNumber: "Номер заказа",
  },
  el: {
    title: "Ευχαριστούμε για την παραγγελία σας!",
    description: "Η πληρωμή λήφθηκε. Επιβεβαιώνουμε την παραγγελία και στέλνουμε ειδοποιήσεις.",
    cart: "Πίσω στο καλάθι",
    catalog: "Άνοιγμα καταλόγου",
    confirming: "Επιβεβαιώνουμε την παραγγελία...",
    confirmed: "Η παραγγελία επιβεβαιώθηκε και αποθηκεύτηκε.",
    fallback: "Η πληρωμή ολοκληρώθηκε, αλλά η παραγγελία δεν έχει επιβεβαιωθεί ακόμη από τον server. Ανανεώστε τη σελίδα σε λίγα δευτερόλεπτα.",
    orderNumber: "Αριθμός παραγγελίας",
  },
  lv: {
    title: "Paldies par jūsu pasūtījumu!",
    description: "Maksājums ir saņemts. Apstiprinām pasūtījumu un nosūtām paziņojumus.",
    cart: "Atpakaļ uz grozu",
    catalog: "Atvērt katalogu",
    confirming: "Apstiprinām pasūtījumu...",
    confirmed: "Pasūtījums ir apstiprināts un saglabāts.",
    fallback: "Maksājums izdevās, bet pasūtījums vēl nav apstiprināts serverī. Pārlādējiet lapu pēc dažām sekundēm.",
    orderNumber: "Pasūtījuma numurs",
  },
} as const;

export default function CheckoutSuccessPage() {
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const t = copy[locale];
  const deliveryCopy = getDeliveryCopy(locale);
  const sessionId = useMemo(() => searchParams.get("session_id"), [searchParams]);
  const [status, setStatus] = useState<"idle" | "loading" | "confirmed" | "error">(
    sessionId ? "loading" : "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    async function confirmCheckout() {
      try {
        setStatus("loading");
        setErrorMessage(null);

        const response = await fetch("/api/checkout/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        const payload = (await response.json().catch(() => ({}))) as { error?: string; orderCode?: string | null };

        if (!response.ok) {
          throw new Error(payload.error || "Failed to confirm checkout.");
        }

        if (!cancelled) {
          setStatus("confirmed");
          setOrderCode(payload.orderCode || null);
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(error instanceof Error ? error.message : t.fallback);
        }
      }
    }

    void confirmCheckout();

    return () => {
      cancelled = true;
    };
  }, [sessionId, t.fallback]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-16">
      <section className="w-full rounded-[32px] border border-[#ece3d9] bg-[#fffaf4] p-8 shadow-[0_30px_80px_rgba(27,42,74,0.08)]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-[color:var(--headline)]">{t.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--muted)]">{t.description}</p>
        {orderCode ? (
          <p className="mt-4 text-sm font-medium text-[color:var(--headline)]">
            {t.orderNumber}: {orderCode}
          </p>
        ) : null}
        {status === "loading" ? (
          <p className="mt-4 text-sm font-medium text-[color:var(--headline)]">{t.confirming}</p>
        ) : null}
        {status === "confirmed" ? (
          <p className="mt-4 text-sm font-medium text-emerald-700">{t.confirmed}</p>
        ) : null}
        {status === "error" ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage || t.fallback}
          </p>
        ) : null}
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--muted)]">{deliveryCopy.success}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={localizePathname("/cart", locale)} className="inline-flex h-11 items-center justify-center rounded-xl border border-[#ece3d9] bg-white px-5 text-sm font-medium text-[color:var(--headline)]">
            {t.cart}
          </Link>
          <Link href={localizePathname("/catalog", locale)} className="inline-flex h-11 items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 text-sm font-medium text-[#203153]">
            {t.catalog}
          </Link>
        </div>
      </section>
    </main>
  );
}
