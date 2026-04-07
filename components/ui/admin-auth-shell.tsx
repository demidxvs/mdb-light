"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContactInlineLinks } from "@/components/ui/contact-links";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLocale } from "@/components/ui/locale-provider";
import { localizePathname } from "@/i18n/config";

type AdminAuthShellProps = {
  topLabel: string;
  backLabel: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AdminAuthShell({
  topLabel,
  backLabel,
  title,
  description,
  children,
}: AdminAuthShellProps) {
  const { locale } = useLocale();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_30%),linear-gradient(180deg,#fffdfa_0%,#f8f3eb_100%)]">
      <div className="border-b border-[color:var(--line)] bg-white/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 text-xs text-[color:var(--muted)] sm:px-10 lg:px-12">
          <ContactInlineLinks className="hidden md:block" />
          <div className="ml-auto">{topLabel}</div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-3 sm:px-8 lg:px-10">
          <Link
            href={localizePathname("/panel-x9k2m4q7r2a/login", locale)}
            className="flex min-w-0 items-center overflow-visible"
          >
            <Image
              src="/logo/mdb-light-logo.svg"
              alt="MDB Light logo"
              width={1080}
              height={182}
              priority
              className="h-12 w-auto origin-left scale-[1.35] object-contain sm:h-14"
            />
          </Link>
          <div className="ml-auto hidden items-center gap-3 lg:flex">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <section className="px-5 py-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Link
              href={localizePathname("/", locale)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-4 py-2 text-sm font-medium text-[color:var(--headline)] hover:border-[color:var(--accent)]/25"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          </div>

          <section className="overflow-hidden rounded-[1.5rem] border border-[#ece3d9] bg-white p-5 shadow-[0_16px_40px_rgba(27,42,74,0.05)] sm:p-6">
            <div className="mb-5 border-b border-[#efe6dd] pb-4">
              <h1 className="font-display text-[1.95rem] font-semibold tracking-[-0.05em] text-[color:var(--headline)] sm:text-[2.35rem]">
                {title}
              </h1>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                {description}
              </p>
            </div>

            {children}
          </section>
        </div>
      </section>
    </main>
  );
}
