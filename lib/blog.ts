import type { Locale } from "@/i18n/config";

type LocaleRecord<T> = Record<Locale, T>;

export type BlogArticle = {
  id: string;
  slug: LocaleRecord<string>;
  title: LocaleRecord<string>;
  description: LocaleRecord<string>;
  excerpt: LocaleRecord<string>;
  body: LocaleRecord<string[]>;
};

export const blogArticles: BlogArticle[] = [
  {
    id: "how-to-choose-lighting",
    slug: {
      en: "how-to-choose-lighting",
      ru: "kak-vybrat-osveshchenie",
      lv: "ka-izveleties-apgaismojumu",
      el: "pos-na-epilexete-fotismo",
    },
    title: {
      en: "How to Choose Lighting for Modern Interiors",
      ru: "Как выбрать освещение для современного интерьера",
      lv: "Kā izvēlēties apgaismojumu mūsdienīgam interjeram",
      el: "Πώς να επιλέξετε φωτισμό για σύγχρονους εσωτερικούς χώρους",
    },
    description: {
      en: "A practical guide to LED lighting, track systems and layered lighting design for homes and retail spaces in Riga and Latvia.",
      ru: "Практическое руководство по LED освещению, трековым системам и световым сценариям для квартир и коммерческих объектов в Риге и Латвии.",
      lv: "Praktisks ceļvedis LED apgaismojumam, sliežu sistēmām un gaismas scenārijiem mājām un komerctelpām Rīgā un Latvijā.",
      el: "Πρακτικός οδηγός για LED φωτισμό, συστήματα ράγας και φωτιστικά σενάρια για κατοικίες και εμπορικούς χώρους στη Ρίγα και τη Λετονία.",
    },
    excerpt: {
      en: "Start with function, add layers, then optimize with LED efficiency.",
      ru: "Начните с функции, добавьте уровни света и затем оптимизируйте систему LED-решениями.",
      lv: "Sāciet ar funkciju, pievienojiet gaismas slāņus un pēc tam optimizējiet ar LED risinājumiem.",
      el: "Ξεκινήστε από τη λειτουργία, προσθέστε επίπεδα φωτισμού και βελτιστοποιήστε με LED αποδοτικότητα.",
    },
    body: {
      en: [
        "Choose lighting by activity first: ambient light for comfort, task light for work zones, and accent light for display surfaces.",
        "Track systems are ideal when layouts change often, especially in Riga retail spaces and modern apartments.",
        "Use efficient LED fixtures with a consistent color temperature and keep installation planning in mind from day one.",
      ],
      ru: [
        "Выбирайте освещение сначала по функциям: общий свет для комфорта, рабочий свет для зон активности и акцентный свет для витрин и деталей.",
        "Трековые системы особенно удобны для гибких планировок, шоурумов и квартир в Риге.",
        "Используйте энергоэффективные LED светильники с единой цветовой температурой и заранее проектируйте монтаж.",
      ],
      lv: [
        "Apgaismojumu izvēlieties pēc funkcijas: vispārējā gaisma komfortam, darba gaisma aktīvajām zonām un akcenta gaisma ekspozīcijām.",
        "Sliežu sistēmas ir īpaši piemērotas mainīgiem plānojumiem, veikaliem un dzīvokļiem Rīgā.",
        "Izmantojiet efektīvus LED gaismekļus ar vienotu krāsu temperatūru un savlaicīgi plānojiet montāžu.",
      ],
      el: [
        "Επιλέξτε φωτισμό πρώτα με βάση τη χρήση: γενικός φωτισμός για άνεση, φωτισμός εργασίας για λειτουργικές ζώνες και φωτισμός έμφασης για επιφάνειες προβολής.",
        "Τα συστήματα ράγας είναι ιδανικά όταν η διάταξη αλλάζει συχνά, ειδικά σε καταστήματα και διαμερίσματα στη Ρίγα.",
        "Χρησιμοποιήστε αποδοτικά LED φωτιστικά με σταθερή θερμοκρασία χρώματος και σχεδιάστε την εγκατάσταση από την αρχή.",
      ],
    },
  },
  {
    id: "apartment-lighting-riga",
    slug: {
      en: "apartment-lighting-riga",
      ru: "osveshchenie-kvartiry-v-rige",
      lv: "dzivokla-apgaismojums-riga",
      el: "fotismos-diamerismatos-sti-riga",
    },
    title: {
      en: "Apartment Lighting in Riga: Practical Planning Tips",
      ru: "Освещение квартиры в Риге: практические советы",
      lv: "Dzīvokļa apgaismojums Rīgā: praktiski padomi",
      el: "Φωτισμός διαμερίσματος στη Ρίγα: πρακτικές συμβουλές",
    },
    description: {
      en: "Plan apartment lighting in Riga with LED panels, magnetic track systems and warm accent lighting for living spaces.",
      ru: "Как спланировать освещение квартиры в Риге: LED панели, магнитные треки и комфортный акцентный свет.",
      lv: "Kā plānot dzīvokļa apgaismojumu Rīgā ar LED paneļiem, magnētiskām sliedēm un akcenta gaismu.",
      el: "Πώς να σχεδιάσετε φωτισμό διαμερίσματος στη Ρίγα με LED panels, μαγνητικές ράγες και φωτισμό έμφασης.",
    },
    excerpt: {
      en: "Riga apartments benefit from layered lighting and compact track solutions.",
      ru: "Для квартир в Риге лучше всего работают многослойный свет и компактные трековые решения.",
      lv: "Rīgas dzīvokļiem vislabāk strādā daudzslāņu gaisma un kompaktas sliežu sistēmas.",
      el: "Τα διαμερίσματα στη Ρίγα ωφελούνται από πολυεπίπεδο φωτισμό και συμπαγείς λύσεις ράγας.",
    },
    body: {
      en: [
        "In compact apartments, replace a single center fixture with layered lighting that separates kitchen, living and hallway zones.",
        "Magnetic track systems help avoid visual clutter while preserving enough lux for worktops and wardrobes.",
        "Warm decorative light improves comfort, while neutral LED panels maintain clarity in kitchens and home offices.",
      ],
      ru: [
        "В компактных квартирах лучше отказаться от одного центрального светильника и разделить кухню, гостиную и коридор по световым сценариям.",
        "Магнитные трековые системы помогают сохранить визуальную чистоту интерьера и дают достаточно света для кухни и гардеробов.",
        "Тёплый декоративный свет добавляет уют, а нейтральные LED панели поддерживают комфорт в кухне и домашнем кабинете.",
      ],
      lv: [
        "Kompaktos dzīvokļos labāk atteikties no viena centrālā gaismekļa un veidot atsevišķus scenārijus virtuvei, viesistabai un gaitenim.",
        "Magnētiskās sliežu sistēmas samazina vizuālo troksni un vienlaikus nodrošina pietiekamu apgaismojumu darba virsmām un skapjiem.",
        "Silta dekoratīvā gaisma rada mājīgumu, bet neitrāli LED paneļi saglabā skaidrību virtuvēs un mājas birojos.",
      ],
      el: [
        "Σε μικρά διαμερίσματα είναι καλύτερο να αποφύγετε ένα μόνο κεντρικό φωτιστικό και να σχεδιάσετε ξεχωριστά σενάρια για κουζίνα, καθιστικό και διάδρομο.",
        "Τα μαγνητικά συστήματα ράγας διατηρούν καθαρές γραμμές στον χώρο και δίνουν επαρκή φωτισμό για πάγκους και ντουλάπες.",
        "Ο θερμός διακοσμητικός φωτισμός αυξάνει την άνεση, ενώ τα ουδέτερα LED panels κρατούν καθαρότητα σε κουζίνες και home office.",
      ],
    },
  },
  {
    id: "lighting-design-latvia",
    slug: {
      en: "lighting-design-latvia",
      ru: "lighting-design-latvia",
      lv: "lighting-design-latvia",
      el: "lighting-design-latvia",
    },
    title: {
      en: "Lighting Design Latvia: From Concept to Installation",
      ru: "Lighting design Latvia: от концепции до установки",
      lv: "Lighting design Latvia: no koncepcijas līdz montāžai",
      el: "Lighting design Latvia: από τη σύλληψη έως την εγκατάσταση",
    },
    description: {
      en: "Lighting design workflow for Latvia and Cyprus: concept, fixture selection, specification and professional installation.",
      ru: "Как выстроить lighting design для Латвии и Кипра: концепция, подбор светильников, спецификация и профессиональный монтаж.",
      lv: "Lighting design process Latvijā un Kiprā: koncepcija, gaismekļu atlase, specifikācija un profesionāla uzstādīšana.",
      el: "Workflow lighting design για Λετονία και Κύπρο: concept, επιλογή φωτιστικών, προδιαγραφές και επαγγελματική εγκατάσταση.",
    },
    excerpt: {
      en: "A complete process from lighting concept to commissioning.",
      ru: "Полный процесс: от световой концепции до ввода в эксплуатацию.",
      lv: "Pilns process no gaismas koncepcijas līdz nodošanai ekspluatācijā.",
      el: "Πλήρης διαδικασία από τη μελέτη φωτισμού έως την παράδοση.",
    },
    body: {
      en: [
        "A strong lighting project starts with zoning, ceiling constraints and power requirements, not with fixture selection alone.",
        "Specification should balance beam angles, color rendering, driver placement and maintenance access.",
        "Installation in Latvia and Cyprus is faster and cleaner when the lighting contractor is involved before finishing works begin.",
      ],
      ru: [
        "Сильный световой проект начинается с зонирования, потолочных ограничений и расчёта питания, а не только с выбора светильников.",
        "Спецификация должна учитывать углы рассеивания, цветопередачу, размещение драйверов и удобство обслуживания.",
        "Монтаж в Латвии и на Кипре проходит быстрее и чище, если подрядчик по освещению подключается до начала чистовой отделки.",
      ],
      lv: [
        "Labs apgaismojuma projekts sākas ar zonējumu, griestu ierobežojumiem un jaudas prasībām, nevis tikai ar gaismekļu izvēli.",
        "Specifikācijā jālīdzsvaro staru leņķi, krāsu atveide, draiveru izvietojums un piekļuve apkopei.",
        "Montāža Latvijā un Kiprā ir ātrāka un tīrāka, ja apgaismojuma speciālists iesaistās pirms apdares darbu sākuma.",
      ],
      el: [
        "Ένα ισχυρό έργο φωτισμού ξεκινά από τη ζωνοποίηση, τους περιορισμούς οροφής και τις απαιτήσεις ισχύος, όχι μόνο από την επιλογή φωτιστικών.",
        "Οι προδιαγραφές πρέπει να ισορροπούν γωνίες δέσμης, απόδοση χρώματος, θέση drivers και πρόσβαση συντήρησης.",
        "Η εγκατάσταση σε Λετονία και Κύπρο γίνεται ταχύτερα όταν ο συνεργάτης φωτισμού εμπλέκεται πριν αρχίσουν τα τελειώματα.",
      ],
    },
  },
];

export function getBlogArticleBySlug(locale: Locale, slug: string) {
  return blogArticles.find((article) => article.slug[locale] === slug) || null;
}
