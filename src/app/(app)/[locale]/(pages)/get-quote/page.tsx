import type { Metadata } from "next";
import { cache } from "react";
import GetQuote from "@/components/GetQuote";
import { getContact, getFooter, getQuotePage } from "@/content";
import { requireLocale } from "@/i18n/require-locale";
import type { Locale } from "@/i18n/routing";
import { localizedCtaHref } from "@/lib/locale-href";

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

  // As três leituras são independentes e estão todas cacheadas. O `getFooter`
  // repete o da folha `@footer` deste request, e é um hit de cache: o aside
  // usa os títulos de contacto, as redes e o botão de chamada do footer, que é
  // onde esse conteúdo já vivia.
  const [content, footer, contact] = await Promise.all([
    getContent(locale),
    getFooter(locale),
    getContact(locale),
  ]);

  const callHref = localizedCtaHref(footer.cta.outlineButton.href, locale);
  const callLabel = footer.cta.outlineButton.label?.trim();

  return (
    <GetQuote
      {...content}
      locale={locale}
      aside={{
        reachHeading: footer.directContact.reachHeading,
        socialHeading: footer.directContact.socialHeading,
        email: contact?.email ?? null,
        call:
          callHref && callLabel ? { label: callLabel, href: callHref } : null,
        socialLinks: footer.socialLinks,
      }}
    />
  );
}
