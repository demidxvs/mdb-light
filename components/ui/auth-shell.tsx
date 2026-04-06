"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteFooter } from "@/components/ui/site-footer";
import { SiteHeader } from "@/components/ui/site-header";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase-client";

type AuthShellProps = {
  topLabel: string;
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
      <SiteHeader topLabel={topLabel} />

      <section className="px-4 py-5 sm:px-8 sm:py-6 lg:px-10">
        <div className="mx-auto max-w-xl">
          <div className="mb-3 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
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
      <SiteFooter />
    </main>
  );
}

