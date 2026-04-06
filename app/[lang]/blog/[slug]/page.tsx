import Link from "next/link";
import { notFound } from "next/navigation";
import { blogArticles, getBlogArticleBySlug } from "@/lib/blog";
import { SeoLocaleAlternatesBridge } from "@/components/seo/seo-locale-alternates-bridge";
import { buildPageMetadata, getCommonStructuredData, getSiteName } from "@/lib/seo";
import { isLocale, type Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};

  const article = getBlogArticleBySlug(lang, slug);
  if (!article) return {};

  const pathnameByLocale = {
    en: `/en/blog/${article.slug.en}`,
    ru: `/ru/blog/${article.slug.ru}`,
    lv: `/lv/blog/${article.slug.lv}`,
    el: `/el/blog/${article.slug.el}`,
  } satisfies Record<Locale, string>;

  return buildPageMetadata({
    locale: lang,
    title: `${article.title[lang]} | ${getSiteName()}`,
    description: article.description[lang],
    pathnameByLocale,
    image: "/hero/hero-banner.png",
    keywords: ["blog", "lighting Riga", "LED lighting Latvia", "lighting Cyprus"],
  });
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const locale = lang as Locale;
  const article = getBlogArticleBySlug(locale, slug);
  if (!article) notFound();

  const alternates = {
    en: `/en/blog/${article.slug.en}`,
    ru: `/ru/blog/${article.slug.ru}`,
    lv: `/lv/blog/${article.slug.lv}`,
    el: `/el/blog/${article.slug.el}`,
  };
  const structuredData = [
    ...getCommonStructuredData(locale),
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title[locale],
      description: article.description[locale],
      author: { "@type": "Organization", name: getSiteName() },
      publisher: { "@type": "Organization", name: getSiteName() },
      mainEntityOfPage: `/${locale}/blog/${article.slug[locale]}`,
    },
  ];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdfa_0%,#f8f3eb_100%)] px-6 py-12 sm:px-10 lg:px-12">
      <SeoLocaleAlternatesBridge alternates={alternates} />
      {structuredData.map((item, index) => (
        <script
          key={`blog-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
      <article className="mx-auto max-w-4xl rounded-[2rem] border border-[#e7dfd4] bg-white p-8 shadow-[0_20px_60px_rgba(27,42,74,0.06)]">
        <Link href={`/${locale}/blog`} className="text-sm font-medium text-[#8d6a1e]">
          {locale === "ru" ? "Назад в блог" : locale === "lv" ? "Atpakaļ uz blogu" : locale === "el" ? "Πίσω στο blog" : "Back to blog"}
        </Link>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-[color:var(--headline)]">
          {article.title[locale]}
        </h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted)] sm:text-base">
          {article.description[locale]}
        </p>
        <div className="mt-8 space-y-5">
          {article.body[locale].map((paragraph) => (
            <p key={paragraph} className="text-base leading-8 text-[color:var(--headline)]/85">
              {paragraph}
            </p>
          ))}
        </div>
      </article>

      <section className="mx-auto mt-8 max-w-4xl rounded-[1.8rem] border border-[#e7dfd4] bg-[#fff8ef] p-6">
        <h2 className="font-display text-2xl font-semibold text-[color:var(--headline)]">
          {locale === "ru" ? "Другие статьи" : locale === "lv" ? "Citi raksti" : locale === "el" ? "Άλλα άρθρα" : "More articles"}
        </h2>
        <div className="mt-5 grid gap-4">
          {blogArticles
            .filter((item) => item.id !== article.id)
            .map((item) => (
              <Link key={item.id} href={`/${locale}/blog/${item.slug[locale]}`} className="text-sm text-[#8d6a1e]">
                {item.title[locale]}
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}
