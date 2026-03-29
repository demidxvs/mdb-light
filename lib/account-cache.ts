export type CachedAccountProfile = {
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
};

const ACCOUNT_CACHE_KEY = "mdb-light-account-cache";

export function readCachedAccountProfile(): CachedAccountProfile | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(ACCOUNT_CACHE_KEY) ?? window.sessionStorage.getItem(ACCOUNT_CACHE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CachedAccountProfile;
  } catch {
    return null;
  }
}

export function writeCachedAccountProfile(profile: CachedAccountProfile) {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify(profile);
  window.localStorage.setItem(ACCOUNT_CACHE_KEY, payload);
  window.sessionStorage.setItem(ACCOUNT_CACHE_KEY, payload);
}

export function clearCachedAccountProfile() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(ACCOUNT_CACHE_KEY);
  window.sessionStorage.removeItem(ACCOUNT_CACHE_KEY);
}
