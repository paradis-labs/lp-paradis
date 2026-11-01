import type { Metadata } from "next";
import type { Media, SiteSeo } from "@/content";
import { type Locale, locales, routing } from "@/i18n/routing";

// Os metadados de partilha e de idioma de uma página (`seo-metadata`).
//
// **Porquê um só sítio.** O Next.js funde os metadados do layout e da página
// campo a campo, mas só no primeiro nível: um `openGraph` na página substitui o
// do layout inteiro, e com ele a imagem, o `siteName` e o `locale`. Cada página
// chama isto para montar o objecto completo, em vez de o repetir à mão.
//
// Os caminhos replicam o `localePrefix: "always"` do next-intl, como
// `locale-href.ts` (ver o aviso de acoplamento nesse ficheiro).

const OG_LOCALE: Record<Locale, string> = { en: "en_US", pt: "pt_AO" };

// O piso do `og:site_name`, o mesmo do `<title>` do layout.
export const SITE_NAME = "Paradis";

const localePath = (locale: Locale, path: string) => `/${locale}${path}`;

/**
 * `path` é o caminho da página sem o locale (`""` na home, `/products`),
 * ou `null` fora de uma página com URL própria (o layout): sem canonical nem
 * `og:url`.
 */
export function pageMetadata(
  seo: SiteSeo,
  locale: Locale,
  path: string | null,
  page: {
    title?: string | null;
    description?: string | null;
    image?: Media | null;
  } = {},
): Metadata {
  const image = page.image ?? seo.image;
  const title = page.title || seo.defaultTitle || SITE_NAME;
  const description = page.description || seo.description;
  // Os URLs relativos resolvem-se pelo `metadataBase` do layout, que só existe
  // com `baseUrl`: sem ele, o Next.js inventaria um `localhost`.
  const linked = path !== null && seo.baseUrl !== null;

  return {
    ...(linked
      ? {
          alternates: {
            canonical: localePath(locale, path),
            languages: {
              ...Object.fromEntries(
                locales.map((code) => [code, localePath(code, path)]),
              ),
              "x-default": localePath(routing.defaultLocale, path),
            },
          },
        }
      : {}),
    openGraph: {
      type: "website",
      siteName: seo.defaultTitle || SITE_NAME,
      locale: OG_LOCALE[locale],
      alternateLocale: locales
        .filter((code) => code !== locale)
        .map((code) => OG_LOCALE[code]),
      title,
      ...(description ? { description } : {}),
      ...(linked ? { url: localePath(locale, path) } : {}),
      ...(image
        ? {
            images: [
              {
                url: image.url,
                ...(image.width ? { width: image.width } : {}),
                ...(image.height ? { height: image.height } : {}),
                ...(image.alt ? { alt: image.alt } : {}),
              },
            ],
          }
        : {}),
    },
    // O X lê as `og:*` que faltam nas `twitter:*`: basta o tipo do cartão.
    twitter: { card: "summary_large_image" },
  };
}
