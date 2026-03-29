"use client";

import Image from "next/image";
import Link from "next/link";
import { Headset, Search } from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { AccountControls } from "@/components/ui/account-controls";
import { AdminNavigation } from "@/components/ui/admin-navigation";
import { useLocale } from "@/components/ui/locale-provider";

type AdminShellProps = {
  topLabel: string;
  supportLabel: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

const shellCopy = {
  en: { eyebrow: "Admin panel", back: "Back to account" },
  ru: { eyebrow: "\u0410\u0434\u043c\u0438\u043d-\u043f\u0430\u043d\u0435\u043b\u044c", back: "\u041d\u0430\u0437\u0430\u0434 \u0432 \u0430\u043a\u043a\u0430\u0443\u043d\u0442" },
  el: { eyebrow: "\u03a0\u03af\u03bd\u03b1\u03ba\u03b1\u03c2 \u03b4\u03b9\u03b1\u03c7\u03b5\u03af\u03c1\u03b9\u03c3\u03b7\u03c2", back: "\u03a0\u03af\u03c3\u03c9 \u03c3\u03c4\u03bf\u03bd \u03bb\u03bf\u03b3\u03b1\u03c1\u03b9\u03b1\u03c3\u03bc\u03cc" },
  lv: { eyebrow: "Administr\u0101cijas panelis", back: "Atpaka\u013c uz kontu" },
} as const;

export function AdminShell({ topLabel, supportLabel, title, description, children }: AdminShellProps) {
  const { locale } = useLocale();
  const t = shellCopy[locale];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_30%),linear-gradient(180deg,#fffdfa_0%,#f8f3eb_100%)]">
      <div className="border-b border-[color:var(--line)] bg-white/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 text-xs text-[color:var(--muted)] sm:px-10 lg:px-12">
          <div className="hidden md:block">+370 (000) 000-00-00 - hello@mdblight.com</div>
          <div className="ml-auto">{topLabel}</div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-white/92 backdrop-blur-xl">
        <div className="flex w-full items-center gap-4 py-1 pl-1 pr-6 sm:pl-2 sm:pr-10 lg:pl-2 lg:pr-12">
          <Link href="/panel-x9k2m4q7r2a" className="flex min-w-0 items-center overflow-visible xl:ml-[360px] 2xl:ml-[380px]">
            <Image src="/logo/mdb-light-logo.svg" alt="MDB Light logo" width={1080} height={182} priority className="h-14 w-auto origin-left scale-150 object-contain sm:h-16" />
          </Link>
          <div className="ml-auto hidden xl:block">
            <AdminNavigation />
          </div>
          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher />
            <button type="button" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--line)] bg-white/72 text-[color:var(--muted)] hover:border-[color:var(--accent)]/30 hover:text-[color:var(--headline)]" aria-label="Search">
              <Search className="h-4.5 w-4.5" />
            </button>
            <AccountControls />
            <Link href="/panel-x9k2m4q7r2a/contacts" className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-[#203153] shadow-[0_12px_28px_rgba(244,198,79,0.28)] hover:bg-[#f1bc36]">
              <Headset className="h-4 w-4" />
              {supportLabel}
            </Link>
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
            <Link href="/account" className="inline-flex h-11 items-center justify-center rounded-xl border border-[#ece3d9] bg-white px-5 text-sm font-medium text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/25">{t.back}</Link>
          </div>

          {children}
        </div>
      </section>
    </main>
  );
}
