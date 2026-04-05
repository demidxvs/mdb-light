"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { AccountControls } from "@/components/ui/account-controls";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { SiteNavigation } from "@/components/ui/site-navigation";
import { ProjectShowcaseSection } from "@/components/ui/project-showcase-section";

export default function ProjectsPage() {
  const t = useTranslations("home");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_30%),linear-gradient(180deg,#fffdfa_0%,#f8f3eb_100%)] pb-8">
      <div className="border-b border-[color:var(--line)] bg-white/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 text-xs text-[color:var(--muted)] sm:px-10 lg:px-12">
          <div className="hidden md:block">+371 24443333 · info@mdbgroup.lv</div>
          <div className="ml-auto">{t("top")}</div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-1 sm:px-10 lg:px-12">
          <Link href="/" className="flex min-w-0 items-center overflow-visible">
            <Image src="/logo/mdb-light-logo.svg" alt="MDB Light logo" width={1080} height={182} priority className="h-14 w-auto origin-left scale-150 object-contain sm:h-16" />
          </Link>
          <div className="ml-auto hidden xl:block">
            <SiteNavigation basePath="/" />
          </div>
          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher />
            <AccountControls />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
        <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-4 py-2 text-sm font-medium text-[color:var(--headline)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]/25">
          <ArrowLeft className="h-4 w-4" />
          {t("projectShowcase.backHome")}
        </Link>
      </div>

      <ProjectShowcaseSection
        eyebrow={t("projectShowcase.eyebrow")}
        title={t("projectShowcase.title")}
        description={t("projectShowcase.description")}
      />
    </main>
  );
}
