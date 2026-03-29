import type { Metadata } from "next";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import { LocaleProvider } from "@/components/ui/locale-provider";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MDB Light",
  description: "LED lighting marketplace with multilingual catalog and admin workflow.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("mdb-light-locale")?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const messages = getMessages(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${dmSans.variable} ${display.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
