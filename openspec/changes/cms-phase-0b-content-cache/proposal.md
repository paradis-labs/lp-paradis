## Why

Cada navegação, incluindo a troca de idioma, refaz as mesmas queries ao CMS para conteúdo que muda raramente: navbar, homepage e footer, cada uma com relações populadas a dois níveis (#15). Não há caching nenhum na camada de dados. Depois da fase 0a todo o acesso passa por `@/content`, o que permite cachear num único sítio e definir as tags de invalidação **no módulo e não no CMS**, para que o Payload hoje e o Directus na fase 3 invalidem as mesmas tags.

## What Changes

- As leituras do módulo de conteúdo passam a ser cacheadas por função e por locale, com tags definidas em `src/content/cache-tags.ts` (`cms:navbar:en`, `cms:homepage:pt`, …) e uma tag por coleção para conteúdo partilhado entre globals.
- O mecanismo de cache é decidido por uma spike no início da change:
  - **`"use cache"` + `cacheTag` + `cacheLife`** (o modelo recomendado no Next 16), se ligar `cacheComponents: true` for compatível com o route group `(payload)` que corre no mesmo processo;
  - **`unstable_cache`** (modelo anterior, ainda suportado) se não for. A troca para `use cache` passa então para a fase 5, quando o Payload sair do processo.
- **Invalidação provisória pelo Payload:** hooks `afterChange`/`afterDelete` nas globals e coleções chamam `revalidateTag` com as tags do módulo. Estes hooks são apagados na fase 5. O webhook Directus da fase 3 invalida as mesmas tags.
- As escritas (`createQuoteRequest`) não são cacheadas.
- Prerender por locale: `generateStaticParams` no segmento `[locale]` com `en` e `pt`. Este passo depende de o #16 (`fix-wave-0-independent-issues`) já ter sido feito e, se não tiver sido, fica de fora desta change.

## Capabilities

### New Capabilities

- `cms-content-cache`: cache das leituras de conteúdo por locale, contrato de tags independente do provider, invalidação ao publicar, e ausência de cache nas escritas.

### Modified Capabilities

_(nenhuma)_

## Impact

- **Código:** `src/content/index.ts` (camada de cache), `src/content/cache-tags.ts` (novo), hooks em `src/collections/**`, `src/app/(app)/[locale]/layout.tsx` (`generateStaticParams`), possivelmente `next.config.ts` (`cacheComponents`).
- **Infra:** o cache vive no disco e na memória de cada instância. O deploy é de instância única, e deixa de o ser se houver réplicas (ver design).
- **Sequência:** depois de `cms-phase-0a-content-seam`. O prerender só entra se o #16 já estiver feito.
- **Issues:** fecha #15. O issue sugere `unstable_cache` e indica o #4 como dependência do prerender, quando a dependência real é o #16: corrigir no comentário de fecho.
