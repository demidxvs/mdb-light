export const PUBLIC_SITE_URL = "https://www.mdblight.com";

export function getPublicSiteUrl() {
  return PUBLIC_SITE_URL;
}

export function buildPublicUrl(pathname: string) {
  return new URL(pathname, PUBLIC_SITE_URL).toString();
}
