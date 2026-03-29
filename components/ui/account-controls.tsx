"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ShoppingCart, CircleUserRound, LoaderCircle, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "@/components/ui/locale-provider";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase-client";
import {
  clearCachedAccountProfile,
  readCachedAccountProfile,
  writeCachedAccountProfile,
} from "@/lib/account-cache";

type ProfileRow = {
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
};

const signInLabelByLocale = {
  en: "Login",
  ru: "\u0412\u043e\u0439\u0442\u0438",
  el: "\u03a3\u03cd\u03bd\u03b4\u03b5\u03c3\u03b7",
  lv: "Piesl\u0113gties",
} as const;

export function AccountControls() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = useTranslations("accountControls");
  const supabaseReady = isSupabaseConfigured();
  const initialCachedProfile = readCachedAccountProfile();
  const [loading, setLoading] = useState(supabaseReady && !initialCachedProfile);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(initialCachedProfile));
  const [profile, setProfile] = useState<ProfileRow | null>(initialCachedProfile);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!supabaseReady) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    const hydrateFromSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      const user = session?.user;
      setIsAuthenticated(Boolean(user));

      if (!user) {
        clearCachedAccountProfile();
        setProfile(null);
        setLoading(false);
        return;
      }

      const meta = user.user_metadata ?? {};
      const nextProfile = {
        email: user.email ?? null,
        first_name: meta.first_name ?? null,
        last_name: meta.last_name ?? null,
        full_name: meta.full_name ?? null,
      };

      writeCachedAccountProfile(nextProfile);
      setProfile(nextProfile);
      setLoading(false);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name, last_name, full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;
      if (profileData) {
        writeCachedAccountProfile({ ...nextProfile, ...profileData });
        setProfile(profileData);
      }
    };

    void hydrateFromSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setIsAuthenticated(Boolean(user));

      if (!user) {
        clearCachedAccountProfile();
        setProfile(null);
        setLoading(false);
        return;
      }

      const meta = user.user_metadata ?? {};
      const nextProfile = {
        email: user.email ?? null,
        first_name: meta.first_name ?? null,
        last_name: meta.last_name ?? null,
        full_name: meta.full_name ?? null,
      };

      writeCachedAccountProfile(nextProfile);
      setProfile(nextProfile);
      setLoading(false);
      void hydrateFromSession();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabaseReady]);

  const displayName = useMemo(() => {
    if (!profile) return "";
    return profile.full_name || [profile.first_name, profile.last_name].filter(Boolean).join(" ");
  }, [profile]);

  const handleSignOut = async () => {
    if (!supabaseReady || signingOut) {
      return;
    }

    setSigningOut(true);
    clearCachedAccountProfile();
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  return (
    <div className="flex items-center gap-2 whitespace-nowrap xl:gap-3">
      <Link
        href="/cart"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--line)] bg-white/72 text-[color:var(--muted)] transition duration-300 hover:-translate-y-0.5 hover:border-[color:var(--accent)]/30 hover:text-[color:var(--headline)]"
        aria-label={t("cart")}
      >
        <ShoppingCart className="h-4.5 w-4.5" />
      </Link>

      {loading ? (
        <div className="flex h-9 items-center gap-2 rounded-xl border border-[color:var(--line)] bg-white/72 px-3 text-[color:var(--muted)]">
          <LoaderCircle className="h-4 w-4 animate-spin" />
        </div>
      ) : isAuthenticated ? (
        <>
          <Link
            href="/account"
            className="flex h-10 min-w-[150px] max-w-[220px] items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-3 text-left text-[color:var(--headline)] shadow-[0_10px_24px_rgba(16,185,129,0.12)] transition duration-300 hover:-translate-y-0.5 hover:border-emerald-400 xl:min-w-[170px]"
            aria-label={t("account")}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700">
              <CircleUserRound className="h-4.5 w-4.5" />
            </div>
            <p className="truncate text-sm font-semibold leading-4">{displayName || t("account")}</p>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-label={t("signOut")}
            className="inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-[color:var(--line)] bg-white/72 px-3 text-sm font-medium text-[color:var(--headline)] transition duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {signingOut ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            <span className="hidden 2xl:inline">{t("signOut")}</span>
          </button>
        </>
      ) : (
        <Link
          href="/login"
          className="inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-[color:var(--line)] bg-white/72 px-3 text-sm font-medium text-[color:var(--headline)] transition duration-300 hover:-translate-y-0.5 hover:border-[color:var(--accent)]/30 hover:text-[color:var(--headline)]"
          aria-label={signInLabelByLocale[locale]}
        >
          <CircleUserRound className="h-4.5 w-4.5" />
          <span>{signInLabelByLocale[locale]}</span>
        </Link>
      )}
    </div>
  );
}
