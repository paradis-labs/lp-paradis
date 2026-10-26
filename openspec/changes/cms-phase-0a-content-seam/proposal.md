## Why

Hoje o Payload não é um detalhe do site, é parte do código dele: seis componentes importam `payload-types.ts`, o `FAQSection` renderiza Lexical com `@payloadcms/richtext-lexical/react`, as páginas chamam `payload-functions.ts` e a Server Action chama `payload.create`. Enquanto for assim, trocar de CMS obriga a mexer em todos estes sítios de uma só vez. Esta é a primeira fase do roadmap `migrate-cms-to-directus`: introduzir uma costura (um módulo de conteúdo com tipos de domínio próprios) com o Payload como único provider e **zero mudança de comportamento visível**. Absorve também três issues que vivem na mesma camada: #8 (tipos demasiado opcionais), #4 (erros engolidos e casts sem validação) e #3 (fetch paralelo no layout).

## What Changes

- Novo módulo `src/content/`, único ponto de acesso a conteúdo para páginas, layouts, slots e Server Actions: `getNavBar`, `getFooter`, `getHomepage`, `getQuotePage`, `getContact`, `findServicesBySlugs` e `createQuoteRequest`.
- **Tipos de domínio** próprios em `src/content/types.ts`, que substituem `payload-types.ts` e os `Populated*` de `src/service/types.ts` em todos os consumidores. Um campo é opcional só quando o conteúdo pode legitimamente faltar (#8).
- **Provider Payload** em `src/content/providers/payload.ts`: chama a Local API, valida a resposta com zod e mapeia-a para os tipos de domínio. Uma falha de transporte propaga-se em vez de ser engolida, e uma forma inválida é registada com slug e locale (#4).
- **Rich text passa a ser HTML sanitizado** no domínio. O provider Payload converte Lexical em HTML no servidor, e o `FAQSection` deixa de importar `@payloadcms/richtext-lexical/react`.
- **Media** passa a ter forma de domínio (`url`, `alt`, `width`, `height`), com URLs `/cdn/<chave>` como hoje.
- O layout e as páginas pedem em paralelo o que for independente (#3).
- `src/service/payload-functions.ts` e `src/service/types.ts` saem. `getPayloadInstance()` passa a ser detalhe interno do provider.
- As fixtures (`footer`, `navbar`, `get-quote`) passam a construir props com os tipos de domínio.

## Capabilities

### New Capabilities

- `cms-content-source`: o contrato entre o site e o CMS (módulo único, tipos de domínio, validação na fronteira, rich text e media neutros, fallback de locale, isolamento do provider).

### Modified Capabilities

- `get-quote-page`: o requisito de origem do conteúdo deixa de nomear o Payload, `payload-functions.ts`, `depth: 2` e `getPayloadInstance()`, e passa a exigir o módulo de conteúdo.
- `quote-request-intake`: a persistência passa a ser feita pelo módulo de conteúdo em vez de `payload.create` na Server Action.

## Impact

- **Código:** novo `src/content/`; consumidores em `src/app/(app)/[locale]/` (`layout.tsx`, `(pages)/page.tsx`, `get-quote/page.tsx`, `get-quote/actions.ts`, folhas de `@footer`, fixtures); componentes `Hero`, `FAQSection`, `MarqueeServices`, `ProductsSection`, `TestimonialCard`, `TestimonialsSection`, `Footer`, `Header`, `ServicesSection`, `GetQuote`. Saem `src/service/payload-functions.ts` e `src/service/types.ts`.
- **Mantido:** `src/service/s3.ts` e a rota `/cdn`; o schema Payload (nenhuma migração de base de dados); `payload-types.ts`, agora importado só pelo provider.
- **Sequência:** depois de `fix-footer-slot-soft-navigation`. A fase 0b (`cms-phase-0b-content-cache`) assenta neste módulo.
- **Issues:** fecha #8, #4 e #3.
