"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AuthShell } from "@/components/ui/auth-shell";
import { useLocale } from "@/components/ui/locale-provider";
import PasswordInput from "@/components/ui/password-input-1";
import { translateAuthError } from "@/lib/auth-errors";
import { loginCopy, registerCopy } from "@/lib/auth-copy";
import { writeCachedAccountProfile } from "@/lib/account-cache";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase-client";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";
  const isRecoveryQuery = searchParams.get("mode") === "recovery";
  const { locale } = useLocale();
  const t = loginCopy[locale];
  const passwordCopy = registerCopy[locale];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [recoveryErrors, setRecoveryErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [authError, setAuthError] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(isRecoveryQuery);

  const supabaseReady = useMemo(() => isSupabaseConfigured(), []);
  const recoveryCopy = {
    en: {
      title: "Create a new password",
      description: "Enter a new password for your MDB Light account.",
      submit: "Save new password",
      submitting: "Saving...",
      success: "Password updated successfully. You can now continue to your account.",
      passwordRequired: "Enter a new password.",
      passwordShort: "New password must be at least 8 characters.",
      confirmRequired: "Confirm the new password.",
      passwordMismatch: "Passwords do not match.",
    },
    ru: {
      title: "Создайте новый пароль",
      description: "Задайте новый пароль для аккаунта MDB Light.",
      submit: "Сохранить новый пароль",
      submitting: "Сохраняем...",
      success: "Пароль успешно обновлен. Теперь можно продолжить работу в аккаунте.",
      passwordRequired: "Введите новый пароль.",
      passwordShort: "Новый пароль должен быть не короче 8 символов.",
      confirmRequired: "Подтвердите новый пароль.",
      passwordMismatch: "Пароли не совпадают.",
    },
    el: {
      title: "Ορίστε νέο κωδικό",
      description: "Εισαγάγετε νέο κωδικό για τον λογαριασμό σας MDB Light.",
      submit: "Αποθήκευση νέου κωδικού",
      submitting: "Αποθήκευση...",
      success: "Ο κωδικός ενημερώθηκε επιτυχώς. Μπορείτε τώρα να συνεχίσετε στον λογαριασμό σας.",
      passwordRequired: "Συμπληρώστε νέο κωδικό.",
      passwordShort: "Ο νέος κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.",
      confirmRequired: "Επιβεβαιώστε τον νέο κωδικό.",
      passwordMismatch: "Οι κωδικοί δεν ταιριάζουν.",
    },
    lv: {
      title: "Izveidojiet jaunu paroli",
      description: "Ievadiet jaunu paroli savam MDB Light kontam.",
      submit: "Saglabāt jauno paroli",
      submitting: "Saglabājam...",
      success: "Parole veiksmīgi atjaunota. Tagad varat turpināt darbu savā kontā.",
      passwordRequired: "Ievadiet jauno paroli.",
      passwordShort: "Jaunajai parolei jābūt vismaz 8 rakstzīmēm.",
      confirmRequired: "Apstipriniet jauno paroli.",
      passwordMismatch: "Paroles nesakrīt.",
    },
  } as const;
  const recovery = recoveryCopy[locale];

  useEffect(() => {
    setIsRecoveryMode(isRecoveryQuery);
  }, [isRecoveryQuery]);

  useEffect(() => {
    if (!supabaseReady) {
      setCheckingSession(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (isRecoveryQuery || isRecoveryMode) {
        setCheckingSession(false);
        return;
      }
      if (data.session?.user) {
        router.replace(nextPath);
        return;
      }
      setCheckingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryMode(true);
        setCheckingSession(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isRecoveryMode, isRecoveryQuery, nextPath, router, supabaseReady]);

  const validate = () => {
    const nextErrors: typeof errors = {};

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

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");

    if (!validate()) return;
    if (!supabaseReady) {
      setAuthError(t.missingConfig);
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError(error.message || t.authErrorFallback);
        return;
      }

      if (!remember) {
        window.sessionStorage.setItem("mdb-light-auth-session", "ephemeral");
      } else {
        window.localStorage.setItem("mdb-light-auth-session", "persistent");
      }

      const meta = data.user?.user_metadata ?? {};
      const cachedProfile = {
        email: data.user?.email ?? email.trim(),
        first_name: (meta.first_name as string | undefined) ?? null,
        last_name: (meta.last_name as string | undefined) ?? null,
        full_name: (meta.full_name as string | undefined) ?? null,
        phone: (meta.phone as string | undefined) ?? null,
      };
      writeCachedAccountProfile(cachedProfile);

      const displayName =
        cachedProfile.full_name ||
        [cachedProfile.first_name, cachedProfile.last_name].filter(Boolean).join(" ") ||
        cachedProfile.email ||
        "Account";

      window.sessionStorage.setItem(
        "mdb-light-auth-notice",
        JSON.stringify({ type: "signed-in", name: displayName }),
      );

      router.replace(nextPath);
      router.refresh();
    } catch {
      setAuthError(t.authErrorFallback);
    } finally {
      setSubmitting(false);
    }
  };

  const validateRecovery = () => {
    const nextErrors: typeof recoveryErrors = {};

    if (!newPassword) {
      nextErrors.password = recovery.passwordRequired;
    } else if (newPassword.length < 8) {
      nextErrors.password = recovery.passwordShort;
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = recovery.confirmRequired;
    } else if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = recovery.passwordMismatch;
    }

    setRecoveryErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRecoverySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");
    setRecoveryMessage("");

    if (!validateRecovery()) return;
    if (!supabaseReady) {
      setAuthError(t.missingConfig);
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setAuthError(translateAuthError(error.message, locale) || t.authErrorFallback);
        return;
      }

      setRecoveryMessage(recovery.success);
      setNewPassword("");
      setConfirmPassword("");

      if (typeof window !== "undefined") {
        window.history.replaceState(window.history.state, "", window.location.pathname);
      }

      setTimeout(() => {
        router.replace("/account");
        router.refresh();
      }, 700);
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
      title={isRecoveryMode ? recovery.title : t.title}
      description={isRecoveryMode ? recovery.description : t.description}
      activeTab="login"
      loginLabel={t.login}
      registerLabel={t.register}
    >
      {checkingSession ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-[#ece3d9] bg-[#fffaf4]">
          <LoaderCircle className="h-6 w-6 animate-spin text-[color:var(--headline)]" />
        </div>
      ) : isRecoveryMode ? (
        <form className="space-y-4" onSubmit={handleRecoverySubmit} noValidate>
          <PasswordInput
            id="recovery-password"
            value={newPassword}
            onChange={setNewPassword}
            error={recoveryErrors.password}
            label={passwordCopy.password}
            placeholder={passwordCopy.passwordPlaceholder}
            mustContainLabel={passwordCopy.mustContain}
            strengthTexts={{
              0: passwordCopy.strengths[0],
              1: passwordCopy.strengths[1],
              2: passwordCopy.strengths[2],
              3: passwordCopy.strengths[3],
              4: passwordCopy.strengths[4],
            }}
            requirementTexts={passwordCopy.requirements}
            compact
          />

          <div className="space-y-2">
            <label htmlFor="recovery-confirm-password" className="block text-sm font-medium text-[color:var(--headline)]">
              {passwordCopy.confirmPassword}
            </label>
            <input
              id="recovery-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder={passwordCopy.confirmPlaceholder}
              className={`h-11 w-full rounded-xl border bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)] ${
                recoveryErrors.confirmPassword ? "border-red-300" : "border-[#ece3d9]"
              }`}
            />
            {recoveryErrors.confirmPassword ? <p className="text-xs text-red-500">{recoveryErrors.confirmPassword}</p> : null}
          </div>

          {authError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {authError}
            </div>
          ) : null}

          {recoveryMessage ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {recoveryMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-6 text-sm font-medium text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)] transition hover:bg-[#efbf3e] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? recovery.submitting : recovery.submit}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
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
              placeholder={t.emailPlaceholder}
              className={`h-11 w-full rounded-xl border bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)] ${errors.email ? "border-red-300" : "border-[#ece3d9]"}`}
            />
            {errors.email ? <p className="text-xs text-red-500">{errors.email}</p> : null}
          </div>

          <PasswordInput
            id="login-password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            label={t.password}
            placeholder={t.passwordPlaceholder}
            compact
            showStrength={false}
          />

          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="flex items-center gap-2 text-[color:var(--muted)]">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="accent-[color:var(--accent)]"
              />
              <span>{t.remember}</span>
            </label>
            <Link
              href="/forgot-password"
              className="font-medium text-[color:var(--headline)] transition hover:text-[color:var(--accent)]"
            >
              {t.forgot}
            </Link>
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
