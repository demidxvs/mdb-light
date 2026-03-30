"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Headset, Search } from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { AccountControls } from "@/components/ui/account-controls";
import { useLocale } from "@/components/ui/locale-provider";
import { HomeCategories } from "@/components/ui/home-categories";
import { HomeFeaturedCatalog } from "@/components/ui/home-featured-catalog";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase-client";

type LocaleKey = "en" | "ru" | "el" | "lv";
type CategoryRow = {
  id: string;
  slug: string;
  sort_order: number;
  cover_image_url: string | null;
  category_translations?: Array<{
    locale: LocaleKey;
    name: string;
    description: string | null;
  }>;
};

const copy = {
  en: {
    top: "Lighting categories overview",
    support: "Contact",
    eyebrow: "Full catalog",
    title: "Browse the marketplace by category first, then go deeper into the products inside each direction.",
    text: "Each category is a curated direction with its own atmosphere, use case, and product logic. Open a category to see every item inside.",
    categories: "Categories",
    categoriesTitle: "All storefront directions in one place",
  },
  ru: {
    top: "Обзор категорий освещения",
    support: "Контакты",
    eyebrow: "Полный каталог",
    title: "Сначала выбирай направление каталога, а потом переходи внутрь товаров этой категории.",
    text: "Каждая категория — это отдельный сценарий света со своей атмосферой, назначением и логикой выбора товаров. Открой категорию и смотри все позиции внутри.",
    categories: "Категории",
    categoriesTitle: "Все направления витрины в одном месте",
  },
  el: {
    top: "Επισκόπηση κατηγοριών φωτισμού",
    support: "Επικοινωνία",
    eyebrow: "Πλήρης κατάλογος",
    title: "Διάλεξε πρώτα κατηγορία και μετά μπες στα προϊόντα που ανήκουν σε αυτή.",
    text: "Κάθε κατηγορία είναι μια ξεχωριστή κατεύθυνση φωτισμού με δική της ατμόσφαιρα, χρήση και λογική προϊόντων. Άνοιξε μια κατηγορία και δες όλα τα προϊόντα μέσα.",
    categories: "Κατηγορίες",
    categoriesTitle: "Όλες οι κατευθύνσεις της βιτρίνας σε ένα μέρος",
  },
  lv: {
    top: "Apgaismojuma kategoriju pārskats",
    support: "Kontakti",
    eyebrow: "Pilns katalogs",
    title: "Vispirms izvēlies kataloga virzienu, pēc tam atver šīs kategorijas produktus.",
    text: "Katra kategorija ir atsevišķs apgaismojuma virziens ar savu noskaņu, pielietojumu un produktu loģiku. Atver kategoriju un apskati visas preces tās iekšienē.",
    categories: "Kategorijas",
    categoriesTitle: "Visi vitrīnas virzieni vienuviet",
  },
} as const;

export default function CatalogPage() {
  const { locale } = useLocale();
  const t = copy[locale];
  const supabaseReady = useMemo(() => isSupabaseConfigured(), []);
  const [categories, setCategories] = useState<CategoryRow[]>([]);

  useEffect(() => {
    if (!supabaseReady) return;
    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    const load = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, slug, sort_order, cover_image_url, category_translations(locale, name, description)")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!mounted) return;
      setCategories((data as CategoryRow[] | null) ?? []);
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [supabaseReady]);

  const fallbackCards = categories.length > 0
    ? categories.map((category) => {
        const translation =
          category.category_translations?.find((item) => item.locale === locale) ||
          category.category_translations?.find((item) => item.locale === "en") ||
          category.category_translations?.[0];

        return {
          title: translation?.name || category.slug,
          description: translation?.description || category.slug,
        };
      })
    : [
        { title: "Track systems", description: "Flexible rail solutions." },
        { title: "Linear fixtures", description: "Continuous clean LED lines." },
        { title: "Decorative lighting", description: "Atmosphere and character." },
        { title: "LED strips", description: "Accent and architectural light." },
      ];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdfa_0%,#f7f2ea_100%)]">
      <div className="border-b border-[color:var(--line)] bg-white/85 backdrop-blur-sm"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 text-xs text-[color:var(--muted)] sm:px-10 lg:px-12"><div className="hidden md:block">+370 (000) 000-00-00 · hello@mdblight.com</div><div className="ml-auto">{t.top}</div></div></div>
      <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-white/92 backdrop-blur-xl"><div className="flex w-full items-center gap-4 py-1 pl-1 pr-6 sm:pl-2 sm:pr-10 lg:pl-2 lg:pr-12"><Link href="/" className="flex min-w-0 items-center overflow-visible xl:ml-[360px] 2xl:ml-[380px]"><Image src="/logo/mdb-light-logo.svg" alt="MDB Light logo" width={1080} height={182} priority className="h-14 w-auto origin-left scale-150 object-contain sm:h-16" /></Link><div className="ml-auto hidden items-center gap-3 lg:flex"><LanguageSwitcher /><button type="button" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--line)] bg-white/72 text-[color:var(--muted)] hover:border-[color:var(--accent)]/30 hover:text-[color:var(--headline)]" aria-label="Search"><Search className="h-4.5 w-4.5" /></button><AccountControls /><Link href="/contacts" className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-[#203153] shadow-[0_12px_28px_rgba(244,198,79,0.28)] hover:bg-[#f1bc36]"><Headset className="h-4 w-4" />{t.support}</Link></div></div></header>

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <div className="rounded-[2rem] border border-[#e9e1d4] bg-white p-6 shadow-[0_20px_60px_rgba(27,42,74,0.06)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f4c64f]">{t.eyebrow}</p>
          <h1 className="mt-4 max-w-5xl font-display text-4xl font-semibold tracking-[-0.06em] text-[color:var(--headline)] sm:text-5xl lg:text-[4rem]">{t.title}</h1>
          <p className="mt-5 max-w-4xl text-sm leading-8 text-[color:var(--muted)] sm:text-base">{t.text}</p>
        </div>
      </section>

      <HomeCategories eyebrow={t.categories} title={t.categoriesTitle} fallbackCards={fallbackCards} limit={32} />
      <HomeFeaturedCatalog />
    </main>
  );
}

