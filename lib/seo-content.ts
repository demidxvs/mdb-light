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
      el: "Εγκατάσταση φωτισμού στη Ρίγα, στη Λετονία και στην Κύπρο",
    },
    description: {
      en: "Professional lighting installation for residential, retail and commercial projects. MDB Light serves Riga, Latvia and Cyprus.",
      ru: "Профессиональный монтаж освещения для квартир, магазинов и коммерческих объектов. MDB Light работает в Риге, Латвии и на Кипре.",
      lv: "Profesionāla apgaismojuma montāža dzīvokļiem, veikaliem un komerctelpām. MDB Light strādā Rīgā, Latvijā un Kiprā.",
      el: "Επαγγελματική εγκατάσταση φωτισμού για οικιστικά, retail και εμπορικά έργα στη Ρίγα, στη Λετονία και στην Κύπρο.",
    },
    intro: {
      en: "MDB Light handles lighting installation for LED fixtures, magnetic track systems, linear lighting and turnkey project delivery.",
      ru: "MDB Light выполняет монтаж LED светильников, магнитных трековых систем, линейного света и проекты под ключ.",
      lv: "MDB Light veic LED gaismekļu, magnētisko sliežu sistēmu, lineārā apgaismojuma un pilna cikla projektu montāžu.",
      el: "Το MDB Light αναλαμβάνει εγκατάσταση για LED φωτιστικά, μαγνητικά συστήματα ράγας, γραμμικό φωτισμό και έργα turnkey.",
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
        "Μια αξιόπιστη εγκατάσταση ξεκινά πριν ολοκληρωθούν οι οροφές. Συντονίζουμε θέσεις φωτιστικών, πρόσβαση σε drivers, σχεδιασμό τροφοδοσίας και ζώνες συντήρησης ώστε να αποφευχθούν ακριβές αλλαγές αργότερα.",
        "Για retail έργα στη Ρίγα, τα μαγνητικά συστήματα ράγας και τα ρυθμιζόμενα spot κάνουν πιο εύκολη την προσαρμογή του φωτισμού όταν αλλάζει το merchandising.",
        "Για έργα στην Κύπρο, δίνουμε προτεραιότητα σε ανθεκτικά LED συστήματα, σωστή διαχείριση drivers και διατάξεις που διευκολύνουν τη συντήρηση σε θερμές κλιματικές συνθήκες.",
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
        { question: "Δουλεύετε μόνο στη Ρίγα;", answer: "Όχι. Εργαζόμαστε στη Ρίγα, σε όλη τη Λετονία και υποστηρίζουμε επίσης έργα εγκατάστασης στην Κύπρο." },
        { question: "Εγκαθιστάτε συστήματα ράγας;", answer: "Ναι. Το MDB Light εγκαθιστά μαγνητικά και standard συστήματα ράγας για διαμερίσματα, retail και εμπορικούς χώρους." },
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
      el: "Φωτισμός ράγας για τη Ρίγα, τη Λετονία και την Κύπρο",
    },
    description: {
      en: "Magnetic and standard track lighting systems for homes, showrooms and retail spaces. MDB Light supplies and installs in Riga, Latvia and Cyprus.",
      ru: "Магнитные и стандартные трековые системы для квартир, шоурумов и магазинов. MDB Light поставляет и монтирует в Риге, Латвии и на Кипре.",
      lv: "Magnētiskās un standarta sliežu sistēmas mājām, showroom un veikaliem. MDB Light piegādā un montē Rīgā, Latvijā un Kiprā.",
      el: "Μαγνητικά και standard συστήματα φωτισμού ράγας για σπίτια, showrooms και retail χώρους στη Ρίγα, στη Λετονία και στην Κύπρο.",
    },
    intro: {
      en: "Track lighting remains one of the strongest SEO and commercial categories for MDB Light because it matches residential, retail and hospitality use cases.",
      ru: "Трековое освещение остаётся одной из ключевых категорий MDB Light, потому что подходит для жилых, коммерческих и hospitality-проектов.",
      lv: "Sliežu apgaismojums ir viena no galvenajām MDB Light kategorijām, jo tas der dzīvojamiem, komerciāliem un hospitality projektiem.",
      el: "Ο φωτισμός ράγας είναι μία από τις βασικές κατηγορίες του MDB Light για οικιστικά, retail και hospitality έργα.",
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
        "Τα συστήματα ράγας είναι ιδανικά όταν η γεωμετρία της οροφής είναι σύνθετη ή όταν ο φωτισμός πρέπει να παραμείνει ευέλικτος μετά την εγκατάσταση.",
        "Για διαμερίσματα στη Ρίγα, οι compact μαγνητικές ράγες δημιουργούν καθαρότερες οροφές και καλύτερο έλεγχο στον accent φωτισμό.",
        "Για retail έργα στη Λετονία και στην Κύπρο, ο φωτισμός ράγας προσαρμόζεται γρήγορα σε αλλαγές βιτρίνας, συλλογών και διαδρομών επισκεπτών.",
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
        { question: "Ποια είναι η διαφορά ανάμεσα σε μαγνητικό και standard φωτισμό ράγας;", answer: "Τα μαγνητικά συστήματα είναι πιο καθαρά οπτικά και πιο εύκολα στην αναδιαμόρφωση, ενώ οι standard ράγες είναι συνήθως πιο οικονομικές." },
        { question: "Μπορεί ο φωτισμός ράγας να χρησιμοποιηθεί σε διαμερίσματα;", answer: "Ναι. Είναι εξαιρετική λύση για κουζίνες, σαλόνια, ντουλάπες και διαδρόμους σε διαμερίσματα της Ρίγας." },
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
      el: "Φωτισμός στη Ρίγα: LED φωτιστικά, συστήματα ράγας και εγκατάσταση",
    },
    description: {
      en: "MDB Light provides lighting in Riga for apartments, retail, showrooms and commercial spaces with supply and installation support.",
      ru: "MDB Light предлагает освещение в Риге для квартир, магазинов, шоурумов и коммерческих объектов с поставкой и монтажом.",
      lv: "MDB Light nodrošina apgaismojumu Rīgā dzīvokļiem, veikaliem, showroom un komerctelpām ar piegādi un montāžu.",
      el: "Το MDB Light προσφέρει φωτισμό στη Ρίγα για διαμερίσματα, retail και εμπορικούς χώρους με προμήθεια και εγκατάσταση.",
    },
    intro: {
      en: "This landing targets the core commercial query group around lighting Riga, track lighting Riga and LED lighting in Riga.",
      ru: "Эта страница ориентирована на основные коммерческие запросы: освещение Рига, трековое освещение Рига и LED lighting in Riga.",
      lv: "Šī lapa mērķē uz galvenajiem komerciālajiem meklējumiem: apgaismojums Rīgā, sliežu apgaismojums Rīgā un LED lighting in Riga.",
      el: "Αυτή η σελίδα στοχεύει στα βασικά εμπορικά searches γύρω από lighting Riga, track lighting Riga και LED lighting in Riga.",
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
        "Τα έργα στη Ρίγα συνήθως απαιτούν ισορροπία ανάμεσα στην αισθητική, την ταχύτητα εγκατάστασης και την εύκολη συντήρηση.",
        "Το MDB Light προμηθεύει LED panels, διακοσμητικά φωτιστικά, μαγνητικές ράγες και ρυθμιζόμενα spot systems για διαμερίσματα και εμπορικούς εσωτερικούς χώρους.",
        "Υποστηρίζουμε επίσης επιλογή προϊόντων, specification και εγκατάσταση για turnkey έργα φωτισμού στη Ρίγα.",
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
        { question: "Δουλεύετε με διαμερίσματα στη Ρίγα;", answer: "Ναι. Το MDB Light υποστηρίζει φωτισμό διαμερισμάτων, ανακαινίσεις, νέες κατασκευές και ιδιωτικά εσωτερικά έργα στη Ρίγα." },
        { question: "Παρέχετε και προϊόντα και εγκατάσταση;", answer: "Ναι. Ανάλογα με το scope, μπορούμε να προμηθεύσουμε μόνο προϊόντα ή να υποστηρίξουμε ολόκληρο το πακέτο εγκατάστασης." },
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
      el: "LED φωτισμός στη Λετονία: προμήθεια και εγκατάσταση από το MDB Light",
    },
    description: {
      en: "LED lighting across Latvia for residential, retail and commercial projects. MDB Light covers specification, product supply and installation.",
      ru: "LED освещение по всей Латвии для жилых, торговых и коммерческих проектов. MDB Light ведёт подбор, поставку и монтаж.",
      lv: "LED apgaismojums visā Latvijā dzīvojamiem, tirdzniecības un komerciāliem projektiem. MDB Light nodrošina atlasi, piegādi un montāžu.",
      el: "LED φωτισμός σε όλη τη Λετονία για οικιστικά, retail και εμπορικά έργα.",
    },
    intro: {
      en: "This page expands SEO beyond Riga and supports broader intent around LED lighting Latvia and lighting design Latvia.",
      ru: "Эта страница расширяет SEO за пределы Риги и закрывает более широкий интент вокруг LED lighting Latvia и lighting design Latvia.",
      lv: "Šī lapa paplašina SEO ārpus Rīgas un aptver plašāku pieprasījumu kopu ap LED lighting Latvia un lighting design Latvia.",
      el: "Αυτή η σελίδα επεκτείνει το SEO πέρα από τη Ρίγα και στοχεύει σε ευρύτερο intent γύρω από LED lighting Latvia και lighting design Latvia.",
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
        "Τα έργα σε όλη τη Λετονία συχνά απαιτούν τόσο προμήθεια προϊόντων όσο και υποστήριξη specification, ειδικά όταν οι contractors χρειάζονται ακριβείς αναφορές φωτιστικών και λεπτομέρειες τοποθέτησης.",
        "Το MDB Light υποστηρίζει LED panels, συστήματα ράγας, αρχιτεκτονικό φωτισμό, διακοσμητικό φωτισμό και planning εγκατάστασης.",
        "Τα καλύτερα αποτελέσματα προκύπτουν από τον συνδυασμό της σωστής κατηγορίας φωτιστικών με ρεαλιστικό σχεδιασμό εγκατάστασης και εύκολη πρόσβαση συντήρησης.",
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
        { question: "Δουλεύετε εκτός Ρίγας;", answer: "Ναι. Το MDB Light υποστηρίζει έργα σε όλη τη Λετονία ανάλογα με το scope και τις απαιτήσεις εγκατάστασης." },
        { question: "Μπορείτε να βοηθήσετε με έργα lighting design Latvia;", answer: "Ναι. Υποστηρίζουμε επιλογή concept, specification και επιλογές προϊόντων με προσανατολισμό στην εγκατάσταση." },
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
      el: "Φωτισμός στην Κύπρο: υποστήριξη προμήθειας LED και εγκατάστασης",
    },
    description: {
      en: "Lighting Cyprus solutions from MDB Light: LED fixtures, track systems and installation support for commercial and residential projects.",
      ru: "Lighting Cyprus решения от MDB Light: LED светильники, трековые системы и монтаж для коммерческих и жилых проектов.",
      lv: "Lighting Cyprus risinājumi no MDB Light: LED gaismekļi, sliežu sistēmas un montāžas atbalsts komerciāliem un dzīvojamiem projektiem.",
      el: "Λύσεις φωτισμού στην Κύπρο από το MDB Light με LED φωτιστικά, συστήματα ράγας και υποστήριξη εγκατάστασης.",
    },
    intro: {
      en: "This landing supports the commercial intent around lighting Cyprus and lighting installation Cyprus.",
      ru: "Эта страница закрывает коммерческий интент вокруг lighting Cyprus и lighting installation Cyprus.",
      lv: "Šī lapa aptver komerciālo pieprasījumu grupu ap lighting Cyprus un lighting installation Cyprus.",
      el: "Αυτό το landing page στοχεύει το εμπορικό intent γύρω από lighting Cyprus και lighting installation Cyprus.",
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
        "Τα έργα στην Κύπρο συχνά χρειάζονται πρακτικές LED λύσεις που αντέχουν στη ζέστη, προσφέρουν εύκολη πρόσβαση συντήρησης και σωστό σχεδιασμό τροφοδοσίας.",
        "Το MDB Light υποστηρίζει διαμερίσματα, βίλες, hospitality και retail χώρους με συστήματα ράγας και αξιόπιστες LED κατηγορίες.",
        "Ένα ισχυρό πακέτο φωτισμού για την Κύπρο ισορροπεί ανάμεσα στην ποιότητα προϊόντων, τη διαχείριση drivers και την εύκολη συντήρηση μετά την παράδοση.",
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
        { question: "Υποστηρίζετε έργα lighting installation Cyprus;", answer: "Ναι. Το MDB Light υποστηρίζει έργα φωτισμού στην Κύπρο με προμήθεια και προσανατολισμό στην εγκατάσταση ανάλογα με το scope." },
        { question: "Ποια προϊόντα είναι καλύτερα για την Κύπρο;", answer: "Ανθεκτικά LED φωτιστικά, συστήματα ράγας και layouts φιλικά στη συντήρηση είναι συνήθως το σωστό σημείο εκκίνησης." },
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
