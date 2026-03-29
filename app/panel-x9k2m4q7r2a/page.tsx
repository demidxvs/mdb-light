"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Layers3,
  LoaderCircle,
  ShieldAlert,
  Users,
} from "lucide-react";
import { AdminShell } from "@/components/ui/admin-shell";
import { useLocale } from "@/components/ui/locale-provider";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase-client";

const adminPath = "/panel-x9k2m4q7r2a";

const copy = {
  en: {
    top: "Protected admin workspace",
    support: "Contact",
    title: "Admin dashboard",
    description:
      "Use separate sections for products, users, and future orders or carts. This is the entry point, not the product form itself.",
    loading: "Checking admin access...",
    denied: "Admin access required",
    signIn: "Sign in first to open the admin panel.",
    noAccess: "You do not have access to this page.",
    productsEyebrow: "Products",
    productsTitle: "Manage catalog items",
    productsText:
      "Open the products section, see created items, and add a new product from a dedicated page.",
    productsCta: "Open products",
    usersEyebrow: "Users",
    usersTitle: "View registered accounts",
    usersText:
      "Open the users page to review emails, names, preferred language, status, and registration date.",
    usersCta: "Open users",
  },
  ru: {
    top: "Защищенная рабочая зона администратора",
    support: "Контакты",
    title: "Панель администратора",
    description:
      "Используйте отдельные разделы для товаров, пользователей и будущих заказов или корзин. Это точка входа, а не сама форма создания товара.",
    loading: "Проверяю права администратора...",
    denied: "Требуется доступ администратора",
    signIn: "Сначала войдите, чтобы открыть админку.",
    noAccess: "У вас нет доступа к этой странице.",
    productsEyebrow: "Товары",
    productsTitle: "Управление каталогом",
    productsText:
      "Откройте раздел товаров, просматривайте созданные позиции и добавляйте новый товар на отдельной странице.",
    productsCta: "Открыть товары",
    usersEyebrow: "Пользователи",
    usersTitle: "Зарегистрированные аккаунты",
    usersText:
      "Откройте раздел пользователей, чтобы видеть email, имена, язык, статус и дату регистрации.",
    usersCta: "Открыть пользователей",
  },
  el: {
    top: "Προστατευμένος χώρος διαχείρισης",
    support: "Επικοινωνία",
    title: "Πίνακας διαχείρισης",
    description:
      "Χρησιμοποιήστε ξεχωριστές ενότητες για προϊόντα, χρήστες και μελλοντικές παραγγελίες ή καλάθια. Αυτή είναι η αρχική σελίδα και όχι η φόρμα δημιουργίας προϊόντος.",
    loading: "Έλεγχος δικαιωμάτων διαχειριστή...",
    denied: "Απαιτείται πρόσβαση διαχειριστή",
    signIn: "Συνδεθείτε πρώτα για να ανοίξετε το admin panel.",
    noAccess: "Δεν έχετε πρόσβαση σε αυτή τη σελίδα.",
    productsEyebrow: "Προϊόντα",
    productsTitle: "Διαχείριση καταλόγου",
    productsText:
      "Ανοίξτε την ενότητα προϊόντων, δείτε τις καταχωρήσεις και προσθέστε νέο προϊόν από ξεχωριστή σελίδα.",
    productsCta: "Άνοιγμα προϊόντων",
    usersEyebrow: "Χρήστες",
    usersTitle: "Εγγεγραμμένοι λογαριασμοί",
    usersText:
      "Ανοίξτε την ενότητα χρηστών για να δείτε email, ονόματα, γλώσσα, κατάσταση και ημερομηνία εγγραφής.",
    usersCta: "Άνοιγμα χρηστών",
  },
  lv: {
    top: "Aizsargāta administrēšanas vide",
    support: "Kontakti",
    title: "Administrācijas panelis",
    description:
      "Izmantojiet atsevišķas sadaļas produktiem, lietotājiem un nākotnē pasūtījumiem vai groziem. Šī ir sākuma lapa, nevis produkta izveides forma.",
    loading: "Tiek pārbaudītas administratora tiesības...",
    denied: "Nepieciešama administratora piekļuve",
    signIn: "Lai atvērtu admin paneli, vispirms pieslēdzieties.",
    noAccess: "Jums nav piekļuves šai lapai.",
    productsEyebrow: "Produkti",
    productsTitle: "Kataloga pārvaldība",
    productsText:
      "Atveriet produktu sadaļu, skatiet izveidotos ierakstus un pievienojiet jaunu produktu atsevišķā lapā.",
    productsCta: "Atvērt produktus",
    usersEyebrow: "Lietotāji",
    usersTitle: "Reģistrētie konti",
    usersText:
      "Atveriet lietotāju sadaļu, lai redzētu email, vārdus, valodu, statusu un reģistrācijas datumu.",
    usersCta: "Atvērt lietotājus",
  },
} as const;

export default function AdminDashboardPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = copy[locale];
  const supabaseReady = useMemo(() => isSupabaseConfigured(), []);
  const [loading, setLoading] = useState(supabaseReady);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(
    supabaseReady ? "" : "Supabase is not configured.",
  );

  useEffect(() => {
    if (!supabaseReady) return;
    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    const hydrate = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      const user = session?.user;
      if (!user) {
        router.replace(`/login?next=${encodeURIComponent(adminPath)}`);
        return;
      }
      const { data: adminRow, error: adminError } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!mounted) return;
      if (adminError) {
        setError(adminError.message);
        setLoading(false);
        return;
      }
      if (!adminRow) {
        setError(t.noAccess);
        setLoading(false);
        return;
      }
      setIsAdmin(true);
      setLoading(false);
    };

    void hydrate();
    return () => {
      mounted = false;
    };
  }, [router, supabaseReady, t.noAccess]);

  return (
    <AdminShell
      topLabel={t.top}
      supportLabel={t.support}
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
        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/panel-x9k2m4q7r2a/products" className="group rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)] transition hover:-translate-y-1 hover:border-[color:var(--accent)]/35">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{t.productsEyebrow}</p>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">{t.productsTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{t.productsText}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--accent)]/15 text-[color:var(--headline)]">
                <Layers3 className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--headline)]">
              {t.productsCta}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link href="/panel-x9k2m4q7r2a/users" className="group rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)] transition hover:-translate-y-1 hover:border-[color:var(--accent)]/35">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{t.usersEyebrow}</p>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">{t.usersTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{t.usersText}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--accent)]/15 text-[color:var(--headline)]">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--headline)]">
              {t.usersCta}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </div>
          </Link>
        </div>
      )}
    </AdminShell>
  );
}
