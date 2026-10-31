import Footer from "@/components/Footer";
import { getFooter } from "@/content";
import { requireLocale } from "@/i18n/require-locale";

// O footer da página de orçamento: o mesmo componente das outras rotas, sem a
// faixa "Ready to build?" — a página já é o destino desse CTA. É esta folha do
// slot `@footer` que faz disso uma coisa de uma rota só: o mapeamento rota →
// composição vive aqui, em código, e não numa flag do CMS, que ligaria a
// variante em todo o lado ou em lado nenhum (`route-scoped-footer`).
//
// O contacto direto e as redes, que esta folha montava numa faixa própria,
// passaram para o aside da página (`quote-contact-aside`), e a busca do
// `Contact` foi com eles. O total de leituras por request não muda.
export default async function GetQuoteFooter({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = requireLocale((await params).locale);
  const footerData = await getFooter(locale);

  return <Footer {...footerData} locale={locale} ctaBand={false} />;
}
