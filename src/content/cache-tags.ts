// As tags de cache do conteúdo — o contrato entre o site e quem invalida.
//
// **Os nomes são do módulo de conteúdo, não do CMS.** Hoje quem invalida são
// os hooks do Payload (`src/collections/hooks/revalidate.ts`); na fase 3 de
// `migrate-cms-to-directus` passa a ser um Flow do Directus a chamar um
// endpoint do site. Os dois mapeiam o que mudou no CMS para estas tags, e
// nenhum inventa as suas: é isso que deixa trocar de CMS sem tocar na cache.
//
// Três níveis, porque uma leitura depende de mais do que a sua global:
//
//   cms:<leitura>             a leitura em todos os locales
//   cms:<leitura>:<locale>    a leitura num locale
//   cms:collection:<nome>     toda leitura que popula essa coleção
//
// A homepage popula serviços, projectos, testemunhos e FAQs; editar um serviço
// tem de a invalidar, e invalida-a pela tag da coleção, não pela da global.

import type { Locale } from "@/i18n/routing";

/** As leituras cacheadas do módulo. Uma por função `get*` de `@/content`. */
export type ContentRead = "navbar" | "footer" | "homepage" | "quote-page";

/** As coleções que alguma leitura popula. */
export type ContentCollection =
  | "contact"
  | "hero"
  | "services"
  | "projects"
  | "testimonials"
  | "faqs"
  | "media";

export const readTag = (read: ContentRead) => `cms:${read}`;

export const readLocaleTag = (read: ContentRead, locale: Locale) =>
  `cms:${read}:${locale}`;

export const collectionTag = (collection: ContentCollection) =>
  `cms:collection:${collection}`;

/** O que cada leitura popula — e portanto o que a deve invalidar. */
export const READ_COLLECTIONS: Record<ContentRead, ContentCollection[]> = {
  navbar: ["media"],
  footer: ["media"],
  homepage: ["hero", "services", "projects", "testimonials", "faqs", "media"],
  "quote-page": ["services"],
};

// ── Invalidação vinda do hcms ──────────────────────────────────────────────
//
// O Flow do hcms chama `POST /api/cms/revalidate` com a coleção alterada, e
// este mapa traduz-a para as tags acima. Com o hcms, uma página (`pages`,
// `page_blocks`, `block_*`) alimenta a homepage, a página de orçamento e a
// faixa de contacto do footer (o `block_contact`), por isso invalida as três.

const PAGE_READS = [
  readTag("homepage"),
  readTag("quote-page"),
  readTag("footer"),
];

const HCMS_COLLECTION_TAGS: Record<string, string[]> = {
  // O site dá o logo, a tagline, o copyright, as redes e o e-mail.
  sites: [readTag("navbar"), readTag("footer"), collectionTag("contact")],
  navigations: [readTag("navbar"), readTag("footer")],
  navigation_items: [readTag("navbar"), readTag("footer")],
  pages: PAGE_READS,
  page_blocks: PAGE_READS,
  offerings: [collectionTag("services")],
  projects: [collectionTag("projects")],
  testimonials: [collectionTag("testimonials")],
  faqs: [collectionTag("faqs")],
  forms: [readTag("quote-page")],
  form_fields: [readTag("quote-page")],
  directus_files: [collectionTag("media")],
};

/**
 * As coleções do hcms que o site conhece. Revalidar todas cobre todas as
 * entradas da cache: cada entrada tem a tag da sua leitura (ou, o contacto, a
 * de `contact`), e alguma destas coleções invalida-a. Usado pela revalidação
 * total do runbook de cutover (`cms/revalidate-all.ts`).
 */
export const HCMS_COLLECTIONS = Object.keys(HCMS_COLLECTION_TAGS);

/**
 * As tags a invalidar quando uma coleção do hcms muda, ou `null` se o site não
 * a conhece. As traduções (`offerings_translations`) contam como a coleção, e
 * qualquer `block_*` como uma página.
 */
export function hcmsCollectionTags(collection: string): string[] | null {
  const base = collection.replace(/_translations$/, "");
  if (Object.hasOwn(HCMS_COLLECTION_TAGS, base))
    return HCMS_COLLECTION_TAGS[base];
  if (base.startsWith("block_")) return PAGE_READS;
  return null;
}

/**
 * A rede de segurança: mesmo sem invalidação, uma entrada expira ao fim disto.
 * Um hook que falhe deixa conteúdo antigo no máximo este tempo, não para
 * sempre. Uma hora: o conteúdo muda raramente, e uma edição perdida corrige-se
 * sozinha antes de alguém ter de a reportar.
 */
export const CONTENT_MAX_AGE_SECONDS = 60 * 60;
