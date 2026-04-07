"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { useLocale } from "@/components/ui/locale-provider";

type CookiePreferences = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = "mdb-light-cookie-consent";
const COOKIE_KEY = "mdb-light-cookie-consent";

const copy = {
  en: {
    title: "Cookie settings",
    text: "MDB Light uses essential cookies for secure functionality and optional cookies for analytics and marketing. Optional cookies stay blocked until you allow them.",
    accept: "Accept",
    reject: "Reject",
    manage: "Manage",
    save: "Save settings",
    essential: "Essential",
    essentialText: "Required for login, cart, locale and consent storage.",
    analytics: "Analytics",
    analyticsText: "Used only after consent for traffic and performance insights.",
    marketing: "Marketing",
    marketingText: "Used only after consent for ads and attribution.",
  },
  ru: {
    title: "Настройки cookies",
    text: "MDB Light использует обязательные cookies для безопасной работы сайта и опциональные cookies для аналитики и маркетинга. Опциональные cookies остаются заблокированы до вашего выбора.",
    accept: "Принять",
    reject: "Отклонить",
    manage: "Настроить",
    save: "Сохранить",
    essential: "Обязательные",
    essentialText: "Нужны для входа, корзины, языка и хранения согласия.",
    analytics: "Аналитика",
    analyticsText: "Используются только после согласия для статистики и производительности.",
    marketing: "Маркетинг",
    marketingText: "Используются только после согласия для рекламы и атрибуции.",
  },
  lv: {
    title: "Sikdatnu iestatijumi",
    text: "MDB Light izmanto būtiskās sīkdatnes drošai vietnes darbībai un izvēles sīkdatnes analītikai un mārketingam. Izvēles sīkdatnes paliek bloķētas līdz jūsu piekrišanai.",
    accept: "Pieņemt",
    reject: "Noraidīt",
    manage: "Pārvaldīt",
    save: "Saglabāt",
    essential: "Būtiskās",
    essentialText: "Nepieciešamas pieteikšanās, groza, valodas un piekrišanas saglabāšanai.",
    analytics: "Analītika",
    analyticsText: "Tiek izmantota tikai pēc piekrišanas statistikai un veiktspējai.",
    marketing: "Mārketings",
    marketingText: "Tiek izmantots tikai pēc piekrišanas reklāmai un attiecināšanai.",
  },
  el: {
    title: "Ρυθμίσεις cookies",
    text: "Το MDB Light χρησιμοποιεί απαραίτητα cookies για την ασφαλή λειτουργία του ιστότοπου και προαιρετικά cookies για αναλύσεις και marketing. Τα προαιρετικά cookies παραμένουν μπλοκαρισμένα μέχρι να τα επιτρέψετε.",
    accept: "Αποδοχή",
    reject: "Απόρριψη",
    manage: "Διαχείριση",
    save: "Αποθήκευση ρυθμίσεων",
    essential: "Απαραίτητα",
    essentialText: "Απαιτούνται για σύνδεση, καλάθι, γλώσσα και αποθήκευση συγκατάθεσης.",
    analytics: "Αναλύσεις",
    analyticsText: "Χρησιμοποιούνται μόνο μετά τη συγκατάθεση για στατιστικά και απόδοση.",
    marketing: "Marketing",
    marketingText: "Χρησιμοποιούνται μόνο μετά τη συγκατάθεση για διαφήμιση και απόδοση καναλιών.",
  },
} as const;

function persistPreferences(preferences: CookiePreferences) {
  const serialized = JSON.stringify(preferences);
  window.localStorage.setItem(STORAGE_KEY, serialized);
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(serialized)}; path=/; max-age=31536000; samesite=lax`;
  window.dispatchEvent(new CustomEvent("mdb-light-cookie-consent", { detail: preferences }));
}

function getInitialConsentState() {
  if (typeof window === "undefined") {
    return {
      isLoaded: false,
      isVisible: false,
      analytics: false,
      marketing: false,
    };
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return {
      isLoaded: true,
      isVisible: true,
      analytics: false,
      marketing: false,
    };
  }

  try {
    const parsed = JSON.parse(stored) as CookiePreferences;

    return {
      isLoaded: true,
      isVisible: false,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
    };
  } catch {
    return {
      isLoaded: true,
      isVisible: true,
      analytics: false,
      marketing: false,
    };
  }
}

export function CookieConsent() {
  const { locale } = useLocale();
  const t = copy[locale];
  const [consentState] = useState(getInitialConsentState);
  const [isLoaded] = useState(consentState.isLoaded);
  const [isVisible, setIsVisible] = useState(consentState.isVisible);
  const [isManaging, setIsManaging] = useState(false);
  const [analytics, setAnalytics] = useState(consentState.analytics);
  const [marketing, setMarketing] = useState(consentState.marketing);

  const panelClass = useMemo(
    () =>
      "fixed inset-x-4 bottom-4 z-[120] rounded-[1.5rem] border border-[#e8dfd2] bg-white p-4 shadow-[0_20px_50px_rgba(27,42,74,0.18)] sm:inset-x-auto sm:right-6 sm:w-[420px]",
    [],
  );

  const handleAccept = () => {
    persistPreferences({ essential: true, analytics: true, marketing: true });
    setAnalytics(true);
    setMarketing(true);
    setIsManaging(false);
    setIsVisible(false);
  };

  const handleReject = () => {
    persistPreferences({ essential: true, analytics: false, marketing: false });
    setAnalytics(false);
    setMarketing(false);
    setIsManaging(false);
    setIsVisible(false);
  };

  const handleSave = () => {
    persistPreferences({ essential: true, analytics, marketing });
    setIsManaging(false);
    setIsVisible(false);
  };

  if (!isLoaded || !isVisible) {
    return null;
  }

  return (
    <>
      <div className={panelClass}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.03em] text-[color:var(--headline)]">{t.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{t.text}</p>
          </div>
          {isManaging ? (
            <button
              type="button"
              onClick={() => setIsManaging(false)}
              className="rounded-full border border-[#ece3d9] p-2 text-[color:var(--muted)] transition hover:text-[color:var(--headline)]"
              aria-label="Close cookie settings"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {isManaging ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-[#ece3d9] bg-[#fffaf4] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-[color:var(--headline)]">{t.essential}</p>
                  <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{t.essentialText}</p>
                </div>
                <span className="rounded-full bg-[#f4c64f] px-3 py-1 text-xs font-semibold text-[#203153]">ON</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#ece3d9] bg-[#fffaf4] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-[color:var(--headline)]">{t.analytics}</p>
                  <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{t.analyticsText}</p>
                </div>
                <label className="inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={analytics}
                    onChange={(event) => setAnalytics(event.target.checked)}
                  />
                  <span className="h-7 w-12 rounded-full bg-[#d9d1c6] transition peer-checked:bg-[#f4c64f]" />
                  <span className="-ml-10 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-[#ece3d9] bg-[#fffaf4] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-[color:var(--headline)]">{t.marketing}</p>
                  <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{t.marketingText}</p>
                </div>
                <label className="inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={marketing}
                    onChange={(event) => setMarketing(event.target.checked)}
                  />
                  <span className="h-7 w-12 rounded-full bg-[#d9d1c6] transition peer-checked:bg-[#f4c64f]" />
                  <span className="-ml-10 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 text-sm font-semibold text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.22)] transition hover:bg-[#efbf3e]"
            >
              {t.save}
            </button>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAccept}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 text-sm font-semibold text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.22)] transition hover:bg-[#efbf3e]"
            >
              {t.accept}
            </button>
            <button
              type="button"
              onClick={handleReject}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-[#ece3d9] bg-white px-5 text-sm font-semibold text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/35"
            >
              {t.reject}
            </button>
            <button
              type="button"
              onClick={() => setIsManaging(true)}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-[#ece3d9] bg-[#fffaf4] px-5 text-sm font-semibold text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/35"
            >
              {t.manage}
            </button>
          </div>
        )}
      </div>

      {isManaging ? <div className="fixed inset-0 z-[110] bg-[rgba(14,22,38,0.34)]" /> : null}
    </>
  );
}
