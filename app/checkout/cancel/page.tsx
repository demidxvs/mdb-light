"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";
import { useLocale } from "@/components/ui/locale-provider";
import { localizePathname } from "@/i18n/config";

const copy = {
  en: {
    title: "Payment cancelled",
    description: "No money was charged. You can return to the cart and try the Stripe test checkout again.",
    cart: "Back to cart",
  },
  ru: {
    title: "Оплата отменена",
    description: "Деньги не списывались. Можно вернуться в корзину и снова попробовать тестовый Stripe checkout.",
    cart: "Назад в корзину",
  },
  el: {
    title: "Η πληρωμή ακυρώθηκε",
    description: "Δεν χρεώθηκαν χρήματα. Μπορείτε να επιστρέψετε στο καλάθι και να δοκιμάσετε ξανά το δοκιμαστικό checkout Stripe.",
    cart: "Πίσω στο καλάθι",
  },
  lv: {
    title: "Maksājums atcelts",
    description: "Nauda netika ieturēta. Varat atgriezties grozā un vēlreiz izmēģināt Stripe testa checkout.",
    cart: "Atpakaļ uz grozu",
  },
} as const;

export default function CheckoutCancelPage() {
  const { locale } = useLocale();
  const t = copy[locale];

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-16">
      <section className="w-full rounded-[32px] border border-[#ece3d9] bg-[#fffaf4] p-8 shadow-[0_30px_80px_rgba(27,42,74,0.08)]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-700">
          <XCircle className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-[color:var(--headline)]">{t.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--muted)]">{t.description}</p>
        <div className="mt-8">
          <Link href={localizePathname("/cart", locale)} className="inline-flex h-11 items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 text-sm font-medium text-[#203153]">
            {t.cart}
          </Link>
        </div>
      </section>
    </main>
  );
}
