"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Blend,
  FileText,
  FolderTree,
  Images,
  Layers3,
  LoaderCircle,
  ReceiptText,
  ShoppingCart,
  ShieldAlert,
  Users,
} from "lucide-react";
import { AdminShell } from "@/components/ui/admin-shell";
import { useLocale } from "@/components/ui/locale-provider";
import {
  createAdminSupabaseBrowserClient,
  isAdminSupabaseConfigured,
} from "@/lib/admin-supabase-client";
import { localizePathname } from "@/i18n/config";

const adminPath = "/panel-x9k2m4q7r2a";

const copy = {
  en: {
    top: "Protected admin workspace",
    support: "Contact",
    title: "Admin dashboard",
    description:
      "Use separate sections for catalog, users, carts, invoices, and storefront content.",
    loading: "Checking admin session...",
    denied: "Admin sign-in required",
    signIn: "Sign in with a dedicated admin account to open this workspace.",
    noAccess: "Your admin session is not active.",
    categoriesEyebrow: "Categories",
    categoriesTitle: "Manage catalog directions",
    categoriesText: "Create categories, edit names and descriptions in 4 languages, delete them, and control the order shown on the storefront.",
    categoriesCta: "Open categories",
    productsEyebrow: "Products",
    productsTitle: "Manage catalog items",
    productsText:
      "Open the products section, see created items, and add a new product from a dedicated page.",
    productsCta: "Open products",
    attributesEyebrow: "Attributes",
    attributesTitle: "Manage product attributes",
    attributesText: "Create reusable characteristics and assign them later inside product cards.",
    attributesCta: "Open attributes",
    cartsEyebrow: "Carts",
    cartsTitle: "Review user carts",
    cartsText: "See active carts, line items, and set discounts directly from the admin panel.",
    cartsCta: "Open carts",
    ordersEyebrow: "Orders",
    ordersTitle: "Track paid orders",
    ordersText: "See successful Stripe orders, review line items, and update payment and fulfillment statuses.",
    ordersCta: "Open orders",
    invoicesEyebrow: "Invoices",
    invoicesTitle: "Build client invoices",
    invoicesText: "Manually assemble invoice lines from products, adjust prices, save drafts, and generate PDF files for clients.",
    invoicesCta: "Open invoice builder",
    projectsEyebrow: "Projects",
    projectsTitle: "Manage completed works",
    projectsText:
      "Upload gallery images, edit project titles and captions in 4 languages, and choose the 4 featured works for the homepage.",
    projectsCta: "Open projects",
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
      "Используйте отдельные разделы для каталога, пользователей, корзин, счетов и контента витрины.",
    loading: "Проверяю admin-сессию...",
    denied: "Требуется вход в админку",
    signIn: "Войдите через отдельный admin-аккаунт, чтобы открыть эту рабочую зону.",
    noAccess: "Admin-сессия не активна.",
    categoriesEyebrow: "Категории",
    categoriesTitle: "Управление направлениями каталога",
    categoriesText: "Создавайте категории, редактируйте названия и описания на 4 языках, удаляйте их и управляйте порядком показа на витрине.",
    categoriesCta: "Открыть категории",
    productsEyebrow: "Товары",
    productsTitle: "Управление каталогом",
    productsText:
      "Откройте раздел товаров, просматривайте созданные позиции и добавляйте новый товар на отдельной странице.",
    productsCta: "Открыть товары",
    attributesEyebrow: "Характеристики",
    attributesTitle: "Управление характеристиками",
    attributesText: "Создавайте универсальные характеристики и потом привязывайте их к товарам в карточке.",
    attributesCta: "Открыть характеристики",
    cartsEyebrow: "Корзины",
    cartsTitle: "Корзины пользователей",
    cartsText: "Просматривайте активные корзины, состав товаров и задавайте скидки прямо из админки.",
    cartsCta: "Открыть корзины",
    ordersEyebrow: "Заказы",
    ordersTitle: "Оплаченные заказы",
    ordersText: "Просматривайте успешные Stripe-заказы, состав товаров и обновляйте статусы оплаты и выполнения.",
    ordersCta: "Открыть заказы",
    invoicesEyebrow: "Счета",
    invoicesTitle: "Создание счетов",
    invoicesText: "Собирайте счет из товаров вручную, меняйте цены, сохраняйте черновики и генерируйте PDF для клиента.",
    invoicesCta: "Открыть конструктор счетов",
    projectsEyebrow: "Проекты",
    projectsTitle: "Управление выполненными работами",
    projectsText:
      "Загружайте изображения в галерею проектов, редактируйте названия и подписи на 4 языках и выбирайте 4 работы для главной страницы.",
    projectsCta: "Открыть проекты",
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
      "Χρησιμοποιήστε ξεχωριστές ενότητες για τον κατάλογο, τους χρήστες, τα καλάθια, τα invoices και το περιεχόμενο του storefront.",
    loading: "Έλεγχος admin συνεδρίας...",
    denied: "Απαιτείται admin σύνδεση",
    signIn: "Συνδεθείτε με ξεχωριστό admin λογαριασμό για να ανοίξετε αυτό το workspace.",
    noAccess: "Η admin συνεδρία δεν είναι ενεργή.",
    categoriesEyebrow: "Κατηγορίες",
    categoriesTitle: "Διαχείριση κατευθύνσεων καταλόγου",
    categoriesText: "Δημιουργήστε κατηγορίες, επεξεργαστείτε ονόματα και περιγραφές σε 4 γλώσσες, διαγράψτε τες και αλλάξτε τη σειρά εμφάνισης στη βιτρίνα.",
    categoriesCta: "Άνοιγμα κατηγοριών",
    productsEyebrow: "Προϊόντα",
    productsTitle: "Διαχείριση καταλόγου",
    productsText:
      "Ανοίξτε την ενότητα προϊόντων, δείτε τις καταχωρήσεις και προσθέστε νέο προϊόν από ξεχωριστή σελίδα.",
    productsCta: "Άνοιγμα προϊόντων",
    attributesEyebrow: "Χαρακτηριστικά",
    attributesTitle: "Διαχείριση χαρακτηριστικών",
    attributesText: "Δημιουργήστε επαναχρησιμοποιήσιμα χαρακτηριστικά και συνδέστε τα αργότερα με προϊόντα.",
    attributesCta: "Άνοιγμα χαρακτηριστικών",
    cartsEyebrow: "Καλάθια",
    cartsTitle: "Καλάθια χρηστών",
    cartsText: "Δείτε ενεργά καλάθια, προϊόντα και εφαρμόστε εκπτώσεις μέσα από το admin.",
    cartsCta: "Άνοιγμα καλαθιών",
    ordersEyebrow: "Παραγγελίες",
    ordersTitle: "Πληρωμένες παραγγελίες",
    ordersText: "Δείτε επιτυχημένες παραγγελίες Stripe, τα προϊόντα τους και ενημερώστε τις καταστάσεις πληρωμής και εκτέλεσης.",
    ordersCta: "Άνοιγμα παραγγελιών",
    invoicesEyebrow: "Invoices",
    invoicesTitle: "Build client invoices",
    invoicesText: "Assemble invoice lines from products, adjust prices, save drafts, and generate PDF files for clients.",
    invoicesCta: "Open invoice builder",
    projectsEyebrow: "Έργα",
    projectsTitle: "Διαχείριση ολοκληρωμένων έργων",
    projectsText:
      "Ανεβάστε εικόνες στη gallery έργων, επεξεργαστείτε τίτλους και λεζάντες σε 4 γλώσσες και επιλέξτε τα 4 έργα που εμφανίζονται στην αρχική.",
    projectsCta: "Άνοιγμα έργων",
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
      "Izmantojiet atsevišķas sadaļas katalogam, lietotājiem, groziem, rēķiniem un veikala saturam.",
    loading: "Tiek pārbaudīta admin sesija...",
    denied: "Nepieciešama admin pieslēgšanās",
    signIn: "Pieslēdzieties ar atsevišķu admin kontu, lai atvērtu šo vidi.",
    noAccess: "Admin sesija nav aktīva.",
    categoriesEyebrow: "Kategorijas",
    categoriesTitle: "Kataloga virzienu pārvaldība",
    categoriesText: "Veidojiet kategorijas, rediģējiet nosaukumus un aprakstus 4 valodās, dzēsiet tās un mainiet parādīšanas secību vitrīnā.",
    categoriesCta: "Atvērt kategorijas",
    productsEyebrow: "Produkti",
    productsTitle: "Kataloga pārvaldība",
    productsText:
      "Atveriet produktu sadaļu, skatiet izveidotos ierakstus un pievienojiet jaunu produktu atsevišķā lapā.",
    productsCta: "Atvērt produktus",
    attributesEyebrow: "Raksturlielumi",
    attributesTitle: "Raksturlielumu pārvaldība",
    attributesText: "Izveidojiet atkārtoti izmantojamus raksturlielumus un vēlāk piesaistiet tos produktu kartītēs.",
    attributesCta: "Atvērt raksturlielumus",
    cartsEyebrow: "Grozi",
    cartsTitle: "Lietotāju grozi",
    cartsText: "Skatiet aktīvos grozus, preces tajos un piešķiriet atlaides no administrācijas paneļa.",
    cartsCta: "Atvērt grozus",
    ordersEyebrow: "Pasūtījumi",
    ordersTitle: "Apmaksātie pasūtījumi",
    ordersText: "Skatiet veiksmīgos Stripe pasūtījumus, to pozīcijas un atjauniniet maksājuma un izpildes statusus.",
    ordersCta: "Atvērt pasūtījumus",
    invoicesEyebrow: "Rēķini",
    invoicesTitle: "Rēķinu veidošana",
    invoicesText: "Salieciet rēķinu no produktiem, koriģējiet cenas, saglabājiet melnrakstus un ģenerējiet PDF klientam.",
    invoicesCta: "Atvērt rēķinu veidotāju",
    projectsEyebrow: "Projekti",
    projectsTitle: "Paveikto darbu pārvaldība",
    projectsText:
      "Augšupielādējiet attēlus projektu galerijā, rediģējiet nosaukumus un parakstus 4 valodās un izvēlieties 4 darbus sākumlapai.",
    projectsCta: "Atvērt projektus",
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
  const href = (pathname: string) => localizePathname(pathname, locale);
  const supabaseReady = useMemo(() => isAdminSupabaseConfigured(), []);
  const [loading, setLoading] = useState(supabaseReady);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(
    supabaseReady ? "" : "Admin Supabase is not configured.",
  );

  useEffect(() => {
    if (!supabaseReady) return;
    const supabase = createAdminSupabaseBrowserClient();
    let mounted = true;

    const hydrate = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      const user = session?.user;
      if (!user) {
        setError(t.signIn);
        setLoading(false);
        router.replace(
          `${localizePathname("/panel-x9k2m4q7r2a/login", locale)}?next=${encodeURIComponent(adminPath)}`,
        );
        return;
      }
      setIsAdmin(true);
      setLoading(false);
    };

    void hydrate();
    return () => {
      mounted = false;
    };
  }, [locale, router, supabaseReady, t.signIn]);

  return (
    <AdminShell
      topLabel={t.top}
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
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Link href={href("/panel-x9k2m4q7r2a/categories")} className="group rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)] transition hover:-translate-y-1 hover:border-[color:var(--accent)]/35">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{t.categoriesEyebrow}</p>
                <h2 className="mt-3 font-display text-[2rem] font-semibold leading-[1.05] tracking-[-0.04em] text-[color:var(--headline)]">{t.categoriesTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{t.categoriesText}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--accent)]/15 text-[color:var(--headline)]">
                <FolderTree className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--headline)]">
              {t.categoriesCta}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link href={href("/panel-x9k2m4q7r2a/products")} className="group rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)] transition hover:-translate-y-1 hover:border-[color:var(--accent)]/35">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{t.productsEyebrow}</p>
                <h2 className="mt-3 font-display text-[2rem] font-semibold leading-[1.05] tracking-[-0.04em] text-[color:var(--headline)]">{t.productsTitle}</h2>
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

          <Link href={href("/panel-x9k2m4q7r2a/attributes")} className="group rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)] transition hover:-translate-y-1 hover:border-[color:var(--accent)]/35">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{t.attributesEyebrow}</p>
                <h2 className="mt-3 font-display text-[2rem] font-semibold leading-[1.05] tracking-[-0.04em] text-[color:var(--headline)]">{t.attributesTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{t.attributesText}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--accent)]/15 text-[color:var(--headline)]">
                <Blend className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--headline)]">
              {t.attributesCta}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link href={href("/panel-x9k2m4q7r2a/carts")} className="group rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)] transition hover:-translate-y-1 hover:border-[color:var(--accent)]/35">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{t.cartsEyebrow}</p>
                <h2 className="mt-3 font-display text-[2rem] font-semibold leading-[1.05] tracking-[-0.04em] text-[color:var(--headline)]">{t.cartsTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{t.cartsText}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--accent)]/15 text-[color:var(--headline)]">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--headline)]">
              {t.cartsCta}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link href={href("/panel-x9k2m4q7r2a/orders")} className="group rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)] transition hover:-translate-y-1 hover:border-[color:var(--accent)]/35">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{t.ordersEyebrow}</p>
                <h2 className="mt-3 font-display text-[2rem] font-semibold leading-[1.05] tracking-[-0.04em] text-[color:var(--headline)]">{t.ordersTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{t.ordersText}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--accent)]/15 text-[color:var(--headline)]">
                <ReceiptText className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--headline)]">
              {t.ordersCta}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link href={href("/panel-x9k2m4q7r2a/invoices")} className="group rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)] transition hover:-translate-y-1 hover:border-[color:var(--accent)]/35">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{t.invoicesEyebrow}</p>
                <h2 className="mt-3 font-display text-[2rem] font-semibold leading-[1.05] tracking-[-0.04em] text-[color:var(--headline)]">{t.invoicesTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{t.invoicesText}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--accent)]/15 text-[color:var(--headline)]">
                <FileText className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--headline)]">
              {t.invoicesCta}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link href={href("/panel-x9k2m4q7r2a/users")} className="group rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)] transition hover:-translate-y-1 hover:border-[color:var(--accent)]/35">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{t.usersEyebrow}</p>
                <h2 className="mt-3 font-display text-[2rem] font-semibold leading-[1.05] tracking-[-0.04em] text-[color:var(--headline)]">{t.usersTitle}</h2>
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

          <Link href={href("/panel-x9k2m4q7r2a/projects")} className="group rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)] transition hover:-translate-y-1 hover:border-[color:var(--accent)]/35">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{t.projectsEyebrow}</p>
                <h2 className="mt-3 font-display text-[2rem] font-semibold leading-[1.05] tracking-[-0.04em] text-[color:var(--headline)]">{t.projectsTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{t.projectsText}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--accent)]/15 text-[color:var(--headline)]">
                <Images className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--headline)]">
              {t.projectsCta}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </div>
          </Link>
        </div>
      )}
    </AdminShell>
  );
}
