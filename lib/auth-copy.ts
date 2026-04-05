import type { Locale } from "@/i18n/config";

type LoginCopy = {
  top: string;
  support: string;
  back: string;
  login: string;
  register: string;
  title: string;
  description: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  remember: string;
  forgot: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successText: string;
  successAction: string;
  missingConfig: string;
  authErrorFallback: string;
  errors: {
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordShort: string;
  };
};

type RegisterCopy = {
  top: string;
  support: string;
  back: string;
  login: string;
  register: string;
  title: string;
  description: string;
  firstName: string;
  lastName: string;
  phone: string;
  phonePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  confirmPassword: string;
  confirmPlaceholder: string;
  mustContain: string;
  create: string;
  creating: string;
  consent: string;
  successTitle: string;
  successText: string;
  successAction: string;
  missingConfig: string;
  authErrorFallback: string;
  strengths: [string, string, string, string, string];
  requirements: [string, string, string, string, string];
  errors: {
    firstNameRequired: string;
    lastNameRequired: string;
    phoneRequired: string;
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordShort: string;
    confirmPasswordRequired: string;
    passwordMismatch: string;
    consentRequired: string;
  };
};

export const loginCopy: Record<Locale, LoginCopy> = {
  en: {
    top: "Multilingual LED marketplace",
    support: "Contact",
    back: "Back to home",
    login: "Login",
    register: "Register",
    title: "Welcome back",
    description: "Sign in to continue with your saved cart and account.",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
    passwordPlaceholder: "Password",
    remember: "Remember this device",
    forgot: "Forgot password?",
    submit: "Sign in",
    submitting: "Signing in...",
    successTitle: "You are signed in",
    successText: "Your session is active. Continue to the catalog.",
    successAction: "Open catalog",
    missingConfig: "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    authErrorFallback: "Could not sign you in. Please try again.",
    errors: {
      emailRequired: "Enter your email.",
      emailInvalid: "Enter a valid email address.",
      passwordRequired: "Enter your password.",
      passwordShort: "Password must be at least 8 characters."
    }
  },
  ru: {
    top: "Мультиязычный маркетплейс LED-освещения",
    support: "Контакты",
    back: "Назад на главную",
    login: "Вход",
    register: "Регистрация",
    title: "С возвращением",
    description: "Войдите, чтобы продолжить с сохраненной корзиной и аккаунтом.",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Пароль",
    passwordPlaceholder: "Пароль",
    remember: "Запомнить это устройство",
    forgot: "Забыли пароль?",
    submit: "Войти",
    submitting: "Входим...",
    successTitle: "Вы вошли в аккаунт",
    successText: "Сессия активна. Можно переходить в каталог.",
    successAction: "Открыть каталог",
    missingConfig: "Supabase еще не настроен. Добавьте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    authErrorFallback: "Не удалось выполнить вход. Попробуйте еще раз.",
    errors: {
      emailRequired: "Введите email.",
      emailInvalid: "Введите корректный email.",
      passwordRequired: "Введите пароль.",
      passwordShort: "Пароль должен быть не короче 8 символов."
    }
  },
  el: {
    top: "Πολύγλωσσο marketplace LED φωτισμού",
    support: "Επικοινωνία",
    back: "Πίσω στην αρχική",
    login: "Σύνδεση",
    register: "Εγγραφή",
    title: "Καλώς ήρθατε ξανά",
    description: "Συνδεθείτε για να συνεχίσετε με το αποθηκευμένο καλάθι και τον λογαριασμό σας.",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Κωδικός",
    passwordPlaceholder: "Κωδικός",
    remember: "Να θυμάται αυτή τη συσκευή",
    forgot: "Ξεχάσατε τον κωδικό;",
    submit: "Σύνδεση",
    submitting: "Σύνδεση...",
    successTitle: "Συνδεθήκατε",
    successText: "Η συνεδρία σας είναι ενεργή. Συνεχίστε στον κατάλογο.",
    successAction: "Άνοιγμα καταλόγου",
    missingConfig: "Το Supabase δεν έχει ρυθμιστεί ακόμα. Προσθέστε NEXT_PUBLIC_SUPABASE_URL και NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    authErrorFallback: "Η σύνδεση απέτυχε. Δοκιμάστε ξανά.",
    errors: {
      emailRequired: "Συμπληρώστε το email.",
      emailInvalid: "Συμπληρώστε έγκυρο email.",
      passwordRequired: "Συμπληρώστε τον κωδικό.",
      passwordShort: "Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες."
    }
  },
  lv: {
    top: "Daudzvalodu LED apgaismojuma marketplace",
    support: "Kontakti",
    back: "Atpakaļ uz sākumu",
    login: "Pieslēgties",
    register: "Reģistrēties",
    title: "Prieks redzēt atkal",
    description: "Pieslēdzieties, lai turpinātu ar saglabāto grozu un kontu.",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Parole",
    passwordPlaceholder: "Parole",
    remember: "Atcerēties šo ierīci",
    forgot: "Aizmirsāt paroli?",
    submit: "Pieslēgties",
    submitting: "Notiek pieslēgšanās...",
    successTitle: "Jūs esat pieslēdzies",
    successText: "Sesija ir aktīva. Varat doties uz katalogu.",
    successAction: "Atvērt katalogu",
    missingConfig: "Supabase vēl nav iestatīts. Pievienojiet NEXT_PUBLIC_SUPABASE_URL un NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    authErrorFallback: "Neizdevās pieslēgties. Mēģiniet vēlreiz.",
    errors: {
      emailRequired: "Ievadiet email.",
      emailInvalid: "Ievadiet derīgu email adresi.",
      passwordRequired: "Ievadiet paroli.",
      passwordShort: "Parolei jābūt vismaz 8 rakstzīmēm."
    }
  }
};

export const registerCopy: Record<Locale, RegisterCopy> = {
  en: {
    top: "Multilingual LED marketplace",
    support: "Contact",
    back: "Back to home",
    login: "Login",
    register: "Register",
    title: "Create your account",
    description: "Sign up to save carts and continue to checkout.",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone number",
    phonePlaceholder: "+371 2XXXXXXX",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
    passwordPlaceholder: "Password",
    confirmPassword: "Confirm password",
    confirmPlaceholder: "Repeat password",
    mustContain: "Must contain:",
    create: "Create account",
    creating: "Creating account...",
    consent: "I agree to the terms, privacy rules, and account-based cart storage.",
    successTitle: "Account successfully created",
    successText: "Your account has been created. You can now save products, place orders, and manage your purchases. Please check your email to confirm your account before logging in.",
    successAction: "Log in",
    missingConfig: "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    authErrorFallback: "Could not create the account. Please try again.",
    strengths: ["Enter a password", "Weak password", "Medium password", "Strong password", "Very strong password"],
    requirements: ["At least 8 characters", "At least 1 number", "At least 1 lowercase letter", "At least 1 uppercase letter", "At least 1 special character"],
    errors: {
      firstNameRequired: "Enter your first name.",
      lastNameRequired: "Enter your last name.",
      phoneRequired: "Enter your phone number.",
      emailRequired: "Enter your email.",
      emailInvalid: "Enter a valid email address.",
      passwordRequired: "Enter your password.",
      passwordShort: "Password must be at least 8 characters.",
      confirmPasswordRequired: "Confirm your password.",
      passwordMismatch: "Passwords do not match.",
      consentRequired: "You need to accept the terms to continue."
    }
  },
  ru: {
    top: "Мультиязычный маркетплейс LED-освещения",
    support: "Контакты",
    back: "Назад на главную",
    login: "Вход",
    register: "Регистрация",
    title: "Создайте аккаунт",
    description: "Регистрация сохраняет корзину и открывает checkout.",
    firstName: "Имя",
    lastName: "Фамилия",
    phone: "Телефон",
    phonePlaceholder: "+371 2XXXXXXX",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Пароль",
    passwordPlaceholder: "Пароль",
    confirmPassword: "Подтвердите пароль",
    confirmPlaceholder: "Повторите пароль",
    mustContain: "Пароль должен содержать:",
    create: "Создать аккаунт",
    creating: "Создаем аккаунт...",
    consent: "Я согласен с правилами, политикой конфиденциальности и хранением корзины по аккаунту.",
    successTitle: "Аккаунт успешно создан",
    successText: "Ваш аккаунт создан. Теперь вы можете сохранять товары, оформлять заказы и управлять своими покупками. Проверьте почту для подтверждения email перед входом.",
    successAction: "Войти в аккаунт",
    missingConfig: "Supabase еще не настроен. Добавьте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    authErrorFallback: "Не удалось создать аккаунт. Попробуйте еще раз.",
    strengths: ["Введите пароль", "Слабый пароль", "Средний пароль", "Сильный пароль", "Очень сильный пароль"],
    requirements: ["Минимум 8 символов", "Минимум 1 цифра", "Минимум 1 строчная буква", "Минимум 1 заглавная буква", "Минимум 1 спецсимвол"],
    errors: {
      firstNameRequired: "Введите имя.",
      lastNameRequired: "Введите фамилию.",
      phoneRequired: "Введите номер телефона.",
      emailRequired: "Введите email.",
      emailInvalid: "Введите корректный email.",
      passwordRequired: "Введите пароль.",
      passwordShort: "Пароль должен быть не короче 8 символов.",
      confirmPasswordRequired: "Подтвердите пароль.",
      passwordMismatch: "Пароли не совпадают.",
      consentRequired: "Нужно принять правила, чтобы продолжить."
    }
  },
  el: {
    top: "Πολύγλωσσο marketplace LED φωτισμού",
    support: "Επικοινωνία",
    back: "Πίσω στην αρχική",
    login: "Σύνδεση",
    register: "Εγγραφή",
    title: "Δημιουργία λογαριασμού",
    description: "Η εγγραφή αποθηκεύει το καλάθι και ανοίγει το checkout.",
    firstName: "Όνομα",
    lastName: "Επώνυμο",
    phone: "Τηλέφωνο",
    phonePlaceholder: "+371 2XXXXXXX",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Κωδικός",
    passwordPlaceholder: "Κωδικός",
    confirmPassword: "Επιβεβαίωση κωδικού",
    confirmPlaceholder: "Επαναλάβετε τον κωδικό",
    mustContain: "Πρέπει να περιέχει:",
    create: "Δημιουργία λογαριασμού",
    creating: "Δημιουργία λογαριασμού...",
    consent: "Συμφωνώ με τους όρους, την πολιτική απορρήτου και την αποθήκευση καλαθιού βάσει λογαριασμού.",
    successTitle: "Ο λογαριασμός δημιουργήθηκε",
    successText: "Ο λογαριασμός σας δημιουργήθηκε. Μπορείτε πλέον να αποθηκεύετε προϊόντα, να κάνετε παραγγελίες και να διαχειρίζεστε τις αγορές σας. Ελέγξτε το email σας για επιβεβαίωση πριν συνδεθείτε.",
    successAction: "Σύνδεση",
    missingConfig: "Το Supabase δεν έχει ρυθμιστεί ακόμα. Προσθέστε NEXT_PUBLIC_SUPABASE_URL και NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    authErrorFallback: "Δεν ήταν δυνατή η δημιουργία λογαριασμού. Δοκιμάστε ξανά.",
    strengths: ["Εισαγάγετε κωδικό", "Αδύναμος κωδικός", "Μέτριος κωδικός", "Ισχυρός κωδικός", "Πολύ ισχυρός κωδικός"],
    requirements: ["Τουλάχιστον 8 χαρακτήρες", "Τουλάχιστον 1 αριθμός", "Τουλάχιστον 1 πεζό γράμμα", "Τουλάχιστον 1 κεφαλαίο γράμμα", "Τουλάχιστον 1 ειδικός χαρακτήρας"],
    errors: {
      firstNameRequired: "Συμπληρώστε το όνομα.",
      lastNameRequired: "Συμπληρώστε το επώνυμο.",
      phoneRequired: "Συμπληρώστε τον αριθμό τηλεφώνου.",
      emailRequired: "Συμπληρώστε το email.",
      emailInvalid: "Συμπληρώστε έγκυρο email.",
      passwordRequired: "Συμπληρώστε τον κωδικό.",
      passwordShort: "Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.",
      confirmPasswordRequired: "Επιβεβαιώστε τον κωδικό.",
      passwordMismatch: "Οι κωδικοί δεν ταιριάζουν.",
      consentRequired: "Πρέπει να αποδεχτείτε τους όρους για να συνεχίσετε."
    }
  },
  lv: {
    top: "Daudzvalodu LED apgaismojuma marketplace",
    support: "Kontakti",
    back: "Atpakaļ uz sākumu",
    login: "Pieslēgties",
    register: "Reģistrēties",
    title: "Izveidojiet kontu",
    description: "Reģistrācija saglabā grozu un atver checkout.",
    firstName: "Vārds",
    lastName: "Uzvārds",
    phone: "Tālrunis",
    phonePlaceholder: "+371 2XXXXXXX",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Parole",
    passwordPlaceholder: "Parole",
    confirmPassword: "Apstipriniet paroli",
    confirmPlaceholder: "Atkārtojiet paroli",
    mustContain: "Jāsatur:",
    create: "Izveidot kontu",
    creating: "Notiek konta izveide...",
    consent: "Es piekrītu noteikumiem, privātuma politikai un groza glabāšanai pēc konta principa.",
    successTitle: "Konts veiksmīgi izveidots",
    successText: "Jūsu konts ir izveidots. Tagad varat saglabāt preces, veikt pasūtījumus un pārvaldīt savus pirkumus. Lūdzu, pārbaudiet e-pastu, lai apstiprinātu kontu pirms pieslēgšanās.",
    successAction: "Pieslēgties",
    missingConfig: "Supabase vēl nav iestatīts. Pievienojiet NEXT_PUBLIC_SUPABASE_URL un NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    authErrorFallback: "Neizdevās izveidot kontu. Mēģiniet vēlreiz.",
    strengths: ["Ievadiet paroli", "Vāja parole", "Vidēja parole", "Spēcīga parole", "Ļoti spēcīga parole"],
    requirements: ["Vismaz 8 rakstzīmes", "Vismaz 1 cipars", "Vismaz 1 mazais burts", "Vismaz 1 lielais burts", "Vismaz 1 speciālā rakstzīme"],
    errors: {
      firstNameRequired: "Ievadiet vārdu.",
      lastNameRequired: "Ievadiet uzvārdu.",
      phoneRequired: "Ievadiet tālruņa numuru.",
      emailRequired: "Ievadiet email.",
      emailInvalid: "Ievadiet derīgu email adresi.",
      passwordRequired: "Ievadiet paroli.",
      passwordShort: "Parolei jābūt vismaz 8 rakstzīmēm.",
      confirmPasswordRequired: "Apstipriniet paroli.",
      passwordMismatch: "Paroles nesakrīt.",
      consentRequired: "Lai turpinātu, jāpiekrīt noteikumiem."
    }
  }
};
