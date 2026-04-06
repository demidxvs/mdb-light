"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ShoppingCart, CircleUserRound, LoaderCircle, LogOut, ReceiptText } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "@/components/ui/locale-provider";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase-client";
import {
  clearCachedAccountProfile,
  readCachedAccountProfile,
  subscribeCachedAccountProfile,
  writeCachedAccountProfile,
  type CachedAccountProfile,
} from "@/lib/account-cache";
import { CART_UPDATED_EVENT, getActiveCartCount, getCurrentUserId } from "@/lib/cart";

type ProfileRow = CachedAccountProfile;

const signInLabelByLocale = {
  en: "Login",
  ru: "\u0412\u043e\u0439\u0442\u0438",
  el: "\u03a3\u03cd\u03bd\u03b4\u03b5\u03c3\u03b7",
  lv: "Piesl\u0113gties",
} as const;

const ordersLabelByLocale = {
  en: "Orders",
  ru: "Заказы",
  el: "Παραγγελίες",
  lv: "Pasūtījumi",
} as const;

export function AccountControls({ compact = false }: { compact?: boolean } = {}) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = useTranslations("accountControls");
  const supabaseReady = isSupabaseConfigured();
  const cachedProfile = useSyncExternalStore(
    subscribeCachedAccountProfile,
    readCachedAccountProfile,
    () => null,
  );
  const [loading, setLoading] = useState(supabaseReady);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!supabaseReady) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    const syncCartCount = async () => {
      const userId = await getCurrentUserId(supabase);
      if (!mounted) return;
      if (!userId) {
        setCartCount(0);
        return;
      }

      try {
        const count = await getActiveCartCount(supabase, userId);
        if (mounted) {
          setCartCount(count);
        }
      } catch {
        if (mounted) {
          setCartCount(0);
        }
      }
    };

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
        setCartCount(0);
        setLoading(false);
        return;
      }

      const meta = user.user_metadata ?? {};
      const nextProfile = {
        email: user.email ?? null,
        first_name: meta.first_name ?? null,
        last_name: meta.last_name ?? null,
        full_name: meta.full_name ?? null,
        phone: meta.phone ?? null,
      };

      writeCachedAccountProfile(nextProfile);
      setProfile(nextProfile);
      setLoading(false);
      void syncCartCount();

      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name, last_name, full_name, phone")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;
      if (profileData) {
        const mergedProfile = { ...nextProfile, ...profileData };
        writeCachedAccountProfile(mergedProfile);
        setProfile(mergedProfile);
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
        setCartCount(0);
        setLoading(false);
        return;
      }

      const meta = user.user_metadata ?? {};
      const nextProfile = {
        email: user.email ?? null,
        first_name: meta.first_name ?? null,
        last_name: meta.last_name ?? null,
        full_name: meta.full_name ?? null,
        phone: meta.phone ?? null,
      };

      writeCachedAccountProfile(nextProfile);
      setProfile(nextProfile);
      setLoading(false);
      void syncCartCount();
      void hydrateFromSession();
    });

    const handleCartUpdated = () => {
      void syncCartCount();
    };

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    };
  }, [supabaseReady]);

  const displayName = useMemo(() => {
    const source = profile ?? cachedProfile;
    if (!source) return "";
    return source.full_name || [source.first_name, source.last_name].filter(Boolean).join(" ");
  }, [cachedProfile, profile]);

  const resolvedAuthenticated = isAuthenticated || Boolean(cachedProfile);
  const resolvedLoading = loading && !cachedProfile;

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
    <div className="flex items-center gap-1.5 whitespace-nowrap sm:gap-2 xl:gap-3">
      <Link
        href="/cart"
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[color:var(--line)] bg-white/72 text-[color:var(--muted)] transition duration-300 hover:-translate-y-0.5 hover:border-[color:var(--accent)]/30 hover:text-[color:var(--headline)]"
        aria-label={t("cart")}
      >
        <ShoppingCart className="h-4.5 w-4.5" />
        {cartCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-[color:var(--accent)] px-1.5 text-[10px] font-semibold leading-5 text-[#203153] shadow-[0_8px_16px_rgba(244,198,79,0.28)]">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        ) : null}
      </Link>

      {resolvedLoading ? (
        <div className="flex h-9 items-center gap-2 rounded-xl border border-[color:var(--line)] bg-white/72 px-3 text-[color:var(--muted)]">
          <LoaderCircle className="h-4 w-4 animate-spin" />
        </div>
      ) : resolvedAuthenticated ? (
        <>
          <Link
            href="/orders"
            className="inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-[color:var(--line)] bg-white/72 px-2.5 text-sm font-medium text-[color:var(--headline)] transition duration-300 hover:-translate-y-0.5 hover:border-[color:var(--accent)]/30 hover:text-[color:var(--headline)] sm:px-3"
            aria-label={ordersLabelByLocale[locale]}
          >
            <ReceiptText className="h-4 w-4" />
            <span className={compact ? "hidden" : "hidden lg:inline xl:inline"}>{ordersLabelByLocale[locale]}</span>
          </Link>

          <Link
            href="/account"
            className="flex h-10 min-w-[42px] max-w-[220px] items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-2.5 text-left text-[color:var(--headline)] shadow-[0_10px_24px_rgba(16,185,129,0.12)] transition duration-300 hover:-translate-y-0.5 hover:border-emerald-400 sm:min-w-[150px] sm:px-3 xl:min-w-[170px]"
            aria-label={t("account")}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700">
              <CircleUserRound className="h-4.5 w-4.5" />
            </div>
            <p className={compact ? "hidden" : "hidden truncate text-sm font-semibold leading-4 sm:block"}>
              {displayName || t("account")}
            </p>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-label={t("signOut")}
            className="inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-[color:var(--line)] bg-white/72 px-2.5 text-sm font-medium text-[color:var(--headline)] transition duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70 sm:px-3"
          >
            {signingOut ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            <span className={compact ? "hidden" : "hidden 2xl:inline"}>{t("signOut")}</span>
          </button>
        </>
      ) : (
        <Link
          href="/login"
          className="inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-[color:var(--line)] bg-white/72 px-2.5 text-sm font-medium text-[color:var(--headline)] transition duration-300 hover:-translate-y-0.5 hover:border-[color:var(--accent)]/30 hover:text-[color:var(--headline)] sm:px-3"
          aria-label={signInLabelByLocale[locale]}
        >
          <CircleUserRound className="h-4.5 w-4.5" />
          <span className={compact ? "hidden" : "hidden sm:inline"}>{signInLabelByLocale[locale]}</span>
        </Link>
      )}
    </div>
  );
}
