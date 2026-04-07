import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { LocaleProvider } from "@/components/ui/locale-provider";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.mdblight.com"),
  title: {
    default: "MDB Light (MDB) - LED Lighting in Riga, Latvia & Cyprus",
    template: "%s | MDB Light",
  },
  description: "MDB Light (MDB) is a multilingual LED lighting marketplace for Riga, Latvia and Cyprus with track systems, lighting installation and commercial product supply.",
  keywords: ["MDB", "MDB Light", "lighting Riga", "освещение в Риге", "LED lighting Latvia", "lighting Cyprus"],
  icons: {
    icon: "/logo/logo-notext.svg",
    shortcut: "/logo/logo-notext.svg",
    apple: "/logo/logo-notext.svg",
  },
  openGraph: {
    siteName: "MDB Light",
    type: "website",
    title: "MDB Light (MDB) - LED Lighting in Riga, Latvia & Cyprus",
    description: "MDB Light supplies LED lighting, track systems and installation support in Riga, Latvia and Cyprus.",
    images: [{ url: "/hero/hero-banner.png" }],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const headerLocale = headerStore.get("x-mdb-locale");
  const cookieLocale = cookieStore.get("mdb-light-locale")?.value;
  const locale = isLocale(headerLocale)
    ? headerLocale
    : isLocale(cookieLocale)
      ? cookieLocale
      : defaultLocale;
  const messages = getMessages(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <LocaleProvider initialLocale={locale} initialMessages={messages}>
          {children}
          <CookieConsent />
        </LocaleProvider>
      </body>
    </html>
  );
}
