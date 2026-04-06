"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProjectShowcaseSection } from "@/components/ui/project-showcase-section";
import { SiteFooter } from "@/components/ui/site-footer";
import { SiteHeader } from "@/components/ui/site-header";

export default function ProjectsPage() {
  const t = useTranslations("home");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_30%),linear-gradient(180deg,#fffdfa_0%,#f8f3eb_100%)] pb-8">
      <SiteHeader topLabel={t("top")} />

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
      <SiteFooter />
    </main>
  );
}
