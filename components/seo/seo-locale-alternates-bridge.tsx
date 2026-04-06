"use client";

import { useEffect } from "react";

export function SeoLocaleAlternatesBridge({
  alternates,
}: {
  alternates: Record<string, string>;
}) {
  useEffect(() => {
    document.documentElement.dataset.localeAlternates = JSON.stringify(alternates);

    return () => {
      delete document.documentElement.dataset.localeAlternates;
    };
  }, [alternates]);

  return null;
}
