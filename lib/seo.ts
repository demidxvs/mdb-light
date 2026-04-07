import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";

type LocaleRecord<T> = Record<Locale, T>;

export type TranslationRecord = {
  locale: Locale;
  name: string | null;
  slug?: string | null;
  short_description?: string | null;
  description?: string | null;
};

export type SeoCategory = {
  id?: string;
  slug: string;
  cover_image_url?: string | null;
  category_translations?: TranslationRecord[];
};

export type SeoProduct = {
  id: string;
  sku?: string;
  slug: string;
  sort_order?: number;
  price_cents: number;
  currency: string;
  primary_image_url?: string | null;
  image_urls?: string[] | null;
  product_translations?: TranslationRecord[];
};

const SITE_NAME = "MDB Light";
const SITE_ALT_NAME = "MDB";
const FALLBACK_SITE_URL = "https://www.mdblight.com";

const CYRILLIC_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
  х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

const GREEK_MAP: Record<string, string> = {
  α: "a", β: "v", γ: "g", δ: "d", ε: "e", ζ: "z", η: "i", θ: "th", ι: "i", κ: "k", λ: "l",
  μ: "m", ν: "n", ξ: "x", ο: "o", π: "p", ρ: "r", σ: "s", ς: "s", τ: "t", υ: "y", φ: "f",
  χ: "ch", ψ: "ps", ω: "o",
};

const GEO_KEYWORDS = {
  en: ["LED lighting Riga", "lighting Riga", "LED lighting Latvia", "lighting Cyprus", "track lights Riga"],
  ru: ["освещение в Риге", "LED lighting Latvia", "освещение Латвия", "lighting Cyprus", "трековое освещение Рига"],
  lv: ["apgaismojums Riga", "LED lighting Latvia", "apgaismojums Latvija", "lighting Cyprus", "sliežu apgaismojums Rīga"],
  el: ["lighting Riga", "LED lighting Latvia", "lighting Cyprus", "φωτισμός Ρίγα", "εγκατάσταση φωτισμού Κύπρος"],
} satisfies LocaleRecord<string[]>;

const HOME_SEO = {
  en: {
    title: "MDB Light (MDB) - LED Lighting in Riga, Latvia & Cyprus",
    description:
      "MDB Light (MDB) supplies LED lighting in Riga, Latvia and Cyprus. Track lights, magnetic systems, LED panels and lighting installation for residential and commercial projects.",
  },
  ru: {
    title: "MDB Light (MDB) - освещение в Риге, Латвии и на Кипре",
    description:
      "MDB Light (MDB) предлагает профессиональное освещение в Риге, Латвии и на Кипре. LED светильники, магнитные трековые системы, LED панели и монтаж под ключ.",
  },
  lv: {
    title: "MDB Light (MDB) - apgaismojums Rīgā, Latvijā un Kiprā",
    description:
      "MDB Light (MDB) nodrošina LED apgaismojumu Rīgā, Latvijā un Kiprā. Magnētiskās sliežu sistēmas, LED paneļi un apgaismojuma uzstādīšana.",
  },
  el: {
    title: "MDB Light (MDB) - Lighting in Riga, Latvia and Cyprus",
    description:
      "MDB Light (MDB) delivers LED lighting in Riga, Latvia and Cyprus with track systems, LED panels and professional lighting installation.",
  },
} satisfies LocaleRecord<{ title: string; description: string }>;

const SUPPORTING_TEXT = {
  en: "Serving projects in Riga, throughout Latvia, and installation services in Cyprus.",
  ru: "Работаем с проектами в Риге, по всей Латвии и выполняем монтаж освещения на Кипре.",
  lv: "Apkalpojam projektus Rīgā, visā Latvijā un nodrošinām apgaismojuma montāžu Kiprā.",
  el: "Υλοποιούμε έργα στη Ρίγα, σε όλη τη Λετονία και παρέχουμε εγκατάσταση φωτισμού στην Κύπρο.",
} satisfies LocaleRecord<string>;

export function getSiteUrl() {
  return FALLBACK_SITE_URL;
}

export function absoluteUrl(pathname: string) {
  return `${getSiteUrl()}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export function transliterate(value: string) {
  return value
    .split("")
    .map((char) => {
      const lower = char.toLowerCase();
      if (CYRILLIC_MAP[lower]) return CYRILLIC_MAP[lower];
      if (GREEK_MAP[lower]) return GREEK_MAP[lower];
      return lower;
    })
    .join("");
}

export function slugify(value: string) {
  return transliterate(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function getCategoryTranslation(category: SeoCategory, locale: Locale) {
  return (
    category.category_translations?.find((item) => item.locale === locale) ||
    category.category_translations?.find((item) => item.locale === "en") ||
    category.category_translations?.[0] ||
    null
  );
}

export function getProductTranslation(product: SeoProduct, locale: Locale) {
  return (
    product.product_translations?.find((item) => item.locale === locale) ||
    product.product_translations?.find((item) => item.locale === "en") ||
    product.product_translations?.[0] ||
    null
  );
}

export function getLocalizedCategorySlug(category: SeoCategory, locale: Locale) {
  const translation = getCategoryTranslation(category, locale);
  const explicitSlug = slugify(translation?.slug || "");
  if (explicitSlug) {
    return explicitSlug;
  }

  return slugify(translation?.name || category.slug);
}

export function getLocalizedProductSlug(product: SeoProduct, locale: Locale) {
  const translation = getProductTranslation(product, locale);
  const explicitSlug = slugify(translation?.slug || "");
  if (explicitSlug) {
    return explicitSlug;
  }
  return slugify(translation?.name || product.sku || product.slug) || slugify(product.slug || product.sku || "product");
}

export function getCategorySlugCandidates(category: SeoCategory) {
  const candidates = new Set<string>();

  candidates.add(slugify(category.slug || "category"));

  for (const locale of ["en", "ru", "lv", "el"] as const) {
    candidates.add(getLocalizedCategorySlug(category, locale));
  }

  for (const translation of category.category_translations ?? []) {
    if (translation.slug) {
      candidates.add(slugify(translation.slug));
    }
    if (translation.name) {
      candidates.add(slugify(translation.name));
    }
  }

  return Array.from(candidates).filter(Boolean);
}

export function getProductSlugCandidates(product: SeoProduct) {
  const candidates = new Set<string>();

  candidates.add(slugify(product.slug || product.sku || "product"));

  if (product.sku) {
    candidates.add(slugify(product.sku));
  }

  for (const locale of ["en", "ru", "lv", "el"] as const) {
    candidates.add(getLocalizedProductSlug(product, locale));
  }

  for (const translation of product.product_translations ?? []) {
    if (translation.slug) {
      candidates.add(slugify(translation.slug));
    }
    if (translation.name) {
      candidates.add(slugify(translation.name));
    }
  }

  return Array.from(candidates).filter(Boolean);
}

export function buildCategoryPath(locale: Locale, category: SeoCategory) {
  return `/${locale}/${getLocalizedCategorySlug(category, locale)}`;
}

export function buildProductPath(locale: Locale, category: SeoCategory, product: SeoProduct) {
  return `/${locale}/${getLocalizedCategorySlug(category, locale)}/${getLocalizedProductSlug(product, locale)}`;
}

export function buildAlternates(paths: LocaleRecord<string>) {
  return {
    canonical: paths.en,
    languages: {
      en: absoluteUrl(paths.en),
      ru: absoluteUrl(paths.ru),
      lv: absoluteUrl(paths.lv),
      el: absoluteUrl(paths.el),
      "x-default": absoluteUrl(paths.en),
    },
  } satisfies NonNullable<Metadata["alternates"]>;
}

export function buildPageMetadata({
  locale,
  title,
  description,
  pathnameByLocale,
  image,
  keywords,
}: {
  locale: Locale;
  title: string;
  description: string;
  pathnameByLocale: LocaleRecord<string>;
  image?: string | null;
  keywords?: string[];
}): Metadata {
  const canonicalPath = pathnameByLocale[locale];
  const ogImage = image || "/hero/hero-banner.png";
  const mergedKeywords = [...GEO_KEYWORDS[locale], ...(keywords ?? [])];

  return {
    title,
    description,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: absoluteUrl("/") }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    referrer: "origin-when-cross-origin",
    category: "lighting",
    classification: "LED lighting, track systems, installation services",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    keywords: mergedKeywords,
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: pathnameByLocale.en,
        ru: pathnameByLocale.ru,
        lv: pathnameByLocale.lv,
        el: pathnameByLocale.el,
        "x-default": pathnameByLocale.en,
      },
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(canonicalPath),
      siteName: SITE_NAME,
      locale,
      type: "website",
      countryName: "Latvia",
      emails: ["info@mdblight.com"],
      phoneNumbers: ["+37124443333"],
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@mdb_light",
    },
    other: {
      keywords: mergedKeywords.join(", "),
      "geo.region": "LV-RIX",
      "geo.placename": "Riga",
      "geo.position": "56.9496;24.1052",
      ICBM: "56.9496, 24.1052",
      "apple-mobile-web-app-title": SITE_NAME,
      "format-detection": "telephone=yes",
    },
  };
}

export function getHomeMetadata(locale: Locale) {
  const pathnameByLocale = {
    en: "/en",
    ru: "/ru",
    lv: "/lv",
    el: "/el",
  } satisfies LocaleRecord<string>;

  return buildPageMetadata({
    locale,
    title: HOME_SEO[locale].title,
    description: HOME_SEO[locale].description,
    pathnameByLocale,
    image: "/hero/hero-banner.png",
    keywords: [SITE_NAME, SITE_ALT_NAME, "MDB", "MDB Light", "Riga", "Latvia", "Cyprus", "lighting"],
  });
}

export function getCategoryMetadata(locale: Locale, category: SeoCategory) {
  const translation = getCategoryTranslation(category, locale);
  const localizedName = translation?.name || category.slug;
  const pathnameByLocale = {
    en: buildCategoryPath("en", category),
    ru: buildCategoryPath("ru", category),
    lv: buildCategoryPath("lv", category),
    el: buildCategoryPath("el", category),
  } satisfies LocaleRecord<string>;

  const titleMap = {
    en: `${localizedName} in Riga, Latvia & Cyprus | MDB Light`,
    ru: `${localizedName} в Риге и Латвии | MDB Light`,
    lv: `${localizedName} Rīgā un Latvijā | MDB Light`,
    el: `${localizedName} in Riga, Latvia & Cyprus | MDB Light`,
  } satisfies LocaleRecord<string>;

  const descriptionMap = {
    en: `${localizedName}. LED lighting Riga, Latvia and Cyprus. ${SUPPORTING_TEXT.en}`,
    ru: `${localizedName}. Освещение в Риге, Латвии и на Кипре. ${SUPPORTING_TEXT.ru}`,
    lv: `${localizedName}. Apgaismojums Rīgā, Latvijā un Kiprā. ${SUPPORTING_TEXT.lv}`,
    el: `${localizedName}. Lighting in Riga, Latvia and Cyprus. ${SUPPORTING_TEXT.el}`,
  } satisfies LocaleRecord<string>;

  return buildPageMetadata({
    locale,
    title: titleMap[locale],
    description: descriptionMap[locale],
    pathnameByLocale,
    image: category.cover_image_url,
    keywords: [localizedName, "Riga", "Latvia", "Cyprus", "lighting installation"],
  });
}

export function getProductMetadata(locale: Locale, category: SeoCategory, product: SeoProduct) {
  const productTranslation = getProductTranslation(product, locale);
  const categoryTranslation = getCategoryTranslation(category, locale);
  const localizedName = productTranslation?.name || product.sku || product.slug;
  const categoryName = categoryTranslation?.name || category.slug;
  const pathnameByLocale = {
    en: buildProductPath("en", category, product),
    ru: buildProductPath("ru", category, product),
    lv: buildProductPath("lv", category, product),
    el: buildProductPath("el", category, product),
  } satisfies LocaleRecord<string>;

  const titleMap = {
    en: `Buy ${localizedName} in Riga | MDB Light`,
    ru: `Купить ${localizedName} в Риге | MDB Light`,
    lv: `Pirkt ${localizedName} Rīgā | MDB Light`,
    el: `Buy ${localizedName} in Riga | MDB Light`,
  } satisfies LocaleRecord<string>;

  const descriptionMap = {
    en: `${localizedName} from the ${categoryName} range. LED lighting Latvia, Riga and Cyprus installation by MDB Light.`,
    ru: `${localizedName} из категории ${categoryName}. LED lighting Latvia, освещение в Риге и монтаж на Кипре от MDB Light.`,
    lv: `${localizedName} no kategorijas ${categoryName}. LED lighting Latvia, apgaismojums Rīgā un montāža Kiprā no MDB Light.`,
    el: `${localizedName} from ${categoryName}. LED lighting Latvia, lighting Riga and installation Cyprus by MDB Light.`,
  } satisfies LocaleRecord<string>;

  return buildPageMetadata({
    locale,
    title: titleMap[locale],
    description: descriptionMap[locale],
    pathnameByLocale,
    image: product.primary_image_url || product.image_urls?.[0] || null,
    keywords: [localizedName, categoryName, "Riga", "Latvia", "Cyprus", product.sku].filter(
      (item): item is string => Boolean(item),
    ),
  });
}

export function getCommonStructuredData(locale: Locale) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      alternateName: [SITE_ALT_NAME, "MDB Light"],
      url: getSiteUrl(),
      logo: absoluteUrl("/logo/logo-notext.svg"),
      areaServed: ["Latvia", "Cyprus"],
      knowsAbout: ["LED lighting", "track systems", "lighting installation"],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+37124443333",
        contactType: "sales",
        areaServed: ["LV", "CY"],
        availableLanguage: ["en", "ru", "lv", "el"],
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: SITE_NAME,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Riga",
        addressCountry: "LV",
      },
      areaServed: ["Riga", "Latvia", "Cyprus"],
      serviceType: ["LED lighting", "track systems", "lighting installation"],
      availableLanguage: [locale, "en", "ru", "lv", "el"],
      url: getSiteUrl(),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      alternateName: SITE_ALT_NAME,
      url: getSiteUrl(),
      inLanguage: [locale, "en", "ru", "lv", "el"],
      potentialAction: {
        "@type": "SearchAction",
        target: `${getSiteUrl()}/catalog?query={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];
}

export function getGeoSupportingText(locale: Locale) {
  return SUPPORTING_TEXT[locale];
}

export function getSiteName() {
  return SITE_NAME;
}
