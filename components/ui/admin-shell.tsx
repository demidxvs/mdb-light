"use client";

import Image from "next/image";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { AdminAccountControls } from "@/components/ui/admin-account-controls";
import { AdminNavigation } from "@/components/ui/admin-navigation";
import { useLocale } from "@/components/ui/locale-provider";
import { localizePathname } from "@/i18n/config";

type AdminShellProps = {
  topLabel: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

const shellCopy = {
  en: { eyebrow: "Admin panel" },
  ru: { eyebrow: "\u0410\u0434\u043c\u0438\u043d-\u043f\u0430\u043d\u0435\u043b\u044c" },
  el: { eyebrow: "\u03a0\u03af\u03bd\u03b1\u03ba\u03b1\u03c2 \u03b4\u03b9\u03b1\u03c7\u03b5\u03af\u03c1\u03b9\u03c3\u03b7\u03c2" },
  lv: { eyebrow: "Administr\u0101cijas panelis" },
} as const;

export function AdminShell({ topLabel, title, description, children }: AdminShellProps) {
  const { locale } = useLocale();
  const t = shellCopy[locale];
  const adminHomeHref = localizePathname("/panel-x9k2m4q7r2a", locale);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_30%),linear-gradient(180deg,#fffdfa_0%,#f8f3eb_100%)]">
      <div className="border-b border-[color:var(--line)] bg-white/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 text-xs text-[color:var(--muted)] sm:px-10 lg:px-12">
          <div className="hidden md:block">+371 24443333 · info@mdbgroup.lv</div>
          <div className="ml-auto">{topLabel}</div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-8 lg:px-10">
          <div className="flex items-center gap-4">
            <Link href={adminHomeHref} className="flex min-w-0 items-center overflow-visible">
              <Image src="/logo/mdb-light-logo.svg" alt="MDB Light logo" width={1080} height={182} priority className="h-12 w-auto origin-left scale-[1.35] object-contain sm:h-14" />
            </Link>
            <div className="ml-auto hidden items-center gap-3 lg:flex">
              <LanguageSwitcher />
              <AdminAccountControls />
            </div>
          </div>
          <div className="hidden xl:block">
            <AdminNavigation />
          </div>
        </div>
      </header>

      <section className="px-5 py-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-3 border-b border-[#efe6dd] pb-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--accent)]">{t.eyebrow}</p>
              <h1 className="mt-3 font-display text-[2.1rem] font-semibold tracking-[-0.05em] text-[color:var(--headline)] sm:text-[2.8rem]">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">{description}</p>
            </div>
          </div>

          {children}
        </div>
      </section>
    </main>
  );
}
