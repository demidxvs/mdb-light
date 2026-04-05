export type ProjectLocale = "en" | "ru" | "el" | "lv";

export type ProjectShowcaseItem = {
  id: string;
  slug: string;
  imageUrl: string | null;
  featuredOnHome: boolean;
  palette: string;
  title: Record<ProjectLocale, string>;
  caption: Record<ProjectLocale, string>;
};

export const mockProjectShowcase: ProjectShowcaseItem[] = [
  {
    id: "proj-home-villa",
    slug: "villa-lighting-installation",
    imageUrl: null,
    featuredOnHome: true,
    palette:
      "bg-[radial-gradient(circle_at_top,rgba(255,232,176,0.55),transparent_34%),linear-gradient(135deg,#26314f_0%,#475a82_42%,#f2d093_100%)]",
    title: {
      en: "Private villa lighting installation",
      ru: "Установка освещения в частной вилле",
      el: "Εγκατάσταση φωτισμού σε ιδιωτική βίλα",
      lv: "Apgaismojuma uzstādīšana privātmājā",
    },
    caption: {
      en: "Warm layered lighting for living zones, stairs, and exterior accents.",
      ru: "Тёплое многослойное освещение для жилых зон, лестницы и наружных акцентов.",
      el: "Ζεστό πολυεπίπεδο φως για καθιστικά, σκάλες και εξωτερικές λεπτομέρειες.",
      lv: "Silts daudzslāņu apgaismojums dzīvojamām zonām, kāpnēm un āra akcentiem.",
    },
  },
  {
    id: "proj-boutique-showroom",
    slug: "boutique-showroom-lighting",
    imageUrl: null,
    featuredOnHome: true,
    palette:
      "bg-[radial-gradient(circle_at_80%_20%,rgba(255,245,212,0.45),transparent_30%),linear-gradient(135deg,#17233b_0%,#314566_45%,#d7b87b_100%)]",
    title: {
      en: "Boutique showroom lighting",
      ru: "Освещение бутика и шоурума",
      el: "Φωτισμός boutique και showroom",
      lv: "Butika un showroom apgaismojums",
    },
    caption: {
      en: "Focused accent lights that guide attention across merchandise displays.",
      ru: "Акцентный свет, который направляет внимание по витринам и товарным зонам.",
      el: "Στοχευμένος φωτισμός που κατευθύνει την προσοχή στις ζώνες προϊόντων.",
      lv: "Akcenta gaisma, kas vada uzmanību pāri produktu ekspozīcijām.",
    },
  },
  {
    id: "proj-restaurant-ambient",
    slug: "restaurant-ambient-lighting",
    imageUrl: null,
    featuredOnHome: true,
    palette:
      "bg-[radial-gradient(circle_at_50%_18%,rgba(255,214,140,0.48),transparent_26%),linear-gradient(135deg,#2a2230_0%,#554463_48%,#f2bc66_100%)]",
    title: {
      en: "Restaurant ambient lighting",
      ru: "Атмосферное освещение ресторана",
      el: "Ατμοσφαιρικός φωτισμός εστιατορίου",
      lv: "Restorāna atmosfēriskais apgaismojums",
    },
    caption: {
      en: "Soft mood lighting with clean zoning for dining and lounge areas.",
      ru: "Мягкий атмосферный свет с аккуратным зонированием для зала и lounge-зон.",
      el: "Απαλός ατμοσφαιρικός φωτισμός με καθαρές ζώνες για dining και lounge χώρους.",
      lv: "Maigs noskaņas apgaismojums ar skaidru zonējumu ēdamzonām un lounge telpām.",
    },
  },
  {
    id: "proj-office-reception",
    slug: "office-reception-lighting",
    imageUrl: null,
    featuredOnHome: true,
    palette:
      "bg-[radial-gradient(circle_at_72%_24%,rgba(255,250,228,0.46),transparent_28%),linear-gradient(135deg,#1d293f_0%,#4c5b78_44%,#efe4c8_100%)]",
    title: {
      en: "Office reception lighting",
      ru: "Освещение офисной reception-зоны",
      el: "Φωτισμός reception γραφείου",
      lv: "Biroja recepcijas apgaismojums",
    },
    caption: {
      en: "Balanced technical lighting for first impressions, navigation, and comfort.",
      ru: "Сбалансированный технический свет для первого впечатления, навигации и комфорта.",
      el: "Ισορροπημένος τεχνικός φωτισμός για πρώτη εντύπωση, προσανατολισμό και άνεση.",
      lv: "Līdzsvarots tehniskais apgaismojums pirmajam iespaidam, orientācijai un komfortam.",
    },
  },
];

export const featuredMockProjectShowcase = mockProjectShowcase.filter((item) => item.featuredOnHome).slice(0, 4);
