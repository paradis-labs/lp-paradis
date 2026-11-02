import type { MetadataRoute } from "next";
import { getProductSlugs, getSiteSeo } from "@/content";
import { type Locale, locales } from "@/i18n/routing";

// O sitemap das páginas públicas nos dois idiomas, com os alternates de idioma
// (`seo-metadata`). As fixtures ficam de fora: são só de desenvolvimento.
//
// Um sitemap exige URLs absolutos: sem o `frontend_url` do site, sai vazio (o
// provider já registou o campo em falta), e não com um domínio inventado.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [seo, slugs] = await Promise.all([getSiteSeo("en"), getProductSlugs()]);
  const { baseUrl } = seo;
  if (!baseUrl) return [];

  const url = (locale: Locale, path: string) => `${baseUrl}/${locale}${path}`;
  const paths = [
    "",
    "/products",
    ...slugs.map((slug) => `/products/${slug}`),
    "/get-quote",
  ];

  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: url(locale, path),
      alternates: {
        languages: Object.fromEntries(
          locales.map((code) => [code, url(code, path)]),
        ),
      },
    })),
  );
}
