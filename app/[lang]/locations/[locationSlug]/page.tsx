import Link from "next/link";
import { notFound } from "next/navigation";
import { SeoLocaleAlternatesBridge } from "@/components/seo/seo-locale-alternates-bridge";
import { SiteFooter } from "@/components/ui/site-footer";
import { SiteHeader } from "@/components/ui/site-header";
import { getLocationLanding } from "@/lib/seo-content";
import { buildPageMetadata, getCommonStructuredData, getSiteName } from "@/lib/seo";
import { isLocale, type Locale } from "@/i18n/config";

function buildPath(locale: Locale, slug: string) {
  return `/${locale}/locations/${slug}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; locationSlug: string }>;
}) {
  const { lang, locationSlug } = await params;
  if (!isLocale(lang)) return {};
  const landing = getLocationLanding(locationSlug);
  if (!landing) return {};

  return buildPageMetadata({
    locale: lang,
    title: `${landing.title[lang]} | MDB Light`,
    description: landing.description[lang],
    pathnameByLocale: {
      en: buildPath("en", locationSlug),
      ru: buildPath("ru", locationSlug),
      lv: buildPath("lv", locationSlug),
      el: buildPath("el", locationSlug),
    },
    image: "/hero/hero-banner.png",
    keywords: landing.keywords,
  });
}

export default async function LocationLandingPage({
  params,
}: {
  params: Promise<{ lang: string; locationSlug: string }>;
}) {
  const { lang, locationSlug } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const landing = getLocationLanding(locationSlug);
  if (!landing) notFound();

  const alternates = {
    en: buildPath("en", locationSlug),
    ru: buildPath("ru", locationSlug),
    lv: buildPath("lv", locationSlug),
    el: buildPath("el", locationSlug),
  };
  const structuredData = [
    ...getCommonStructuredData(locale),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: landing.faq[locale].map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdfa_0%,#f8f3eb_100%)]">
      <SeoLocaleAlternatesBridge alternates={alternates} />
      {structuredData.map((item, index) => (
        <script key={`location-schema-${index}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }} />
      ))}
      <SiteHeader topLabel={landing.title[locale]} />
      <section className="mx-auto max-w-5xl px-6 py-10 sm:px-10 lg:px-12">
      <div className="rounded-[2rem] border border-[#e7dfd4] bg-white p-8 shadow-[0_20px_60px_rgba(27,42,74,0.06)]">
        <nav className="text-sm text-[color:var(--muted)]">
          <Link href={`/${locale}`}>{getSiteName()}</Link>
          <span className="mx-2">/</span>
          <span>{landing.title[locale]}</span>
        </nav>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#c6952f]">Riga · Latvia · Cyprus</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.05em] text-[color:var(--headline)]">{landing.title[locale]}</h1>
        <p className="mt-5 max-w-4xl text-base leading-8 text-[color:var(--headline)]/85">{landing.intro[locale]}</p>
        <div className="mt-8 space-y-5">
          {landing.body[locale].map((paragraph) => (
            <p key={paragraph} className="text-base leading-8 text-[color:var(--muted)]">{paragraph}</p>
          ))}
        </div>
      </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-5xl gap-5 px-6 pb-10 sm:px-10 lg:px-12 md:grid-cols-2">
        {landing.faq[locale].map((item) => (
          <article key={item.question} className="rounded-[1.6rem] border border-[#e7dfd4] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
            <h2 className="font-display text-xl font-semibold text-[color:var(--headline)]">{item.question}</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{item.answer}</p>
          </article>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
