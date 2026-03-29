"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const router = useRouter();
  const [locale, setLocale] = React.useState<Locale>(initialLocale);

  React.useEffect(() => {
    setLocale(initialLocale);
    window.localStorage.setItem("mdb-light-locale", initialLocale);
    document.documentElement.lang = initialLocale;
  }, [initialLocale]);

  const handleSetLocale = React.useCallback(
    (nextLocale: Locale) => {
      if (nextLocale === locale) {
        return;
      }

      setLocale(nextLocale);
      window.localStorage.setItem("mdb-light-locale", nextLocale);
      document.cookie = `mdb-light-locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = nextLocale;
      router.refresh();
    },
    [locale, router],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale: handleSetLocale }}>
      {children}
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
