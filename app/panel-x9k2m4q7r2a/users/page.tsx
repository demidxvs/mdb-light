"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LoaderCircle,
  ShieldAlert,
  Users,
  ArrowLeft,
} from "lucide-react";
import { AdminShell } from "@/components/ui/admin-shell";
import { useLocale } from "@/components/ui/locale-provider";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase-client";

type ProfileRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  preferred_locale: string;
  created_at: string;
  is_active: boolean;
};

const copy = {
  en: {
    top: "Protected user management area",
    support: "Contact",
    title: "Users",
    description:
      "View registered users, their preferred locale, activity status, and core account data.",
    loading: "Loading users...",
    denied: "Admin access required",
    signIn: "Sign in first to open the admin panel.",
    noAccess: "You do not have access to this page.",
    back: "Back to dashboard",
    eyebrow: "Users",
    sectionTitle: "Registered accounts",
    user: "User",
    email: "Email",
    locale: "Locale",
    status: "Status",
    created: "Created",
    unnamed: "Unnamed user",
    active: "Active",
    disabled: "Disabled",
  },
  ru: {
    top: "Защищенная зона управления пользователями",
    support: "Контакты",
    title: "Пользователи",
    description:
      "Просматривайте зарегистрированных пользователей, их язык, статус активности и основные данные аккаунта.",
    loading: "Загружаю пользователей...",
    denied: "Требуется доступ администратора",
    signIn: "Сначала войдите, чтобы открыть админку.",
    noAccess: "У вас нет доступа к этой странице.",
    back: "Назад к дэшборду",
    eyebrow: "Пользователи",
    sectionTitle: "Зарегистрированные аккаунты",
    user: "Пользователь",
    email: "Email",
    locale: "Язык",
    status: "Статус",
    created: "Создан",
    unnamed: "Без имени",
    active: "Активен",
    disabled: "Отключен",
  },
  el: {
    top: "Προστατευμένη διαχείριση χρηστών",
    support: "Επικοινωνία",
    title: "Χρήστες",
    description:
      "Δείτε τους εγγεγραμμένους χρήστες, τη γλώσσα τους, την κατάσταση δραστηριότητας και τα βασικά στοιχεία λογαριασμού.",
    loading: "Φόρτωση χρηστών...",
    denied: "Απαιτείται πρόσβαση διαχειριστή",
    signIn: "Συνδεθείτε πρώτα για να ανοίξετε το admin panel.",
    noAccess: "Δεν έχετε πρόσβαση σε αυτή τη σελίδα.",
    back: "Πίσω στο dashboard",
    eyebrow: "Χρήστες",
    sectionTitle: "Εγγεγραμμένοι λογαριασμοί",
    user: "Χρήστης",
    email: "Email",
    locale: "Γλώσσα",
    status: "Κατάσταση",
    created: "Δημιουργήθηκε",
    unnamed: "Χρήστης χωρίς όνομα",
    active: "Ενεργός",
    disabled: "Ανενεργός",
  },
  lv: {
    top: "Aizsargāta lietotāju pārvaldība",
    support: "Kontakti",
    title: "Lietotāji",
    description:
      "Skatiet reģistrētos lietotājus, viņu valodu, aktivitātes statusu un galvenos konta datus.",
    loading: "Ielādē lietotājus...",
    denied: "Nepieciešama administratora piekļuve",
    signIn: "Lai atvērtu admin paneli, vispirms pieslēdzieties.",
    noAccess: "Jums nav piekļuves šai lapai.",
    back: "Atpakaļ uz paneli",
    eyebrow: "Lietotāji",
    sectionTitle: "Reģistrētie konti",
    user: "Lietotājs",
    email: "Email",
    locale: "Valoda",
    status: "Statuss",
    created: "Izveidots",
    unnamed: "Lietotājs bez vārda",
    active: "Aktīvs",
    disabled: "Atspējots",
  },
} as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = copy[locale];
  const supabaseReady = useMemo(() => isSupabaseConfigured(), []);
  const [loading, setLoading] = useState(supabaseReady);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(
    supabaseReady ? "" : "Supabase is not configured.",
  );
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);

  useEffect(() => {
    if (!supabaseReady) return;
    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    const hydrate = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      const user = session?.user;
      if (!user) {
        setError(t.signIn);
        setLoading(false);
        router.replace("/login");
        return;
      }

      const { data: adminRow } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!mounted) return;
      if (!adminRow) {
        setError(t.noAccess);
        setLoading(false);
        return;
      }

      const { data: profileRows, error: profileError } = await supabase
        .from("profiles")
        .select(
          "id, email, first_name, last_name, full_name, preferred_locale, created_at, is_active",
        )
        .order("created_at", { ascending: false });

      if (!mounted) return;
      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      setProfiles((profileRows as ProfileRow[] | null) ?? []);
      setLoading(false);
    };

    void hydrate();
    return () => {
      mounted = false;
    };
  }, [router, supabaseReady, t.noAccess, t.signIn]);

  return (
    <AdminShell
      topLabel={t.top}
      supportLabel={t.support}
      title={t.title}
      description={t.description}
    >
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
              <h2 className="font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">
                {t.denied}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
                {error}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/panel-x9k2m4q7r2a"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-5 text-sm font-medium text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/25"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.back}
            </Link>
          </div>

          <section className="rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#efe6dd] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">
                  {t.eyebrow}
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">
                  {t.sectionTitle}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--accent)]/15 text-[color:var(--headline)]">
                <Users className="h-6 w-6" />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#ece3d9]">
              <table className="min-w-full divide-y divide-[#efe6dd] text-sm">
                <thead className="bg-[#fffcf7] text-left text-[color:var(--muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">{t.user}</th>
                    <th className="px-4 py-3 font-medium">{t.email}</th>
                    <th className="px-4 py-3 font-medium">{t.locale}</th>
                    <th className="px-4 py-3 font-medium">{t.status}</th>
                    <th className="px-4 py-3 font-medium">{t.created}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f4ece3] bg-white text-[color:var(--headline)]">
                  {profiles.map((profile) => {
                    const name =
                      profile.full_name ||
                      [profile.first_name, profile.last_name]
                        .filter(Boolean)
                        .join(" ") ||
                      t.unnamed;

                    return (
                      <tr key={profile.id}>
                        <td className="px-4 py-4 font-medium">{name}</td>
                        <td className="px-4 py-4 text-[color:var(--muted)]">
                          {profile.email || "-"}
                        </td>
                        <td className="px-4 py-4 uppercase text-[color:var(--muted)]">
                          {profile.preferred_locale}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${profile.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                          >
                            {profile.is_active ? t.active : t.disabled}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[color:var(--muted)]">
                          {formatDate(profile.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  );
}




