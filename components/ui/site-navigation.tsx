"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/ui/locale-provider";
import { localizePathname, stripLocalePrefix } from "@/i18n/config";

export function SiteNavigation({
  basePath,
  className,
  compact = false,
}: {
  basePath?: string;
  className?: string;
  compact?: boolean;
} = {}) {
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const { locale } = useLocale();
  void basePath;

  const links = [
    { href: "/catalog", label: t("catalog") },
    { href: "/projects", label: t("projects") },
  ];

  return (
    <nav
      className={cn(
        "border border-[#ece3d9] bg-white/82 shadow-none",
        compact
          ? "grid w-full grid-cols-2 gap-0.5 rounded-full p-0.5"
          : "inline-flex w-full items-center justify-start gap-1 rounded-[1.6rem] py-1 pl-0.5 pr-1",
        className,
      )}
    >
      {links.map((link) => {
        const isActive = stripLocalePrefix(pathname || "/") === link.href;

        return (
          <Link
            key={link.href}
            href={localizePathname(link.href, locale)}
            className={cn(
              "inline-flex items-center justify-center text-center text-sm font-medium leading-5 whitespace-nowrap transition",
              compact
                ? "min-h-10 w-full rounded-full px-2 py-1 text-[12px] sm:min-h-10 sm:px-4 sm:py-2 sm:text-sm"
                : "min-h-9 rounded-xl px-4 py-2",
              isActive
                ? "bg-[#7f91b7] text-white shadow-[0_10px_24px_rgba(127,145,183,0.24)]"
                : "text-[color:var(--muted)] hover:bg-[#fff7ef] hover:text-[color:var(--headline)]",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
