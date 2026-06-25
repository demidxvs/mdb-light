"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/ui/admin-shell";
import { useLocale } from "@/components/ui/locale-provider";
import { localizePathname } from "@/i18n/config";
import { isAdminSupabaseConfigured } from "@/lib/admin-supabase-client";

type PromoCodeRow = {
  code: string;
  discount_percent: number;
  created_at: string;
};

const copy = {
  en: {
    top: "Protected promo code management area",
    title: "Promo codes",
    description: "Create product discounts. Delivery is never discounted.",
    loading: "Loading promo codes...",
    denied: "Admin access required",
    signIn: "Sign in first to open the admin panel.",
    noAccess: "You do not have access to this page.",
    code: "Promo code",
    discount: "Discount percent",
    create: "Create promo code",
    creating: "Saving...",
    activeCodes: "Active promo codes",
    empty: "No promo codes yet.",
    delete: "Delete",
    deleting: "Deleting...",
    created: "Created",
    saved: "Promo code saved.",
    removed: "Promo code deleted.",
    invalid: "Enter a code and discount from 1 to 100.",
    error: "Could not save promo code.",
    deleteError: "Could not delete promo code.",
  },
  ru: {
    top: "Защищенная зона управления промокодами",
    title: "Промокоды",
    description: "Создавайте скидки на товары. Доставка не участвует в скидке.",
    loading: "Загружаю промокоды...",
    denied: "Требуется доступ администратора",
    signIn: "Сначала войдите, чтобы открыть админку.",
    noAccess: "У вас нет доступа к этой странице.",
    code: "Промокод",
    discount: "Процент скидки",
    create: "Создать промокод",
    creating: "Сохраняю...",
    activeCodes: "Активные промокоды",
    empty: "Промокодов пока нет.",
    delete: "Удалить",
    deleting: "Удаляю...",
    created: "Создан",
    saved: "Промокод сохранён.",
    removed: "Промокод удалён.",
    invalid: "Введите код и скидку от 1 до 100.",
    error: "Не удалось сохранить промокод.",
    deleteError: "Не удалось удалить промокод.",
  },
  el: {
    top: "Προστατευμένη διαχείριση promo codes",
    title: "Promo codes",
    description: "Δημιουργήστε εκπτώσεις προϊόντων. Η παράδοση δεν έχει έκπτωση.",
    loading: "Φόρτωση promo codes...",
    denied: "Απαιτείται πρόσβαση διαχειριστή",
    signIn: "Συνδεθείτε πρώτα για να ανοίξετε το admin panel.",
    noAccess: "Δεν έχετε πρόσβαση σε αυτή τη σελίδα.",
    code: "Promo code",
    discount: "Ποσοστό έκπτωσης",
    create: "Δημιουργία promo code",
    creating: "Αποθήκευση...",
    activeCodes: "Ενεργά promo codes",
    empty: "Δεν υπάρχουν promo codes.",
    delete: "Διαγραφή",
    deleting: "Διαγραφή...",
    created: "Δημιουργήθηκε",
    saved: "Το promo code αποθηκεύτηκε.",
    removed: "Το promo code διαγράφηκε.",
    invalid: "Συμπληρώστε κωδικό και έκπτωση από 1 έως 100.",
    error: "Δεν ήταν δυνατή η αποθήκευση.",
    deleteError: "Δεν ήταν δυνατή η διαγραφή.",
  },
  lv: {
    top: "Aizsargāta promo kodu pārvaldība",
    title: "Promo kodi",
    description: "Izveidojiet produktu atlaides. Piegāde netiek diskontēta.",
    loading: "Ielādē promo kodus...",
    denied: "Nepieciešama administratora piekļuve",
    signIn: "Lai atvērtu admin paneli, vispirms pieslēdzieties.",
    noAccess: "Jums nav piekļuves šai lapai.",
    code: "Promo kods",
    discount: "Atlaide procentos",
    create: "Izveidot promo kodu",
    creating: "Saglabā...",
    activeCodes: "Aktīvie promo kodi",
    empty: "Promo kodu vēl nav.",
    delete: "Dzēst",
    deleting: "Dzēš...",
    created: "Izveidots",
    saved: "Promo kods saglabāts.",
    removed: "Promo kods dzēsts.",
    invalid: "Ievadiet kodu un atlaidi no 1 līdz 100.",
    error: "Neizdevās saglabāt promo kodu.",
    deleteError: "Neizdevās dzēst promo kodu.",
  },
} as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function AdminPromoCodesPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = copy[locale];
  const supabaseReady = useMemo(() => isAdminSupabaseConfigured(), []);
  const [loading, setLoading] = useState(supabaseReady);
  const [isAdmin, setIsAdmin] = useState(false);
  const [promoCodes, setPromoCodes] = useState<PromoCodeRow[]>([]);
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("50");
  const [submitting, setSubmitting] = useState(false);
  const [deletingCode, setDeletingCode] = useState("");
  const [error, setError] = useState(supabaseReady ? "" : "Supabase is not configured.");
  const [message, setMessage] = useState("");

  const loadPromoCodes = useCallback(async () => {
    const response = await fetch("/api/admin/promo-codes", { credentials: "include" });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      promoCodes?: PromoCodeRow[];
    };

    if (response.status === 401) {
      router.replace(localizePathname("/panel-x9k2m4q7r2a/login", locale));
      return;
    }

    if (!response.ok) {
      setError(payload.error || t.noAccess);
      return;
    }

    setPromoCodes(payload.promoCodes ?? []);
    setIsAdmin(true);
  }, [locale, router, t.noAccess]);

  useEffect(() => {
    if (!supabaseReady) return;
    let mounted = true;

    const hydrate = async () => {
      await loadPromoCodes();
      if (mounted) setLoading(false);
    };

    void hydrate();
    return () => {
      mounted = false;
    };
  }, [loadPromoCodes, supabaseReady]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const parsedDiscount = Number.parseFloat(discountPercent.replace(",", "."));
    if (!code.trim() || !Number.isFinite(parsedDiscount) || parsedDiscount <= 0 || parsedDiscount > 100) {
      setError(t.invalid);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code,
          discountPercent: parsedDiscount,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (response.status === 401) {
        router.replace(localizePathname("/panel-x9k2m4q7r2a/login", locale));
        return;
      }

      if (!response.ok) {
        setError(payload.error || t.error);
        return;
      }

      setCode("");
      setDiscountPercent("50");
      setMessage(t.saved);
      await loadPromoCodes();
    } catch {
      setError(t.error);
    } finally {
      setSubmitting(false);
    }
  };

  const deletePromoCode = async (nextCode: string) => {
    setError("");
    setMessage("");
    setDeletingCode(nextCode);

    try {
      const response = await fetch("/api/admin/promo-codes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: nextCode }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (response.status === 401) {
        router.replace(localizePathname("/panel-x9k2m4q7r2a/login", locale));
        return;
      }

      if (!response.ok) {
        setError(payload.error || t.deleteError);
        return;
      }

      setMessage(t.removed);
      await loadPromoCodes();
    } catch {
      setError(t.deleteError);
    } finally {
      setDeletingCode("");
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
              <h2 className="font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">{t.denied}</h2>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{error || t.signIn}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <form onSubmit={handleSubmit} className="space-y-5 rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
            <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
              <span>{t.code}</span>
              <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]" />
            </label>
            <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
              <span>{t.discount}</span>
              <input type="number" min="1" max="100" step="0.01" value={discountPercent} onChange={(event) => setDiscountPercent(event.target.value)} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]" />
            </label>
            <button type="submit" disabled={submitting} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-6 text-sm font-medium text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)] transition hover:bg-[#efbf3e] disabled:cursor-not-allowed disabled:opacity-70">
              {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {submitting ? t.creating : t.create}
            </button>
          </form>

          <section className="space-y-4 rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">{t.activeCodes}</h2>
            {promoCodes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#e8dccf] bg-[#fffcf7] px-4 py-5 text-sm text-[color:var(--muted)]">{t.empty}</div>
            ) : (
              <div className="space-y-3">
                {promoCodes.map((promoCode) => (
                  <div key={promoCode.code} className="flex flex-wrap items-center justify-between gap-3 rounded-[1.35rem] border border-[#ece3d9] bg-[#fffcf7] p-4">
                    <div>
                      <p className="text-base font-semibold text-[color:var(--headline)]">{promoCode.code}</p>
                      <p className="mt-1 text-sm text-[color:var(--muted)]">
                        {Number(promoCode.discount_percent)}% · {t.created}: {formatDate(promoCode.created_at)}
                      </p>
                    </div>
                    <button type="button" onClick={() => void deletePromoCode(promoCode.code)} disabled={deletingCode === promoCode.code} className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-700 disabled:cursor-not-allowed disabled:opacity-60">
                      {deletingCode === promoCode.code ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      {deletingCode === promoCode.code ? t.deleting : t.delete}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </AdminShell>
  );
}
