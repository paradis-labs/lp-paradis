import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import CursorLoader from "@/components/Cursor";
import Header from "@/components/Header";
import HydrationSignal from "@/components/HydrationSignal";
import NavigationProgress from "@/components/NavigationProgress";
import SmoothScroll from "@/components/SmoothScroll";
import { getNavBar } from "@/content";
import { gilroy } from "@/fonts/gilroy";
import { requireLocale } from "@/i18n/require-locale";
import { locales } from "@/i18n/routing";

// Com `cacheComponents`, um root param sem valores conhecidos é erro de build:
// os dois idiomas são pré-renderizados.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Paradis",
  description: "",
};

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
  footer,
  params,
}: Readonly<{
  children: React.ReactNode;
  footer: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const locale = requireLocale((await params).locale);

  const headerData = await getNavBar(locale);

  return (
    <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`antialiased ${inter.className} ${gilroy.variable}`}>
        <HydrationSignal />
        <CursorLoader />
        <NavigationProgress />
        <SmoothScroll>
          <Header {...headerData} locale={locale} />
          {children}
          {footer}
        </SmoothScroll>
      </body>
    </html>
  );
}
