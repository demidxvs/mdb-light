"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Handshake,
  Headset,  Lightbulb,
  Search,  Sparkles,
  Wrench,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLocale } from "@/components/ui/locale-provider";
import { SiteNavigation } from "@/components/ui/site-navigation";
import { AccountControls } from "@/components/ui/account-controls";

import { HomeFeaturedCatalog } from "@/components/ui/home-featured-catalog";
import { HomeCategories } from "@/components/ui/home-categories";
import { useEffect, useState } from "react";

export default function Home() {
  const { locale } = useLocale();
  const t = useTranslations("home");
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  useEffect(() => {
    const rawNotice = window.sessionStorage.getItem("mdb-light-auth-notice");
    if (!rawNotice) return;

    let nextNotice: string | null = null;

    try {
      const parsed = JSON.parse(rawNotice) as { type?: string; name?: string };
      if (parsed.type === "signed-in") {
        nextNotice = parsed.name
          ? `${t("authNotice.text")}, ${parsed.name}.`
          : t("authNotice.title");
      }
    } catch {
      nextNotice = t("authNotice.title");
    }

    if (nextNotice) {
      queueMicrotask(() => setAuthNotice(nextNotice));
    }

    window.sessionStorage.removeItem("mdb-light-auth-notice");
  }, [t]);

  const isCompactHero = locale === "ru" || locale === "el";
  const heroChipClass =
    "inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs text-white/80 transition duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/16";
  const heroPrimaryButtonClass =
    "inline-flex h-14 min-w-[170px] items-center justify-center gap-2 rounded-xl bg-[#f4c64f] px-6 text-sm font-semibold text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#efbf3e] hover:shadow-[0_18px_34px_rgba(244,198,79,0.34)]";
  const heroSecondaryButtonClass =
    "inline-flex h-14 min-w-[170px] items-center justify-center gap-2 rounded-xl border border-white/24 bg-white/12 px-6 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:border-white/32 hover:bg-white/18";

  const audience = [
    {
      title: t("audience.designers.title"),
      description: t("audience.designers.description"),
      icon: Sparkles,
    },
    {
      title: t("audience.partners.title"),
      description: t("audience.partners.description"),
      icon: Handshake,
    },
    {
      title: t("audience.installers.title"),
      description: t("audience.installers.description"),
      icon: Wrench,
    },
  ];

  const catalogCards = [
    {
      title: t("catalogCards.track.title"),
      description: t("catalogCards.track.description"),
    },
    {
      title: t("catalogCards.linear.title"),
      description: t("catalogCards.linear.description"),
    },
    {
      title: t("catalogCards.decorative.title"),
      description: t("catalogCards.decorative.description"),
    },
    {
      title: t("catalogCards.strips.title"),
      description: t("catalogCards.strips.description"),
    },
  ];

  const projects = [t("projects.homes"), t("projects.retail"), t("projects.restaurants")];
  const adminItems = [
    t("adminItems.products"),
    t("adminItems.translations"),
    t("adminItems.orders"),
    t("adminItems.statuses"),
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_30%),linear-gradient(180deg,#fffdfa_0%,#f8f3eb_100%)]">
      <div className="border-b border-[color:var(--line)] bg-white/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 text-xs text-[color:var(--muted)] sm:px-10 lg:px-12">
          <div className="hidden md:block">+370 (000) 000-00-00 · hello@mdblight.com</div>
          <div className="ml-auto">{t("top")}</div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-white/92 backdrop-blur-xl">
        <div className="flex w-full items-center gap-4 py-1 pl-1 pr-6 sm:pl-2 sm:pr-10 lg:pl-2 lg:pr-12">
          <a href="#" className="flex min-w-0 items-center overflow-visible xl:ml-[360px] 2xl:ml-[380px]">
            <Image
              src="/logo/mdb-light-logo.svg"
              alt="MDB Light logo"
              width={1080}
              height={182}
              priority
              className="h-14 w-auto origin-left scale-150 object-contain sm:h-16"
            />
          </a>
          <div className="ml-auto hidden xl:block">
            <SiteNavigation />
          </div>
          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher />
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--line)] bg-white/72 text-[color:var(--muted)] hover:border-[color:var(--accent)]/30 hover:text-[color:var(--headline)]"
              aria-label="Search"
            >
              <Search className="h-4.5 w-4.5" />
            </button>
            <AccountControls />
            <Link
              href="/contacts"
              className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-[#203153] shadow-[0_12px_28px_rgba(244,198,79,0.28)] hover:bg-[#f1bc36]"
            >
              <Headset className="h-4 w-4" />
              {t("support")}
            </Link>
          </div>
        </div>
      </header>

      {authNotice ? (
        <section className="mx-auto max-w-7xl px-6 pt-6 sm:px-10 lg:px-12">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 shadow-[0_12px_30px_rgba(16,185,129,0.08)]">
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-5 w-5" />
              <div>
                <p className="font-semibold">{t("authNotice.title")}</p>
                <p>{authNotice}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAuthNotice(null)}
              className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-medium text-emerald-800"
            >
              OK
            </button>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <div className="rounded-[2rem] border border-[#e9e1d4] bg-white p-6 shadow-[0_20px_60px_rgba(27,42,74,0.06)]">
          <div className="relative overflow-hidden rounded-[1.7rem] px-4 py-5 text-white sm:px-8 sm:py-8">
            <Image
              src="/hero/hero-banner.svg"
              alt="Lighting hero banner"
              fill
              priority
              className="object-cover object-[72%_56%]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,25,45,0.9)_0%,rgba(20,31,54,0.84)_34%,rgba(24,36,60,0.56)_52%,rgba(24,36,60,0.18)_72%,rgba(24,36,60,0.04)_100%)]" />
            <div className="absolute inset-y-0 left-0 w-[62%] bg-[radial-gradient(circle_at_15%_25%,rgba(255,255,255,0.08),transparent_36%)]" />

            <div className="relative grid h-[500px] items-center lg:grid-cols-[minmax(0,640px)_1fr]">
              <div className="flex h-[410px] max-w-[640px] flex-col pr-0 lg:pr-10">
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/collections" className={heroChipClass}>
                    <BadgeCheck className="h-4 w-4 text-[#f4c64f]" />
                    {t("badge1")}
                  </Link>
                  <Link href="/lighting" className={heroChipClass}>
                    <Lightbulb className="h-4 w-4 text-[#f4c64f]" />
                    {t("badge2")}
                  </Link>
                </div>
                <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.18em] text-[#f4c64f]">
                  {t("heroEyebrow")}
                </p>
                <h1
                  className={`font-display mt-4 font-semibold leading-[0.98] tracking-[-0.05em] ${
                    isCompactHero
                      ? "max-w-[520px] text-[2.35rem] sm:text-[2.75rem] lg:text-[3.2rem]"
                      : "max-w-[560px] text-[2.55rem] sm:text-[3rem] lg:text-[3.6rem]"
                  }`}
                >
                  {t("heroLead")} <span className="text-[#f4c64f]">{t("heroAccent")}</span>{" "}
                  {t("heroTail")}
                </h1>
                <p
                  className={`mt-5 text-white/84 ${
                    isCompactHero
                      ? "max-w-[500px] text-[14px] leading-6 sm:text-[15px]"
                      : "max-w-[520px] text-[15px] leading-7 sm:text-base"
                  }`}
                >
                  {t("heroText")}
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
                  <Link href="/catalog" className={heroPrimaryButtonClass}>
                    {t("cta1")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/projects" className={heroSecondaryButtonClass}>
                    {t("cta2")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div aria-hidden="true" className="hidden lg:block" />
            </div>
          </div>

          <div id="partners" className="mt-8 grid gap-4 xl:grid-cols-3">
            {audience.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="flex h-[126px] items-center gap-4 rounded-[1.4rem] border border-[#ece3d9] bg-[#fffcf7] px-5 py-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[color:var(--accent)]/18 bg-[color:var(--accent-soft)] text-[color:var(--accent)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-lg font-semibold text-[color:var(--headline)]">{title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-[color:var(--muted)]">{description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-[#8f9eb8]" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <HomeCategories eyebrow={t("categories")} title={t("categoriesTitle")} fallbackCards={catalogCards} limit={32} />`r`n`r`n      <HomeFeaturedCatalog />

      <section id="projects" className="mx-auto max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
        <div className="rounded-[2rem] border border-[#e5e8ee] bg-white p-6 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--accent)]">{t("inspiration")}</p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-[-0.05em] text-[color:var(--headline)] sm:text-4xl">
            {t("inspirationTitle")}
          </h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {projects.map((item, index) => (
              <article key={item} className="overflow-hidden rounded-[1.6rem] border border-[#e9e0d3] bg-[#fffaf4]">
                <div
                  className={`h-52 ${
                    index === 0
                      ? "bg-[linear-gradient(135deg,#fff0d2,#d6a54f,#24365d)]"
                      : index === 1
                        ? "bg-[linear-gradient(135deg,#eef4ff,#8fa1c7,#223250)]"
                        : "bg-[linear-gradient(135deg,#fff1da,#f0bf65,#1f2f4d)]"
                  }`}
                />
                <div className="p-5">
                  <h3 className="font-display text-xl font-semibold text-[color:var(--headline)]">{item}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-6 py-2 pb-16 sm:px-10 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-[#e5e8ee] bg-white p-6 sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--accent)]">{t("about")}</p>
            <h2 className="font-display mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.05em] text-[color:var(--headline)] sm:text-4xl">
              {t("aboutTitle")}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[color:var(--muted)] sm:text-base">{t("aboutText")}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <article className="h-[124px] rounded-[1.5rem] border border-[#e9e0d3] bg-[#fffaf4] p-5">
                <p className="font-display text-2xl font-semibold text-[color:var(--headline)]">4</p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{t("metrics.languages")}</p>
              </article>
              <article className="h-[124px] rounded-[1.5rem] border border-[#e9e0d3] bg-[#fffaf4] p-5">
                <p className="font-display text-2xl font-semibold text-[color:var(--headline)]">24/7</p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{t("metrics.support")}</p>
              </article>
              <article className="h-[124px] rounded-[1.5rem] border border-[#e9e0d3] bg-[#fffaf4] p-5">
                <p className="font-display text-2xl font-semibold text-[color:var(--headline)]">LED</p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{t("metrics.collections")}</p>
              </article>
            </div>
          </div>
          <div id="support" className="rounded-[2rem] border border-[#e5e8ee] bg-white p-6 sm:p-8 lg:min-h-[520px]">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--accent)]">{t("admin")}</p>
            <h2 className="font-display mt-3 max-w-[24rem] text-3xl font-semibold tracking-[-0.05em] text-[color:var(--headline)] sm:text-4xl">
              {t("adminTitle")}
            </h2>
            <div className="mt-8 space-y-3">
              {adminItems.map((item) => (
                <div
                  key={item}
                  className="flex min-h-[72px] items-center gap-3 rounded-[1.25rem] border border-[#e9e0d3] bg-[#fffaf4] px-4 py-4"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[color:var(--accent-soft)] text-[color:var(--accent)]">
                    <BadgeCheck className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium leading-6 text-[color:var(--headline)]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-10 border-t border-[color:var(--line)] bg-white/72">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
          <p className="font-display text-2xl font-semibold text-[color:var(--headline)]">MDB Light</p>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[color:var(--muted)]">{t("footer")}</p>
        </div>
      </footer>
    </main>
  );
}



















