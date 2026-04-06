import type { Locale } from "@/i18n/config";

type LocaleRecord<T> = Record<Locale, T>;

export type SeoLanding = {
  slug: string;
  title: LocaleRecord<string>;
  description: LocaleRecord<string>;
  intro: LocaleRecord<string>;
  body: LocaleRecord<string[]>;
  faq: LocaleRecord<Array<{ question: string; answer: string }>>;
  keywords: string[];
};

export const serviceLandings: Record<string, SeoLanding> = {
  "lighting-installation": {
    slug: "lighting-installation",
    title: {
      en: "Lighting Installation in Riga, Latvia and Cyprus",
      ru: "Монтаж освещения в Риге, Латвии и на Кипре",
      lv: "Apgaismojuma montāža Rīgā, Latvijā un Kiprā",
      el: "Lighting Installation in Riga, Latvia and Cyprus",
    },
    description: {
      en: "Professional lighting installation for residential, retail and commercial projects. MDB Light serves Riga, Latvia and Cyprus.",
      ru: "Профессиональный монтаж освещения для квартир, магазинов и коммерческих объектов. MDB Light работает в Риге, Латвии и на Кипре.",
      lv: "Profesionāla apgaismojuma montāža dzīvokļiem, veikaliem un komerctelpām. MDB Light strādā Rīgā, Latvijā un Kiprā.",
      el: "Professional lighting installation for residential, retail and commercial projects in Riga, Latvia and Cyprus.",
    },
    intro: {
      en: "MDB Light handles lighting installation for LED fixtures, magnetic track systems, linear lighting and turnkey project delivery.",
      ru: "MDB Light выполняет монтаж LED светильников, магнитных трековых систем, линейного света и проекты под ключ.",
      lv: "MDB Light veic LED gaismekļu, magnētisko sliežu sistēmu, lineārā apgaismojuma un pilna cikla projektu montāžu.",
      el: "MDB Light delivers installation for LED fixtures, magnetic track systems, linear lighting and turnkey projects.",
    },
    body: {
      en: [
        "A strong installation process starts before the ceiling is closed. We coordinate fixture positions, driver access, power planning and service zones to avoid expensive corrections later.",
        "For retail and showroom spaces in Riga, magnetic track systems and adjustable spotlights allow the lighting concept to evolve with merchandising and display changes.",
        "For projects in Cyprus, we focus on durable LED solutions, driver management and practical maintenance access in warm climate conditions.",
      ],
      ru: [
        "Качественный монтаж начинается ещё до закрытия потолков. Мы согласовываем точки светильников, доступ к драйверам, питание и сервисные зоны, чтобы избежать дорогих переделок.",
        "Для магазинов и шоурумов в Риге магнитные трековые системы и поворотные светильники позволяют адаптировать свет под изменение выкладки.",
        "Для проектов на Кипре мы закладываем надёжные LED-решения, грамотное размещение драйверов и удобный доступ для обслуживания.",
      ],
      lv: [
        "Kvalitatīva montāža sākas vēl pirms griestu aizvēršanas. Mēs saskaņojam gaismekļu vietas, draiveru piekļuvi, barošanu un servisa zonas, lai izvairītos no dārgām korekcijām vēlāk.",
        "Veikaliem un showroom telpām Rīgā magnētiskās sliežu sistēmas un regulējami prožektori ļauj pielāgot apgaismojumu mainīgai ekspozīcijai.",
        "Projektiem Kiprā mēs izvēlamies uzticamus LED risinājumus, sakārtotu draiveru izvietojumu un ērtu piekļuvi apkopei siltā klimatā.",
      ],
      el: [
        "A reliable installation starts before ceilings are finished. We coordinate luminaire positions, driver access, power planning and maintenance zones to avoid costly changes later.",
        "For retail projects in Riga, magnetic track systems and adjustable spotlights make it easier to adapt lighting when merchandising changes.",
        "For Cyprus projects, we prioritize durable LED systems, clean driver management and maintenance-friendly layouts in warm climate conditions.",
      ],
    },
    faq: {
      en: [
        { question: "Do you install lighting only in Riga?", answer: "No. We work in Riga, across Latvia and also support installation projects in Cyprus." },
        { question: "Do you install track systems?", answer: "Yes. MDB Light installs magnetic and standard track lighting systems for apartments, retail and commercial spaces." },
      ],
      ru: [
        { question: "Вы работаете только в Риге?", answer: "Нет. Мы выполняем монтаж в Риге, по всей Латвии и сопровождаем проекты на Кипре." },
        { question: "Вы монтируете трековые системы?", answer: "Да. MDB Light устанавливает магнитные и стандартные трековые системы для квартир, магазинов и коммерческих помещений." },
      ],
      lv: [
        { question: "Vai jūs strādājat tikai Rīgā?", answer: "Nē. Mēs veicam montāžu Rīgā, visā Latvijā un atbalstām projektus arī Kiprā." },
        { question: "Vai jūs montējat sliežu sistēmas?", answer: "Jā. MDB Light uzstāda magnētiskās un standarta sliežu sistēmas dzīvokļiem, veikaliem un komerctelpām." },
      ],
      el: [
        { question: "Do you work only in Riga?", answer: "No. We work in Riga, throughout Latvia and also support installation projects in Cyprus." },
        { question: "Do you install track systems?", answer: "Yes. MDB Light installs magnetic and standard track systems for apartments, retail and commercial spaces." },
      ],
    },
    keywords: ["lighting installation", "installation Riga", "installation Latvia", "installation Cyprus"],
  },
  "track-lighting": {
    slug: "track-lighting",
    title: {
      en: "Track Lighting Systems for Riga, Latvia and Cyprus",
      ru: "Трековое освещение для Риги, Латвии и Кипра",
      lv: "Sliežu apgaismojums Rīgai, Latvijai un Kiprai",
      el: "Track Lighting for Riga, Latvia and Cyprus",
    },
    description: {
      en: "Magnetic and standard track lighting systems for homes, showrooms and retail spaces. MDB Light supplies and installs in Riga, Latvia and Cyprus.",
      ru: "Магнитные и стандартные трековые системы для квартир, шоурумов и магазинов. MDB Light поставляет и монтирует в Риге, Латвии и на Кипре.",
      lv: "Magnētiskās un standarta sliežu sistēmas mājām, showroom un veikaliem. MDB Light piegādā un montē Rīgā, Latvijā un Kiprā.",
      el: "Magnetic and standard track lighting systems for homes, showrooms and retail spaces in Riga, Latvia and Cyprus.",
    },
    intro: {
      en: "Track lighting remains one of the strongest SEO and commercial categories for MDB Light because it matches residential, retail and hospitality use cases.",
      ru: "Трековое освещение остаётся одной из ключевых категорий MDB Light, потому что подходит для жилых, коммерческих и hospitality-проектов.",
      lv: "Sliežu apgaismojums ir viena no galvenajām MDB Light kategorijām, jo tas der dzīvojamiem, komerciāliem un hospitality projektiem.",
      el: "Track lighting is one of the strongest MDB Light categories for residential, retail and hospitality projects.",
    },
    body: {
      en: [
        "Track systems work especially well when ceiling geometry is complex or when the light layout needs flexibility after installation.",
        "For Riga apartments, compact magnetic tracks create clean ceilings with fewer visible fixtures and better control over accent lighting.",
        "For retail projects in Latvia and Cyprus, track lighting improves adaptation speed when collections, displays or walking paths change.",
      ],
      ru: [
        "Трековые системы особенно эффективны там, где сложная геометрия потолка или нужен гибкий сценарий света уже после монтажа.",
        "Для квартир в Риге компактные магнитные треки дают чистый потолок, меньше визуального шума и лучший контроль акцентного света.",
        "Для магазинов в Латвии и на Кипре трековое освещение помогает быстро перестраивать свет под новые коллекции, витрины и маршруты клиентов.",
      ],
      lv: [
        "Sliežu sistēmas īpaši labi strādā tur, kur griestu ģeometrija ir sarežģīta vai gaismas scenārijam jāpaliek elastīgam arī pēc montāžas.",
        "Rīgas dzīvokļos kompaktās magnētiskās sliedes nodrošina tīrākus griestus, mazāk vizuālā trokšņa un labāku akcenta apgaismojuma kontroli.",
        "Veikaliem Latvijā un Kiprā sliežu apgaismojums palīdz ātri pielāgot gaismu jaunām kolekcijām, vitrīnām un kustības plūsmai.",
      ],
      el: [
        "Track systems are ideal when ceiling geometry is complex or when lighting needs to stay flexible after installation.",
        "For Riga apartments, compact magnetic tracks create cleaner ceilings and better control over accent lighting.",
        "For retail projects in Latvia and Cyprus, track lighting adapts quickly to changing displays, collections and visitor paths.",
      ],
    },
    faq: {
      en: [
        { question: "What is the difference between magnetic and standard track lighting?", answer: "Magnetic systems are cleaner visually and easier to reconfigure, while standard track systems are cost-effective and widely compatible." },
        { question: "Can track lighting be installed in apartments?", answer: "Yes. It is widely used in apartments in Riga for kitchens, living areas, wardrobes and corridor lighting." },
      ],
      ru: [
        { question: "Чем магнитные треки отличаются от стандартных?", answer: "Магнитные системы выглядят чище и проще в перенастройке, а стандартные треки выгоднее по бюджету и имеют широкую совместимость." },
        { question: "Можно ли ставить трековое освещение в квартире?", answer: "Да. В Риге такие системы часто используют в кухнях, гостиных, гардеробах и коридорах." },
      ],
      lv: [
        { question: "Kāda ir atšķirība starp magnētiskajām un standarta sliedēm?", answer: "Magnētiskās sistēmas ir vizuāli tīrākas un vieglāk pārkonfigurējamas, bet standarta sliedes ir ekonomiskākas un plaši saderīgas." },
        { question: "Vai sliežu apgaismojumu var uzstādīt dzīvoklī?", answer: "Jā. Rīgā tās bieži izmanto virtuvēs, dzīvojamās zonās, garderobēs un gaiteņos." },
      ],
      el: [
        { question: "What is the difference between magnetic and standard track lighting?", answer: "Magnetic systems are visually cleaner and easier to reconfigure, while standard tracks are often more budget-friendly." },
        { question: "Can track lighting be used in apartments?", answer: "Yes. It is a strong option for kitchens, living rooms, wardrobes and corridors in Riga apartments." },
      ],
    },
    keywords: ["track lighting", "magnetic track systems", "track lights Riga", "LED lighting Latvia"],
  },
};

export const locationLandings: Record<string, SeoLanding> = {
  riga: {
    slug: "riga",
    title: {
      en: "Lighting in Riga: LED Fixtures, Track Systems and Installation",
      ru: "Освещение в Риге: LED светильники, треки и монтаж",
      lv: "Apgaismojums Rīgā: LED gaismekļi, sliedes un montāža",
      el: "Lighting in Riga: LED Fixtures, Track Systems and Installation",
    },
    description: {
      en: "MDB Light provides lighting in Riga for apartments, retail, showrooms and commercial spaces with supply and installation support.",
      ru: "MDB Light предлагает освещение в Риге для квартир, магазинов, шоурумов и коммерческих объектов с поставкой и монтажом.",
      lv: "MDB Light nodrošina apgaismojumu Rīgā dzīvokļiem, veikaliem, showroom un komerctelpām ar piegādi un montāžu.",
      el: "MDB Light provides lighting in Riga for apartments, retail and commercial spaces with supply and installation.",
    },
    intro: {
      en: "This landing targets the core commercial query group around lighting Riga, track lighting Riga and LED lighting in Riga.",
      ru: "Эта страница ориентирована на основные коммерческие запросы: освещение Рига, трековое освещение Рига и LED lighting in Riga.",
      lv: "Šī lapa mērķē uz galvenajiem komerciālajiem meklējumiem: apgaismojums Rīgā, sliežu apgaismojums Rīgā un LED lighting in Riga.",
      el: "This page targets the main commercial searches around lighting Riga, track lighting Riga and LED lighting in Riga.",
    },
    body: {
      en: [
        "Riga projects typically demand a balance between aesthetics, installation speed and long-term maintainability.",
        "MDB Light supplies LED panels, decorative fixtures, magnetic tracks and configurable spotlight systems for both apartments and commercial interiors.",
        "When needed, we also support lighting installation, specification and product selection for turnkey projects in Riga.",
      ],
      ru: [
        "Проекты в Риге обычно требуют баланса между эстетикой, скоростью монтажа и удобством дальнейшего обслуживания.",
        "MDB Light поставляет LED панели, декоративные светильники, магнитные треки и настраиваемые споты для квартир и коммерческих интерьеров.",
        "При необходимости мы также сопровождаем проектирование, подбор и монтаж освещения под ключ в Риге.",
      ],
      lv: [
        "Rīgas projekti parasti prasa līdzsvaru starp estētiku, montāžas ātrumu un ilgtermiņa uzturēšanu.",
        "MDB Light piegādā LED paneļus, dekoratīvos gaismekļus, magnētiskās sliedes un regulējamu prožektoru sistēmas dzīvokļiem un komerctelpām.",
        "Ja nepieciešams, mēs nodrošinām arī projektēšanu, atlasi un apgaismojuma montāžu Rīgā pilna cikla projektos.",
      ],
      el: [
        "Riga projects usually require a balance between aesthetics, installation speed and maintenance access.",
        "MDB Light supplies LED panels, decorative fixtures, magnetic tracks and adjustable spotlight systems for apartments and commercial interiors.",
        "We also support product selection, specification and installation for turnkey lighting projects in Riga.",
      ],
    },
    faq: {
      en: [
        { question: "Do you work with apartments in Riga?", answer: "Yes. MDB Light works with apartment lighting, renovations, new-builds and custom private interiors in Riga." },
        { question: "Do you provide both products and installation?", answer: "Yes. Depending on the project, we can supply products only or handle a broader lighting installation scope." },
      ],
      ru: [
        { question: "Вы работаете с квартирами в Риге?", answer: "Да. MDB Light занимается освещением квартир, ремонтов, новостроек и частных интерьеров в Риге." },
        { question: "Вы даёте и товар, и монтаж?", answer: "Да. В зависимости от проекта мы можем ограничиться поставкой либо взять более широкий объём по монтажу освещения." },
      ],
      lv: [
        { question: "Vai jūs strādājat ar dzīvokļiem Rīgā?", answer: "Jā. MDB Light strādā ar dzīvokļu apgaismojumu, renovācijām, jaunbūvēm un privātiem interjeriem Rīgā." },
        { question: "Vai jūs nodrošināt gan produktus, gan montāžu?", answer: "Jā. Atkarībā no projekta mēs varam piegādāt produktus vai pārvaldīt arī plašāku montāžas apjomu." },
      ],
      el: [
        { question: "Do you work with apartments in Riga?", answer: "Yes. MDB Light supports apartment lighting, renovations, new-builds and private interiors in Riga." },
        { question: "Do you provide both products and installation?", answer: "Yes. Depending on scope, we can supply products only or support the full installation package." },
      ],
    },
    keywords: ["lighting Riga", "track lighting Riga", "LED lighting Riga"],
  },
  latvia: {
    slug: "latvia",
    title: {
      en: "LED Lighting Latvia: Supply and Installation by MDB Light",
      ru: "LED lighting Latvia: поставка и монтаж от MDB Light",
      lv: "LED lighting Latvia: piegāde un montāža no MDB Light",
      el: "LED Lighting Latvia: Supply and Installation by MDB Light",
    },
    description: {
      en: "LED lighting across Latvia for residential, retail and commercial projects. MDB Light covers specification, product supply and installation.",
      ru: "LED освещение по всей Латвии для жилых, торговых и коммерческих проектов. MDB Light ведёт подбор, поставку и монтаж.",
      lv: "LED apgaismojums visā Latvijā dzīvojamiem, tirdzniecības un komerciāliem projektiem. MDB Light nodrošina atlasi, piegādi un montāžu.",
      el: "LED lighting across Latvia for residential, retail and commercial projects.",
    },
    intro: {
      en: "This page expands SEO beyond Riga and supports broader intent around LED lighting Latvia and lighting design Latvia.",
      ru: "Эта страница расширяет SEO за пределы Риги и закрывает более широкий интент вокруг LED lighting Latvia и lighting design Latvia.",
      lv: "Šī lapa paplašina SEO ārpus Rīgas un aptver plašāku pieprasījumu kopu ap LED lighting Latvia un lighting design Latvia.",
      el: "This page expands SEO beyond Riga and targets broader intent around LED lighting Latvia and lighting design Latvia.",
    },
    body: {
      en: [
        "Projects across Latvia often combine product supply with specification support, especially when contractors need exact fixture references and mounting details.",
        "MDB Light helps with LED panels, track systems, architectural lighting, decorative lighting and lighting installation support.",
        "The strongest results come from combining the right fixture category with realistic installation planning and maintenance access.",
      ],
      ru: [
        "Проекты по Латвии часто требуют не только поставки, но и спецификации, когда подрядчику нужны точные артикулы, узлы монтажа и понимание сервиса.",
        "MDB Light помогает с LED панелями, трековыми системами, архитектурным и декоративным светом, а также с сопровождением монтажа.",
        "Лучший результат даёт связка правильной категории светильников, реалистичного плана монтажа и доступа для обслуживания.",
      ],
      lv: [
        "Projektos visā Latvijā bieži nepieciešama ne tikai piegāde, bet arī specifikācija ar precīzām pozīcijām, montāžas detaļām un apkalpošanas pieeju.",
        "MDB Light palīdz ar LED paneļiem, sliežu sistēmām, arhitektūras un dekoratīvo apgaismojumu, kā arī montāžas atbalstu.",
        "Labākais rezultāts rodas, apvienojot pareizo gaismekļu kategoriju ar reālistisku montāžas plānu un uzturēšanas piekļuvi.",
      ],
      el: [
        "Projects across Latvia often require both product supply and specification support, especially when contractors need exact fixture references and mounting details.",
        "MDB Light supports LED panels, track systems, architectural lighting, decorative lighting and installation planning.",
        "The best results come from combining the right fixture category with realistic installation planning and maintenance access.",
      ],
    },
    faq: {
      en: [
        { question: "Do you work outside Riga?", answer: "Yes. MDB Light supports projects across Latvia depending on scope, product category and installation requirements." },
        { question: "Can you help with lighting design Latvia projects?", answer: "Yes. We can support concept selection, category planning, specification and installation-oriented product choices." },
      ],
      ru: [
        { question: "Вы работаете за пределами Риги?", answer: "Да. MDB Light сопровождает проекты по всей Латвии в зависимости от масштаба, категории товара и требований по монтажу." },
        { question: "Вы можете помочь с lighting design Latvia проектами?", answer: "Да. Мы можем помочь с концепцией, подбором категорий, спецификацией и выбором оборудования под монтаж." },
      ],
      lv: [
        { question: "Vai jūs strādājat ārpus Rīgas?", answer: "Jā. MDB Light atbalsta projektus visā Latvijā atkarībā no mēroga, produktu kategorijas un montāžas prasībām." },
        { question: "Vai jūs palīdzat ar lighting design Latvia projektiem?", answer: "Jā. Mēs palīdzam ar koncepciju, kategoriju izvēli, specifikāciju un montāžai piemērotu risinājumu atlasi." },
      ],
      el: [
        { question: "Do you work outside Riga?", answer: "Yes. MDB Light supports projects across Latvia depending on scope and installation requirements." },
        { question: "Can you help with lighting design Latvia projects?", answer: "Yes. We support concept selection, specification and installation-oriented product choices." },
      ],
    },
    keywords: ["LED lighting Latvia", "lighting design Latvia", "lighting Latvia"],
  },
  cyprus: {
    slug: "cyprus",
    title: {
      en: "Lighting Cyprus: LED Supply and Installation Support",
      ru: "Lighting Cyprus: LED поставка и монтаж",
      lv: "Lighting Cyprus: LED piegāde un montāžas atbalsts",
      el: "Lighting Cyprus: LED Supply and Installation Support",
    },
    description: {
      en: "Lighting Cyprus solutions from MDB Light: LED fixtures, track systems and installation support for commercial and residential projects.",
      ru: "Lighting Cyprus решения от MDB Light: LED светильники, трековые системы и монтаж для коммерческих и жилых проектов.",
      lv: "Lighting Cyprus risinājumi no MDB Light: LED gaismekļi, sliežu sistēmas un montāžas atbalsts komerciāliem un dzīvojamiem projektiem.",
      el: "Lighting Cyprus solutions from MDB Light with LED fixtures, track systems and installation support.",
    },
    intro: {
      en: "This landing supports the commercial intent around lighting Cyprus and lighting installation Cyprus.",
      ru: "Эта страница закрывает коммерческий интент вокруг lighting Cyprus и lighting installation Cyprus.",
      lv: "Šī lapa aptver komerciālo pieprasījumu grupu ap lighting Cyprus un lighting installation Cyprus.",
      el: "This landing targets the commercial intent around lighting Cyprus and lighting installation Cyprus.",
    },
    body: {
      en: [
        "Cyprus projects often need practical LED solutions that can handle heat, maintenance requirements and efficient power planning.",
        "MDB Light supports product selection for apartments, villas, hospitality and retail spaces, with a focus on track systems and reliable LED categories.",
        "A strong Cyprus lighting package balances product quality, driver management and easy servicing after handover.",
      ],
      ru: [
        "Проекты на Кипре часто требуют практичных LED-решений, устойчивых к теплу, понятных в обслуживании и грамотно спланированных по питанию.",
        "MDB Light помогает с подбором света для квартир, вилл, hospitality и retail-объектов, особенно в категориях трековых систем и надёжного LED-освещения.",
        "Сильный lighting Cyprus пакет строится на балансе качества товара, управления драйверами и удобства сервиса после сдачи объекта.",
      ],
      lv: [
        "Kipras projektiem bieži nepieciešami praktiski LED risinājumi, kas iztur siltumu, ir ērti apkalpošanā un pareizi saplānoti pēc jaudas.",
        "MDB Light palīdz atlasīt apgaismojumu dzīvokļiem, villām, hospitality un retail objektiem, īpaši sliežu sistēmu un uzticamu LED kategorijās.",
        "Spēcīgs lighting Cyprus piedāvājums balstās uz produktu kvalitāti, draiveru pārvaldību un ērtu servisu pēc nodošanas ekspluatācijā.",
      ],
      el: [
        "Cyprus projects often need practical LED solutions that handle heat, maintenance access and efficient power planning.",
        "MDB Light supports apartments, villas, hospitality and retail spaces with track systems and reliable LED categories.",
        "A strong Cyprus lighting package balances product quality, driver management and easy servicing after handover.",
      ],
    },
    faq: {
      en: [
        { question: "Do you support lighting installation Cyprus projects?", answer: "Yes. MDB Light supports supply and installation-oriented lighting projects in Cyprus depending on scope." },
        { question: "Which products are best for Cyprus?", answer: "It depends on the project, but durable LED fixtures, track systems and service-friendly layouts are usually the best starting point." },
      ],
      ru: [
        { question: "Вы сопровождаете lighting installation Cyprus проекты?", answer: "Да. MDB Light поддерживает проекты на Кипре с поставкой и ориентацией на монтаж в зависимости от масштаба." },
        { question: "Какие товары лучше подходят для Кипра?", answer: "Это зависит от объекта, но обычно лучше всего работают надёжные LED светильники, трековые системы и удобные для сервиса решения." },
      ],
      lv: [
        { question: "Vai jūs atbalstāt lighting installation Cyprus projektus?", answer: "Jā. MDB Light atbalsta projektus Kiprā ar piegādi un montāžas fokusu atkarībā no apjoma." },
        { question: "Kuri produkti vislabāk der Kiprai?", answer: "Tas atkarīgs no objekta, taču parasti labākais sākums ir uzticami LED gaismekļi, sliežu sistēmas un servisam ērti risinājumi." },
      ],
      el: [
        { question: "Do you support lighting installation Cyprus projects?", answer: "Yes. MDB Light supports supply and installation-oriented lighting projects in Cyprus depending on scope." },
        { question: "Which products are best for Cyprus?", answer: "Durable LED fixtures, track systems and service-friendly layouts are usually the right starting point." },
      ],
    },
    keywords: ["lighting Cyprus", "lighting installation Cyprus", "LED Cyprus"],
  },
};

export function getServiceLanding(slug: string) {
  return serviceLandings[slug] ?? null;
}

export function getLocationLanding(slug: string) {
  return locationLandings[slug] ?? null;
}
