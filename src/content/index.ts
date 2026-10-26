import { unstable_cache } from "next/cache";
import type { Locale } from "@/i18n/routing";
import {
  CONTENT_MAX_AGE_SECONDS,
  type ContentRead,
  collectionTag,
  READ_COLLECTIONS,
  readLocaleTag,
  readTag,
} from "./cache-tags";
import * as provider from "./providers/hcms";

// A API pública do conteúdo do site — o único import permitido a páginas,
// layouts, slots e Server Actions (`@/content`).
//
// **As leituras são cacheadas aqui, num só sítio (#15).** Sem isto cada
// navegação — a troca de idioma incluída — refazia as mesmas queries ao CMS
// para conteúdo que muda raramente. O provider não sabe que há cache; os
// consumidores também não.
//
// O conteúdo vem do hcms (`providers/hcms.ts`). As suas variáveis de ambiente
// são validadas ao carregar este módulo: em falta, o site rebenta no arranque e
// não no primeiro pedido que lhe toque.
provider.assertHcmsEnv();

// O locale vai na chave **e** nas tags. Sem ele na chave, o primeiro visitante
// a aquecer a entrada decidia o idioma de todos os seguintes. `hcms` na chave
// separa estas entradas das do Payload, que leu o site até à fase 5 e cuja
// cache pode ainda estar em `.next`.
function cachedRead<T>(
  read: ContentRead,
  load: (locale: Locale) => Promise<T>,
): (locale: Locale) => Promise<T> {
  return (locale) =>
    unstable_cache(() => load(locale), ["content", "hcms", read, locale], {
      tags: [
        readTag(read),
        readLocaleTag(read, locale),
        ...READ_COLLECTIONS[read].map(collectionTag),
      ],
      revalidate: CONTENT_MAX_AGE_SECONDS,
    })();
}

export const getNavBar = cachedRead("navbar", provider.getNavBar);
export const getFooter = cachedRead("footer", provider.getFooter);
export const getHomepage = cachedRead("homepage", provider.getHomepage);
export const getQuotePage = cachedRead("quote-page", provider.getQuotePage);

// O contacto é o e-mail do site: invalida-se pela tag `contact`, que a
// alteração do item `sites` no hcms também dispara.
export const getContact = (locale: Locale) =>
  unstable_cache(
    () => provider.getContact(locale),
    ["content", "hcms", "contact", locale],
    {
      tags: [collectionTag("contact")],
      revalidate: CONTENT_MAX_AGE_SECONDS,
    },
  )();

// Sem cache, de propósito. `isQuoteFormEnabled` é a válvula da Server Action:
// fechar o formulário no CMS tem de valer na submissão seguinte, não daqui a
// uma hora. As outras duas são a escrita e a sua preparação — duas submissões
// iguais são duas submissões.
export const { isQuoteFormEnabled, findServicesBySlugs, createQuoteRequest } =
  provider;

export type * from "./types";
