## 1. Logs do endpoint de revalidação

- [x] 1.1 Em `src/app/api/cms/revalidate/route.ts`, separar a recusa por segredo em dois casos só para o log ("site sem `CMS_REVALIDATE_SECRET`" e "segredo errado"), cada um com `console.warn("[cache] …")`, mantendo a resposta `401 { "error": "unauthorized" }` igual nos dois e sem logar nenhum valor de segredo
- [x] 1.2 Logar com `console.warn("[cache] …")` o 400 por corpo inválido e o 400 por outro `site` (com o `site` recebido)
- [x] 1.3 Logar com `console.info("[cache] …")` o 200 sem tags (coleção não mapeada), com a coleção e o evento, ao lado do log de sucesso que já existe
- [x] 1.4 Atualizar o comentário do topo da rota para dizer que cada desfecho fica registado

## 2. Aviso no arranque

- [x] 2.1 Criar `src/instrumentation.ts` com `register()` que, em `NEXT_RUNTIME === "nodejs"` e fora de `NEXT_PHASE === "phase-production-build"`, faz um único `console.warn("[cache] …")` quando `CMS_REVALIDATE_SECRET` está vazio ou ausente (ler o guia `instrumentation.md` em `node_modules/next/dist/docs` antes)
- [x] 2.2 Comentar no ficheiro porque é aviso e não erro (build do Docker e dev local sem segredo; a expiração de 1 h continua a atualizar o conteúdo)

## 3. Verificação

- [x] 3.1 `npm run lint` sem erros
- [x] 3.2 `npm run build` termina com sucesso sem `CMS_REVALIDATE_SECRET` e sem o aviso de arranque no output
- [x] 3.3 `next start` sem o segredo: o aviso aparece uma vez; um `POST /api/cms/revalidate` dá 401 e o log diz "site sem segredo"
- [x] 3.4 `next start` com `CMS_REVALIDATE_SECRET=test`: sem aviso; com segredo errado → 401 e log "segredo errado"; `collection: "projects"` → 200 com a tag e o log de sucesso, e o `GET /en` seguinte dá `x-nextjs-cache: MISS`; `collection: "unknown"` → 200 `[]` e o log "nada invalidado"; `site: "outro"` → 400 e o log com o site; corpo inválido → 400 e o log
- [x] 3.5 Confirmar que nenhuma linha de log contém o valor do segredo

## 4. Documentação

- [x] 4.1 Em `cms/hcms/FLOW.md`, acrescentar uma secção "Diagnosticar" com cada linha `[cache]` e o que fazer em cada caso, e a nota de que `next dev`/staging não recebem o aviso do hcms, com `CMS_REVALIDATE_SECRET=… npm run cms:revalidate -- http://localhost:3000`
- [x] 4.2 Corrigir o comentário do `Dockerfile` que diz que nenhuma rota é pré-renderizada (com `cacheComponents` as páginas públicas são)
- [x] 4.3 Em `CLAUDE.md`, na nota das variáveis de ambiente, dizer que sem `CMS_REVALIDATE_SECRET` o site arranca com um aviso e a revalidação pelo hcms fica desligada
