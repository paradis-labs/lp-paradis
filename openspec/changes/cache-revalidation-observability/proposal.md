## Why

"A cache não revalida" não se consegue diagnosticar a partir do site. Um build de produção local mostrou que o mecanismo funciona: `POST /api/cms/revalidate` → `revalidateTag` → o pedido seguinte dá `x-nextjs-cache: MISS` e mostra o conteúdo novo. A falha está no caminho até lá, e esse caminho não deixa rasto: um segredo errado ou em falta dá 401 sem log, uma coleção não mapeada dá 200 com `[]` sem log, e um site sem `CMS_REVALIDATE_SECRET` arranca normalmente e rejeita todos os avisos do hcms. O único sinal hoje é o registo do flow no hcms, que quem olha para os logs do site não vê.

## What Changes

- **Cada pedido ao endpoint de revalidação deixa uma linha de log**, com o desfecho: autorizado e invalidado, autorizado sem nada a invalidar (coleção não mapeada), recusado por segredo (distinguindo "segredo não configurado no site" de "segredo errado"), recusado por corpo inválido ou por outro `site`. As respostas HTTP não mudam: o motivo do 401 fica só no log, não na resposta.
- **Aviso no arranque do servidor sem `CMS_REVALIDATE_SECRET`**: um `console.warn` único a dizer que a revalidação pelo hcms está desligada e que o conteúdo só se atualiza pela expiração de 1 h. É um aviso e não um erro: o build do Docker e o `npm run dev` local correm sem o segredo, e a expiração continua a funcionar.
- **Documentação de diagnóstico** em `cms/hcms/FLOW.md`: o que cada linha de log quer dizer, e que um servidor local ou de staging nunca recebe o aviso do hcms (o `revalidate_url` aponta para um só site), com o `npm run cms:revalidate` como forma de revalidar à mão.
- **Correção do comentário do `Dockerfile`** que diz que nenhuma rota é pré-renderizada: desde `cacheComponents` as páginas públicas são.

## Capabilities

### New Capabilities
- `cms-cache-revalidation`: o endpoint `POST /api/cms/revalidate` e a sua observabilidade: as respostas por caso, a linha de log de cada desfecho e o aviso no arranque sem segredo configurado.

### Modified Capabilities
<!-- Nenhuma: não há spec da revalidação em openspec/specs/. -->

## Impact

- `src/app/api/cms/revalidate/route.ts`: logs por desfecho, respostas iguais.
- `src/instrumentation.ts` (novo): o aviso no arranque.
- `cms/hcms/FLOW.md`, `Dockerfile` (comentário), `CLAUDE.md` (a nota das variáveis de ambiente).
- Sem dependências novas, sem mudança no hcms nem no contrato do flow.
- Fora do âmbito: a cache do router no browser (`x-nextjs-stale-time: 300`), a cache do `/_next/image` para ficheiros substituídos com o mesmo id, a coordenação entre réplicas e o `/en` servido como dinâmico em produção. Estão em Open Questions no design.
