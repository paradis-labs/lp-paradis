import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { getProduct, getProductSlugs, getSiteSeo } from "@/content";
import { requireLocale } from "@/i18n/require-locale";
import { pageMetadata } from "@/lib/page-metadata";

interface ProductRouteProps {
  params: Promise<{ locale: string; slug: string }>;
}

// Os slugs são os mesmos nos dois idiomas (o de `en-US`); o `locale` vem do
// `generateStaticParams` do layout. Com `cacheComponents`, um parâmetro sem
// valores conhecidos é erro de build.
export async function generateStaticParams() {
  return (await getProductSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProductRouteProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = requireLocale(raw);
  const [content, seo] = await Promise.all([
    getProduct(locale, slug),
    getSiteSeo(locale),
  ]);
  if (!content) return {};

  const title = content.product.title.trim();
  const description = content.product.description.trim();
  // A partilha mostra a capa do produto (a variante 1200×630); sem capa, a
  // imagem do site.
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...pageMetadata(seo, locale, `/products/${slug}`, {
      title,
      description,
      image: content.product.shareImage,
    }),
  };
}

export default async function ProductRoute({ params }: ProductRouteProps) {
  const { locale: raw, slug } = await params;
  const locale = requireLocale(raw);
  const content = await getProduct(locale, slug);
  if (!content) notFound();

  return <ProductDetail content={content} locale={locale} />;
}
