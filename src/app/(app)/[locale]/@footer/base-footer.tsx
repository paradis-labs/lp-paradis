import Footer from "@/components/Footer";
import { getFooter } from "@/content";
import { requireLocale } from "@/i18n/require-locale";

// O footer de toda rota que não tenha uma composição própria no slot `@footer`
// — hoje `/`, as rotas de fixture, e qualquer rota futura que não se registe.
//
// Servido por três folhas, que só o reexportam: `default.tsx` (hard
// navigation), `page.tsx` (a raiz) e `[...catchAll]/page.tsx` (qualquer outra
// rota em soft navigation). Vive num só sítio para que as três não possam
// divergir. O nome não é uma convenção de rota de propósito: o Next ignora-o, e
// quem lê também não o confunde com uma folha.
//
// A busca da global mudou de sítio (vinha do `layout.tsx`) mas não de contagem:
// para um dado request só uma folha deste slot corre, então continua a ser uma
// query por request.
export default async function BaseFooter({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = requireLocale((await params).locale);
  const footerData = await getFooter(locale);

  return <Footer {...footerData} locale={locale} />;
}
