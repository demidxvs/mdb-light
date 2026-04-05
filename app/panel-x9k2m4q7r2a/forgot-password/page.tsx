"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { AdminAuthShell } from "@/components/ui/admin-auth-shell";
import { useLocale } from "@/components/ui/locale-provider";
import { localizePathname } from "@/i18n/config";
import {
  createAdminSupabaseBrowserClient,
  isAdminSupabaseConfigured,
} from "@/lib/admin-supabase-client";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const copy = {
  en: {
    top: "Separate administrator workspace",
    back: "Back to storefront",
    title: "Reset admin password",
    description:
      "Send a recovery link for the separate admin account. Storefront customer accounts are not affected.",
    email: "Email",
    submit: "Send reset link",
    submitting: "Sending...",
    success:
      "If the email exists in the admin workspace, the recovery link has been sent.",
    missingConfig:
      "Admin Supabase is not configured yet. Add NEXT_PUBLIC_ADMIN_SUPABASE_URL and NEXT_PUBLIC_ADMIN_SUPABASE_ANON_KEY.",
    errorFallback: "Could not send the recovery email. Please try again.",
    errors: {
      emailRequired: "Enter your email.",
      emailInvalid: "Enter a valid email address.",
    },
  },
  ru: {
    top: "Отдельная рабочая зона администратора",
    back: "Назад в магазин",
    title: "Сброс пароля администратора",
    description:
      "Отправьте recovery-ссылку для отдельного admin-аккаунта. Это не влияет на клиентские аккаунты магазина.",
    email: "Email",
    submit: "Отправить ссылку",
    submitting: "Отправляем...",
    success:
      "Если такой email есть в админке, ссылка для восстановления уже отправлена.",
    missingConfig:
      "Admin Supabase еще не настроен. Добавьте NEXT_PUBLIC_ADMIN_SUPABASE_URL и NEXT_PUBLIC_ADMIN_SUPABASE_ANON_KEY.",
    errorFallback: "Не удалось отправить письмо для восстановления. Попробуйте еще раз.",
    errors: {
      emailRequired: "Введите email.",
      emailInvalid: "Введите корректный email.",
    },
  },
  el: {
    top: "Ξεχωριστός χώρος διαχείρισης",
    back: "Επιστροφή στο storefront",
    title: "Επαναφορά admin κωδικού",
    description:
      "Στείλτε recovery link για τον ξεχωριστό admin λογαριασμό. Δεν επηρεάζει τους λογαριασμούς πελατών του storefront.",
    email: "Email",
    submit: "Αποστολή συνδέσμου",
    submitting: "Αποστολή...",
    success:
      "Αν το email υπάρχει στο admin workspace, ο σύνδεσμος επαναφοράς έχει σταλεί.",
    missingConfig:
      "Το admin Supabase δεν έχει ρυθμιστεί ακόμα. Προσθέστε NEXT_PUBLIC_ADMIN_SUPABASE_URL και NEXT_PUBLIC_ADMIN_SUPABASE_ANON_KEY.",
    errorFallback:
      "Η αποστολή του recovery email απέτυχε. Δοκιμάστε ξανά.",
    errors: {
      emailRequired: "Συμπληρώστε το email.",
      emailInvalid: "Συμπληρώστε έγκυρο email.",
    },
  },
  lv: {
    top: "Atsevišķa administratora vide",
    back: "Atpakaļ uz veikalu",
    title: "Admin paroles atjaunošana",
    description:
      "Nosūtiet atjaunošanas saiti atsevišķajam admin kontam. Tas neietekmē veikala klientu kontus.",
    email: "Email",
    submit: "Nosūtīt saiti",
    submitting: "Nosūtām...",
    success:
      "Ja šāds email ir admin vidē, paroles atjaunošanas saite jau ir nosūtīta.",
    missingConfig:
      "Admin Supabase vēl nav iestatīts. Pievienojiet NEXT_PUBLIC_ADMIN_SUPABASE_URL un NEXT_PUBLIC_ADMIN_SUPABASE_ANON_KEY.",
    errorFallback:
      "Neizdevās nosūtīt paroles atjaunošanas vēstuli. Mēģiniet vēlreiz.",
    errors: {
      emailRequired: "Ievadiet email.",
      emailInvalid: "Ievadiet derīgu email adresi.",
    },
  },
} as const;

export default function AdminForgotPasswordPage() {
  const { locale } = useLocale();
  const t = copy[locale];
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [authError, setAuthError] = useState("");
  const [fieldError, setFieldError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess("");
    setAuthError("");
    setFieldError("");

    if (!email.trim()) {
      setFieldError(t.errors.emailRequired);
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setFieldError(t.errors.emailInvalid);
      return;
    }

    if (!isAdminSupabaseConfigured()) {
      setAuthError(t.missingConfig);
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createAdminSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}${localizePathname("/panel-x9k2m4q7r2a/login", locale)}`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (error) {
        setAuthError(error.message || t.errorFallback);
        return;
      }

      setSuccess(t.success);
      setEmail("");
    } catch {
      setAuthError(t.errorFallback);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminAuthShell
      topLabel={t.top}
      backLabel={t.back}
      title={t.title}
      description={t.description}
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[color:var(--headline)]">
            {t.email}
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 w-full rounded-2xl border border-[#e6ddd3] bg-[#fffdfa] px-4 text-sm text-[color:var(--headline)] outline-none transition focus:border-[color:var(--accent)] focus:bg-white"
            autoComplete="email"
          />
          {fieldError ? (
            <p className="text-sm text-[#c84b31]">{fieldError}</p>
          ) : null}
        </div>

        {authError ? (
          <div className="rounded-2xl border border-[#f4c7bc] bg-[#fff4ef] px-4 py-3 text-sm text-[#af4b2b]">
            {authError}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[color:var(--accent)] px-5 text-sm font-semibold text-[#203153] shadow-[0_18px_35px_rgba(244,198,79,0.24)] transition hover:translate-y-[-1px] hover:shadow-[0_20px_42px_rgba(244,198,79,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <LoaderCircle className="h-4.5 w-4.5 animate-spin" />
          ) : (
            <ArrowRight className="h-4.5 w-4.5" />
          )}
          {submitting ? t.submitting : t.submit}
        </button>
      </form>
    </AdminAuthShell>
  );
}
