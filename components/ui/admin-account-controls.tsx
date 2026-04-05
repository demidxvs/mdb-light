"use client";

import { CircleUserRound, LoaderCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useLocale } from "@/components/ui/locale-provider";
import {
  createAdminSupabaseBrowserClient,
  isAdminSupabaseConfigured,
} from "@/lib/admin-supabase-client";
import { localizePathname } from "@/i18n/config";

const copy = {
  en: {
    signIn: "Admin login",
    signOut: "Sign out",
    fallback: "Administrator",
  },
  ru: {
    signIn: "Вход в админку",
    signOut: "Выйти",
    fallback: "Администратор",
  },
  el: {
    signIn: "Σύνδεση admin",
    signOut: "Αποσύνδεση",
    fallback: "Διαχειριστής",
  },
  lv: {
    signIn: "Admin pieslēgšanās",
    signOut: "Iziet",
    fallback: "Administrators",
  },
} as const;

export function AdminAccountControls() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = copy[locale];
  const ready = isAdminSupabaseConfigured();
  const [loading, setLoading] = useState(ready);
  const [email, setEmail] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const supabase = createAdminSupabaseBrowserClient();
    let mounted = true;

    const syncUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setAuthenticated(Boolean(session?.user));
      setEmail(session?.user?.email ?? "");
      setLoading(false);
    };

    void syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setAuthenticated(Boolean(session?.user));
      setEmail(session?.user?.email ?? "");
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [ready]);

  const loginHref = useMemo(
    () => localizePathname("/panel-x9k2m4q7r2a/login", locale),
    [locale],
  );

  const handleSignOut = async () => {
    if (!ready || signingOut) {
      return;
    }

    setSigningOut(true);

    try {
      const supabase = createAdminSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.replace(loginHref);
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-9 items-center gap-2 rounded-xl border border-[color:var(--line)] bg-white/72 px-3 text-[color:var(--muted)]">
        <LoaderCircle className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <a
        href={loginHref}
        className="inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-[color:var(--line)] bg-white/72 px-3 text-sm font-medium text-[color:var(--headline)] transition duration-300 hover:-translate-y-0.5 hover:border-[color:var(--accent)]/30"
      >
        <CircleUserRound className="h-4.5 w-4.5" />
        <span>{t.signIn}</span>
      </a>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-10 min-w-[170px] max-w-[250px] items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-3 text-left text-[color:var(--headline)] shadow-[0_10px_24px_rgba(16,185,129,0.12)]">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700">
          <CircleUserRound className="h-4.5 w-4.5" />
        </div>
        <p className="truncate text-sm font-semibold leading-4">
          {email || t.fallback}
        </p>
      </div>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-[color:var(--line)] bg-white/72 px-3 text-sm font-medium text-[color:var(--headline)] transition duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {signingOut ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        <span className="hidden 2xl:inline">{t.signOut}</span>
      </button>
    </div>
  );
}
