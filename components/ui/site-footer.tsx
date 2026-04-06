"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { defaultLocale, localizePathname } from "@/i18n/config";
import { useLocale } from "@/components/ui/locale-provider";
import { companyInfoLabels, legalPageLabels, type LegalPageKey } from "@/lib/legal-content";

const legalPages: LegalPageKey[] = ["privacy", "cookies", "delivery", "terms"];

const copy = {
  en: {
    company: "MDB Group, SIA",
  },
  ru: {
    company: "MDB Group, SIA",
  },
  lv: {
    company: "MDB Group, SIA",
  },
  el: {
    company: "MDB Group, SIA",
  },
} as const;

export function SiteFooter() {
  const pathname = usePathname();
  const { locale } = useLocale();

  if (pathname?.startsWith("/panel-x9k2m4q7r2a")) {
    return null;
  }

  const labels = companyInfoLabels[locale];
  const footerLabels = legalPageLabels[locale];

  return (
    <footer className="mt-auto border-t border-[color:var(--line)] bg-white/92">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-10 lg:px-12">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="space-y-3 text-sm leading-7 text-[color:var(--muted)]">
            <p className="text-base font-semibold text-[color:var(--headline)]">{copy[locale].company}</p>
            <p>Riga, Latvia</p>
            <p>
              <span className="font-medium text-[color:var(--headline)]">{labels.email}: </span>
              <a href="mailto:info@mdblight.com" className="transition hover:text-[color:var(--headline)]">
                info@mdblight.com
              </a>
            </p>
            <p>
              <span className="font-medium text-[color:var(--headline)]">{labels.phone}: </span>
              <a href="tel:+37124443333" className="transition hover:text-[color:var(--headline)]">
                +371 24443333
              </a>
            </p>
          </div>

          <nav className="grid gap-3 text-sm text-[color:var(--muted)] sm:grid-cols-2">
            {legalPages.map((page) => {
              const href = locale === defaultLocale ? `/${page}` : localizePathname(`/${page}`, locale);
              return (
                <Link
                  key={page}
                  href={href}
                  className="rounded-xl border border-[#ece3d9] bg-[#fffaf4] px-4 py-3 font-medium transition hover:border-[color:var(--accent)]/40 hover:text-[color:var(--headline)]"
                >
                  {footerLabels[page]}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </footer>
  );
}
