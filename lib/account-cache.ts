export type CachedAccountProfile = {
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  phone: string | null;
};

const ACCOUNT_CACHE_KEY = "mdb-light-account-cache";
const ACCOUNT_CACHE_EVENT = "mdb-light-account-cache-updated";

let lastRawProfile: string | null = null;
let lastParsedProfile: CachedAccountProfile | null = null;

export function readCachedAccountProfile(): CachedAccountProfile | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(ACCOUNT_CACHE_KEY) ?? window.sessionStorage.getItem(ACCOUNT_CACHE_KEY);
  if (!raw) return null;

  if (raw === lastRawProfile) {
    return lastParsedProfile;
  }

  try {
    const parsed = JSON.parse(raw) as CachedAccountProfile;
    lastRawProfile = raw;
    lastParsedProfile = parsed;
    return parsed;
  } catch {
    lastRawProfile = null;
    lastParsedProfile = null;
    return null;
  }
}

export function writeCachedAccountProfile(profile: CachedAccountProfile) {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify(profile);
  window.localStorage.setItem(ACCOUNT_CACHE_KEY, payload);
  window.sessionStorage.setItem(ACCOUNT_CACHE_KEY, payload);
  lastRawProfile = payload;
  lastParsedProfile = profile;
  window.dispatchEvent(new Event(ACCOUNT_CACHE_EVENT));
}

export function clearCachedAccountProfile() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(ACCOUNT_CACHE_KEY);
  window.sessionStorage.removeItem(ACCOUNT_CACHE_KEY);
  lastRawProfile = null;
  lastParsedProfile = null;
  window.dispatchEvent(new Event(ACCOUNT_CACHE_EVENT));
}

export function subscribeCachedAccountProfile(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== ACCOUNT_CACHE_KEY) return;
    lastRawProfile = null;
    lastParsedProfile = null;
    onStoreChange();
  };

  const handleCustomUpdate = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(ACCOUNT_CACHE_EVENT, handleCustomUpdate);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(ACCOUNT_CACHE_EVENT, handleCustomUpdate);
  };
}
