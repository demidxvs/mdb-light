"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useLocale } from "@/components/ui/locale-provider";
import { localizePathname } from "@/i18n/config";
import { formatOrderMoney, getBankDetails, getDeliveryCopy } from "@/lib/order-utils";

const copy = {
  en: { title: "Order created", orderNumber: "Order number", instructions: "Pay the order using the bank details below. Use the order number in the payment reference. We will contact you after the payment is received.", company: "Company", iban: "IBAN", bank: "Bank", swift: "SWIFT", amount: "Amount", reference: "Reference", loading: "Loading order details...", cart: "Back to cart", catalog: "Open catalog" },
  ru: { title: "Заказ создан", orderNumber: "Номер заказа", instructions: "Оплатите заказ по реквизитам ниже. В назначении платежа укажите номер заказа. После оплаты мы свяжемся с вами.", company: "Компания", iban: "IBAN", bank: "Банк", swift: "SWIFT", amount: "Сумма", reference: "Назначение платежа", loading: "Загружаем данные заказа...", cart: "Назад в корзину", catalog: "Открыть каталог" },
  el: { title: "Η παραγγελία δημιουργήθηκε", orderNumber: "Αριθμός παραγγελίας", instructions: "Πληρώστε την παραγγελία με τα παρακάτω τραπεζικά στοιχεία. Χρησιμοποιήστε τον αριθμό παραγγελίας ως αναφορά πληρωμής. Θα επικοινωνήσουμε μαζί σας μετά την επιβεβαίωση της πληρωμής.", company: "Εταιρεία", iban: "IBAN", bank: "Τράπεζα", swift: "SWIFT", amount: "Ποσό", reference: "Αναφορά πληρωμής", loading: "Φόρτωση στοιχείων παραγγελίας...", cart: "Πίσω στο καλάθι", catalog: "Άνοιγμα καταλόγου" },
  lv: { title: "Pasūtījums izveidots", orderNumber: "Pasūtījuma numurs", instructions: "Apmaksājiet pasūtījumu pēc zemāk norādītajiem rekvizītiem. Maksājuma mērķī norādiet pasūtījuma numuru. Pēc apmaksas mēs ar jums sazināsimies.", company: "Uzņēmums", iban: "IBAN", bank: "Banka", swift: "SWIFT", amount: "Summa", reference: "Maksājuma mērķis", loading: "Ielādē pasūtījuma informāciju...", cart: "Atpakaļ uz grozu", catalog: "Atvērt katalogu" },
} as const;

export default function BankTransferPage() {
  const { locale } = useLocale();
  const t = copy[locale];
  const deliveryCopy = getDeliveryCopy(locale);
  const searchParams = useSearchParams();
  const orderCode = useMemo(() => searchParams.get("order"), [searchParams]);
  const totalCents = useMemo(() => Number(searchParams.get("total") || 0), [searchParams]);
  const currency = useMemo(() => searchParams.get("currency") || "EUR", [searchParams]);
  const bankDetails = getBankDetails();

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-16">
      <section className="w-full rounded-[32px] border border-[#ece3d9] bg-[#fffaf4] p-8 shadow-[0_30px_80px_rgba(27,42,74,0.08)]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-8 w-8" /></div>
        <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-[color:var(--headline)]">{t.title}</h1>
        {!orderCode ? (
          <p className="mt-4 text-sm text-[color:var(--muted)]">{t.loading}</p>
        ) : (
          <>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{t.orderNumber}: <span className="font-semibold text-[color:var(--headline)]">{orderCode}</span></p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{t.instructions}</p>
            <div className="mt-6 rounded-[24px] border border-[#ece3d9] bg-white p-6">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div><p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">{t.company}</p><p className="mt-2 font-medium text-[color:var(--headline)]">{bankDetails.company}</p></div>
                <div><p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">{t.iban}</p><p className="mt-2 font-medium text-[color:var(--headline)]">{bankDetails.iban}</p></div>
                <div><p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">{t.bank}</p><p className="mt-2 font-medium text-[color:var(--headline)]">{bankDetails.bank}</p></div>
                <div><p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">{t.swift}</p><p className="mt-2 font-medium text-[color:var(--headline)]">{bankDetails.swift}</p></div>
                <div><p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">{t.amount}</p><p className="mt-2 font-medium text-[color:var(--headline)]">{formatOrderMoney(totalCents, currency)}</p></div>
                <div><p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">{t.reference}</p><p className="mt-2 font-medium text-[color:var(--headline)]">{orderCode}</p></div>
              </div>
            </div>
            <p className="mt-6 text-sm leading-7 text-[color:var(--muted)]">{deliveryCopy.bankTransfer}</p>
          </>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={localizePathname("/cart", locale)} className="inline-flex h-11 items-center justify-center rounded-xl border border-[#ece3d9] bg-white px-5 text-sm font-medium text-[color:var(--headline)]">{t.cart}</Link>
          <Link href={localizePathname("/catalog", locale)} className="inline-flex h-11 items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 text-sm font-medium text-[#203153]">{t.catalog}</Link>
        </div>
      </section>
    </main>
  );
}
