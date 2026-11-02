## Why

Depois de a janela de rollback da fase 4 fechar sem rollback, o Payload é peso morto dentro do site: o admin e a API continuam montados, a imagem arrasta `payload`, `@payloadcms/*` e o adaptador de Postgres, e cada bump do Next continua refém do `withPayload`. Com as imagens a vir do hcms, também a rota `/cdn` e o acesso direto ao bucket S3 deixam de ter uso. É a última fase do roadmap `migrate-cms-to-directus`: retirar tudo o que existia só por causa do Payload, incluindo o código transitório das fases anteriores.

## What Changes

- **BREAKING:** saem do site `/admin` e `/api` do Payload, ou seja, o route group `src/app/(payload)/`.
- **BREAKING:** saem `src/payload.config.ts`, `src/collections/` (incluindo os hooks de revalidação da fase 0b e o interruptor `PAYLOAD_READ_ONLY` da fase 4), `payload-types.ts` e o provider `src/content/providers/payload.ts`.
- **BREAKING:** sai a rota `/cdn/<chave>` (`src/app/cdn/`), com `src/service/s3.ts`, as variáveis `S3_*` e o `@aws-sdk/client-s3`. As imagens vêm de `${CMS_URL}/assets/<id>` desde o cutover. Links externos para URLs `/cdn/…` antigos deixam de funcionar.
- Sai a seleção `CMS_PROVIDER`: o módulo de conteúdo passa a usar sempre o provider hcms.
- `next.config.ts` deixa de usar `withPayload`. A cache passa de `unstable_cache` para `"use cache"` com `cacheComponents: true`, com as mesmas tags e os ajustes que a spike da 0b registou.
- Saem as dependências `payload`, `@payloadcms/{db-postgres,next,richtext-lexical,storage-s3,translations}` e `graphql`. `sharp` só sai se o `next/image` em standalone não o exigir.
- Saem as variáveis `PAYLOAD_SECRET`, `DATABASE_URL`, `CMS_PROVIDER` e `S3_*` do site.
- Saem os scripts que dependiam da Local API do Payload: `cms/parity/`, `cms/hcms/verify-content.ts` e `cms/hcms/import-submissions.ts`. `cms/hcms/check-contract.ts` fica, porque só lê o hcms.
- A regra de lint da fase 0a passa a restringir `@directus/sdk` a `src/content/providers/`.
- A base de dados do Payload é arquivada (dump) e desligada. O bucket S3 do Payload fica a cargo de quem gere a infra.
- `CLAUDE.md` e `README.md` deixam de descrever o Payload.

## Capabilities

### New Capabilities

_(nenhuma)_

### Modified Capabilities

- `cms-content-source`: deixa de haver seleção de provider e paridade entre providers; a restrição de imports passa a ser sobre o SDK do Directus; as imagens vêm só do hcms.
- `cms-content-cache`: a invalidação passa a ser feita só pelo Flow do hcms.
- `quote-request-intake`: o requisito de acesso deixa de descrever o Payload.
- `container-build-pipeline`: a imagem do site deixa de servir `/admin`.

## Impact

- **Código removido:** `src/app/(payload)/`, `src/app/cdn/`, `src/service/`, `src/collections/`, `src/payload.config.ts`, `payload-types.ts`, `src/content/providers/payload.ts`, `cms/parity/` e os scripts do hcms que usam o Payload.
- **Dependências:** ver acima. A imagem do site fica mais pequena e o build mais rápido (medir com a capability `build-time-measurement`).
- **Infra:** dump final e desligar a base do Payload; remover segredos; decidir o destino do bucket S3.
- **Specs com referências ao "admin" do Payload** (`footer-content-authority`, `footer-direct-contact-band`, `calendly-popup-cta`, `change-landing`) falam do admin como interface editorial em geral, e continuam válidas com o hcms. Não são alteradas aqui.
- **Sequência:** só depois de a janela de rollback da fase 4 fechar.
