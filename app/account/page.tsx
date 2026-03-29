"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  LoaderCircle,
  Mail,
  LockKeyhole,
  LogOut,
  UserRound,
} from "lucide-react";
import { AuthShell } from "@/components/ui/auth-shell";
import { useLocale } from "@/components/ui/locale-provider";
import PasswordInput from "@/components/ui/password-input-1";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-client";
import { registerCopy } from "@/lib/auth-copy";
import {
  clearCachedAccountProfile,
  readCachedAccountProfile,
  writeCachedAccountProfile,
} from "@/lib/account-cache";

type ProfileRow = {
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
};

const copy = {
  en: {
    top: "Multilingual LED marketplace",
    support: "Contact",
    back: "Back to home",
    login: "Login",
    register: "Register",
    title: "Your account",
    description: "Manage your account details, change email, and update your password.",
    profile: "Profile",
    email: "Email",
    signOut: "Sign out",
    openCatalog: "Open catalog",
    notReady: "Supabase is not configured.",
    unauthorized: "You are not signed in.",
    changeEmail: "Change email",
    newEmail: "New email",
    currentPassword: "Current password",
    saveEmail: "Save new email",
    emailSuccess: "Email change requested. Check your inbox for confirmation.",
    changePassword: "Change password",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
    savePassword: "Update password",
    passwordSuccess: "Password updated successfully.",
    currentPasswordRequired: "Enter your current password.",
    newEmailRequired: "Enter a new email.",
    newEmailInvalid: "Enter a valid email.",
    newPasswordRequired: "Enter a new password.",
    newPasswordShort: "New password must be at least 8 characters.",
    confirmPasswordRequired: "Confirm the new password.",
    passwordMismatch: "Passwords do not match.",
    reauthFailed: "Current password is incorrect.",
    genericError: "Could not update account settings. Try again.",
  },
  ru: {
    top: "Мультиязычный маркетплейс LED-освещения",
    support: "Контакты",
    back: "Назад на главную",
    login: "Вход",
    register: "Регистрация",
    title: "Ваш аккаунт",
    description: "Управляйте данными аккаунта, меняйте email и обновляйте пароль.",
    profile: "Профиль",
    email: "Email",
    signOut: "Выйти",
    openCatalog: "Открыть каталог",
    notReady: "Supabase не настроен.",
    unauthorized: "Вы не вошли в аккаунт.",
    changeEmail: "Смена email",
    newEmail: "Новый email",
    currentPassword: "Текущий пароль",
    saveEmail: "Сохранить новый email",
    emailSuccess: "Запрос на смену email отправлен. Проверьте почту для подтверждения.",
    changePassword: "Смена пароля",
    newPassword: "Новый пароль",
    confirmPassword: "Подтвердите новый пароль",
    savePassword: "Обновить пароль",
    passwordSuccess: "Пароль успешно обновлен.",
    currentPasswordRequired: "Введите текущий пароль.",
    newEmailRequired: "Введите новый email.",
    newEmailInvalid: "Введите корректный email.",
    newPasswordRequired: "Введите новый пароль.",
    newPasswordShort: "Новый пароль должен быть не короче 8 символов.",
    confirmPasswordRequired: "Подтвердите новый пароль.",
    passwordMismatch: "Пароли не совпадают.",
    reauthFailed: "Текущий пароль введен неверно.",
    genericError: "Не удалось обновить данные аккаунта. Попробуйте еще раз.",
  },
  el: {
    top: "Πολύγλωσσο marketplace LED φωτισμού",
    support: "Επικοινωνία",
    back: "Πίσω στην αρχική",
    login: "Σύνδεση",
    register: "Εγγραφή",
    title: "Ο λογαριασμός σας",
    description: "Διαχειριστείτε τα στοιχεία του λογαριασμού σας, αλλάξτε email και ενημερώστε τον κωδικό.",
    profile: "Προφίλ",
    email: "Email",
    signOut: "Αποσύνδεση",
    openCatalog: "Άνοιγμα καταλόγου",
    notReady: "Το Supabase δεν έχει ρυθμιστεί.",
    unauthorized: "Δεν έχετε συνδεθεί.",
    changeEmail: "Αλλαγή email",
    newEmail: "Νέο email",
    currentPassword: "Τρέχων κωδικός",
    saveEmail: "Αποθήκευση νέου email",
    emailSuccess: "Το αίτημα αλλαγής email στάλθηκε. Ελέγξτε το inbox σας για επιβεβαίωση.",
    changePassword: "Αλλαγή κωδικού",
    newPassword: "Νέος κωδικός",
    confirmPassword: "Επιβεβαίωση νέου κωδικού",
    savePassword: "Ενημέρωση κωδικού",
    passwordSuccess: "Ο κωδικός ενημερώθηκε επιτυχώς.",
    currentPasswordRequired: "Συμπληρώστε τον τρέχοντα κωδικό.",
    newEmailRequired: "Συμπληρώστε νέο email.",
    newEmailInvalid: "Συμπληρώστε έγκυρο email.",
    newPasswordRequired: "Συμπληρώστε νέο κωδικό.",
    newPasswordShort: "Ο νέος κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.",
    confirmPasswordRequired: "Επιβεβαιώστε τον νέο κωδικό.",
    passwordMismatch: "Οι κωδικοί δεν ταιριάζουν.",
    reauthFailed: "Ο τρέχων κωδικός είναι λανθασμένος.",
    genericError: "Δεν ήταν δυνατή η ενημέρωση των στοιχείων λογαριασμού. Δοκιμάστε ξανά.",
  },
  lv: {
    top: "Daudzvalodu LED apgaismojuma marketplace",
    support: "Kontakti",
    back: "Atpakaļ uz sākumu",
    login: "Pieslēgties",
    register: "Reģistrēties",
    title: "Jūsu konts",
    description: "Pārvaldiet konta datus, mainiet email un atjaunojiet paroli.",
    profile: "Profils",
    email: "Email",
    signOut: "Izrakstīties",
    openCatalog: "Atvērt katalogu",
    notReady: "Supabase nav iestatīts.",
    unauthorized: "Jūs neesat pieslēdzies.",
    changeEmail: "Mainīt email",
    newEmail: "Jauns email",
    currentPassword: "Pašreizējā parole",
    saveEmail: "Saglabāt jauno email",
    emailSuccess: "Email maiņas pieprasījums nosūtīts. Pārbaudiet savu pastkasti apstiprināšanai.",
    changePassword: "Mainīt paroli",
    newPassword: "Jauna parole",
    confirmPassword: "Apstipriniet jauno paroli",
    savePassword: "Atjaunot paroli",
    passwordSuccess: "Parole veiksmīgi atjaunota.",
    currentPasswordRequired: "Ievadiet pašreizējo paroli.",
    newEmailRequired: "Ievadiet jauno email.",
    newEmailInvalid: "Ievadiet derīgu email adresi.",
    newPasswordRequired: "Ievadiet jauno paroli.",
    newPasswordShort: "Jaunajai parolei jābūt vismaz 8 rakstzīmēm.",
    confirmPasswordRequired: "Apstipriniet jauno paroli.",
    passwordMismatch: "Paroles nesakrīt.",
    reauthFailed: "Pašreizējā parole ir nepareiza.",
    genericError: "Neizdevās atjaunot konta datus. Mēģiniet vēlreiz.",
  },
} as const;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AccountPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = copy[locale];
  const passwordCopy = registerCopy[locale];
  const supabaseReady = isSupabaseConfigured();
  const initialCachedProfile = readCachedAccountProfile();
  const [loading, setLoading] = useState(supabaseReady && !initialCachedProfile);
  const [profile, setProfile] = useState<ProfileRow | null>(initialCachedProfile);
  const [error, setError] = useState(supabaseReady ? "" : t.notReady);
  const [signingOut, setSigningOut] = useState(false);
  const [emailForm, setEmailForm] = useState({ newEmail: "", currentPassword: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [emailMessage, setEmailMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const displayName = useMemo(
    () => profile?.full_name || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || profile?.email || "",
    [profile]
  );

  useEffect(() => {
    if (!supabaseReady) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    const hydrateAccount = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      const user = session?.user;
      if (!user) {
        clearCachedAccountProfile();
        setError(t.unauthorized);
        setLoading(false);
        router.replace("/login");
        return;
      }

      const meta = user.user_metadata ?? {};
      const nextProfile = {
        email: user.email ?? null,
        first_name: (meta.first_name as string | undefined) ?? null,
        last_name: (meta.last_name as string | undefined) ?? null,
        full_name: (meta.full_name as string | undefined) ?? null,
      };

      writeCachedAccountProfile(nextProfile);
      setProfile(nextProfile);
      setLoading(false);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("email, first_name, last_name, full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (profileError) {
        setError(profileError.message);
      } else if (profileData) {
        writeCachedAccountProfile(profileData);
        setProfile(profileData);
      }
    };

    void hydrateAccount();

    return () => {
      mounted = false;
    };
  }, [router, supabaseReady, t.unauthorized]);

  const verifyCurrentPassword = async (email: string, currentPassword: string) => {
    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    return signInError;
  };

  const handleEmailUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailError("");
    setEmailMessage("");

    if (!emailForm.currentPassword) {
      setEmailError(t.currentPasswordRequired);
      return;
    }

    if (!emailForm.newEmail.trim()) {
      setEmailError(t.newEmailRequired);
      return;
    }

    if (!emailRegex.test(emailForm.newEmail.trim())) {
      setEmailError(t.newEmailInvalid);
      return;
    }

    if (!profile?.email) {
      setEmailError(t.genericError);
      return;
    }

    setEmailSubmitting(true);

    try {
      const reauthError = await verifyCurrentPassword(profile.email, emailForm.currentPassword);
      if (reauthError) {
        setEmailError(t.reauthFailed);
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({
        email: emailForm.newEmail.trim(),
      });

      if (updateError) {
        setEmailError(updateError.message || t.genericError);
        return;
      }

      setEmailMessage(t.emailSuccess);
      setEmailForm({ newEmail: "", currentPassword: "" });
    } catch {
      setEmailError(t.genericError);
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handlePasswordUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (!passwordForm.currentPassword) {
      setPasswordError(t.currentPasswordRequired);
      return;
    }

    if (!passwordForm.newPassword) {
      setPasswordError(t.newPasswordRequired);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError(t.newPasswordShort);
      return;
    }

    if (!passwordForm.confirmPassword) {
      setPasswordError(t.confirmPasswordRequired);
      return;
    }

    if (passwordForm.confirmPassword !== passwordForm.newPassword) {
      setPasswordError(t.passwordMismatch);
      return;
    }

    if (!profile?.email) {
      setPasswordError(t.genericError);
      return;
    }

    setPasswordSubmitting(true);

    try {
      const reauthError = await verifyCurrentPassword(profile.email, passwordForm.currentPassword);
      if (reauthError) {
        setPasswordError(t.reauthFailed);
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (updateError) {
        setPasswordError(updateError.message || t.genericError);
        return;
      }

      setPasswordMessage(t.passwordSuccess);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      setPasswordError(t.genericError);
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabaseReady || signingOut) return;
    setSigningOut(true);
    clearCachedAccountProfile();
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  };

  return (
    <AuthShell topLabel={t.top} supportLabel={t.support} backLabel={t.back} title={t.title} description={t.description} activeTab="login" loginLabel={t.login} registerLabel={t.register}>
      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-[#ece3d9] bg-[#fffaf4]">
          <LoaderCircle className="h-6 w-6 animate-spin text-[color:var(--headline)]" />
        </div>
      ) : (
        <div className="space-y-4">
          {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          <div className="rounded-2xl border border-[#ece3d9] bg-[#fffaf4] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--accent)]/15 text-[color:var(--headline)]">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[color:var(--headline)]">{t.profile}</p>
                <p className="text-sm text-[color:var(--muted)]">{displayName}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[#ece3d9] bg-white px-4 py-3 text-sm text-[color:var(--headline)]">
              <div className="flex items-center justify-between gap-4">
                <span>{t.email}</span>
                <span className="text-[color:var(--muted)]">{profile?.email || "-"}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleEmailUpdate} className="space-y-4 rounded-2xl border border-[#ece3d9] bg-[#fffaf4] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--accent)]/15 text-[color:var(--headline)]"><Mail className="h-4.5 w-4.5" /></div>
              <h2 className="font-display text-xl font-semibold text-[color:var(--headline)]">{t.changeEmail}</h2>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[color:var(--headline)]">{t.newEmail}</label>
              <input value={emailForm.newEmail} onChange={(event) => setEmailForm((current) => ({ ...current, newEmail: event.target.value }))} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-white px-4 outline-none transition focus:border-[color:var(--accent)]" />
            </div>
            <PasswordInput id="current-email-password" value={emailForm.currentPassword} onChange={(value) => setEmailForm((current) => ({ ...current, currentPassword: value }))} label={t.currentPassword} placeholder={t.currentPassword} showStrength={false} />
            {emailError ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{emailError}</div> : null}
            {emailMessage ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{emailMessage}</div> : null}
            <button type="submit" disabled={emailSubmitting} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-6 text-sm font-medium text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)] transition hover:bg-[#efbf3e] disabled:cursor-not-allowed disabled:opacity-70">
              {t.saveEmail}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <form onSubmit={handlePasswordUpdate} className="space-y-4 rounded-2xl border border-[#ece3d9] bg-[#fffaf4] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--accent)]/15 text-[color:var(--headline)]"><LockKeyhole className="h-4.5 w-4.5" /></div>
              <h2 className="font-display text-xl font-semibold text-[color:var(--headline)]">{t.changePassword}</h2>
            </div>
            <PasswordInput id="current-password" value={passwordForm.currentPassword} onChange={(value) => setPasswordForm((current) => ({ ...current, currentPassword: value }))} label={t.currentPassword} placeholder={t.currentPassword} showStrength={false} />
            <PasswordInput id="new-password" value={passwordForm.newPassword} onChange={(value) => setPasswordForm((current) => ({ ...current, newPassword: value }))} label={t.newPassword} placeholder={t.newPassword} mustContainLabel={passwordCopy.mustContain} strengthTexts={{ 0: passwordCopy.strengths[0], 1: passwordCopy.strengths[1], 2: passwordCopy.strengths[2], 3: passwordCopy.strengths[3], 4: passwordCopy.strengths[4] }} requirementTexts={passwordCopy.requirements} compact />
            <div className="space-y-2">
              <label className="text-sm font-medium text-[color:var(--headline)]">{t.confirmPassword}</label>
              <input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-white px-4 outline-none transition focus:border-[color:var(--accent)]" />
            </div>
            {passwordError ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{passwordError}</div> : null}
            {passwordMessage ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{passwordMessage}</div> : null}
            <button type="submit" disabled={passwordSubmitting} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-6 text-sm font-medium text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)] transition hover:bg-[#efbf3e] disabled:cursor-not-allowed disabled:opacity-70">
              {t.savePassword}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/catalog" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-6 text-sm font-medium text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)] transition hover:bg-[#efbf3e]">
              {t.openCatalog}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button type="button" onClick={handleSignOut} disabled={signingOut} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-6 text-sm font-medium text-[color:var(--headline)] transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70">
              <LogOut className="h-4 w-4" />
              {t.signOut}
            </button>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
