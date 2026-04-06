import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { getLegalPageAlternates, type LegalPageKey } from "@/lib/legal-content";

type PageKey = LegalPageKey;

const metaByLocale: Record<
  PageKey,
  Record<Locale, { title: string; description: string }>
> = {
  privacy: {
    en: {
      title: "Privacy Policy | MDB Light",
      description: "Learn how we process your personal data.",
    },
    ru: {
      title: "Политика конфиденциальности | MDB Light",
      description: "Узнайте, как мы обрабатываем ваши персональные данные.",
    },
    lv: {
      title: "Privatuma politika | MDB Light",
      description: "Uzziniet, ka mes apstradajam jusu personas datus.",
    },
    el: {
      title: "Πολιτική Απορρήτου | MDB Light",
      description: "Μάθετε πώς επεξεργαζόμαστε τα προσωπικά σας δεδομένα.",
    },
  },
  cookies: {
    en: {
      title: "Cookies Policy | MDB Light",
      description: "Learn how MDB Light uses cookies and consent settings.",
    },
    ru: {
      title: "Политика cookies | MDB Light",
      description: "Узнайте, как MDB Light использует cookies и настройки согласия.",
    },
    lv: {
      title: "Sikdatnu politika | MDB Light",
      description: "Uzziniet, ka MDB Light izmanto sikdatnes un piekrisanas iestatijumus.",
    },
    el: {
      title: "Πολιτική Cookies | MDB Light",
      description: "Μάθετε πώς το MDB Light χρησιμοποιεί cookies και ρυθμίσεις συναίνεσης.",
    },
  },
  delivery: {
    en: {
      title: "Delivery and Returns | MDB Light",
      description: "Information about delivery, payment and returns.",
    },
    ru: {
      title: "Доставка и возврат | MDB Light",
      description: "Информация о доставке, оплате и возврате.",
    },
    lv: {
      title: "Piegade un atgriesana | MDB Light",
      description: "Informacija par piegadi, apmaksu un atgriesanu.",
    },
    el: {
      title: "Παράδοση και Επιστροφές | MDB Light",
      description: "Πληροφορίες σχετικά με παράδοση, πληρωμή και επιστροφές.",
    },
  },
  terms: {
    en: {
      title: "Terms of Use | MDB Light",
      description: "Website terms and conditions of use.",
    },
    ru: {
      title: "Условия использования | MDB Light",
      description: "Условия и правила использования сайта.",
    },
    lv: {
      title: "Lietosanas noteikumi | MDB Light",
      description: "Vietnes lietosanas noteikumi un nosacijumi.",
    },
    el: {
      title: "Όροι Χρήσης | MDB Light",
      description: "Όροι και προϋποθέσεις χρήσης της ιστοσελίδας.",
    },
  },
};

export async function getRequestLocale(): Promise<Locale> {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const headerLocale = headerStore.get("x-mdb-locale");
  const cookieLocale = cookieStore.get("mdb-light-locale")?.value;

  if (isLocale(headerLocale)) return headerLocale;
  if (isLocale(cookieLocale)) return cookieLocale;

  return defaultLocale;
}

export async function getLegalMetadata(page: PageKey): Promise<Metadata> {
  const locale = await getRequestLocale();
  const meta = metaByLocale[page][locale];

  return {
    title: meta.title,
    description: meta.description,
    alternates: getLegalPageAlternates(page),
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: "article",
      url: `/${locale}/${page}`,
    },
  };
}
