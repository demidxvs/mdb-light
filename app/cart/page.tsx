"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, LoaderCircle, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { AuthShell } from "@/components/ui/auth-shell";
import { useLocale } from "@/components/ui/locale-provider";
import { localizePathname } from "@/i18n/config";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-client";
import {
  CART_UPDATED_EVENT,
  emitCartUpdated,
  getCurrentUserId,
  getOrCreateActiveCart,
  readGuestCartItems,
  updateGuestCartItemQuantity,
} from "@/lib/cart";
import { getDeliveryCopy } from "@/lib/order-utils";

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
    slug?: string;
    image_url?: string | null;
    sku?: string;
    selected_color?: string | null;
    selected_length?: string | null;
    selected_material?: string | null;
    selected_options?: Record<string, string> | null;
  } | null;
};

type CartRow = {
  id: string;
  currency: string;
  discount_cents: number;
};

const copy = {
  en: {
    top: "Multilingual LED marketplace",
    back: "Back to home",
    login: "Login",
    register: "Register",
    title: "Your cart",
    description: "Review selected products, adjust quantities, and continue shopping.",
    empty: "Your cart is empty.",
    action: "Open catalog",
    loading: "Loading cart...",
    price: "Price",
    quantity: "Quantity",
    subtotal: "Subtotal",
    discount: "Discount",
    total: "Total",
    remove: "Remove",
    color: "Color",
    length: "Length",
    material: "Material",
    loadError: "Could not load cart. Try again in a moment.",
    checkout: "Proceed to checkout",
  },
  ru: {
    top: "Мультиязычный маркетплейс LED-освещения",
    back: "Назад на главную",
    login: "Вход",
    register: "Регистрация",
    title: "Ваша корзина",
    description: "Проверьте выбранные товары, измените количество и продолжайте покупки.",
    empty: "Корзина пуста.",
    action: "Открыть каталог",
    loading: "Загружаю корзину...",
    price: "Цена",
    quantity: "Количество",
    subtotal: "Сумма",
    discount: "Скидка",
    total: "Итого",
    remove: "Удалить",
    color: "Цвет",
    length: "Длина",
    material: "Материал",
    loadError: "Не удалось загрузить корзину. Попробуйте ещё раз.",
    checkout: "Перейти к оформлению",
  },
  el: {
    top: "Πολύγλωσσο marketplace LED φωτισμού",
    back: "Πίσω στην αρχική",
    login: "Σύνδεση",
    register: "Εγγραφή",
    title: "Το καλάθι σας",
    description: "Ελέγξτε τα επιλεγμένα προϊόντα, αλλάξτε ποσότητες και συνεχίστε τις αγορές.",
    empty: "Το καλάθι είναι άδειο.",
    action: "Άνοιγμα καταλόγου",
    loading: "Φόρτωση καλαθιού...",
    price: "Τιμή",
    quantity: "Ποσότητα",
    subtotal: "Υποσύνολο",
    discount: "Έκπτωση",
    total: "Σύνολο",
    remove: "Διαγραφή",
    color: "Χρώμα",
    length: "Μήκος",
    material: "Υλικό",
    loadError: "Δεν ήταν δυνατή η φόρτωση του καλαθιού. Δοκιμάστε ξανά.",
    checkout: "Συνέχεια στο checkout",
  },
  lv: {
    top: "Daudzvalodu LED apgaismojuma marketplace",
    back: "Atpakaļ uz sākumu",
    login: "Pieslēgties",
    register: "Reģistrēties",
    title: "Jūsu grozs",
    description: "Pārskatiet izvēlētos produktus, mainiet daudzumu un turpiniet iepirkties.",
    empty: "Grozs ir tukšs.",
    action: "Atvērt katalogu",
    loading: "Ielādē grozu...",
    price: "Cena",
    quantity: "Daudzums",
    subtotal: "Starpsumma",
    discount: "Atlaide",
    total: "Kopā",
    remove: "Dzēst",
    color: "Krāsa",
    length: "Garums",
    material: "Materiāls",
    loadError: "Neizdevās ielādēt grozu. Mēģiniet vēlreiz.",
    checkout: "Turpināt uz checkout",
  },
} as const;

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "EUR",
  }).format(cents / 100);
}

export default function CartPage() {
  const { locale } = useLocale();
  const t = copy[locale];
  const supabaseReady = useMemo(() => isSupabaseConfigured(), []);
  const [loading, setLoading] = useState(supabaseReady);
  const [userId, setUserId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartRow | null>(null);
  const [items, setItems] = useState<CartItemRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const deliveryCopy = getDeliveryCopy(locale);

  useEffect(() => {
    if (!supabaseReady) return;
    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    const loadCart = async (soft = false) => {
      if (!soft) {
        setLoading(true);
      }

      setLoadError(null);

      try {
        const nextUserId = await getCurrentUserId(supabase);
        if (!mounted) return;
        setUserId(nextUserId);

        if (!nextUserId) {
          setItems(readGuestCartItems() as CartItemRow[]);
          setCart({ id: "guest-cart", currency: "EUR", discount_cents: 0 });
          return;
        }

        const activeCart = await getOrCreateActiveCart(supabase, nextUserId);
        if (!mounted) return;
        setCart({
          id: activeCart.id,
          currency: activeCart.currency,
          discount_cents: activeCart.discount_cents ?? 0,
        });

        const { data: itemData, error: itemError } = await supabase
          .from("cart_items")
          .select("id, product_id, quantity, unit_price_cents, currency, selected_color, selected_length, selected_material, selected_options, product_snapshot")
          .eq("cart_id", activeCart.id)
          .order("created_at", { ascending: false });

        if (itemError) {
          throw itemError;
        }

        if (!mounted) return;
        setItems((itemData as CartItemRow[] | null) ?? []);
      } catch (error) {
        if (!mounted) return;
        console.error("Failed to load cart", error);
        setLoadError(copy[locale].loadError);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadCart();
    const handleUpdated = () => void loadCart(true);
    window.addEventListener(CART_UPDATED_EVENT, handleUpdated);

    return () => {
      mounted = false;
      window.removeEventListener(CART_UPDATED_EVENT, handleUpdated);
    };
  }, [locale, supabaseReady]);

  const updateQuantity = async (item: CartItemRow, nextQuantity: number) => {
    if (!cart) return;

    if (!userId) {
      updateGuestCartItemQuantity(item.id, nextQuantity);
      return;
    }

    const supabase = createSupabaseBrowserClient();

    if (nextQuantity <= 0) {
      await supabase.from("cart_items").delete().eq("id", item.id);
      emitCartUpdated();
      return;
    }

    await supabase.from("cart_items").update({ quantity: nextQuantity }).eq("id", item.id);
    emitCartUpdated();
  };

  const subtotal = items.reduce((sum, item) => sum + item.unit_price_cents * item.quantity, 0);
  const discount = Math.min(cart?.discount_cents ?? 0, subtotal);
  const total = Math.max(subtotal - discount, 0);
  const currency = cart?.currency || items[0]?.currency || "EUR";

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
      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-[#ece3d9] bg-[#fffaf4]">
          <div className="flex items-center gap-3 text-sm text-[color:var(--muted)]">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            {t.loading}
          </div>
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{loadError}</div>
      ) : items.length === 0 ? (
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
      ) : (
        <div className="space-y-5">
          <div className="space-y-3">
            {items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-[#ece3d9] bg-[#fffaf4] p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#ece3d9] bg-white">
                      {item.product_snapshot?.image_url ? (
                        <Image
                          src={item.product_snapshot.image_url}
                          alt={item.product_snapshot?.name || item.product_snapshot?.sku || item.product_id}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center px-3 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-[color:var(--muted)]">
                          MDB Light
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-[color:var(--headline)]">{item.product_snapshot?.name || item.product_snapshot?.sku || item.product_id}</p>
                      {item.product_snapshot?.sku ? <p className="mt-1 text-xs text-[color:var(--muted)]">{item.product_snapshot.sku}</p> : null}
                      {(item.selected_color || item.product_snapshot?.selected_color) ? (
                        <p className="mt-1 text-xs text-[color:var(--muted)]">
                          {t.color}: {item.selected_color || item.product_snapshot?.selected_color}
                        </p>
                      ) : null}
                      {(item.selected_length || item.product_snapshot?.selected_length) ? (
                        <p className="mt-1 text-xs text-[color:var(--muted)]">
                          {t.length}: {item.selected_length || item.product_snapshot?.selected_length}
                        </p>
                      ) : null}
                      {(item.selected_material || item.product_snapshot?.selected_material) ? (
                        <p className="mt-1 text-xs text-[color:var(--muted)]">
                          {t.material}: {item.selected_material || item.product_snapshot?.selected_material}
                        </p>
                      ) : null}
                      {Object.entries(item.product_snapshot?.selected_options ?? {}).map(([key, value]) => (
                        <p key={key} className="mt-1 text-xs text-[color:var(--muted)]">
                          {key}: {value}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-[color:var(--headline)]">{formatMoney(item.unit_price_cents, item.currency)}</div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="inline-flex items-center rounded-xl border border-[#ece3d9] bg-white">
                    <button type="button" onClick={() => void updateQuantity(item, item.quantity - 1)} className="inline-flex h-10 w-10 items-center justify-center text-[color:var(--headline)]">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="inline-flex min-w-[40px] justify-center text-sm font-semibold text-[color:var(--headline)]">{item.quantity}</span>
                    <button type="button" onClick={() => void updateQuantity(item, item.quantity + 1)} className="inline-flex h-10 w-10 items-center justify-center text-[color:var(--headline)]">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[color:var(--headline)]">{formatMoney(item.unit_price_cents * item.quantity, item.currency)}</span>
                    <button type="button" onClick={() => void updateQuantity(item, 0)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-700">
                      <Trash2 className="h-4 w-4" />
                      {t.remove}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <section className="rounded-2xl border border-[#ece3d9] bg-[#fffaf4] p-5">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-[color:var(--muted)]">
                <span>{t.subtotal}</span>
                <span>{formatMoney(subtotal, currency)}</span>
              </div>
              <div className="flex items-center justify-between text-[color:var(--muted)]">
                <span>{t.discount}</span>
                <span>-{formatMoney(discount, currency)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[#ece3d9] pt-3 text-base font-semibold text-[color:var(--headline)]">
                <span>{t.total}</span>
                <span>{formatMoney(total, currency)}</span>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">{deliveryCopy.cartCheckout}</p>
            <button
              type="button"
              onClick={() => {
                window.location.href = localizePathname("/checkout", locale);
              }}
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 text-sm font-medium text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)] transition hover:bg-[#efbf3e]"
            >
              {t.checkout}
            </button>
          </section>
        </div>
      )}
    </AuthShell>
  );
}
