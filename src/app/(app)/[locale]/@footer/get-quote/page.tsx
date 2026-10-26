import Footer from "@/components/Footer";
import { getContact, getFooter } from "@/content";
import { requireLocale } from "@/i18n/require-locale";

// O footer da página de orçamento: o mesmo componente das outras rotas, mais a
// faixa de contacto direto. É esta folha do slot `@footer` que faz da faixa uma
// coisa de uma rota só — o mapeamento rota → composição vive aqui, em código, e
// não numa flag do CMS, que ligaria a faixa em todo o lado ou em lado nenhum.
//
// A faixa junta duas fontes. Os títulos vêm do grupo `directContact` da global
// `footer`, que é cópia traduzível; o endereço vem do contacto da empresa, que
// é um facto com dono próprio e não se traduz. Até aqui a folha passava
// `directContact.emailHeading` — o título "Email Us" — como se fosse o endereço,
// e a faixa mostrava `mailto:Email Us`.
//
// A busca do `Contact` acontece **só aqui**. É a razão de a faixa não custar
// nada às outras rotas: as folhas genéricas do slot não a conhecem, e para um
// dado request só uma folha corre.
export default async function GetQuoteFooter({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = requireLocale((await params).locale);

  // Independentes uma da outra: nenhuma espera pela outra.
  const [footerData, contact] = await Promise.all([
    getFooter(locale),
    getContact(locale),
  ]);

  const contactBand = {
    reachHeading: footerData.directContact?.reachHeading,
    socialHeading: footerData.directContact?.socialHeading,
    email: contact?.email,
  };

  return <Footer {...footerData} locale={locale} contactBand={contactBand} />;
}
