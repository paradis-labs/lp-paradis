## Context

```
                 módulo de conteúdo
                 ┌─────────────────────────────────────┐
  páginas ─────► │ getNavBar(locale)    tag cms:navbar:<l>│
                 │ getHomepage(locale)  tag cms:homepage:<l>│ ◄── tags definidas aqui
                 │ getFooter(locale)    tag cms:footer:<l>│
                 └───────────────┬─────────────────────┘
                     provider    │
              ┌──────────────────┴──────────────────┐
       Payload (fases 0b–4)                 Directus (fase 3 →)
  afterChange → revalidateTag(tag)   webhook → /api/cms/revalidate → revalidateTag(tag)
     (apagado na fase 5)                       (permanente)
```

O Next 16 tem dois modelos de cache. `"use cache"` só existe com `cacheComponents: true`, e esta opção muda o rendering de toda a app: acessos a dados de runtime fora de `Suspense` passam a erro de build. A app inclui o admin do Payload (`(payload)/admin`), cujo comportamento com `cacheComponents` não está garantido.

## Goals / Non-Goals

**Goals:**
- Uma troca de idioma ou navegação com o cache quente não faz nenhuma query ao CMS.
- Um editor que publica vê a alteração no site na navegação seguinte.
- O contrato de tags sobrevive à troca de provider sem alterações.

**Non-Goals:**
- Cache partilhado entre réplicas (custom cache handler): o deploy é de instância única.
- O webhook do Directus (fase 3).

## Decisions

### Spike primeiro: `cacheComponents` com o Payload no processo
Ligar `cacheComponents: true` num branch e verificar: `npm run build` passa, `/admin` faz login e edita, a API REST responde e o site renderiza. Se tudo passar, usa-se `"use cache"` + `cacheLife("max")` + `cacheTag(...)` dentro das funções de leitura do módulo. Se não passar, usa-se `unstable_cache` com as mesmas chaves e tags, e a fase 5 ganha a tarefa de migrar para `use cache`. Nos dois casos a API pública de `@/content` é a mesma, por isso a decisão não se propaga aos consumidores.

### O locale é argumento da função cacheada
Com `use cache`, os argumentos fazem parte da chave automaticamente. Com `unstable_cache`, o locale entra explicitamente no `keyParts`. Nos dois casos, omiti-lo serviria PT a visitantes EN, e as tags também incluem o locale.

### Granularidade de tags: por global e locale, mais uma por coleção
Uma global usa duas tags: `cms:<global>` (todas as línguas) e `cms:<global>:<locale>`. Como as globals populam coleções (a homepage inclui projetos, serviços e outros), cada leitura recebe também `cms:collection:<nome>` por cada coleção que popula. Editar um serviço invalida `cms:collection:services`, o que apanha a homepage e a página de orçamento.

Alternativa considerada: uma tag única `cms` para tudo. É mais simples e o volume do site permite-o. Rejeitada por pouco, porque a granularidade custa quase nada aqui e evita revalidar tudo a cada gravação de uma submissão ou de uma media irrelevante.

### `revalidateTag(tag, "max")` nos hooks
É stale-while-revalidate, como recomenda a doc. O editor vê a alteração no pedido seguinte ao primeiro que dispara a revalidação. `updateTag` não serve, porque só funciona em Server Actions e os hooks do Payload não o são.

### Hooks Payload num único helper
`src/collections/hooks/revalidate.ts` exporta `revalidateGlobal(slug)` e `revalidateCollection(slug)`, que mapeiam slugs do Payload para tags do módulo. Cada global e coleção regista-os em `afterChange`/`afterDelete`. `quote-requests` **não** regista, porque não é conteúdo lido pelo site.

### Prerender condicional ao #16
`generateStaticParams` em `[locale]/layout.tsx` devolve `en` e `pt`. Sem o `Suspense` do #16, o header força a renderização no cliente e o build falha ao tornar a rota estática. Se o #16 ainda não estiver em `develop`, este passo fica de fora e é registado no issue.

## Risks / Trade-offs

- [O conteúdo fica preso se o hook falhar] → `cacheLife` com expiração máxima finita (horas) como rede. O hook regista erros.
- [Cache por instância, se o deploy passar a ter réplicas] → Documentar no `CLAUDE.md`. Nesse caso é preciso um `cacheHandlers` partilhado (ver `self-hosting.md`, "Multi-Instance Cache Coordination").
- [`cacheComponents` partir o admin depois do merge, numa atualização do Payload] → Se a spike escolher `use cache`, a verificação do `/admin` entra na checklist de bumps do Payload até à fase 5.
- [Media alterada sem a global mudar] → `Media` também invalida `cms:collection:media`, que todas as leituras com imagens incluem.

## Migration Plan

Deploy normal; o primeiro pedido de cada página aquece o cache. Rollback: reverter. Não há dados a migrar.

## Open Questions

- ~~Resultado da spike de `cacheComponents` (decide o mecanismo).~~ **Decidido: `unstable_cache`.** Tira as queries de cada navegação sem mudar o rendering: o switch de idioma continua a sair como link no HTML do servidor e o `/admin` não é tocado. O prerender por locale (secção 5) fica de fora desta change, porque seria ele a pôr o fallback do switch no HTML estático. `"use cache"` + `cacheComponents` passa para a fase 5, com os três ajustes registados abaixo.

## Resultado da spike (2026-10-23)

`cacheComponents: true` com as leituras de `@/content` em `"use cache"` + `cacheLife("max")`. **O build passa e o Payload no mesmo processo não o impede**, mas só depois de três ajustes, e há uma troca que o design não previa.

| Verificação | Resultado |
|---|---|
| `npm run build` | passa: `/en`, `/pt`, `/[locale]/get-quote` pré-renderizadas (○); `/admin/[[...segments]]` em prerender parcial (◐); `/api/*` dinâmico |
| `/admin`, `/admin/login`, `/admin/collections/projects` | 200; o login do Payload renderiza |
| `GET /api/globals/homepage`, `GET /api/projects` | 200 |
| `/cdn/<chave>` | 200, `image/svg+xml` |
| Edição autenticada no `/admin` | **não verificada**: exige sessão de editor |

Ajustes que o build exigiu, por ordem:
1. `src/app/cdn/[...path]/route.ts`: `export const runtime` e `export const dynamic` são incompatíveis com `cacheComponents`. Sem eles a rota continua a servir (testado).
2. `generateStaticParams` em `[locale]/layout.tsx`: com `cacheComponents` um root param sem valores é erro de build. Era o passo 5 desta change, que deixa de ser opcional.
3. `new Date().getFullYear()` no `Footer` é um "unstable value" durante o prerender. A spec `footer-content-authority` exige o ano "composto em runtime" e que acompanhe a virada do ano. Há duas saídas: um leaf de cliente que compõe o ano no browser, ou o ano dentro de um escopo `"use cache"` com `cacheLife` diário.

A troca: com a página pré-renderizada, o `<Suspense>` do `LocaleSwitch` (#16) serve o **fallback** no HTML estático, um `<span>` sem `href`. O switch só passa a link depois da hidratação. Sem JavaScript, ou até hidratar, não há link para o outro idioma. Hoje, com render dinâmico, o link sai no HTML do servidor.
