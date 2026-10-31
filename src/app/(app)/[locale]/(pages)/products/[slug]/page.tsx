import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { getProduct, getProductSlugs } from "@/content";
import { requireLocale } from "@/i18n/require-locale";

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
  const content = await getProduct(requireLocale(raw), slug);
  if (!content) return {};

  const title = content.product.title.trim();
  const description = content.product.description.trim();
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
  };
}

export default async function ProductRoute({ params }: ProductRouteProps) {
  const { locale: raw, slug } = await params;
  const locale = requireLocale(raw);
  const content = await getProduct(locale, slug);
  if (!content) notFound();

  return <ProductDetail content={content} locale={locale} />;
}
