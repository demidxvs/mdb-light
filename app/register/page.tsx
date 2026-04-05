"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { AuthShell } from "@/components/ui/auth-shell";
import { useLocale } from "@/components/ui/locale-provider";
import PasswordInput from "@/components/ui/password-input-1";
import { registerCopy } from "@/lib/auth-copy";
import { localizePathname } from "@/i18n/config";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase-client";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const { locale } = useLocale();
  const t = registerCopy[locale];
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    consent?: string;
  }>({});

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setCheckingSession(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      if (data.user) {
        window.location.replace("/account");
        return;
      }
      setCheckingSession(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const validate = () => {
    const nextErrors: typeof errors = {};

    if (!firstName.trim()) nextErrors.firstName = t.errors.firstNameRequired;
    if (!lastName.trim()) nextErrors.lastName = t.errors.lastNameRequired;
    if (!phone.trim()) nextErrors.phone = t.errors.phoneRequired;

    if (!email.trim()) {
      nextErrors.email = t.errors.emailRequired;
    } else if (!emailRegex.test(email.trim())) {
      nextErrors.email = t.errors.emailInvalid;
    }

    if (!password) {
      nextErrors.password = t.errors.passwordRequired;
    } else if (password.length < 8) {
      nextErrors.password = t.errors.passwordShort;
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = t.errors.confirmPasswordRequired;
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = t.errors.passwordMismatch;
    }

    if (!consent) nextErrors.consent = t.errors.consentRequired;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");

    if (!validate()) return;
    if (!isSupabaseConfigured()) {
      setAuthError(t.missingConfig);
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}${localizePathname("/login", locale)}`
          : undefined;

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
            phone: phone.trim(),
            locale,
          },
        },
      });

      if (error) {
        setAuthError(error.message || t.authErrorFallback);
        return;
      }

      setSubmitted(true);
      setPassword("");
      setConfirmPassword("");
    } catch {
      setAuthError(t.authErrorFallback);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      topLabel={t.top}
      backLabel={t.back}
      title={t.title}
      description={t.description}
      activeTab="register"
      loginLabel={t.login}
      registerLabel={t.register}
    >
      {checkingSession ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-[#ece3d9] bg-[#fffaf4]">
          <LoaderCircle className="h-6 w-6 animate-spin text-[color:var(--headline)]" />
        </div>
      ) : submitted ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
            <p className="font-semibold text-emerald-900">{t.successTitle}</p>
            <p className="mt-1">{t.successText}</p>
          </div>
          <Link
            href="/login"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-6 text-sm font-medium text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)] transition hover:bg-[#efbf3e]"
          >
            {t.successAction}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="first-name" className="block text-sm font-medium text-[color:var(--headline)]">
                {t.firstName}
              </label>
              <input id="first-name" type="text" value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder={t.firstName} className={`h-11 w-full rounded-xl border bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)] ${errors.firstName ? "border-red-300" : "border-[#ece3d9]"}`} />
              {errors.firstName ? <p className="text-xs text-red-500">{errors.firstName}</p> : null}
            </div>
            <div className="space-y-2">
              <label htmlFor="last-name" className="block text-sm font-medium text-[color:var(--headline)]">{t.lastName}</label>
              <input id="last-name" type="text" value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder={t.lastName} className={`h-11 w-full rounded-xl border bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)] ${errors.lastName ? "border-red-300" : "border-[#ece3d9]"}`} />
              {errors.lastName ? <p className="text-xs text-red-500">{errors.lastName}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-[color:var(--headline)]">{t.email}</label>
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t.emailPlaceholder} className={`h-11 w-full rounded-xl border bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)] ${errors.email ? "border-red-300" : "border-[#ece3d9]"}`} />
            {errors.email ? <p className="text-xs text-red-500">{errors.email}</p> : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium text-[color:var(--headline)]">{t.phone}</label>
            <input id="phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder={t.phonePlaceholder} className={`h-11 w-full rounded-xl border bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)] ${errors.phone ? "border-red-300" : "border-[#ece3d9]"}`} />
            {errors.phone ? <p className="text-xs text-red-500">{errors.phone}</p> : null}
          </div>

          <PasswordInput id="register-password" value={password} onChange={setPassword} error={errors.password} label={t.password} placeholder={t.passwordPlaceholder} mustContainLabel={t.mustContain} strengthTexts={{ 0: t.strengths[0], 1: t.strengths[1], 2: t.strengths[2], 3: t.strengths[3], 4: t.strengths[4] }} requirementTexts={t.requirements} compact />

          <div className="space-y-2">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-[color:var(--headline)]">{t.confirmPassword}</label>
            <input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder={t.confirmPlaceholder} className={`h-11 w-full rounded-xl border bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)] ${errors.confirmPassword ? "border-red-300" : "border-[#ece3d9]"}`} />
            {errors.confirmPassword ? <p className="text-xs text-red-500">{errors.confirmPassword}</p> : null}
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-[#ece3d9] bg-[#fffaf4] px-4 py-3 text-sm leading-6 text-[color:var(--muted)]">
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 accent-[color:var(--accent)]" />
            <span>{t.consent}</span>
          </label>
          {errors.consent ? <p className="-mt-2 text-xs text-red-500">{errors.consent}</p> : null}

          {authError ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{authError}</div> : null}

          <button type="submit" disabled={submitting} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-6 text-sm font-medium text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)] transition hover:bg-[#efbf3e] disabled:cursor-not-allowed disabled:opacity-70">
            {submitting ? t.creating : t.create}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}
    </AuthShell>
  );
}
