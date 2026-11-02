## Context

```
 hoje                                       depois da fase 0a
 ────                                       ─────────────────
 page.tsx ──► payload-functions ──► Payload  page.tsx ──► @/content ──► providers/payload ──► Payload
 Hero.tsx ──► payload-types.ts               Hero.tsx ──► @/content/types
 FAQ.tsx  ──► @payloadcms/richtext-lexical   FAQ.tsx  ──► HTML sanitizado (string)
 actions  ──► payload.create                 actions  ──► createQuoteRequest()
```

As globals são lidas com `findGlobal({ depth: 2, locale })` e o resultado é forçado para `Populated*` com `as T`. Nada valida a forma. Os tipos gerados tornam quase tudo opcional (`?: … | null`), e os componentes compensam com pisos que mascaram o que é obrigatório (#8).

## Goals / Non-Goals

**Goals:**
- Nenhum ficheiro fora de `src/content/providers/` importa `payload`, `@payloadcms/*`, `@payload-config` ou `payload-types.ts`, com exceção de `src/payload.config.ts`, `src/collections/` e o route group `(payload)`.
- O HTML de cada página, em cada locale, fica idêntico ao de antes. A única exceção aceite é a diferença de markup do rich text, que tem de ser visualmente equivalente.
- Tipos de domínio que o Directus consiga produzir sem contorcionismos.

**Non-Goals:**
- Caching e invalidação (fase 0b).
- Seleção de provider por ambiente (fase 3, quando houver um segundo provider).
- Qualquer alteração ao schema do Payload.

## Decisions

### Módulo em `src/content/`, não em `src/service/`
`src/service/` mistura CMS com S3 (`s3.ts`, usado pela rota `/cdn`). O módulo novo fica com uma responsabilidade só:

```
src/content/
├── index.ts          API pública (funções) — o único import permitido aos consumidores
├── types.ts          tipos de domínio
├── rich-text.ts      sanitização do HTML de rich text
└── providers/
    └── payload.ts    Local API + zod + mapeamento → domínio
```

`index.ts` reexporta as funções do provider ativo, que nesta fase é sempre o Payload. A fase 3 transforma isto numa seleção.

### Tipos de domínio desenhados a partir do que a UI consome
Os tipos não espelham o schema; espelham as props. Exemplo: `Homepage.projects` é `{ enabled: boolean; heading: string | null; items: Project[] }`, e `items` é sempre um array, vazio quando não há. Um campo é `T | null` quando o editor pode deixá-lo vazio e a UI tem piso para isso. Um campo obrigatório para a UI fazer sentido (o `href` de um link, a `url` de uma media) é obrigatório no tipo, e o provider descarta o item que não o tenha, com log.

Alternativa considerada: manter `payload-types.ts` como tipos de domínio e só esconder as funções. Rejeitada, porque os tipos gerados *são* o acoplamento (`number | Service`, `id: number`, a forma Lexical).

### zod na fronteira do provider
O provider valida a resposta crua com um schema zod por global/coleção (zod já é dependência), e só depois mapeia. Regras para #4:
- **Falha de transporte** (base de dados em baixo, timeout): propaga-se. A página cai no error boundary do Next. Engolir o erro serviria uma página vazia com status 200 e cache.
- **Item inválido dentro de uma lista** (ex.: projeto sem `url`): é descartado, com `console.error` estruturado (slug, locale, id, caminho do campo). O resto da lista renderiza.
- **Global inteira inválida**: é erro, que se propaga.

### Rich text como HTML sanitizado
O Directus guarda rich text como HTML (interface WYSIWYG). O Payload guarda árvores Lexical. O denominador comum que ambos produzem é **HTML**. O provider Payload converte Lexical → HTML no servidor com o conversor HTML do `@payloadcms/richtext-lexical`, e `src/content/rich-text.ts` sanitiza-o com uma allowlist (parágrafos, ênfase, listas, links, quebras) antes de chegar ao domínio como `RichText` (tipo marcado: `string & { __brand: "RichText" }`). O `FAQSection` renderiza-o num único ponto com `dangerouslySetInnerHTML`, e o tipo marcado garante que só HTML já sanitizado chega ali.

Alternativa considerada: um AST próprio (`RichTextNode[]`) renderizado por componente. Dá mais controlo de estilo, mas obriga a escrever dois conversores (Lexical → AST e HTML → AST). Rejeitada pelo custo, porque o único rich text do site são as respostas das FAQ.

### Media com URL resolvida
`Media = { url: string; alt: string | null; width: number | null; height: number | null }`. O provider Payload já recebe `url` como `/cdn/<filename>` (o `generateFileURL` em `payload.config.ts`). O provider Directus vai montar o mesmo caminho a partir de `filename_disk`. Os componentes nunca constroem URLs de media.

### Fallback de locale é responsabilidade do provider
O Payload faz fallback (`localization.fallback: true`, default `en`). O contrato do módulo diz que **um campo localizado vazio no locale pedido chega com o valor do locale padrão**. O provider Payload cumpre-o de graça; o provider Directus vai ter de o implementar.

### `createQuoteRequest` e `findServicesBySlugs` no módulo
A Server Action continua a fazer validação zod, honeypot, tempo mínimo e `form.enabled`; isso é regra de negócio do formulário e não do CMS. O provider só faz I/O: procura serviços por slug e grava a submissão com `overrideAccess: true` (ver `fix-quote-requests-public-create`).

## Risks / Trade-offs

- [Diferenças de HTML no rich text] → Comparar o HTML renderizado das FAQ antes/depois em ambos os locales; aceitar diferenças só de markup (ex.: `<p>` extra), não de conteúdo.
- [Tipos mais estritos revelarem conteúdo já em falta em produção] → Itens descartados são registados. Antes do merge, correr a home e `/get-quote` contra um dump de produção e ler os logs.
- [Um PR muito grande] → Dividido em tasks por global. Cada global migra para o módulo num commit próprio, e o site compila e funciona entre commits.
- [Regras de import só por convenção] → Acrescentar uma regra Biome `noRestrictedImports` para `payload`, `@payloadcms/*` e `payload-types` fora de `src/content/providers/`, `src/collections/`, `src/payload.config.ts` e `(payload)`.

## Migration Plan

Merge para `develop`, deploy normal. Não há alterações de dados. Rollback: reverter o PR.

## Open Questions

- Sanitizador: `sanitize-html` (servidor, maduro) ou `isomorphic-dompurify`. A recomendação é `sanitize-html`, porque o rich text só é processado no servidor.
