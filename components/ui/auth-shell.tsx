"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Headset, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { SiteNavigation } from "@/components/ui/site-navigation";
import { AccountControls } from "@/components/ui/account-controls";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase-client";

type AuthShellProps = {
  topLabel: string;
  supportLabel: string;
  backLabel: string;
  title: string;
  description: string;
  activeTab: "login" | "register";
  loginLabel: string;
  registerLabel: string;
  children: React.ReactNode;
};

export function AuthShell({
  topLabel,
  supportLabel,
  backLabel,
  title,
  description,
  activeTab,
  loginLabel,
  registerLabel,
  children,
}: AuthShellProps) {
  const supabaseReady = isSupabaseConfigured();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!supabaseReady) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    const syncUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setIsAuthenticated(Boolean(data.user));
    };

    void syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void syncUser();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabaseReady]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_30%),linear-gradient(180deg,#fffdfa_0%,#f8f3eb_100%)]">
      <div className="border-b border-[color:var(--line)] bg-white/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 text-xs text-[color:var(--muted)] sm:px-10 lg:px-12">
          <div className="hidden md:block">+370 (000) 000-00-00 · hello@mdblight.com</div>
          <div className="ml-auto">{topLabel}</div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-white/92 backdrop-blur-xl">
        <div className="flex w-full items-center gap-4 py-1 pl-1 pr-6 sm:pl-2 sm:pr-10 lg:pl-2 lg:pr-12">
          <Link href="/" className="flex min-w-0 items-center overflow-visible xl:ml-[360px] 2xl:ml-[380px]">
            <Image
              src="/logo/mdb-light-logo.svg"
              alt="MDB Light logo"
              width={1080}
              height={182}
              priority
              className="h-14 w-auto origin-left scale-150 object-contain sm:h-16"
            />
          </Link>
          <div className="ml-auto hidden xl:block">
            <SiteNavigation basePath="/" />
          </div>
          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher />
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--line)] bg-white/72 text-[color:var(--muted)] hover:border-[color:var(--accent)]/30 hover:text-[color:var(--headline)]"
              aria-label="Search"
            >
              <Search className="h-4.5 w-4.5" />
            </button>
            <AccountControls />
            <Link
              href="/contacts"
              className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-[#203153] shadow-[0_12px_28px_rgba(244,198,79,0.28)] hover:bg-[#f1bc36]"
            >
              <Headset className="h-4 w-4" />
              {supportLabel}
            </Link>
          </div>
        </div>
      </header>

      <section className="px-5 py-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Link
              href={isAuthenticated ? "/account" : "/"}
              className="inline-flex items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-4 py-2 text-sm font-medium text-[color:var(--headline)] hover:border-[color:var(--accent)]/25"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>

            {!isAuthenticated ? (
              <div className="inline-flex rounded-2xl border border-[#ece3d9] bg-white p-1">
                <Link
                  href="/login"
                  className={`relative rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    activeTab === "login"
                      ? "bg-[color:var(--accent)] text-[#203153] shadow-[0_10px_24px_rgba(244,198,79,0.22)]"
                      : "text-[color:var(--muted)] hover:bg-[#fff7ef]"
                  }`}
                >
                  <span className="relative z-10">{loginLabel}</span>
                </Link>
                <Link
                  href="/register"
                  className={`relative rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    activeTab === "register"
                      ? "bg-[color:var(--accent)] text-[#203153] shadow-[0_10px_24px_rgba(244,198,79,0.22)]"
                      : "text-[color:var(--muted)] hover:bg-[#fff7ef]"
                  }`}
                >
                  <span className="relative z-10">{registerLabel}</span>
                </Link>
              </div>
            ) : null}
          </div>

          <section
            id={activeTab === "login" ? "login-form" : "register-form"}
            className="overflow-hidden rounded-[1.5rem] border border-[#ece3d9] bg-white p-5 shadow-[0_16px_40px_rgba(27,42,74,0.05)] sm:p-6"
          >
            <div className="mb-5 border-b border-[#efe6dd] pb-4">
              <h1 className="font-display text-[1.95rem] font-semibold tracking-[-0.05em] text-[color:var(--headline)] sm:text-[2.35rem]">
                {title}
              </h1>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{description}</p>
            </div>

            {children}
          </section>
        </div>
      </section>
    </main>
  );
}








