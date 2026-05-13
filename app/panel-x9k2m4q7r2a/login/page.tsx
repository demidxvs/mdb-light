"use client";
import { ArrowRight, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import PasswordInput from "@/components/ui/password-input-1";
import { AdminAuthShell } from "@/components/ui/admin-auth-shell";
import { useLocale } from "@/components/ui/locale-provider";
import { localizePathname } from "@/i18n/config";
import {
  createAdminSupabaseBrowserClient,
  isAdminSupabaseConfigured,
} from "@/lib/admin-supabase-client";
import { translateAuthError } from "@/lib/auth-errors";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const totpCodeRegex = /^\d{6}$/;
const adminRootPath = "/panel-x9k2m4q7r2a";
const adminTotpFriendlyName = "MDB Light Admin";

type MfaStep = "password" | "setup" | "verify";

function getQrCodeSrc(qrCode: string) {
  if (!qrCode) return "";
  if (qrCode.startsWith("data:")) return qrCode;
  return `data:image/svg+xml;utf8,${encodeURIComponent(qrCode)}`;
}

const copy = {
  en: {
    top: "Separate administrator workspace",
    back: "Back to storefront",
    title: "Admin sign in",
    description:
      "This login is isolated from the storefront account and is used only for the admin workspace.",
    email: "Email",
    password: "Password",
    passwordPlaceholder: "Password",
    submit: "Open admin panel",
    submitting: "Signing in...",
    forgot: "Forgot password?",
    mfaCode: "Authenticator code",
    mfaPlaceholder: "123456",
    mfaSetupTitle: "Set up Google Authenticator",
    mfaSetupDescription:
      "Scan the QR code in Google Authenticator and enter the 6-digit code to finish admin sign-in.",
    mfaVerifyTitle: "Enter Google Authenticator code",
    mfaVerifyDescription:
      "Open Google Authenticator and enter the current 6-digit code for the admin workspace.",
    mfaSecret: "Manual setup key",
    mfaUri: "Setup URI",
    mfaSubmit: "Verify code",
    mfaSubmitting: "Verifying...",
    mfaInvalidCode: "Enter a valid 6-digit code.",
    mfaUnavailable: "Could not prepare multi-factor authentication. Try signing in again.",
    missingConfig:
      "Admin Supabase is not configured yet. Add NEXT_PUBLIC_ADMIN_SUPABASE_URL and NEXT_PUBLIC_ADMIN_SUPABASE_ANON_KEY.",
    authErrorFallback: "Could not sign you in to the admin workspace. Please try again.",
    errors: {
      emailRequired: "Enter your email.",
      emailInvalid: "Enter a valid email address.",
      passwordRequired: "Enter your password.",
      passwordShort: "Password must be at least 8 characters.",
    },
  },
  ru: {
    top: "Отдельная рабочая зона администратора",
    back: "Назад в магазин",
    title: "Вход в админку",
    description:
      "Этот вход полностью отделен от аккаунта покупателя и используется только для панели администратора.",
    email: "Email",
    password: "Пароль",
    passwordPlaceholder: "Пароль",
    submit: "Открыть админку",
    submitting: "Входим...",
    forgot: "Забыли пароль?",
    mfaCode: "Код из Authenticator",
    mfaPlaceholder: "123456",
    mfaSetupTitle: "Подключите Google Authenticator",
    mfaSetupDescription:
      "Сканируйте QR-код в Google Authenticator и введите 6-значный код, чтобы завершить вход в админку.",
    mfaVerifyTitle: "Введите код из Google Authenticator",
    mfaVerifyDescription:
      "Откройте Google Authenticator и введите текущий 6-значный код для admin workspace.",
    mfaSecret: "Ключ для ручного подключения",
    mfaUri: "Setup URI",
    mfaSubmit: "Подтвердить код",
    mfaSubmitting: "Проверяем...",
    mfaInvalidCode: "Введите корректный 6-значный код.",
    mfaUnavailable: "Не удалось подготовить двухфакторную аутентификацию. Войдите еще раз.",
    missingConfig:
      "Admin Supabase еще не настроен. Добавьте NEXT_PUBLIC_ADMIN_SUPABASE_URL и NEXT_PUBLIC_ADMIN_SUPABASE_ANON_KEY.",
    authErrorFallback: "Не удалось войти в админку. Попробуйте еще раз.",
    errors: {
      emailRequired: "Введите email.",
      emailInvalid: "Введите корректный email.",
      passwordRequired: "Введите пароль.",
      passwordShort: "Пароль должен быть не короче 8 символов.",
    },
  },
  el: {
    top: "Ξεχωριστός χώρος διαχείρισης",
    back: "Επιστροφή στο storefront",
    title: "Σύνδεση διαχειριστή",
    description:
      "Αυτή η σύνδεση είναι απομονωμένη από τον λογαριασμό πελάτη και χρησιμοποιείται μόνο για το admin workspace.",
    email: "Email",
    password: "Κωδικός",
    passwordPlaceholder: "Κωδικός",
    submit: "Άνοιγμα admin panel",
    submitting: "Σύνδεση...",
    forgot: "Ξεχάσατε τον κωδικό;",
    mfaCode: "Κωδικός Authenticator",
    mfaPlaceholder: "123456",
    mfaSetupTitle: "Ρυθμίστε το Google Authenticator",
    mfaSetupDescription:
      "Σαρώστε το QR code στο Google Authenticator και εισάγετε τον 6-ψήφιο κωδικό για να ολοκληρώσετε τη σύνδεση.",
    mfaVerifyTitle: "Εισαγάγετε τον κωδικό Google Authenticator",
    mfaVerifyDescription:
      "Ανοίξτε το Google Authenticator και εισάγετε τον τρέχοντα 6-ψήφιο κωδικό για το admin workspace.",
    mfaSecret: "Κλειδί χειροκίνητης ρύθμισης",
    mfaUri: "Setup URI",
    mfaSubmit: "Επιβεβαίωση κωδικού",
    mfaSubmitting: "Επαλήθευση...",
    mfaInvalidCode: "Συμπληρώστε έγκυρο 6-ψήφιο κωδικό.",
    mfaUnavailable: "Δεν ήταν δυνατή η προετοιμασία του MFA. Συνδεθείτε ξανά.",
    missingConfig:
      "Το admin Supabase δεν έχει ρυθμιστεί ακόμα. Προσθέστε NEXT_PUBLIC_ADMIN_SUPABASE_URL και NEXT_PUBLIC_ADMIN_SUPABASE_ANON_KEY.",
    authErrorFallback:
      "Η σύνδεση στο admin workspace απέτυχε. Δοκιμάστε ξανά.",
    errors: {
      emailRequired: "Συμπληρώστε το email.",
      emailInvalid: "Συμπληρώστε έγκυρο email.",
      passwordRequired: "Συμπληρώστε τον κωδικό.",
      passwordShort: "Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.",
    },
  },
  lv: {
    top: "Atsevišķa administratora vide",
    back: "Atpakaļ uz veikalu",
    title: "Admin pieslēgšanās",
    description:
      "Šī pieslēgšanās ir pilnībā atdalīta no pircēja konta un paredzēta tikai administrācijas panelim.",
    email: "Email",
    password: "Parole",
    passwordPlaceholder: "Parole",
    submit: "Atvērt admin paneli",
    submitting: "Notiek pieslēgšanās...",
    forgot: "Aizmirsāt paroli?",
    mfaCode: "Authenticator kods",
    mfaPlaceholder: "123456",
    mfaSetupTitle: "Iestatiet Google Authenticator",
    mfaSetupDescription:
      "Noskenējiet QR kodu Google Authenticator lietotnē un ievadiet 6 ciparu kodu, lai pabeigtu admin pieslēgšanos.",
    mfaVerifyTitle: "Ievadiet Google Authenticator kodu",
    mfaVerifyDescription:
      "Atveriet Google Authenticator un ievadiet aktuālo 6 ciparu kodu admin videi.",
    mfaSecret: "Atslēga manuālai iestatīšanai",
    mfaUri: "Setup URI",
    mfaSubmit: "Apstiprināt kodu",
    mfaSubmitting: "Pārbaudām...",
    mfaInvalidCode: "Ievadiet derīgu 6 ciparu kodu.",
    mfaUnavailable: "Neizdevās sagatavot divu faktoru autentifikāciju. Pieslēdzieties vēlreiz.",
    missingConfig:
      "Admin Supabase vēl nav iestatīts. Pievienojiet NEXT_PUBLIC_ADMIN_SUPABASE_URL un NEXT_PUBLIC_ADMIN_SUPABASE_ANON_KEY.",
    authErrorFallback:
      "Neizdevās pieslēgties admin videi. Mēģiniet vēlreiz.",
    errors: {
      emailRequired: "Ievadiet email.",
      emailInvalid: "Ievadiet derīgu email adresi.",
      passwordRequired: "Ievadiet paroli.",
      passwordShort: "Parolei jābūt vismaz 8 rakstzīmēm.",
    },
  },
} as const;

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const t = copy[locale];
  const nextPath = searchParams.get("next") || adminRootPath;
  const isRecoveryQuery = searchParams.get("mode") === "recovery";
  const ready = useMemo(() => isAdminSupabaseConfigured(), []);
  const [checkingSession, setCheckingSession] = useState(ready);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mfaStep, setMfaStep] = useState<MfaStep>("password");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [mfaQrCode, setMfaQrCode] = useState("");
  const [mfaSecret, setMfaSecret] = useState("");
  const [mfaUri, setMfaUri] = useState("");
  const [authError, setAuthError] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [mfaError, setMfaError] = useState("");
  const [recoveryErrors, setRecoveryErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isRecoveryMode, setIsRecoveryMode] = useState(isRecoveryQuery);

  const recoveryCopy = {
    en: {
      title: "Set a new admin password",
      description:
        "Create a new password for the admin workspace. This does not affect storefront customer accounts.",
      submit: "Save new password",
      submitting: "Saving...",
      success:
        "Admin password updated successfully. You can now continue to the admin panel.",
      passwordRequired: "Enter a new password.",
      passwordShort: "New password must be at least 8 characters.",
      confirmRequired: "Confirm the new password.",
      passwordMismatch: "Passwords do not match.",
    },
    ru: {
      title: "Задайте новый пароль администратора",
      description:
        "Создайте новый пароль для админки. Это не влияет на клиентские аккаунты магазина.",
      submit: "Сохранить новый пароль",
      submitting: "Сохраняем...",
      success:
        "Пароль администратора обновлен. Теперь можно продолжить работу в админке.",
      passwordRequired: "Введите новый пароль.",
      passwordShort: "Новый пароль должен быть не короче 8 символов.",
      confirmRequired: "Подтвердите новый пароль.",
      passwordMismatch: "Пароли не совпадают.",
    },
    el: {
      title: "Ορίστε νέο admin κωδικό",
      description:
        "Δημιουργήστε νέο κωδικό για το admin workspace. Αυτό δεν επηρεάζει τους λογαριασμούς πελατών του storefront.",
      submit: "Αποθήκευση νέου κωδικού",
      submitting: "Αποθήκευση...",
      success:
        "Ο admin κωδικός ενημερώθηκε. Μπορείτε τώρα να συνεχίσετε στο admin panel.",
      passwordRequired: "Συμπληρώστε νέο κωδικό.",
      passwordShort: "Ο νέος κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.",
      confirmRequired: "Επιβεβαιώστε τον νέο κωδικό.",
      passwordMismatch: "Οι κωδικοί δεν ταιριάζουν.",
    },
    lv: {
      title: "Izveidojiet jaunu admin paroli",
      description:
        "Izveidojiet jaunu paroli administrācijas panelim. Tas neietekmē veikala klientu kontus.",
      submit: "Saglabāt jauno paroli",
      submitting: "Saglabājam...",
      success:
        "Admin parole ir atjaunota. Tagad varat turpināt darbu admin panelī.",
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

  const resetMfaState = () => {
    setMfaStep("password");
    setMfaCode("");
    setMfaFactorId("");
    setMfaQrCode("");
    setMfaSecret("");
    setMfaUri("");
    setMfaError("");
  };

  const prepareMfaStep = useCallback(async () => {
    const supabase = createAdminSupabaseBrowserClient();
    const [{ data: aalData, error: aalError }, { data: factorData, error: factorError }] =
      await Promise.all([
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
        supabase.auth.mfa.listFactors(),
      ]);

    if (aalError || factorError || !aalData || !factorData) {
      throw new Error(t.mfaUnavailable);
    }

    if (aalData.currentLevel === "aal2") {
      router.replace(nextPath);
      router.refresh();
      return;
    }

    const verifiedTotpFactor =
      factorData.totp[0] ??
      factorData.all.find(
        (factor) => factor.factor_type === "totp" && factor.status === "verified",
      );

    if (verifiedTotpFactor) {
      setMfaFactorId(verifiedTotpFactor.id);
      setMfaStep("verify");
      setCheckingSession(false);
      return;
    }

    const staleTotpFactors = factorData.all.filter(
      (factor) => factor.factor_type === "totp" && factor.status !== "verified",
    );

    for (const factor of staleTotpFactors) {
      await supabase.auth.mfa.unenroll({ factorId: factor.id });
    }

    const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: adminTotpFriendlyName,
    });

    if (enrollError || !enrollData || !("totp" in enrollData)) {
      throw new Error(enrollError?.message || t.mfaUnavailable);
    }

    setMfaFactorId(enrollData.id);
    setMfaQrCode(enrollData.totp.qr_code);
    setMfaSecret(enrollData.totp.secret);
    setMfaUri(enrollData.totp.uri);
    setMfaStep("setup");
    setCheckingSession(false);
  }, [nextPath, router, t.mfaUnavailable]);

  useEffect(() => {
    if (!ready) {
      setCheckingSession(false);
      return;
    }

    const supabase = createAdminSupabaseBrowserClient();
    let mounted = true;

    const hydrate = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (isRecoveryMode || isRecoveryQuery) {
        setCheckingSession(false);
        return;
      }

      if (session?.user) {
        try {
          await prepareMfaStep();
        } catch (error) {
          if (!mounted) return;
          setAuthError(
            error instanceof Error ? error.message : t.mfaUnavailable,
          );
          setCheckingSession(false);
        }
        return;
      }

      resetMfaState();
      setCheckingSession(false);
    };

    void hydrate();
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
  }, [isRecoveryMode, isRecoveryQuery, prepareMfaStep, ready, router, t.mfaUnavailable]);

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
    setMfaError("");

    if (!validate()) return;
    if (!ready) {
      setAuthError(t.missingConfig);
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createAdminSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError(translateAuthError(error.message, locale) || t.authErrorFallback);
        return;
      }

      await prepareMfaStep();
    } catch (error) {
      setAuthError(
        translateAuthError(error instanceof Error ? error.message : "", locale) ||
          t.authErrorFallback,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleMfaSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");
    setMfaError("");

    if (!totpCodeRegex.test(mfaCode.trim())) {
      setMfaError(t.mfaInvalidCode);
      return;
    }

    if (!mfaFactorId) {
      setMfaError(t.mfaUnavailable);
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createAdminSupabaseBrowserClient();
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: mfaFactorId,
        code: mfaCode.trim(),
      });

      if (error) {
        setMfaError(translateAuthError(error.message, locale) || t.authErrorFallback);
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch {
      setMfaError(t.authErrorFallback);
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

  const handleRecoverySubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setAuthError("");
    setRecoveryMessage("");

    if (!validateRecovery()) return;
    if (!ready) {
      setAuthError(t.missingConfig);
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createAdminSupabaseBrowserClient();
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

      window.setTimeout(() => {
        router.replace(nextPath);
        router.refresh();
      }, 800);
    } catch {
      setAuthError(t.authErrorFallback);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminAuthShell
      topLabel={t.top}
      backLabel={t.back}
      title={isRecoveryMode ? recovery.title : t.title}
      description={
        isRecoveryMode
          ? recovery.description
          : mfaStep === "setup"
            ? t.mfaSetupDescription
            : mfaStep === "verify"
              ? t.mfaVerifyDescription
              : t.description
      }
    >
      {checkingSession ? (
        <div className="flex min-h-[260px] items-center justify-center text-sm font-medium text-[color:var(--muted)]">
          <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-[color:var(--headline)]" />
          {t.submitting}
        </div>
      ) : isRecoveryMode ? (
        <form onSubmit={handleRecoverySubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--headline)]">
              {recovery.title}
            </label>
            <PasswordInput
              value={newPassword}
              onChange={setNewPassword}
              placeholder={t.passwordPlaceholder}
              autoComplete="new-password"
            />
            {recoveryErrors.password ? (
              <p className="text-sm text-[#c84b31]">{recoveryErrors.password}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--headline)]">
              {locale === "ru"
                ? "Подтвердите новый пароль"
                : locale === "el"
                  ? "Επιβεβαιώστε τον νέο κωδικό"
                  : locale === "lv"
                    ? "Apstipriniet jauno paroli"
                    : "Confirm new password"}
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder={t.passwordPlaceholder}
              autoComplete="new-password"
            />
            {recoveryErrors.confirmPassword ? (
              <p className="text-sm text-[#c84b31]">
                {recoveryErrors.confirmPassword}
              </p>
            ) : null}
          </div>

          {authError ? (
            <div className="rounded-2xl border border-[#f4c7bc] bg-[#fff4ef] px-4 py-3 text-sm text-[#af4b2b]">
              {authError}
            </div>
          ) : null}

          {recoveryMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {recoveryMessage}
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
            {submitting ? recovery.submitting : recovery.submit}
          </button>
        </form>
      ) : mfaStep === "setup" || mfaStep === "verify" ? (
        <form onSubmit={handleMfaSubmit} className="space-y-5" noValidate>
          <div className="rounded-2xl border border-[#ece3d9] bg-[#fffaf4] p-4">
            <p className="text-sm font-semibold text-[color:var(--headline)]">
              {mfaStep === "setup" ? t.mfaSetupTitle : t.mfaVerifyTitle}
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              {mfaStep === "setup" ? t.mfaSetupDescription : t.mfaVerifyDescription}
            </p>
          </div>

          {mfaStep === "setup" && mfaQrCode ? (
            <div className="rounded-2xl border border-[#ece3d9] bg-white p-4">
              <div className="mx-auto flex w-full max-w-[240px] justify-center rounded-2xl border border-[#ece3d9] bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getQrCodeSrc(mfaQrCode)}
                  alt={adminTotpFriendlyName}
                  className="h-[200px] w-[200px]"
                />
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent)]">
                    {t.mfaSecret}
                  </p>
                  <code className="mt-2 block break-all rounded-xl bg-[#fff7e8] px-3 py-3 text-sm text-[color:var(--headline)]">
                    {mfaSecret}
                  </code>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent)]">
                    {t.mfaUri}
                  </p>
                  <code className="mt-2 block break-all rounded-xl bg-[#fff7e8] px-3 py-3 text-xs text-[color:var(--headline)]">
                    {mfaUri}
                  </code>
                </div>
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--headline)]">
              {t.mfaCode}
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={mfaCode}
              onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              className="h-12 w-full rounded-2xl border border-[#e6ddd3] bg-[#fffdfa] px-4 text-sm text-[color:var(--headline)] outline-none transition focus:border-[color:var(--accent)] focus:bg-white"
              placeholder={t.mfaPlaceholder}
              autoComplete="one-time-code"
            />
            {mfaError ? (
              <p className="text-sm text-[#c84b31]">{mfaError}</p>
            ) : null}
          </div>

          {authError ? (
            <div className="rounded-2xl border border-[#f4c7bc] bg-[#fff4ef] px-4 py-3 text-sm text-[#af4b2b]">
              {authError}
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
            {submitting ? t.mfaSubmitting : t.mfaSubmit}
          </button>
        </form>
      ) : (
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
            {errors.email ? (
              <p className="text-sm text-[#c84b31]">{errors.email}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-[color:var(--headline)]">
                {t.password}
              </label>
              <Link
                href={localizePathname("/panel-x9k2m4q7r2a/forgot-password", locale)}
                className="text-sm font-medium text-[color:var(--accent-strong)] transition hover:text-[color:var(--headline)]"
              >
                {t.forgot}
              </Link>
            </div>
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder={t.passwordPlaceholder}
              autoComplete="current-password"
            />
            {errors.password ? (
              <p className="text-sm text-[#c84b31]">{errors.password}</p>
            ) : null}
          </div>

          {authError ? (
            <div className="rounded-2xl border border-[#f4c7bc] bg-[#fff4ef] px-4 py-3 text-sm text-[#af4b2b]">
              {authError}
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
      )}
    </AdminAuthShell>
  );
}
