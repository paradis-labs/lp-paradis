## 1. Spike de mecanismo

- [x] 1.1 Num branch descartável, ligar `cacheComponents: true` em `next.config.ts` e correr `npm run build`
- [x] 1.2 Com o build a passar: login no `/admin`, editar e gravar uma global, `GET /api/globals/homepage` e navegar `/en` e `/pt` — `/admin/login`, `/admin/collections/projects`, a API e `/cdn` respondem 200; a edição autenticada não foi verificada (sem sessão de editor). Ver `design.md`
- [x] 1.3 Registar o resultado em `design.md` (Open Questions → Decisions) e escolher `use cache` ou `unstable_cache`

## 2. Contrato de tags

- [x] 2.1 Criar `src/content/cache-tags.ts` com os construtores de tags (global, global+locale, coleção) e a constante de expiração máxima
- [x] 2.2 Documentar no ficheiro que estas tags são o contrato com qualquer provider (Payload agora, Directus na fase 3)

## 3. Camada de cache

- [x] 3.1 Envolver cada leitura de `@/content` com o mecanismo escolhido, com o locale na chave e as tags da global e das coleções populadas
- [x] 3.2 Confirmar que `createQuoteRequest` e `findServicesBySlugs` (chamado na Server Action) não são cacheados

## 4. Invalidação provisória pelo Payload

- [x] 4.1 Criar `src/collections/hooks/revalidate.ts` (mapeia slug do Payload → tags do módulo) com um comentário a indicar que é apagado na fase 5
- [x] 4.2 Registar `afterChange` em `NavBar`, `Footer`, `HomePage` e `GetQuotePage`
- [x] 4.3 Registar `afterChange` e `afterDelete` em `Hero`, `Contact`, `Projects`, `Services`, `Testimonials`, `FAQs` e `Media`. `QuoteRequests` fica de fora

## 5. Prerender por locale — FORA desta change (decisão da spike: ver `design.md`)

- [x] 5.1 ~~`generateStaticParams` em `src/app/(app)/[locale]/layout.tsx` com `routing.locales`~~ — adiado para a fase 5
- [x] 5.2 ~~Confirmar no output de `npm run build` que `/en` e `/pt` são pré-renderizadas~~ — adiado para a fase 5

## 6. Verificação (build de produção, não dev)

- [x] 6.1 Log temporário de queries no provider: com o cache quente, a troca de idioma faz 0 queries — 1 query por leitura e locale a frio, 0 em três trocas a quente; locales isolados
- [ ] 6.2 Cronometrar a troca de idioma com throttling, antes e depois
- [ ] 6.3 Editar uma global e um serviço no `/admin` e confirmar que aparecem no site no pedido seguinte
- [ ] 6.4 Submeter o formulário e confirmar que nada é revalidado
- [x] 6.5 Atualizar `CLAUDE.md` (cache, tags, cache por instância)
- [ ] 6.6 Fechar #15, corrigindo no comentário a referência #4 → #16
