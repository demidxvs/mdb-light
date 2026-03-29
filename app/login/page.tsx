"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AuthShell } from "@/components/ui/auth-shell";
import { useLocale } from "@/components/ui/locale-provider";
import PasswordInput from "@/components/ui/password-input-1";
import { loginCopy } from "@/lib/auth-copy";
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
  const { locale } = useLocale();
  const t = loginCopy[locale];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const supabaseReady = useMemo(() => isSupabaseConfigured(), []);

  useEffect(() => {
    if (!supabaseReady) {
      setCheckingSession(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session?.user) {
        router.replace(nextPath);
        return;
      }
      setCheckingSession(false);
    });

    return () => {
      mounted = false;
    };
  }, [nextPath, router, supabaseReady]);

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
      {checkingSession ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-[#ece3d9] bg-[#fffaf4]">
          <LoaderCircle className="h-6 w-6 animate-spin text-[color:var(--headline)]" />
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
