"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/ui/auth-shell";
import { useLocale } from "@/components/ui/locale-provider";
import { localizePathname } from "@/i18n/config";
import { loginCopy } from "@/lib/auth-copy";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase-client";

const copy = {
  en: {
    title: "Reset password",
    description: "Enter your email and we will send you a password reset link.",
    email: "Email",
    placeholder: "you@example.com",
    submit: "Send reset link",
    submitting: "Sending...",
    successTitle: "Reset link sent",
    successText: "Check your email for the recovery link.",
    errorRequired: "Enter your email.",
    errorInvalid: "Enter a valid email address.",
  },
  ru: {
    title: "Сброс пароля",
    description: "Введите email, и мы отправим ссылку для сброса пароля.",
    email: "Email",
    placeholder: "you@example.com",
    submit: "Отправить ссылку",
    submitting: "Отправляем...",
    successTitle: "Ссылка отправлена",
    successText: "Проверьте почту, чтобы открыть ссылку восстановления.",
    errorRequired: "Введите email.",
    errorInvalid: "Введите корректный email.",
  },
  el: {
    title: "Επαναφορά κωδικού",
    description: "Συμπληρώστε το email σας και θα στείλουμε σύνδεσμο επαναφοράς.",
    email: "Email",
    placeholder: "you@example.com",
    submit: "Αποστολή συνδέσμου",
    submitting: "Αποστολή...",
    successTitle: "Ο σύνδεσμος στάλθηκε",
    successText: "Ελέγξτε το email σας για τον σύνδεσμο ανάκτησης.",
    errorRequired: "Συμπληρώστε το email.",
    errorInvalid: "Συμπληρώστε έγκυρο email.",
  },
  lv: {
    title: "Paroles atjaunošana",
    description: "Ievadiet savu email, un mēs nosūtīsim paroles atjaunošanas saiti.",
    email: "Email",
    placeholder: "you@example.com",
    submit: "Nosūtīt saiti",
    submitting: "Nosūtām...",
    successTitle: "Saite ir nosūtīta",
    successText: "Pārbaudiet e-pastu, lai atvērtu atjaunošanas saiti.",
    errorRequired: "Ievadiet email.",
    errorInvalid: "Ievadiet derīgu email adresi.",
  },
} as const;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const { locale } = useLocale();
  const shared = loginCopy[locale];
  const t = copy[locale];
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [authError, setAuthError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setAuthError("");

    if (!email.trim()) {
      setError(t.errorRequired);
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setError(t.errorInvalid);
      return;
    }

    if (!isSupabaseConfigured()) {
      setAuthError(shared.missingConfig);
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}${localizePathname("/login", locale)}`
          : undefined;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (resetError) {
        setAuthError(resetError.message || shared.authErrorFallback);
        return;
      }

      setSubmitted(true);
    } catch {
      setAuthError(shared.authErrorFallback);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      topLabel={shared.top}
      backLabel={shared.back}
      title={t.title}
      description={t.description}
      activeTab="login"
      loginLabel={shared.login}
      registerLabel={shared.register}
    >
      {submitted ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-emerald-900">{t.successTitle}</p>
                <p className="mt-1 text-sm leading-6 text-emerald-800">{t.successText}</p>
              </div>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-6 text-sm font-medium text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)] transition hover:bg-[#efbf3e]"
          >
            {shared.login}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-[color:var(--headline)]">
              {t.email}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t.placeholder}
              className={`h-11 w-full rounded-xl border bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)] ${
                error ? "border-red-300" : "border-[#ece3d9]"
              }`}
            />
            {error ? <p className="text-xs text-red-500">{error}</p> : null}
          </div>

          {authError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {authError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-6 text-sm font-medium text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)] transition hover:bg-[#efbf3e] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? t.submitting : t.submit}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}
    </AuthShell>
  );
}
