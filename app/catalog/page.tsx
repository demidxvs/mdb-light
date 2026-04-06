 "use client";

import { useLocale } from "@/components/ui/locale-provider";
import { HomeCategories } from "@/components/ui/home-categories";
import { HomeFeaturedCatalog } from "@/components/ui/home-featured-catalog";
import { SiteFooter } from "@/components/ui/site-footer";
import { SiteHeader } from "@/components/ui/site-header";

const copy = {
  en: {
    top: "Lighting categories overview",
    eyebrow: "Categories",
    title: "Lighting categories",
    text: "Choose the direction you need and go to the products",
    fallbackCards: [
      { title: "Track systems", description: "Flexible rail solutions." },
      { title: "Linear fixtures", description: "Continuous clean LED lines." },
      { title: "Decorative lighting", description: "Atmosphere and character." },
      { title: "LED strips", description: "Accent and architectural light." },
    ],
  },
  ru: {
    top: "Обзор категорий освещения",
    eyebrow: "Категории",
    title: "Категории освещения",
    text: "Выберите нужное направление и перейдите к товарам",
    fallbackCards: [
      { title: "Трековые системы", description: "Гибкие решения на шине." },
      { title: "Линейные светильники", description: "Чистые непрерывные линии света." },
      { title: "Декоративный свет", description: "Свет для атмосферы и акцентов." },
      { title: "LED ленты", description: "Подсветка для деталей и архитектуры." },
    ],
  },
  el: {
    top: "Επισκόπηση κατηγοριών φωτισμού",
    eyebrow: "Κατηγορίες",
    title: "Κατηγορίες φωτισμού",
    text: "Επιλέξτε την κατεύθυνση που χρειάζεστε και μεταβείτε στα προϊόντα",
    fallbackCards: [
      { title: "Συστήματα ράγας", description: "Ευέλικτες λύσεις ράγας." },
      { title: "Γραμμικά φωτιστικά", description: "Καθαρές συνεχείς γραμμές φωτός." },
      { title: "Διακοσμητικός φωτισμός", description: "Ατμόσφαιρα και χαρακτήρας." },
      { title: "LED ταινίες", description: "Φωτισμός έμφασης και αρχιτεκτονικής." },
    ],
  },
  lv: {
    top: "Apgaismojuma kategoriju pārskats",
    eyebrow: "Kategorijas",
    title: "Apgaismojuma kategorijas",
    text: "Izvēlieties vajadzīgo virzienu un pārejiet uz precēm",
    fallbackCards: [
      { title: "Sliežu sistēmas", description: "Elastīgi risinājumi uz sliedes." },
      { title: "Lineārie gaismekļi", description: "Tīras nepārtrauktas gaismas līnijas." },
      { title: "Dekoratīvais apgaismojums", description: "Noskaņa un akcents." },
      { title: "LED lentes", description: "Akcenta un arhitektūras apgaismojums." },
    ],
  },
} as const;

export default function CatalogPage() {
  const { locale } = useLocale();
  const t = copy[locale];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdfa_0%,#f7f2ea_100%)]">
      <SiteHeader topLabel={t.top} />

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <div className="rounded-[2rem] border border-[#e9e1d4] bg-white p-6 shadow-[0_20px_60px_rgba(27,42,74,0.06)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f4c64f]">{t.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold tracking-[-0.06em] text-[color:var(--headline)] sm:text-5xl">{t.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">{t.text}</p>
        </div>
      </section>

      <HomeCategories eyebrow="" title="" fallbackCards={t.fallbackCards} limit={32} />
      <HomeFeaturedCatalog />
      <SiteFooter />
    </main>
  );
}
