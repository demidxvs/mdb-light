"use client";

import * as React from "react";
import type { AbstractIntlMessages } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { localizePathname, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase-client";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale,
  initialMessages,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
  initialMessages: AbstractIntlMessages;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [locale, setLocale] = React.useState<Locale>(initialLocale);
  const [messages, setMessages] = React.useState<AbstractIntlMessages>(initialMessages);

  React.useEffect(() => {
    setLocale(initialLocale);
    setMessages(initialMessages);
    window.localStorage.setItem("mdb-light-locale", initialLocale);
    document.documentElement.lang = initialLocale;
  }, [initialLocale, initialMessages]);

  React.useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const loginPath = localizePathname("/login", locale);
    const inRecoveryMode =
      (pathname || "/") === loginPath && searchParams?.get("mode") === "recovery";

    const redirectToRecovery = () => {
      if (inRecoveryMode) {
        return;
      }

      router.replace(`${loginPath}?mode=recovery`);
    };

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (hashParams.get("type") === "recovery") {
      redirectToRecovery();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        redirectToRecovery();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [locale, pathname, router, searchParams]);

  const handleSetLocale = React.useCallback(
    (nextLocale: Locale) => {
      if (nextLocale === locale) {
        return;
      }

      setLocale(nextLocale);
      setMessages(getMessages(nextLocale));
      window.localStorage.setItem("mdb-light-locale", nextLocale);
      document.cookie = `mdb-light-locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = nextLocale;
      let nextPathname = localizePathname(pathname || "/", nextLocale);
      const alternates = document.documentElement.dataset.localeAlternates;
      if (alternates) {
        try {
          const parsed = JSON.parse(alternates) as Record<string, string>;
          if (typeof parsed[nextLocale] === "string") {
            nextPathname = parsed[nextLocale];
          }
        } catch {
          // Ignore malformed alternates payloads.
        }
      }
      const query = searchParams?.toString();
      const nextUrl = query ? `${nextPathname}?${query}` : nextPathname;
      router.push(nextUrl);
      router.refresh();
    },
    [locale, pathname, router, searchParams],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale: handleSetLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Riga">
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = React.useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}
