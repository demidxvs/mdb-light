"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Layers3,
  Mail,
  MapPin,
  Percent,
  Phone,
  Truck,
  Wrench,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLocale } from "@/components/ui/locale-provider";
import { SiteNavigation } from "@/components/ui/site-navigation";
import { AccountControls } from "@/components/ui/account-controls";
import { HomeFeaturedCatalog } from "@/components/ui/home-featured-catalog";
import { HomeCategories } from "@/components/ui/home-categories";
import { ProjectShowcaseSection } from "@/components/ui/project-showcase-section";
import { localizePathname } from "@/i18n/config";
import { useEffect, useState } from "react";

const ContactFormCard = dynamic(
  () => import("@/components/ui/contact-form-card").then((mod) => mod.ContactFormCard),
  { ssr: false },
);

export default function Home() {
  const { locale } = useLocale();
  const t = useTranslations("home");
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const seoHub = {
    en: {
      eyebrow: "MDB Light in Riga",
      title: "MDB Light (MDB) for lighting in Riga, Latvia and Cyprus",
      paragraphs: [
        "MDB Light is a multilingual lighting store and project partner for LED lighting in Riga, across Latvia and for installation-oriented projects in Cyprus.",
        "We focus on track lighting, magnetic systems, LED panels, decorative fixtures and practical product selection for apartments, retail and commercial interiors.",
        "If users search for MDB, MDB Light, lighting Riga, LED lighting Latvia or lighting Cyprus, this site is built to connect those intents with real products, categories and installation support.",
      ],
      links: [
        { href: localizePathname("/en/locations/riga", locale), label: "Lighting Riga" },
        { href: localizePathname("/en/locations/latvia", locale), label: "LED Lighting Latvia" },
        { href: localizePathname("/en/locations/cyprus", locale), label: "Lighting Cyprus" },
        { href: localizePathname("/en/services/lighting-installation", locale), label: "Lighting Installation" },
        { href: localizePathname("/en/services/track-lighting", locale), label: "Track Lighting" },
      ],
    },
    ru: {
      eyebrow: "MDB Light в Риге",
      title: "MDB Light (MDB): освещение в Риге, Латвии и на Кипре",
      paragraphs: [
        "MDB Light — это многоязычный магазин и проектный партнёр по LED освещению в Риге, по всей Латвии и для installation-проектов на Кипре.",
        "Мы фокусируемся на трековом освещении, магнитных системах, LED панелях, декоративных светильниках и практичном подборе света для квартир, retail и коммерческих интерьеров.",
        "Если пользователь ищет MDB, MDB Light, освещение в Риге, LED lighting Latvia или lighting Cyprus, главная страница должна связывать этот интент с реальными товарами, категориями и монтажом.",
      ],
      links: [
        { href: localizePathname("/ru/locations/riga", locale), label: "Освещение в Риге" },
        { href: localizePathname("/ru/locations/latvia", locale), label: "LED lighting Latvia" },
        { href: localizePathname("/ru/locations/cyprus", locale), label: "Lighting Cyprus" },
        { href: localizePathname("/ru/services/lighting-installation", locale), label: "Монтаж освещения" },
        { href: localizePathname("/ru/services/track-lighting", locale), label: "Трековое освещение" },
      ],
    },
    lv: {
      eyebrow: "MDB Light Rīgā",
      title: "MDB Light (MDB): apgaismojums Rīgā, Latvijā un Kiprā",
      paragraphs: [
        "MDB Light ir daudzvalodu apgaismojuma veikals un projektu partneris LED apgaismojumam Rīgā, visā Latvijā un uzstādīšanas projektiem Kiprā.",
        "Mēs koncentrējamies uz sliežu apgaismojumu, magnētiskajām sistēmām, LED paneļiem, dekoratīviem gaismekļiem un praktisku atlasi dzīvokļiem, retail un komerciāliem interjeriem.",
        "Ja lietotāji meklē MDB, MDB Light, apgaismojums Rīgā, LED lighting Latvia vai lighting Cyprus, sākumlapa sasaista šo nodomu ar reālām produktu kategorijām un montāžas atbalstu.",
      ],
      links: [
        { href: localizePathname("/lv/locations/riga", locale), label: "Apgaismojums Rīgā" },
        { href: localizePathname("/lv/locations/latvia", locale), label: "LED Lighting Latvia" },
        { href: localizePathname("/lv/locations/cyprus", locale), label: "Lighting Cyprus" },
        { href: localizePathname("/lv/services/lighting-installation", locale), label: "Apgaismojuma montāža" },
        { href: localizePathname("/lv/services/track-lighting", locale), label: "Sliežu apgaismojums" },
      ],
    },
    el: {
      eyebrow: "MDB Light in Riga",
      title: "MDB Light (MDB) for lighting in Riga, Latvia and Cyprus",
      paragraphs: [
        "MDB Light is a multilingual lighting store and project partner for LED lighting in Riga, across Latvia and for installation-oriented projects in Cyprus.",
        "We focus on track lighting, magnetic systems, LED panels, decorative fixtures and practical product selection for apartments, retail and commercial interiors.",
        "If users search for MDB, MDB Light, lighting Riga, LED lighting Latvia or lighting Cyprus, this homepage should connect that intent with real categories, products and installation support.",
      ],
      links: [
        { href: localizePathname("/el/locations/riga", locale), label: "Lighting Riga" },
        { href: localizePathname("/el/locations/latvia", locale), label: "LED Lighting Latvia" },
        { href: localizePathname("/el/locations/cyprus", locale), label: "Lighting Cyprus" },
        { href: localizePathname("/el/services/lighting-installation", locale), label: "Lighting Installation" },
        { href: localizePathname("/el/services/track-lighting", locale), label: "Track Lighting" },
      ],
    },
  }[locale];

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
      title: t("audience.delivery.title"),
      description: t("audience.delivery.description"),
      icon: Truck,
    },
    {
      title: t("audience.installation.title"),
      description: t("audience.installation.description"),
      icon: Wrench,
    },
    {
      title: t("audience.wholesale.title"),
      description: t("audience.wholesale.description"),
      icon: Percent,
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

  const contactItems = [
    {
      title: t("contact.items.phone.label"),
      value: t("contact.items.phone.value"),
      icon: Phone,
    },
    {
      title: t("contact.items.email.label"),
      value: t("contact.items.email.value"),
      icon: Mail,
    },
    {
      title: t("contact.items.address.label"),
      value: t("contact.items.address.value"),
      icon: MapPin,
    },
  ];
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_30%),linear-gradient(180deg,#fffdfa_0%,#f8f3eb_100%)]">
      <div className="border-b border-[color:var(--line)] bg-white/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 text-xs text-[color:var(--muted)] sm:px-10 lg:px-12">
          <div className="hidden md:block">+371 24443333 · info@mdbgroup.lv</div>
          <div className="ml-auto">{t("top")}</div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-1 sm:px-10 lg:px-12">
          <a href="#" className="flex min-w-0 items-center overflow-visible">
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
            <AccountControls />
          </div>
        </div>
        <div className="border-t border-[color:var(--line)] px-4 py-3 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            <div className="flex items-center gap-2">
              <SiteNavigation compact className="min-w-0 flex-1" />
              <LanguageSwitcher className="shrink-0" />
            </div>
            <div className="overflow-x-auto pb-1">
              <AccountControls />
            </div>
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

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-10 sm:py-10 lg:px-12">
        <div className="rounded-[1.6rem] border border-[#e9e1d4] bg-white p-4 shadow-[0_20px_60px_rgba(27,42,74,0.06)] sm:rounded-[2rem] sm:p-6">
          <div className="relative overflow-hidden rounded-[1.35rem] px-4 py-5 text-white sm:rounded-[1.7rem] sm:px-8 sm:py-8">
            <Image
              src="/hero/hero-banner.svg"
              alt="Lighting hero banner"
              fill
              priority
              className="object-cover object-[78%_58%] sm:object-[72%_56%]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,25,45,0.9)_0%,rgba(20,31,54,0.84)_34%,rgba(24,36,60,0.56)_52%,rgba(24,36,60,0.18)_72%,rgba(24,36,60,0.04)_100%)]" />
            <div className="absolute inset-y-0 left-0 w-[100%] bg-[radial-gradient(circle_at_15%_25%,rgba(255,255,255,0.08),transparent_36%)] sm:w-[62%]" />

            <div className="relative grid min-h-[660px] items-center sm:min-h-[620px] lg:min-h-[540px] lg:grid-cols-[minmax(0,640px)_1fr]">
              <div className="flex min-h-[620px] max-w-[640px] flex-col pr-0 sm:min-h-[520px] lg:min-h-[450px] lg:pr-10">
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                  <div aria-hidden="true" className={heroChipClass}>
                    <Layers3 className="h-4 w-4 text-[#f4c64f]" />
                    {t("badge1")}
                  </div>
                  <div aria-hidden="true" className={heroChipClass}>
                    <Wrench className="h-4 w-4 text-[#f4c64f]" />
                    {t("badge2")}
                  </div>
                </div>
                <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.18em] text-[#f4c64f]">
                  {t("heroEyebrow")}
                </p>
                <h1
                  className={`font-display mt-4 font-semibold leading-[0.98] tracking-[-0.05em] ${
                    isCompactHero
                      ? "max-w-[300px] text-[2.2rem] sm:max-w-[520px] sm:text-[2.75rem] lg:text-[3.2rem]"
                      : "max-w-[310px] text-[2.35rem] sm:max-w-[560px] sm:text-[3rem] lg:text-[3.6rem]"
                  }`}
                >
                  {t("heroLead")} <span className="text-[#f4c64f]">{t("heroAccent")}</span>{" "}
                  {t("heroTail")}
                </h1>
                <p
                  className={`mt-5 text-white/84 ${
                    isCompactHero
                      ? "max-w-[315px] text-[14px] leading-6 sm:max-w-[500px] sm:text-[15px]"
                      : "max-w-[320px] text-[15px] leading-7 sm:max-w-[520px] sm:text-base"
                  }`}
                >
                  {t("heroText")}
                </p>
                <div className="mt-auto grid w-full gap-3 pt-6 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
                  <Link href={localizePathname("/catalog", locale)} className={`${heroPrimaryButtonClass} w-full sm:w-auto`}>
                    {t("cta1")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href={localizePathname("/projects", locale)} className={`${heroSecondaryButtonClass} w-full sm:w-auto`}>
                    {t("cta2")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div aria-hidden="true" className="hidden lg:block" />
            </div>
          </div>

          <div id="partners" className="mt-6 grid gap-4 xl:grid-cols-3">
            {audience.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="flex min-h-[118px] items-center gap-4 rounded-[1.4rem] border border-[#ece3d9] bg-[#fffcf7] px-4 py-4 sm:h-[126px] sm:px-5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[color:var(--accent)]/18 bg-[color:var(--accent-soft)] text-[color:var(--accent)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-base font-semibold text-[color:var(--headline)] sm:text-lg">{title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-[color:var(--muted)]">{description}</p>
                </div>
                <ChevronRight className="hidden h-5 w-5 text-[#8f9eb8] sm:block" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <HomeCategories eyebrow={t("categories")} title={t("categoriesTitle")} fallbackCards={catalogCards} limit={32} />
      <HomeFeaturedCatalog />
      <ProjectShowcaseSection
        sectionId="projects"
        eyebrow={t("projectShowcase.eyebrow")}
        title={t("projectShowcase.title")}
        description={t("projectShowcase.description")}
        ctaLabel={t("projectShowcase.cta")}
        ctaHref={localizePathname("/projects", locale)}
        limit={4}
        homeOnly
      />

      <section id="about" className="mx-auto max-w-7xl px-6 py-2 pb-16 sm:px-10 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-[#e5e8ee] bg-white p-6 sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--accent)]">
              {t("contact.leftLabel")}
            </p>
            <h2 className="font-display mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.05em] text-[color:var(--headline)] sm:text-4xl">
              {t("contact.leftTitle")}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[color:var(--muted)] sm:text-base">
              {t("contact.leftDescription")}
            </p>
            <div className="mt-8 grid gap-4">
              {contactItems.map(({ title, value, icon: Icon }) => (
                <article
                  key={title}
                  className="flex min-h-[96px] items-center gap-4 rounded-[1.5rem] border border-[#e9e0d3] bg-[#fffaf4] px-5 py-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[color:var(--accent)]/18 bg-[color:var(--accent-soft)] text-[color:var(--accent)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--muted)]">{title}</p>
                    <p className="mt-2 text-base font-semibold text-[color:var(--headline)] sm:text-lg">{value}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <ContactFormCard />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12 sm:px-10 lg:px-12">
        <div className="rounded-[2rem] border border-[#e5e8ee] bg-white p-6 shadow-[0_20px_60px_rgba(27,42,74,0.06)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{seoHub.eyebrow}</p>
          <h2 className="mt-3 max-w-4xl font-display text-3xl font-semibold tracking-[-0.05em] text-[color:var(--headline)] sm:text-4xl">
            {seoHub.title}
          </h2>
          <div className="mt-5 grid gap-4 text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            {seoHub.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {seoHub.links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-11 items-center rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 py-2 text-sm font-medium text-[color:var(--headline)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]/30"
              >
                {item.label}
              </Link>
            ))}
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
