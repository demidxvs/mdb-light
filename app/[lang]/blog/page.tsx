import Link from "next/link";
import { notFound } from "next/navigation";
import { blogArticles } from "@/lib/blog";
import { SeoLocaleAlternatesBridge } from "@/components/seo/seo-locale-alternates-bridge";
import {
  buildPageMetadata,
  getCommonStructuredData,
  getSiteName,
} from "@/lib/seo";
import { isLocale, type Locale } from "@/i18n/config";

function getMetadata(locale: Locale) {
  const paths = {
    en: "/en/blog",
    ru: "/ru/blog",
    lv: "/lv/blog",
    el: "/el/blog",
  } as const;

  return buildPageMetadata({
    locale,
    title:
      locale === "ru"
        ? "Блог об освещении в Риге, Латвии и на Кипре | MDB Light"
        : locale === "lv"
          ? "Apgaismojuma blogs Rīgai, Latvijai un Kiprai | MDB Light"
          : locale === "el"
            ? "Lighting Blog for Riga, Latvia and Cyprus | MDB Light"
            : "Lighting Blog for Riga, Latvia and Cyprus | MDB Light",
    description:
      locale === "ru"
        ? "Статьи про LED lighting Latvia, освещение в Риге, lighting installation Cyprus и световой дизайн."
        : locale === "lv"
          ? "Raksti par LED lighting Latvia, apgaismojumu Rīgā, lighting installation Cyprus un gaismas dizainu."
          : locale === "el"
            ? "Articles about LED lighting Latvia, lighting Riga, lighting installation Cyprus and lighting design."
            : "Articles about LED lighting Latvia, lighting Riga, lighting installation Cyprus and lighting design.",
    pathnameByLocale: paths,
    image: "/hero/hero-banner.png",
    keywords: ["lighting blog", "Riga", "Latvia", "Cyprus"],
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return getMetadata(lang);
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const locale = lang as Locale;
  const alternates = {
    en: "/en/blog",
    ru: "/ru/blog",
    lv: "/lv/blog",
    el: "/el/blog",
  };
  const structuredData = getCommonStructuredData(locale);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdfa_0%,#f8f3eb_100%)] px-6 py-12 sm:px-10 lg:px-12">
      <SeoLocaleAlternatesBridge alternates={alternates} />
      {structuredData.map((item, index) => (
        <script
          key={`blog-index-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-[#e7dfd4] bg-white p-8 shadow-[0_20px_60px_rgba(27,42,74,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c6952f]">
          {getSiteName()}
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-[color:var(--headline)]">
          {locale === "ru"
            ? "SEO-блог про освещение"
            : locale === "lv"
              ? "SEO blogs par apgaismojumu"
              : locale === "el"
                ? "SEO blog για φωτισμό"
                : "Lighting SEO blog"}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
          {locale === "ru"
            ? "Материалы про освещение в Риге, LED lighting Latvia, lighting installation Cyprus и практику светового проектирования."
            : locale === "lv"
              ? "Raksti par apgaismojumu Rīgā, LED lighting Latvia, lighting installation Cyprus un gaismas projektēšanu."
              : locale === "el"
                ? "Articles about lighting Riga, LED lighting Latvia, lighting installation Cyprus and practical lighting design."
                : "Articles about lighting Riga, LED lighting Latvia, lighting installation Cyprus and practical lighting design."}
        </p>
      </section>

      <section className="mx-auto mt-8 grid max-w-5xl gap-5">
        {blogArticles.map((article) => (
          <Link
            key={article.id}
            href={`/${locale}/blog/${article.slug[locale]}`}
            className="rounded-[1.6rem] border border-[#e7dfd4] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)] transition hover:-translate-y-0.5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c6952f]">Blog</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-[color:var(--headline)]">
              {article.title[locale]}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              {article.description[locale]}
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
