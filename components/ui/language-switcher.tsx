"use client";

import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";
import { useLocale } from "@/components/ui/locale-provider";

const locales: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
  { code: "el", label: "EL" },
  { code: "lv", label: "LV" },
];

export function LanguageSwitcher({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className={cn(
        compact
          ? "inline-flex items-center gap-0.5 rounded-[1.6rem] border border-[#ece3d9] bg-white/82 p-0.5 shadow-none"
          : "inline-flex items-center gap-1 rounded-2xl border border-[#ece3d9] bg-white/82 p-1 shadow-none",
        className,
      )}
    >
      {locales.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => setLocale(item.code)}
          className={cn(
            compact
              ? "relative flex h-[2.15rem] min-w-[2.15rem] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tracking-[0.14em] transition-all duration-200 sm:h-10 sm:min-w-10 sm:px-3 sm:text-xs"
              : "relative rounded-xl px-2.5 py-2 text-[11px] font-semibold tracking-[0.14em] transition-all duration-200 sm:px-3 sm:text-xs",
            locale === item.code
              ? "bg-[color:var(--accent)] text-white shadow-[0_10px_24px_rgba(244,198,79,0.22)]"
              : "text-[color:var(--muted)] hover:bg-[#fff7ef] hover:text-[color:var(--headline)]",
          )}
        >
          <span className="relative z-10">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
