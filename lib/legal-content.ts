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
    delivery: "Piegāde / atgriešana",
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
      updatedAt: "June 2026",
      sections: [
        {
          title: "Delivery time and methods",
          body: [
            "Standard delivery is estimated at 3 to 14 calendar days after payment confirmation or order confirmation, depending on stock, order volume, destination and product category.",
            "Parcel locker delivery is available for eligible goods. Home delivery applies to larger or higher-risk products and to mixed carts where at least one item requires home delivery.",
            "If a different delivery period applies to a project order, custom supply, installation service or out-of-stock product, we confirm it before processing the order.",
          ],
        },
        {
          title: "14-day withdrawal for distance purchases",
          body: [
            "For online distance purchases, consumers may withdraw from the contract within 14 days from the day the goods are received, without giving a reason.",
            "To start a return, contact MDB Light at info@mdblight.com before sending the goods back. The returned product must be complete, safely packed and without damage, scratches, installation marks or use beyond what is necessary to inspect the product.",
            "If the product value is reduced because it was handled more than necessary for inspection, we may deduct the loss in value from the refund where allowed by law.",
          ],
        },
        {
          title: "Return costs and refunds",
          body: [
            "For withdrawal returns, the customer pays the return shipping cost unless MDB Light has agreed to cover it. Original standard delivery costs are refunded where required by applicable consumer law.",
            "Refunds are made to the original payment method within the legal deadline after we receive the withdrawal notice, but we may wait until the goods are returned or proof of return is provided.",
            "Goods made to the customer's specifications, clearly personalised goods, installed goods and project-specific supply may be excluded from the 14-day withdrawal right unless the product is defective.",
          ],
        },
        {
          title: "Defective or damaged goods",
          body: [
            "If goods arrive damaged, incomplete or defective, contact us as soon as possible and keep photos, packaging and the order confirmation.",
            "Defective goods are handled under the EU and Latvian legal guarantee rules. Depending on the situation, the remedy may be repair, replacement, price reduction or refund.",
            "The return cost for defective goods is covered by the trader where required by law.",
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
          title: "Delivery, returns and legal guarantee",
          body: [
            "By placing an order, you accept the delivery and returns terms published on the Delivery / Returns page.",
            "These terms do not limit mandatory consumer rights under Latvian or EU consumer protection law.",
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
      updatedAt: "Июнь 2026",
      sections: [
        {
          title: "Сроки и способы доставки",
          body: [
            "Стандартный ориентировочный срок доставки составляет от 3 до 14 календарных дней после подтверждения оплаты или подтверждения заказа. Срок зависит от наличия товара, объёма заказа, адреса доставки и категории продукции.",
            "Доставка в пакомат доступна для подходящих товаров. Доставка на дом применяется для более крупных или чувствительных товаров, а также для смешанной корзины, если хотя бы один товар требует доставки на дом.",
            "Если для проектного заказа, индивидуальной поставки, монтажа или отсутствующего на складе товара нужен другой срок, мы подтверждаем его до обработки заказа.",
          ],
        },
        {
          title: "14-дневное право отказа при онлайн-покупке",
          body: [
            "При дистанционной онлайн-покупке потребитель может отказаться от договора в течение 14 дней со дня получения товара без указания причины.",
            "Для начала возврата свяжитесь с MDB Light по адресу info@mdblight.com до отправки товара. Товар должен быть полным, безопасно упакованным, без повреждений, царапин, следов монтажа или использования сверх проверки товара.",
            "Если стоимость товара снижена из-за обращения с ним сверх необходимой проверки, мы можем удержать соответствующее уменьшение стоимости в пределах, разрешённых законом.",
          ],
        },
        {
          title: "Стоимость возврата и возврат средств",
          body: [
            "При возврате по праву отказа клиент оплачивает обратную доставку, если MDB Light отдельно не согласовал оплатить её. Стоимость стандартной первоначальной доставки возвращается в случаях, предусмотренных законом о защите прав потребителей.",
            "Возврат средств производится на исходный способ оплаты в установленный законом срок после получения заявления об отказе, однако мы можем ожидать возврата товара или подтверждения его отправки.",
            "Товары, изготовленные по индивидуальным параметрам клиента, явно персонализированные товары, смонтированные товары и проектные поставки могут быть исключены из 14-дневного права отказа, если товар не является дефектным.",
          ],
        },
        {
          title: "Брак или повреждение товара",
          body: [
            "Если товар получен повреждённым, неполным или с дефектом, свяжитесь с нами как можно быстрее и сохраните фотографии, упаковку и подтверждение заказа.",
            "Дефектные товары рассматриваются по правилам законной гарантии ЕС и Латвии. В зависимости от ситуации возможны ремонт, замена, уменьшение цены или возврат средств.",
            "Расходы на возврат дефектного товара покрывает продавец в случаях, предусмотренных законом.",
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
          title: "Доставка, возврат и законная гарантия",
          body: [
            "Оформляя заказ, вы принимаете условия доставки и возврата, опубликованные на странице Доставка и возврат.",
            "Эти условия не ограничивают обязательные права потребителя по законодательству Латвии и ЕС.",
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
      description: "Kā MDB Light apkopo, glabā un izmanto personas datus ES.",
      updatedLabel: "Pēdējoreiz atjaunināts",
      updatedAt: "Aprīlis 2026",
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
      title: "Piegāde un atgriešana",
      description: "MDB Light pasūtījumu piegādes termiņi, atgriešana un atmaksas nosacījumi.",
      updatedLabel: "Pēdējoreiz atjaunināts",
      updatedAt: "Jūnijs 2026",
      sections: [
        {
          title: "Piegādes termiņi un veidi",
          body: [
            "Standarta piegādes aptuvenais termiņš ir no 3 līdz 14 kalendārajām dienām pēc maksājuma vai pasūtījuma apstiprināšanas. Termiņš ir atkarīgs no preces pieejamības, pasūtījuma apjoma, piegādes adreses un preces kategorijas.",
            "Piegāde uz pakomātu ir pieejama piemērotām precēm. Piegāde uz mājām tiek piemērota lielākiem vai jutīgākiem produktiem, kā arī jauktam grozam, ja vismaz vienai precei nepieciešama piegāde uz mājām.",
            "Ja projekta pasūtījumam, individuālai piegādei, uzstādīšanai vai noliktavā neesošai precei piemērojams cits termiņš, mēs to apstiprinām pirms pasūtījuma apstrādes.",
          ],
        },
        {
          title: "14 dienu atteikuma tiesības distances pirkumiem",
          body: [
            "Distances pirkumiem internetā patērētājs var atteikties no līguma 14 dienu laikā no preces saņemšanas dienas, nenorādot iemeslu.",
            "Lai sāktu atgriešanu, pirms preces nosūtīšanas sazinieties ar MDB Light: info@mdblight.com. Precei jābūt pilnā komplektācijā, droši iepakotai, bez bojājumiem, skrāpējumiem, uzstādīšanas pēdām vai lietošanas, kas pārsniedz preces pārbaudi.",
            "Ja preces vērtība ir samazinājusies tādas rīcības dēļ, kas pārsniedz nepieciešamo pārbaudi, mēs varam ieturēt attiecīgo vērtības samazinājumu, ciktāl to atļauj likums.",
          ],
        },
        {
          title: "Atgriešanas izmaksas un atmaksa",
          body: [
            "Izmantojot atteikuma tiesības, klients sedz atpakaļnosūtīšanas izmaksas, ja MDB Light nav atsevišķi piekritis tās segt. Sākotnējās standarta piegādes izmaksas tiek atmaksātas gadījumos, ko paredz patērētāju tiesību aizsardzības noteikumi.",
            "Atmaksa tiek veikta uz sākotnējo maksājuma veidu likumā noteiktajā termiņā pēc atteikuma paziņojuma saņemšanas, tomēr mēs varam sagaidīt preces atgriešanu vai pierādījumu par tās nosūtīšanu.",
            "Pēc klienta specifikācijas izgatavotas preces, skaidri personalizētas preces, uzstādītas preces un projekta piegādes var nebūt pakļautas 14 dienu atteikuma tiesībām, ja vien prece nav neatbilstoša vai bojāta.",
          ],
        },
        {
          title: "Neatbilstoša vai bojāta prece",
          body: [
            "Ja prece saņemta bojāta, nepilnā komplektācijā vai ar defektu, sazinieties ar mums pēc iespējas ātrāk un saglabājiet fotogrāfijas, iepakojumu un pasūtījuma apstiprinājumu.",
            "Neatbilstošas preces tiek izskatītas saskaņā ar ES un Latvijas likumiskās garantijas noteikumiem. Atkarībā no situācijas risinājums var būt remonts, apmaiņa, cenas samazinājums vai naudas atmaksa.",
            "Neatbilstošas preces atgriešanas izmaksas sedz tirgotājs gadījumos, ko paredz likums.",
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
          title: "4. Piegāde, atgriešana un likumiskā garantija",
          body: [
            "Veicot pasūtījumu, jūs piekrītat piegādes un atgriešanas nosacījumiem, kas publicēti lapā Piegāde un atgriešana.",
            "Šie nosacījumi neierobežo patērētāja obligātās tiesības saskaņā ar Latvijas un ES patērētāju tiesību aizsardzības noteikumiem.",
          ],
        },
        {
          title: "5. Atbildiba",
          body: [
            "Mes neuznemamies atbildibu par:",
            "Nepareizi ievaditiem datiem",
            "Piegades aizkavesanos areju faktoru del",
          ],
        },
        {
          title: "6. Intelektualais ipasums",
          body: [
            "Visa vietnes informacija pieder MDBLIGHT.",
          ],
        },
        {
          title: "7. Izmainas",
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
      updatedAt: "June 2026",
      sections: [
        {
          title: "Χρόνος και τρόποι παράδοσης",
          body: [
            "Ο τυπικός εκτιμώμενος χρόνος παράδοσης είναι από 3 έως 14 ημερολογιακές ημέρες μετά την επιβεβαίωση πληρωμής ή παραγγελίας, ανάλογα με το απόθεμα, τον όγκο της παραγγελίας, τον προορισμό και την κατηγορία προϊόντος.",
            "Η παράδοση σε parcel locker είναι διαθέσιμη για κατάλληλα προϊόντα. Η παράδοση στο σπίτι εφαρμόζεται σε μεγαλύτερα ή πιο ευαίσθητα προϊόντα, καθώς και σε μικτά καλάθια όπου τουλάχιστον ένα προϊόν απαιτεί παράδοση στο σπίτι.",
            "Εάν ισχύει διαφορετικός χρόνος για έργο, ειδική προμήθεια, εγκατάσταση ή προϊόν εκτός αποθέματος, τον επιβεβαιώνουμε πριν την επεξεργασία της παραγγελίας.",
          ],
        },
        {
          title: "Δικαίωμα υπαναχώρησης 14 ημερών για εξ αποστάσεως αγορές",
          body: [
            "Για online εξ αποστάσεως αγορές, ο καταναλωτής μπορεί να υπαναχωρήσει από τη σύμβαση εντός 14 ημερών από την ημέρα παραλαβής των προϊόντων, χωρίς να αναφέρει λόγο.",
            "Για να ξεκινήσετε επιστροφή, επικοινωνήστε με το MDB Light στο info@mdblight.com πριν αποστείλετε τα προϊόντα. Το προϊόν πρέπει να είναι πλήρες, ασφαλώς συσκευασμένο και χωρίς φθορές, γρατζουνιές, σημάδια εγκατάστασης ή χρήση πέρα από την απαραίτητη επιθεώρηση.",
            "Εάν η αξία του προϊόντος μειωθεί λόγω χειρισμού πέρα από την απαραίτητη επιθεώρηση, μπορούμε να παρακρατήσουμε την αντίστοιχη μείωση αξίας όπου επιτρέπεται από τον νόμο.",
          ],
        },
        {
          title: "Κόστος επιστροφής και επιστροφή χρημάτων",
          body: [
            "Για επιστροφές λόγω υπαναχώρησης, ο πελάτης πληρώνει το κόστος επιστροφής εκτός εάν το MDB Light έχει συμφωνήσει να το καλύψει. Τα αρχικά έξοδα τυπικής παράδοσης επιστρέφονται όπου απαιτείται από την ισχύουσα νομοθεσία προστασίας καταναλωτή.",
            "Οι επιστροφές χρημάτων γίνονται στην αρχική μέθοδο πληρωμής εντός της νόμιμης προθεσμίας μετά τη λήψη της δήλωσης υπαναχώρησης, αλλά μπορούμε να περιμένουμε μέχρι την επιστροφή των προϊόντων ή την απόδειξη αποστολής.",
            "Προϊόντα κατασκευασμένα σύμφωνα με προδιαγραφές πελάτη, σαφώς εξατομικευμένα προϊόντα, εγκατεστημένα προϊόντα και προμήθειες έργων μπορεί να εξαιρούνται από το δικαίωμα υπαναχώρησης 14 ημερών, εκτός εάν το προϊόν είναι ελαττωματικό.",
          ],
        },
        {
          title: "Ελαττωματικά ή κατεστραμμένα προϊόντα",
          body: [
            "Εάν τα προϊόντα παραδοθούν κατεστραμμένα, ελλιπή ή ελαττωματικά, επικοινωνήστε μαζί μας το συντομότερο δυνατό και κρατήστε φωτογραφίες, συσκευασία και επιβεβαίωση παραγγελίας.",
            "Τα ελαττωματικά προϊόντα αντιμετωπίζονται σύμφωνα με τους κανόνες νόμιμης εγγύησης της ΕΕ και της Λετονίας. Ανάλογα με την περίπτωση, η λύση μπορεί να είναι επισκευή, αντικατάσταση, μείωση τιμής ή επιστροφή χρημάτων.",
            "Το κόστος επιστροφής ελαττωματικών προϊόντων καλύπτεται από τον έμπορο όπου απαιτείται από τον νόμο.",
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
          title: "Παράδοση, επιστροφές και νόμιμη εγγύηση",
          body: [
            "Με την υποβολή παραγγελίας αποδέχεστε τους όρους παράδοσης και επιστροφών που δημοσιεύονται στη σελίδα Παράδοση / Επιστροφές.",
            "Οι όροι αυτοί δεν περιορίζουν τα υποχρεωτικά δικαιώματα καταναλωτή σύμφωνα με τη λετονική ή την ευρωπαϊκή νομοθεσία προστασίας καταναλωτή.",
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
