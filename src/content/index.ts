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
import * as hcms from "./providers/hcms";
import * as payload from "./providers/payload";

// A API pública do conteúdo do site — o único import permitido a páginas,
// layouts, slots e Server Actions (`@/content`).
//
// **As leituras são cacheadas aqui, num só sítio (#15).** Sem isto cada
// navegação — a troca de idioma incluída — refazia as mesmas queries ao CMS
// para conteúdo que muda raramente. O provider não sabe que há cache; os
// consumidores também não.
//
// `unstable_cache` e não `"use cache"`: o segundo só existe com
// `cacheComponents`, que muda o rendering da app inteira — incluindo o admin do
// Payload, que corre neste processo. A spike está registada em
// `openspec/changes/cms-phase-0b-content-cache/design.md`. A troca para
// `"use cache"` fica para a fase 5, quando o Payload sair; as tags não mudam.
//
// **O provider escolhe-se aqui, uma vez, por `CMS_PROVIDER`** (`payload` |
// `hcms`, default `payload`). Nenhum consumidor sabe qual é. Um valor inválido,
// ou o hcms sem as suas variáveis, rebenta ao carregar o módulo, e não no
// primeiro pedido que lhe toque. A variável é transitória: sai na fase 5, com o
// Payload.

// O contrato que os dois providers cumprem. Um provider a que falte uma função,
// ou com outra assinatura, não compila.
type ContentProvider = Pick<
  typeof payload,
  | "getNavBar"
  | "getFooter"
  | "getHomepage"
  | "getQuotePage"
  | "getContact"
  | "isQuoteFormEnabled"
  | "findServicesBySlugs"
  | "createQuoteRequest"
>;

const PROVIDERS = { payload, hcms } satisfies Record<string, ContentProvider>;
type ProviderName = keyof typeof PROVIDERS;

function selectProvider(): { name: ProviderName; provider: ContentProvider } {
  const name = process.env.CMS_PROVIDER?.trim() || "payload";
  if (!Object.hasOwn(PROVIDERS, name)) {
    throw new Error(
      `[content] CMS_PROVIDER="${name}" inválido. Valores aceites: ${Object.keys(PROVIDERS).join(", ")}`,
    );
  }
  if (name === "hcms") hcms.assertHcmsEnv();
  return {
    name: name as ProviderName,
    provider: PROVIDERS[name as ProviderName],
  };
}

const { name: providerName, provider } = selectProvider();

// O locale vai na chave **e** nas tags. Sem ele na chave, o primeiro visitante
// a aquecer a entrada decidia o idioma de todos os seguintes. O provider vai
// na chave e não nas tags: a cache do Next persiste em `.next` entre restarts,
// e trocar de CMS não pode servir entradas do outro. As tags são as mesmas
// para os dois, porque quem invalida não sabe qual está ativo.
function cachedRead<T>(
  read: ContentRead,
  load: (locale: Locale) => Promise<T>,
): (locale: Locale) => Promise<T> {
  return (locale) =>
    unstable_cache(
      () => load(locale),
      ["content", providerName, read, locale],
      {
        tags: [
          readTag(read),
          readLocaleTag(read, locale),
          ...READ_COLLECTIONS[read].map(collectionTag),
        ],
        revalidate: CONTENT_MAX_AGE_SECONDS,
      },
    )();
}

export const getNavBar = cachedRead("navbar", provider.getNavBar);
export const getFooter = cachedRead("footer", provider.getFooter);
export const getHomepage = cachedRead("homepage", provider.getHomepage);
export const getQuotePage = cachedRead("quote-page", provider.getQuotePage);

// O contacto é uma coleção lida directamente, não uma global: invalida-se só
// pela tag da própria coleção (no hcms, o e-mail do site).
export const getContact = (locale: Locale) =>
  unstable_cache(
    () => provider.getContact(locale),
    ["content", providerName, "contact", locale],
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
