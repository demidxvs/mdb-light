"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { useLocale } from "@/components/ui/locale-provider";
import { localizePathname } from "@/i18n/config";
import {
  clearGuestCart,
  getCurrentUserId,
  getOrCreateActiveCart,
  readGuestCartItems,
} from "@/lib/cart";
import { getDeliveryCopy, type OrderPaymentMethod } from "@/lib/order-utils";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-client";

type CartItemRow = {
  id: string;
  product_id: string;
  quantity: number;
  unit_price_cents: number;
  currency: string;
  selected_color?: string | null;
  selected_length?: string | null;
  selected_material?: string | null;
  selected_options?: Record<string, string> | null;
  product_snapshot: {
    name?: string;
    sku?: string;
    selected_options?: Record<string, string> | null;
  } | null;
};

type CartRow = {
  currency: string;
  discount_cents: number;
};

type CheckoutFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  note: string;
  password: string;
  confirmPassword: string;
};

const copy = {
  en: {
    title: "Checkout",
    description: "Enter your contact details, choose the payment method and confirm your order.",
    loading: "Loading checkout...",
    paymentMethod: "Payment method",
    contactTitle: "Contact details",
    accountTitle: "Account",
    guestHint: "You can complete the order as a guest or create an account during checkout.",
    createAccount: "Create account",
    createAccountHint: "Use the same email for the order and your future account.",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    note: "Order note",
    password: "Password",
    confirmPassword: "Confirm password",
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
    required: "Please fill in all required fields.",
    invalidEmail: "Please enter a valid email address.",
    passwordShort: "Password must be at least 8 characters.",
    passwordMismatch: "Passwords do not match.",
  },
  ru: {
    title: "Оформление заказа",
    description: "Введите контактные данные, выберите способ оплаты и подтвердите заказ.",
    loading: "Загружаем checkout...",
    paymentMethod: "Способ оплаты",
    contactTitle: "Контактные данные",
    accountTitle: "Аккаунт",
    guestHint: "Вы можете оформить заказ как гость или создать аккаунт во время checkout.",
    createAccount: "Создать аккаунт",
    createAccountHint: "Для заказа и нового аккаунта будет использоваться один и тот же email.",
    firstName: "Имя",
    lastName: "Фамилия",
    email: "Email",
    phone: "Телефон",
    note: "Комментарий к заказу",
    password: "Пароль",
    confirmPassword: "Подтверждение пароля",
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
    required: "Заполните все обязательные поля.",
    invalidEmail: "Введите корректный email.",
    passwordShort: "Пароль должен содержать минимум 8 символов.",
    passwordMismatch: "Пароли не совпадают.",
  },
  el: {
    title: "Checkout",
    description: "Συμπληρώστε τα στοιχεία επικοινωνίας, επιλέξτε τρόπο πληρωμής και επιβεβαιώστε την παραγγελία.",
    loading: "Φόρτωση checkout...",
    paymentMethod: "Τρόπος πληρωμής",
    contactTitle: "Στοιχεία επικοινωνίας",
    accountTitle: "Λογαριασμός",
    guestHint: "Μπορείτε να ολοκληρώσετε την παραγγελία ως επισκέπτης ή να δημιουργήσετε λογαριασμό στο checkout.",
    createAccount: "Δημιουργία λογαριασμού",
    createAccountHint: "Το ίδιο email θα χρησιμοποιηθεί για την παραγγελία και τον νέο λογαριασμό.",
    firstName: "Όνομα",
    lastName: "Επώνυμο",
    email: "Email",
    phone: "Τηλέφωνο",
    note: "Σχόλιο παραγγελίας",
    password: "Κωδικός πρόσβασης",
    confirmPassword: "Επιβεβαίωση κωδικού",
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
    required: "Συμπληρώστε όλα τα υποχρεωτικά πεδία.",
    invalidEmail: "Συμπληρώστε έγκυρο email.",
    passwordShort: "Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.",
    passwordMismatch: "Οι κωδικοί δεν ταιριάζουν.",
  },
  lv: {
    title: "Checkout",
    description: "Ievadiet kontaktinformāciju, izvēlieties apmaksas veidu un apstipriniet pasūtījumu.",
    loading: "Ielādē checkout...",
    paymentMethod: "Apmaksas veids",
    contactTitle: "Kontaktinformācija",
    accountTitle: "Konts",
    guestHint: "Pasūtījumu varat noformēt kā viesis vai izveidot kontu checkout laikā.",
    createAccount: "Izveidot kontu",
    createAccountHint: "Pasūtījumam un jaunajam kontam tiks izmantots viens un tas pats email.",
    firstName: "Vārds",
    lastName: "Uzvārds",
    email: "Email",
    phone: "Tālrunis",
    note: "Komentārs pasūtījumam",
    password: "Parole",
    confirmPassword: "Apstipriniet paroli",
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
    required: "Aizpildiet visus obligātos laukus.",
    invalidEmail: "Ievadiet korektu email adresi.",
    passwordShort: "Parolei jābūt vismaz 8 simbolus garai.",
    passwordMismatch: "Paroles nesakrīt.",
  },
} as const;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "EUR",
  }).format(cents / 100);
}

function buildInitialFormState(): CheckoutFormState {
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    note: "",
    password: "",
    confirmPassword: "",
  };
}

export default function CheckoutPage() {
  const { locale } = useLocale();
  const t = copy[locale];
  const deliveryCopy = getDeliveryCopy(locale);
  const supabaseReady = useMemo(() => isSupabaseConfigured(), []);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartRow | null>(null);
  const [items, setItems] = useState<CartItemRow[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>("stripe");
  const [createAccount, setCreateAccount] = useState(false);
  const [form, setForm] = useState<CheckoutFormState>(buildInitialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        if (!supabaseReady) {
          const guestItems = readGuestCartItems() as CartItemRow[];
          if (!mounted) return;
          setUserId(null);
          setItems(guestItems);
          setCart({ currency: guestItems[0]?.currency || "EUR", discount_cents: 0 });
          return;
        }

        const supabase = createSupabaseBrowserClient();
        const nextUserId = await getCurrentUserId(supabase);
        if (!mounted) return;

        setUserId(nextUserId);

        if (!nextUserId) {
          const guestItems = readGuestCartItems() as CartItemRow[];
          setItems(guestItems);
          setCart({ currency: guestItems[0]?.currency || "EUR", discount_cents: 0 });
          return;
        }

        const activeCart = await getOrCreateActiveCart(supabase, nextUserId);
        const [{ data: itemRows, error: itemError }, { data: profileData }, authResult] =
          await Promise.all([
            supabase
              .from("cart_items")
              .select("id, product_id, quantity, unit_price_cents, currency, selected_color, selected_length, selected_material, selected_options, product_snapshot")
              .eq("cart_id", activeCart.id)
              .order("created_at", { ascending: true }),
            supabase
              .from("profiles")
              .select("first_name, last_name, email, phone")
              .eq("id", nextUserId)
              .maybeSingle(),
            supabase.auth.getUser(),
          ]);

        if (itemError) {
          throw itemError;
        }

        if (!mounted) return;

        const authUser = authResult.data.user;
        setCart({
          currency: activeCart.currency,
          discount_cents: activeCart.discount_cents ?? 0,
        });
        setItems((itemRows as CartItemRow[] | null) ?? []);
        setForm((current) => ({
          ...current,
          firstName: profileData?.first_name || authUser?.user_metadata?.first_name || "",
          lastName: profileData?.last_name || authUser?.user_metadata?.last_name || "",
          email: profileData?.email || authUser?.email || "",
          phone: profileData?.phone || authUser?.user_metadata?.phone || "",
        }));
      } catch {
        if (!mounted) return;
        setError(t.error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [supabaseReady, t.error]);

  const subtotal = items.reduce((sum, item) => sum + item.unit_price_cents * item.quantity, 0);
  const discount = Math.min(cart?.discount_cents ?? 0, subtotal);
  const total = Math.max(subtotal - discount, 0);
  const currency = cart?.currency || items[0]?.currency || "EUR";

  const updateField = <K extends keyof CheckoutFormState>(key: K, value: CheckoutFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validate = () => {
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.phone.trim()
    ) {
      return t.required;
    }

    if (!emailRegex.test(form.email.trim())) {
      return t.invalidEmail;
    }

    if (!userId && createAccount) {
      if (form.password.length < 8) {
        return t.passwordShort;
      }

      if (form.password !== form.confirmPassword) {
        return t.passwordMismatch;
      }
    }

    return "";
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          locale,
          paymentMethod,
          createAccount: !userId && createAccount,
          password: form.password,
          confirmPassword: form.confirmPassword,
          customer: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            note: form.note,
          },
          items: !userId
            ? items.map((item) => ({
                productId: item.product_id,
                quantity: item.quantity,
                selectedColor: item.selected_color ?? null,
                selectedLength: item.selected_length ?? null,
                selectedMaterial: item.selected_material ?? null,
                selectedOptions: item.selected_options ?? {},
                selectedOptionLabels: item.product_snapshot?.selected_options ?? {},
                productSnapshot: item.product_snapshot,
              }))
            : undefined,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        url?: string;
        clearGuestCart?: boolean;
      };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || t.error);
      }

      if (payload.clearGuestCart) {
        clearGuestCart();
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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{t.contactTitle}</p>
            {!userId ? <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{t.guestHint}</p> : null}
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} placeholder={t.firstName} className="h-12 rounded-xl border border-[#ece3d9] bg-white px-4 text-sm text-[color:var(--headline)] outline-none transition focus:border-[color:var(--accent)]" />
              <input value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} placeholder={t.lastName} className="h-12 rounded-xl border border-[#ece3d9] bg-white px-4 text-sm text-[color:var(--headline)] outline-none transition focus:border-[color:var(--accent)]" />
              <input value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder={t.email} className="h-12 rounded-xl border border-[#ece3d9] bg-white px-4 text-sm text-[color:var(--headline)] outline-none transition focus:border-[color:var(--accent)]" />
              <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder={t.phone} className="h-12 rounded-xl border border-[#ece3d9] bg-white px-4 text-sm text-[color:var(--headline)] outline-none transition focus:border-[color:var(--accent)]" />
              <textarea value={form.note} onChange={(event) => updateField("note", event.target.value)} placeholder={t.note} className="min-h-[100px] rounded-xl border border-[#ece3d9] bg-white px-4 py-3 text-sm text-[color:var(--headline)] outline-none transition focus:border-[color:var(--accent)] md:col-span-2" />
            </div>
          </div>

          {!userId ? (
            <div className="mt-8 rounded-[24px] border border-[#ece3d9] bg-white p-5">
              <div className="flex items-start gap-3">
                <input id="create-account" type="checkbox" checked={createAccount} onChange={(event) => setCreateAccount(event.target.checked)} className="mt-1 h-4 w-4 accent-[color:var(--accent)]" />
                <label htmlFor="create-account" className="space-y-1">
                  <p className="text-sm font-semibold text-[color:var(--headline)]">{t.createAccount}</p>
                  <p className="text-sm leading-6 text-[color:var(--muted)]">{t.createAccountHint}</p>
                </label>
              </div>

              {createAccount ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <input value={form.password} onChange={(event) => updateField("password", event.target.value)} type="password" placeholder={t.password} className="h-12 rounded-xl border border-[#ece3d9] bg-[#fffdf8] px-4 text-sm text-[color:var(--headline)] outline-none transition focus:border-[color:var(--accent)]" />
                  <input value={form.confirmPassword} onChange={(event) => updateField("confirmPassword", event.target.value)} type="password" placeholder={t.confirmPassword} className="h-12 rounded-xl border border-[#ece3d9] bg-[#fffdf8] px-4 text-sm text-[color:var(--headline)] outline-none transition focus:border-[color:var(--accent)]" />
                </div>
              ) : null}
            </div>
          ) : null}

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
