import type { Locale } from "@/i18n/config";

export type LegalPageKey = "privacy" | "cookies" | "delivery" | "terms";

type LegalSection = {
  title: string;
  body: string[];
};

type LegalPageContent = {
  title: string;
  description: string;
  updatedLabel: string;
  updatedAt: string;
  sections: LegalSection[];
};

const companyInfo = {
  name: "MDB Group, SIA",
  city: "Riga, Latvia",
  email: "info@mdblight.com",
  phone: "+371 24443333",
};

export const legalPageLabels: Record<Locale, Record<LegalPageKey, string>> = {
  en: {
    privacy: "Privacy Policy",
    cookies: "Cookies Policy",
    delivery: "Delivery / Returns",
    terms: "Terms of Use",
  },
  ru: {
    privacy: "Политика конфиденциальности",
    cookies: "Политика cookies",
    delivery: "Доставка и возврат",
    terms: "Условия использования",
  },
  lv: {
    privacy: "Privatuma politika",
    cookies: "Sikdatnu politika",
    delivery: "Piegade / atgriesana",
    terms: "Lietošanas noteikumi",
  },
  el: {
    privacy: "Πολιτική Απορρήτου",
    cookies: "Πολιτική Cookies",
    delivery: "Παράδοση / Επιστροφές",
    terms: "Όροι Χρήσης",
  },
};

export const companyInfoLabels: Record<
  Locale,
  { email: string; phone: string; location: string }
> = {
  en: { email: "Email", phone: "Phone", location: "Location" },
  ru: { email: "Email", phone: "Телефон", location: "Локация" },
  lv: { email: "Email", phone: "Talrunis", location: "Atrašanas vieta" },
  el: { email: "Email", phone: "Τηλέφωνο", location: "Τοποθεσία" },
};

const content: Record<Locale, Record<LegalPageKey, LegalPageContent>> = {
  en: {
    privacy: {
      title: "Privacy Policy",
      description: "How MDB Light collects, stores and uses personal data in the EU.",
      updatedLabel: "Last updated",
      updatedAt: "April 2026",
      sections: [
        {
          title: "Who we are",
          body: [
            "MDB Group, SIA operates the MDB Light storefront for customers in Riga, Latvia, Cyprus and other supported markets.",
            `If you have privacy questions, contact us at ${companyInfo.email} or ${companyInfo.phone}.`,
          ],
        },
        {
          title: "What data we collect",
          body: [
            "We process account details, order data, billing and delivery information, and communications you send through forms or email.",
            "We also keep technical records required for security, fraud prevention and essential site functionality.",
          ],
        },
        {
          title: "Why we process your data",
          body: [
            "We use personal data to create accounts, confirm email ownership, process orders, arrange delivery, respond to support requests and comply with legal obligations.",
            "Where consent is required for analytics or marketing technologies, those tools remain disabled until you grant permission.",
          ],
        },
        {
          title: "Your rights",
          body: [
            "You may request access, correction, deletion, restriction, objection or export of your personal data in accordance with GDPR.",
            "Requests are reviewed case by case, and we may retain limited records where required for accounting, security or legal compliance.",
          ],
        },
      ],
    },
    cookies: {
      title: "Cookies Policy",
      description: "How MDB Light uses essential, analytics and marketing cookies.",
      updatedLabel: "Last updated",
      updatedAt: "April 2026",
      sections: [
        {
          title: "Essential cookies",
          body: [
            "Essential cookies keep the storefront secure and functional. They support authentication, locale preferences, cart state and consent storage.",
            "These cookies are always active because the site cannot operate correctly without them.",
          ],
        },
        {
          title: "Analytics cookies",
          body: [
            "Analytics cookies help us understand page usage, performance and product interest. They are disabled until you accept them.",
            "You can change your preference at any time from the cookie settings panel.",
          ],
        },
        {
          title: "Marketing cookies",
          body: [
            "Marketing cookies may be used for ad attribution, remarketing and campaign measurement if such tools are enabled in the future.",
            "They remain blocked until you explicitly opt in.",
          ],
        },
      ],
    },
    delivery: {
      title: "Delivery / Returns",
      description: "Delivery coverage, timelines, returns and refund conditions for MDB Light orders.",
      updatedLabel: "Last updated",
      updatedAt: "April 2026",
      sections: [
        {
          title: "Delivery",
          body: [
            "Delivery availability depends on stock, order volume, destination and product category. Project quotations may include separate lead times for supply and installation.",
            "We confirm estimated dispatch and delivery windows after order review or quotation approval.",
          ],
        },
        {
          title: "Returns",
          body: [
            "Customers should contact MDB Light before returning goods. Unused standard products may be eligible for return according to applicable consumer law and product condition.",
            "Custom-made, project-specific, installed or damaged goods may not be returnable unless required by law.",
          ],
        },
        {
          title: "Refunds",
          body: [
            "Approved refunds are processed to the original payment method after returned goods are inspected.",
            "Shipping, handling or installation costs may be non-refundable where permitted by law and clearly agreed in advance.",
          ],
        },
      ],
    },
    terms: {
      title: "Terms of Use",
      description: "Rules for using the MDB Light website, catalog and customer account features.",
      updatedLabel: "Last updated",
      updatedAt: "April 2026",
      sections: [
        {
          title: "Use of the site",
          body: [
            "You agree to use MDB Light only for lawful browsing, quotation requests, purchases and account management.",
            "You must not misuse the site, scrape restricted areas, interfere with security features or submit false information.",
          ],
        },
        {
          title: "Product information",
          body: [
            "We aim to keep pricing, availability and specifications current, but project pricing and installation terms may require separate confirmation.",
            "Images, descriptions and translations are provided for convenience and may be updated without notice.",
          ],
        },
        {
          title: "Accounts and communication",
          body: [
            "You are responsible for maintaining the confidentiality of your login credentials and for activity under your account.",
            "By registering, you agree to receive operational emails related to sign-in, password recovery, orders and account security.",
          ],
        },
      ],
    },
  },
  ru: {
    privacy: {
      title: "Политика конфиденциальности",
      description: "Как MDB Light собирает, хранит и использует персональные данные в ЕС.",
      updatedLabel: "Последнее обновление",
      updatedAt: "Апрель 2026",
      sections: [
        {
          title: "Кто мы",
          body: [
            "MDB Group, SIA управляет магазином MDB Light для клиентов в Риге, Латвии, на Кипре и в других поддерживаемых регионах.",
            `Если у вас есть вопросы по защите данных, свяжитесь с нами: ${companyInfo.email} или ${companyInfo.phone}.`,
          ],
        },
        {
          title: "Какие данные мы собираем",
          body: [
            "Мы обрабатываем данные аккаунта, информацию о заказах, платёжные и адресные данные, а также сообщения, отправленные через формы и email.",
            "Также сохраняются технические записи, необходимые для безопасности, предотвращения мошенничества и работы ключевых функций сайта.",
          ],
        },
        {
          title: "Зачем мы обрабатываем данные",
          body: [
            "Персональные данные используются для регистрации, подтверждения email, обработки заказов, организации доставки, ответа на обращения и выполнения требований закона.",
            "Если для аналитики или маркетинга требуется согласие, такие инструменты остаются отключенными до вашего выбора.",
          ],
        },
        {
          title: "Ваши права",
          body: [
            "Вы можете запросить доступ, исправление, удаление, ограничение обработки, возражение или экспорт своих данных в соответствии с GDPR.",
            "Часть записей может храниться дольше, если это требуется для бухгалтерии, безопасности или исполнения закона.",
          ],
        },
      ],
    },
    cookies: {
      title: "Политика cookies",
      description: "Как MDB Light использует обязательные, аналитические и маркетинговые cookies.",
      updatedLabel: "Последнее обновление",
      updatedAt: "Апрель 2026",
      sections: [
        {
          title: "Обязательные cookies",
          body: [
            "Обязательные cookies поддерживают безопасность и базовую работу магазина. Они нужны для авторизации, языка, корзины и хранения cookie-согласия.",
            "Эти cookies всегда активны, потому что без них сайт не сможет корректно работать.",
          ],
        },
        {
          title: "Аналитические cookies",
          body: [
            "Аналитические cookies помогают понять использование страниц, производительность и интерес к товарам. Они отключены до вашего согласия.",
            "Изменить выбор можно в любой момент в настройках cookies.",
          ],
        },
        {
          title: "Маркетинговые cookies",
          body: [
            "Маркетинговые cookies могут использоваться для атрибуции рекламы, ремаркетинга и оценки кампаний, если такие инструменты будут включены.",
            "До явного согласия они остаются заблокированы.",
          ],
        },
      ],
    },
    delivery: {
      title: "Доставка и возврат",
      description: "Условия доставки, возврата и возврата средств для заказов MDB Light.",
      updatedLabel: "Последнее обновление",
      updatedAt: "Апрель 2026",
      sections: [
        {
          title: "Доставка",
          body: [
            "Возможность и сроки доставки зависят от наличия товара, объёма заказа, региона и категории продукции. Для проектных поставок сроки могут подтверждаться отдельно.",
            "Ориентировочные сроки отгрузки и доставки подтверждаются после проверки заказа или согласования предложения.",
          ],
        },
        {
          title: "Возврат",
          body: [
            "Перед возвратом товара необходимо связаться с MDB Light. Неиспользованные стандартные товары могут подпадать под возврат в рамках закона о защите прав потребителей и состояния товара.",
            "Индивидуальные, проектные, смонтированные или повреждённые товары могут не подлежать возврату, если иное не требуется законом.",
          ],
        },
        {
          title: "Возврат средств",
          body: [
            "После одобрения и проверки возвращённого товара возврат средств производится на исходный способ оплаты.",
            "Стоимость доставки, обработки и монтажа может не возвращаться в пределах, допускаемых законом и заранее согласованных условий.",
          ],
        },
      ],
    },
    terms: {
      title: "Условия использования",
      description: "Правила использования сайта MDB Light, каталога и функций аккаунта.",
      updatedLabel: "Последнее обновление",
      updatedAt: "Апрель 2026",
      sections: [
        {
          title: "Использование сайта",
          body: [
            "Вы соглашаетесь использовать MDB Light только для законного просмотра каталога, запросов, заказов и управления своим аккаунтом.",
            "Запрещено злоупотреблять сайтом, обходить защиту, собирать данные из закрытых разделов или отправлять ложную информацию.",
          ],
        },
        {
          title: "Информация о товарах",
          body: [
            "Мы стараемся поддерживать актуальность цен, наличия и характеристик, однако для проектов цена и условия монтажа могут подтверждаться отдельно.",
            "Изображения, описания и переводы предоставляются для удобства и могут обновляться без предварительного уведомления.",
          ],
        },
        {
          title: "Аккаунты и коммуникация",
          body: [
            "Вы отвечаете за сохранность своих данных входа и действия, выполняемые через ваш аккаунт.",
            "Регистрируясь, вы соглашаетесь получать сервисные письма, связанные со входом, восстановлением пароля, заказами и безопасностью аккаунта.",
          ],
        },
      ],
    },
  },
  lv: {
    privacy: {
      title: "Privatuma politika",
      description: "Mes cienam jusu privatumu un apnemamies aizsargat jusu personas datus.",
      updatedLabel: "Pedejais atjauninajums",
      updatedAt: "06.04.2026",
      sections: [
        {
          title: "1. Kadu informaciju mes vacam",
          body: [
            "Mes varam vakt sadu informaciju:",
            "Vards, uzvards",
            "E-pasta adrese",
            "Telefona numurs",
            "Piegades adrese",
            "Pasutijumu informacija",
          ],
        },
        {
          title: "2. Ka mes izmantojam jusu datus",
          body: [
            "Jusu dati tiek izmantoti:",
            "Pasutijumu apstradei",
            "Klientu atbalstam",
            "Sazinai par piegadi",
            "Vietnes uzlabosanai",
          ],
        },
        {
          title: "3. Datu glabasana",
          body: [
            "Jusu dati tiek glabati drosi un netiek nodoti tresajam personam, iznemot piegades un maksajumu apstrades vajadzibam.",
          ],
        },
        {
          title: "4. Sikdatnes (Cookies)",
          body: [
            "Mes izmantojam sikdatnes, lai uzlabotu lietotaja pieredzi.",
          ],
        },
        {
          title: "5. Jusu tiesibas",
          body: [
            "Jums ir tiesibas:",
            "Pieprasit piekljuvi saviem datiem",
            "Labot vai dzest datus",
            "Atsaukt piekrisanu",
          ],
        },
        {
          title: "6. Kontakti",
          body: [
            "Ja jums ir jautajumi:",
            `Email: ${companyInfo.email}`,
          ],
        },
      ],
    },
    cookies: {
      title: "Sikdatnu politika",
      description: "Kā MDB Light izmanto būtiskās, analītiskās un mārketinga sīkdatnes.",
      updatedLabel: "Pēdējoreiz atjaunināts",
      updatedAt: "Aprīlis 2026",
      sections: [
        {
          title: "Būtiskās sīkdatnes",
          body: [
            "Būtiskās sīkdatnes uztur veikala drošību un pamatfunkcijas. Tās nepieciešamas autorizācijai, valodas izvēlei, grozam un piekrišanas saglabāšanai.",
            "Šīs sīkdatnes vienmēr ir aktīvas, jo bez tām vietne nevar korekti darboties.",
          ],
        },
        {
          title: "Analītiskās sīkdatnes",
          body: [
            "Analītiskās sīkdatnes palīdz saprast lapu lietojumu, veiktspēju un interesi par produktiem. Tās ir izslēgtas līdz jūsu piekrišanai.",
            "Savu izvēli varat mainīt jebkurā laikā sīkdatņu iestatījumos.",
          ],
        },
        {
          title: "Mārketinga sīkdatnes",
          body: [
            "Mārketinga sīkdatnes nākotnē var tikt izmantotas reklāmas attiecināšanai, remarketingam un kampaņu novērtēšanai, ja šādi rīki tiks ieslēgti.",
            "Līdz skaidrai piekrišanai tās paliek bloķētas.",
          ],
        },
      ],
    },
    delivery: {
      title: "Piegade un atgriesana",
      description: "Informacija par piegadi, apmaksu un atgriesanu.",
      updatedLabel: "Pedejais atjauninajums",
      updatedAt: "06.04.2026",
      sections: [
        {
          title: "1. Piegade",
          body: [
            "Mes piegadam pasutijumus Latvija un citas ES valstis.",
            "Piegades laiks:",
            "Latvija: 2-5 darba dienas",
            "ES: 5-10 darba dienas",
            "Pec pasutijuma veiksanas ar jums sazinasies musu menedzeris, lai precizetu piegades detalas.",
          ],
        },
        {
          title: "2. Piegades izmaksas",
          body: [
            "Piegades izmaksas tiek aprekintas individuali atkariba no pasutijuma.",
          ],
        },
        {
          title: "3. Apmaksa",
          body: [
            "Apmaksa iespejama:",
            "Ar bankas parskaitijumu",
            "Ar karti (Stripe)",
          ],
        },
        {
          title: "4. Atgriesana",
          body: [
            "Jums ir tiesibas atgriezt preci 14 dienu laika no sanemsanas dienas.",
            "Nosacijumi:",
            "Precei jabut nelietotai",
            "Originalaja iepakojuma",
          ],
        },
        {
          title: "5. Bojata prece",
          body: [
            "Ja prece ir bojata, ludzu sazinieties ar mums nekavejoties.",
            `Email: ${companyInfo.email}`,
          ],
        },
      ],
    },
    terms: {
      title: "Lietosanas noteikumi",
      description: "Vietnes lietosanas noteikumi un nosacijumi.",
      updatedLabel: "Pedejais atjauninajums",
      updatedAt: "06.04.2026",
      sections: [
        {
          title: "1. Visparigie noteikumi",
          body: [
            "Izmantojot so vietni, jus piekrītat siem noteikumiem.",
          ],
        },
        {
          title: "2. Pasutijumi",
          body: [
            "Visi pasutijumi tiek apstiprinati pec apmaksas vai sazinas ar klientu.",
          ],
        },
        {
          title: "3. Cenas",
          body: [
            "Visas cenas ir noraditas ar PVN.",
          ],
        },
        {
          title: "4. Atbildiba",
          body: [
            "Mes neuznemamies atbildibu par:",
            "Nepareizi ievaditiem datiem",
            "Piegades aizkavesanos areju faktoru del",
          ],
        },
        {
          title: "5. Intelektualais ipasums",
          body: [
            "Visa vietnes informacija pieder MDBLIGHT.",
          ],
        },
        {
          title: "6. Izmainas",
          body: [
            "Mes varam mainit noteikumus jebkura laika.",
          ],
        },
      ],
    },
  },
  el: {
    privacy: {
      title: "Πολιτική Απορρήτου",
      description: "Πώς το MDB Light συλλέγει, αποθηκεύει και χρησιμοποιεί προσωπικά δεδομένα στην ΕΕ.",
      updatedLabel: "Τελευταία ενημέρωση",
      updatedAt: "April 2026",
      sections: [
        {
          title: "Ποιοι είμαστε",
          body: [
            "Η MDB Group, SIA διαχειρίζεται το MDB Light για πελάτες στη Ρίγα, στη Λετονία, στην Κύπρο και σε άλλες υποστηριζόμενες αγορές.",
            `Για ερωτήσεις σχετικά με την προστασία δεδομένων, επικοινωνήστε στο ${companyInfo.email} ή στο ${companyInfo.phone}.`,
          ],
        },
        {
          title: "Ποια δεδομένα συλλέγουμε",
          body: [
            "Επεξεργαζόμαστε στοιχεία λογαριασμού, πληροφορίες παραγγελιών, στοιχεία αποστολής και χρέωσης, καθώς και επικοινωνία που αποστέλλεται μέσω φορμών ή email.",
            "Διατηρούμε επίσης τεχνικά αρχεία που απαιτούνται για την ασφάλεια, την πρόληψη απάτης και τη βασική λειτουργικότητα του ιστότοπου.",
          ],
        },
        {
          title: "Γιατί επεξεργαζόμαστε τα δεδομένα σας",
          body: [
            "Χρησιμοποιούμε προσωπικά δεδομένα για δημιουργία λογαριασμού, επιβεβαίωση email, επεξεργασία παραγγελιών, συντονισμό παράδοσης, υποστήριξη πελατών και νομική συμμόρφωση.",
            "Οι τεχνολογίες analytics και marketing παραμένουν απενεργοποιημένες μέχρι να δοθεί συγκατάθεση όπου απαιτείται.",
          ],
        },
        {
          title: "Τα δικαιώματά σας",
          body: [
            "Μπορείτε να ζητήσετε πρόσβαση, διόρθωση, διαγραφή, περιορισμό, εναντίωση ή εξαγωγή των δεδομένων σας σύμφωνα με τον GDPR.",
            "Ορισμένα αρχεία μπορεί να διατηρούνται περισσότερο όταν αυτό απαιτείται για λογιστικούς, ασφαλιστικούς ή νομικούς λόγους.",
          ],
        },
      ],
    },
    cookies: {
      title: "Πολιτική Cookies",
      description: "Πώς το MDB Light χρησιμοποιεί απαραίτητα, analytics και marketing cookies.",
      updatedLabel: "Τελευταία ενημέρωση",
      updatedAt: "April 2026",
      sections: [
        {
          title: "Απαραίτητα cookies",
          body: [
            "Τα απαραίτητα cookies διατηρούν την ασφάλεια και τις βασικές λειτουργίες του καταστήματος, συμπεριλαμβανομένης της σύνδεσης, της επιλογής γλώσσας, της κατάστασης του καλαθιού και της αποθήκευσης συναίνεσης.",
            "Είναι πάντα ενεργά, επειδή ο ιστότοπος δεν μπορεί να λειτουργήσει σωστά χωρίς αυτά.",
          ],
        },
        {
          title: "Cookies analytics",
          body: [
            "Τα cookies analytics βοηθούν στη μέτρηση της χρήσης σελίδων, της απόδοσης και του ενδιαφέροντος για προϊόντα. Παραμένουν απενεργοποιημένα μέχρι να τα αποδεχθείτε.",
            "Μπορείτε να επιστρέψετε και να αλλάξετε αυτή την επιλογή οποιαδήποτε στιγμή από τις ρυθμίσεις cookies.",
          ],
        },
        {
          title: "Cookies marketing",
          body: [
            "Τα cookies marketing μπορούν να χρησιμοποιηθούν για απόδοση διαφημίσεων, remarketing και μέτρηση καμπανιών εάν αυτά τα εργαλεία ενεργοποιηθούν αργότερα.",
            "Παραμένουν μπλοκαρισμένα μέχρι να δώσετε ρητή συγκατάθεση.",
          ],
        },
      ],
    },
    delivery: {
      title: "Παράδοση / Επιστροφές",
      description: "Χρόνοι παράδοσης, κανόνες επιστροφής και όροι επιστροφής χρημάτων για παραγγελίες MDB Light.",
      updatedLabel: "Τελευταία ενημέρωση",
      updatedAt: "April 2026",
      sections: [
        {
          title: "Παράδοση",
          body: [
            "Η παράδοση εξαρτάται από το απόθεμα, τον όγκο της παραγγελίας, τον προορισμό και την κατηγορία προϊόντος. Οι προσφορές έργων μπορεί να περιλαμβάνουν ξεχωριστούς χρόνους για προμήθεια και εγκατάσταση.",
            "Οι εκτιμώμενοι χρόνοι αποστολής και παράδοσης επιβεβαιώνονται μετά τον έλεγχο της παραγγελίας ή την έγκριση της προσφοράς.",
          ],
        },
        {
          title: "Επιστροφές",
          body: [
            "Παρακαλούμε επικοινωνήστε με το MDB Light πριν επιστρέψετε προϊόντα. Τα αχρησιμοποίητα τυπικά προϊόντα μπορεί να είναι επιλέξιμα για επιστροφή ανάλογα με τη νομοθεσία και την κατάσταση του προϊόντος.",
            "Εξατομικευμένα, έργου, εγκατεστημένα ή κατεστραμμένα προϊόντα μπορεί να εξαιρούνται, εκτός αν η τοπική νομοθεσία ορίζει διαφορετικά.",
          ],
        },
        {
          title: "Επιστροφή χρημάτων",
          body: [
            "Οι εγκεκριμένες επιστροφές χρημάτων επιστρέφονται στην αρχική μέθοδο πληρωμής μετά από έλεγχο των επιστραφέντων προϊόντων.",
            "Τα έξοδα αποστολής, διαχείρισης και εγκατάστασης μπορεί να μην επιστρέφονται όπου αυτό επιτρέπεται νομικά και έχει συμφωνηθεί σαφώς.",
          ],
        },
      ],
    },
    terms: {
      title: "Όροι Χρήσης",
      description: "Κανόνες χρήσης του ιστότοπου MDB Light, του καταλόγου και των λειτουργιών λογαριασμού.",
      updatedLabel: "Τελευταία ενημέρωση",
      updatedAt: "April 2026",
      sections: [
        {
          title: "Χρήση του ιστότοπου",
          body: [
            "Συμφωνείτε να χρησιμοποιείτε το MDB Light μόνο για νόμιμη πλοήγηση, αιτήματα προσφοράς, αγορές και διαχείριση λογαριασμού.",
            "Δεν πρέπει να κάνετε κατάχρηση του ιστότοπου, να παρεμβαίνετε στους μηχανισμούς ασφαλείας, να συλλέγετε δεδομένα από περιορισμένες περιοχές ή να υποβάλλετε ψευδείς πληροφορίες.",
          ],
        },
        {
          title: "Πληροφορίες προϊόντων",
          body: [
            "Προσπαθούμε να διατηρούμε ενημερωμένες τις τιμές, το απόθεμα και τις προδιαγραφές, αλλά οι τιμές έργων και οι όροι εγκατάστασης μπορεί να απαιτούν ξεχωριστή επιβεβαίωση.",
            "Οι εικόνες, οι περιγραφές και οι μεταφράσεις παρέχονται για διευκόλυνση και μπορεί να αναθεωρηθούν χωρίς προειδοποίηση.",
          ],
        },
        {
          title: "Λογαριασμοί και επικοινωνία",
          body: [
            "Είστε υπεύθυνοι για τη διατήρηση ασφαλών των στοιχείων σύνδεσής σας και για τη δραστηριότητα που πραγματοποιείται μέσω του λογαριασμού σας.",
            "Με την εγγραφή σας συμφωνείτε να λαμβάνετε λειτουργικά emails σχετικά με τη σύνδεση, την ανάκτηση κωδικού, τις παραγγελίες και την ασφάλεια λογαριασμού.",
          ],
        },
      ],
    },
  },
};

export function getLegalPageContent(locale: Locale, page: LegalPageKey) {
  return content[locale][page];
}

export function getLegalPageAlternates(page: LegalPageKey) {
  return {
    languages: {
      en: `/en/${page}`,
      ru: `/ru/${page}`,
      lv: `/lv/${page}`,
      el: `/el/${page}`,
      "x-default": `/en/${page}`,
    },
  } as const;
}
