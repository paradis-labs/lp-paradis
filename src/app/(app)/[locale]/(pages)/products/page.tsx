import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ProductsListing from "@/components/ProductsListing";
import { getProductsPage } from "@/content";
import { requireLocale } from "@/i18n/require-locale";
import type { Locale } from "@/i18n/routing";
import { textOr } from "@/lib/cms-text";

interface ProductsRouteProps {
  params: Promise<{ locale: string }>;
}

// Os pisos do cabeçalho: o texto do mockup, que é o mesmo do bloco `#products`
// da home de onde o cabeçalho vem.
const FALLBACK: Record<
  Locale,
  { eyebrow: string; title: string; lead: string }
> = {
  en: {
    eyebrow: "Our Products",
    title: "Digital Products Built to Solve Real Problems",
    lead: "We create innovative digital products focused on usability, performance, and real business impact. Designed to simplify experiences and help businesses grow smarter.",
  },
  pt: {
    eyebrow: "Produtos",
    title: "Produtos digitais feitos para resolver problemas reais",
    lead: "Criamos produtos digitais inovadores, focados na usabilidade, no desempenho e no impacto real no negócio. Pensados para simplificar experiências e ajudar as empresas a crescer de forma mais inteligente.",
  },
};

// Um campo vazio cai na `metadata` estática do layout, e não no piso: o piso é
// para o ecrã, e um `<title>` inventado esconderia que o CMS não o tem.
export async function generateMetadata({
  params,
}: ProductsRouteProps): Promise<Metadata> {
  const locale = requireLocale((await params).locale);
  const content = await getProductsPage(locale);

  const title = content.title?.trim();
  const description = content.lead?.trim();

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
  };
}

export default async function ProductsRoute({ params }: ProductsRouteProps) {
  const locale = requireLocale((await params).locale);
  const content = await getProductsPage(locale);
  const fallback = FALLBACK[locale];

  return (
    <main>
      <PageHeader
        eyebrow={textOr(content.eyebrow, fallback.eyebrow)}
        title={textOr(content.title, fallback.title)}
        lead={textOr(content.lead, fallback.lead)}
      />
      <ProductsListing items={content.items} locale={locale} />
    </main>
  );
}
