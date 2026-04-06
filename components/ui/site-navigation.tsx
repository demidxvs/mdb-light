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
        "inline-flex items-center rounded-[1.6rem] border border-[#ece3d9] bg-white/82 p-1 shadow-none",
        compact && "w-full",
        className,
      )}
    >
      {links.map((link) => {
        const isActive = stripLocalePrefix(pathname || "/") === link.href;

        return (
          <Link
            key={link.href}
            href={localizePathname(link.href, locale)}
            className={`inline-flex h-9 items-center justify-center rounded-xl text-sm font-medium transition ${
              isActive
                ? "bg-[#7f91b7] text-white shadow-[0_10px_24px_rgba(127,145,183,0.24)]"
                : "text-[color:var(--muted)] hover:bg-[#fff7ef] hover:text-[color:var(--headline)]"
            } ${compact ? "flex-1 px-4" : "px-6"}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
