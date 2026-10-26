import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import CursorFollower from "@/components/CursorFollower";
import Header from "@/components/Header";
import HydrationSignal from "@/components/HydrationSignal";
import NavigationProgress from "@/components/NavigationProgress";
import SmoothScroll from "@/components/SmoothScroll";
import { getNavBar } from "@/content";
import { gilroy } from "@/fonts/gilroy";
import type { Locale } from "@/i18n/routing";

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
  const { locale } = (await params) as { locale: Locale };

  const headerData = await getNavBar(locale);

  return (
    <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`antialiased ${inter.className} ${gilroy.variable}`}>
        <HydrationSignal />
        <CursorFollower />
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
