import { cacheLife, cacheTag } from "next/cache";
import type { Locale } from "@/i18n/routing";
import {
  CONTENT_MAX_AGE_SECONDS,
  type ContentCollection,
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
// **As leituras são cacheadas aqui, num só sítio (#15)**, com `"use cache"`.
// Sem isto cada navegação — a troca de idioma incluída — refazia as mesmas
// queries ao CMS para conteúdo que muda raramente. O provider não sabe que há
// cache; os consumidores também não.
//
// O conteúdo vem do hcms (`providers/hcms.ts`). As suas variáveis de ambiente
// são validadas ao carregar este módulo: em falta, o site rebenta no arranque e
// não no primeiro pedido que lhe toque.
provider.assertHcmsEnv();

// O locale é argumento de cada função cacheada, por isso entra na chave: sem
// ele, o primeiro visitante a aquecer a entrada decidiria o idioma de todos os
// seguintes. As tags são as de `cache-tags.ts`, que o endpoint de revalidação
// invalida. Uma função por leitura, e não uma fábrica: um `"use cache"` põe na
// chave o que captura, e uma função capturada não é serializável.
function tag(read: ContentRead, locale: Locale) {
  cacheLife({ revalidate: CONTENT_MAX_AGE_SECONDS });
  cacheTag(
    readTag(read),
    readLocaleTag(read, locale),
    ...READ_COLLECTIONS[read].map(collectionTag),
  );
}

export async function getNavBar(locale: Locale) {
  "use cache";
  tag("navbar", locale);
  return provider.getNavBar(locale);
}

export async function getFooter(locale: Locale) {
  "use cache";
  tag("footer", locale);
  return provider.getFooter(locale);
}

export async function getHomepage(locale: Locale) {
  "use cache";
  tag("homepage", locale);
  return provider.getHomepage(locale);
}

export async function getQuotePage(locale: Locale) {
  "use cache";
  tag("quote-page", locale);
  return provider.getQuotePage(locale);
}

// O contacto é o e-mail do site: invalida-se pela tag `contact`, que a
// alteração do item `sites` no hcms também dispara.
const CONTACT: ContentCollection = "contact";

export async function getContact(locale: Locale) {
  "use cache";
  cacheLife({ revalidate: CONTENT_MAX_AGE_SECONDS });
  cacheTag(collectionTag(CONTACT));
  return provider.getContact(locale);
}

// Sem cache, de propósito. `isQuoteFormEnabled` é a válvula da Server Action:
// fechar o formulário no CMS tem de valer na submissão seguinte, não daqui a
// uma hora. As outras duas são a escrita e a sua preparação — duas submissões
// iguais são duas submissões.
export const { isQuoteFormEnabled, findServicesBySlugs, createQuoteRequest } =
  provider;

export type * from "./types";
