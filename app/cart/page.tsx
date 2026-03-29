"use client";

import { useLocale } from "@/components/ui/locale-provider";
import { AuthShell } from "@/components/ui/auth-shell";
import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";

const copy = {
  en: {
    top: "Multilingual LED marketplace",
    support: "Contact",
    back: "Back to home",
    login: "Login",
    register: "Register",
    title: "Your cart",
    description: "Products added to cart will appear here. Cart sync with Supabase comes next.",
    empty: "Your cart is empty for now.",
    action: "Open catalog"
  },
  ru: {
    top: "Мультиязычный маркетплейс LED-освещения",
    support: "Контакты",
    back: "Назад на главную",
    login: "Вход",
    register: "Регистрация",
    title: "Ваша корзина",
    description: "Здесь будут отображаться товары, добавленные в корзину. Следующим шагом подключим синхронизацию корзины с Supabase.",
    empty: "Корзина пока пустая.",
    action: "Открыть каталог"
  },
  el: {
    top: "Πολύγλωσσο marketplace LED φωτισμού",
    support: "Επικοινωνία",
    back: "Πίσω στην αρχική",
    login: "Σύνδεση",
    register: "Εγγραφή",
    title: "Το καλάθι σας",
    description: "Εδώ θα εμφανίζονται τα προϊόντα που προστέθηκαν στο καλάθι. Στο επόμενο βήμα θα συνδέσουμε τον συγχρονισμό με Supabase.",
    empty: "Το καλάθι είναι προς το παρόν άδειο.",
    action: "Άνοιγμα καταλόγου"
  },
  lv: {
    top: "Daudzvalodu LED apgaismojuma marketplace",
    support: "Kontakti",
    back: "Atpakaļ uz sākumu",
    login: "Pieslēgties",
    register: "Reģistrēties",
    title: "Jūsu grozs",
    description: "Šeit parādīsies grozā pievienotie produkti. Nākamajā solī pieslēgsim groza sinhronizāciju ar Supabase.",
    empty: "Grozs pagaidām ir tukšs.",
    action: "Atvērt katalogu"
  }
} as const;

export default function CartPage() {
  const { locale } = useLocale();
  const t = copy[locale];

  return (
    <AuthShell
      topLabel={t.top}
      supportLabel={t.support}
      backLabel={t.back}
      title={t.title}
      description={t.description}
      activeTab="login"
      loginLabel={t.login}
      registerLabel={t.register}
    >
      <div className="rounded-2xl border border-[#ece3d9] bg-[#fffaf4] p-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--accent)]/15 text-[color:var(--headline)]">
          <ShoppingCart className="h-6 w-6" />
        </div>
        <p className="mt-4 text-sm text-[color:var(--muted)]">{t.empty}</p>
        <Link
          href="/catalog"
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 text-sm font-medium text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)] transition hover:bg-[#efbf3e]"
        >
          {t.action}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </AuthShell>
  );
}
