import type { Metadata } from "next";
import { cache } from "react";
import GetQuote from "@/components/GetQuote";
import { getQuotePage } from "@/content";
import { requireLocale } from "@/i18n/require-locale";
import type { Locale } from "@/i18n/routing";

interface GetQuoteRouteProps {
  params: Promise<{ locale: string }>;
}

const getContent = cache((locale: Locale) => getQuotePage(locale));

export async function generateMetadata({
  params,
}: GetQuoteRouteProps): Promise<Metadata> {
  const locale = requireLocale((await params).locale);
  const content = await getContent(locale);

  const title = content.seo.metaTitle?.trim();
  const description = content.seo.metaDescription?.trim();

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
  };
}

export default async function GetQuoteRoute({ params }: GetQuoteRouteProps) {
  const locale = requireLocale((await params).locale);
  const content = await getContent(locale);

  return <GetQuote {...content} locale={locale} />;
}
