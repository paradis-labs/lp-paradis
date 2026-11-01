## Context

A cache do conteúdo vive em `src/content/index.ts` (`"use cache"` + `cacheTag` + `cacheLife({ revalidate: 1 h })`) e é invalidada pelo hcms: o flow "Revalidate site" faz `POST /api/cms/revalidate` a cada alteração, e a rota traduz a coleção para tags (`cache-tags.ts`) e chama `revalidateTag(tag, { expire: 0 })`.

Na exploração que deu origem a esta change verificou-se, num build de produção local, que:

- as tags dos `"use cache"` propagam-se às páginas prerenderizadas (os `.meta` de `/en`, `/en/products`, `/en/products/kitenda` trazem-nas);
- depois do POST, o pedido seguinte dá `x-nextjs-cache: MISS` e volta a `HIT` com o render novo;
- em produção, o Cloudflare está à frente mas responde `cf-cache-status: DYNAMIC`, ou seja, não guarda HTML.

O mecanismo funciona. O que falta é ver as falhas: hoje a rota só regista o caso de sucesso com tags. O 401, o 400 e o 200 vazio passam em silêncio, e o `.env` local nem tem `CMS_REVALIDATE_SECRET`. O `assertHcmsEnv()` só exige `CMS_URL` e os dois tokens.

## Goals / Non-Goals

**Goals:**
- Que os logs do site digam, para cada aviso do hcms, se foi aceite, recusado e porquê, e o que invalidou.
- Que um site sem segredo o diga ao arrancar, em vez de rejeitar em silêncio todos os avisos.
- Que quem desenvolve saiba que o servidor local nunca recebe o aviso, e como revalidar à mão.

**Non-Goals:**
- Mudar as respostas HTTP, o contrato do flow, o mapa de tags ou os tempos de cache.
- A cache do router no browser (`x-nextjs-stale-time: 300`), a cache do `/_next/image`, a coordenação entre réplicas (`cacheHandlers`).
- Tornar `CMS_REVALIDATE_SECRET` obrigatório no arranque.

## Decisions

### Um log por desfecho, na rota, com `console.*`
A rota passa a escrever uma linha `[cache]` em cada ramo: `console.info` para o sucesso (com ou sem tags) e `console.warn` para as recusas (401, 400). O prefixo `[cache]` e o formato `mensagem + objeto` seguem o log existente (`[cache] revalidado pelo hcms`) e o do provider (`[content] item inválido descartado`).

- *Alternativa: um logger estruturado (pino, etc.).* Recusada: o repo não tem nenhum, e uma dependência nova para meia dúzia de linhas não compensa.
- *Alternativa: registar só as falhas.* Recusada: o 200 vazio é um caminho feliz do ponto de vista HTTP, mas é exatamente o que esconde uma coleção nova que ficou fora do mapa.

**Ruído:** o flow avisa todos os sites de todas as alterações no hcms (limitação conhecida em `FLOW.md`), por isso as edições noutros sites também geram linhas "nada invalidado". O volume é o das edições de editores, ou seja, baixo. Fica em `info` e não se filtra.

### O motivo do 401 vai para o log, não para a resposta
O log distingue "site sem `CMS_REVALIDATE_SECRET`" de "segredo recebido errado". A resposta continua `401 { "error": "unauthorized" }` nos dois casos. Dizer ao cliente que o site não tem segredo revelaria a um terceiro que o endpoint está aberto a configuração errada. O log nunca escreve nenhum dos valores, nem prefixos ou comprimentos.

### O aviso de arranque fica em `src/instrumentation.ts`, como aviso e não como erro
O `register()` do `instrumentation.ts` corre uma vez por instância do servidor, antes do primeiro pedido. É o sítio certo para um aviso único. Corre só com `NEXT_RUNTIME === "nodejs"` e salta a fase de build (`NEXT_PHASE === "phase-production-build"`), porque o `Dockerfile` faz o build sem segredos de runtime.

- *Alternativa: lançar erro, como faz `assertHcmsEnv()`.* Recusada: o `assertHcmsEnv()` corre ao carregar `@/content`, o que inclui o build (as páginas são prerenderizadas). Exigir o segredo aí partia o build do Docker e o `npm run dev` de quem não o tem. E o site funciona sem ele: o conteúdo atualiza na mesma, só que ao fim de 1 h.
- *Alternativa: o aviso no topo do módulo da rota.* Recusada: o módulo só carrega no primeiro pedido à rota. Ou seja, o aviso só aparecia quando o hcms já estivesse a ser recusado, que é tarde demais.

### O desenvolvimento local fica documentado, não automatizado
O `revalidate_url` do item `sites` é um só URL, o de produção. Um `next dev` ou um staging nunca recebe o aviso e serve conteúdo até 1 h desatualizado. `FLOW.md` passa a dizê-lo e aponta para `CMS_REVALIDATE_SECRET=… npm run cms:revalidate -- http://localhost:3000`, que já existe. Mudar o hcms para avisar vários URLs por site é uma change no `Template-multisite-tenant`.

## Risks / Trade-offs

- [O `register()` também corre nos workers do build e o `NEXT_PHASE` não está definido aí] → validar no `npm run build` (tarefa 3.3). Se o aviso aparecer, a condição passa a ser outra, e o pior caso é uma linha a mais no log do build.
- [Logar o 401 dá um sinal a quem anda a testar o endpoint] → o log fica do lado do servidor, e a resposta HTTP não muda.
- [O log de "nada invalidado" polui os logs com edições de outros sites] → volume baixo. Desaparece quando o template passar a avisar só o site dono do item.

## Migration Plan

Sem migração: o comportamento HTTP é o mesmo. Depois do deploy, confirmar nos logs de produção que uma edição de teste no hcms produz a linha `[cache]` de sucesso. Se aparecer o aviso de arranque ou uma recusa por segredo, configurar o `CMS_REVALIDATE_SECRET` e o `revalidate_url`/`revalidate_secret` no item `sites` (passos de `FLOW.md`). Rollback: reverter o commit.

## Open Questions

- Em produção, `/en` responde `private, no-store` (dinâmico) enquanto `/en/products` é prerenderizado (`HIT`). No build local `/en` é estático. Não afeta a revalidação, mas pode ser uma versão diferente em produção ou algo que só lá torna o `/en` dinâmico. Investigar à parte.
- Se o sintoma reportado não era do servidor, pode ter sido a cache do router (5 min num separador aberto) ou uma imagem substituída com o mesmo id (cache do `/_next/image`). Ficam para uma change própria, se se confirmarem.
