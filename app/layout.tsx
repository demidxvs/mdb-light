import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { LocaleProvider } from "@/components/ui/locale-provider";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mdb-light.com"),
  title: {
    default: "MDB Light",
    template: "%s | MDB Light",
  },
  description: "LED lighting marketplace for Riga, Latvia and Cyprus with multilingual catalog and installation services.",
  icons: {
    icon: "/logo/mdb-light-logo.svg",
    shortcut: "/logo/mdb-light-logo.svg",
  },
  openGraph: {
    siteName: "MDB Light",
    type: "website",
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
        </LocaleProvider>
      </body>
    </html>
  );
}
