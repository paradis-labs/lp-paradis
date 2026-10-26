## Why

`quote-requests` declara `create: () => true`, o que deixa `POST /api/quote-requests` aberto a qualquer pessoa. Um pedido direto à API REST salta todas as guardas da Server Action: o honeypot, o tempo mínimo, a validação zod e a válvula `form.enabled` da global `get-quote-page`. A Server Action não precisa dessa permissão: grava pela Local API (`payload.create`), que por omissão corre com `overrideAccess: true`. A escrita pública é, portanto, uma porta que só serve atacantes, e pode fechar-se hoje sem esperar pela migração para o Directus.

## What Changes

- `quote-requests` passa a ter `create` restrito a utilizador autenticado, como `read`/`update`/`delete`.
- A Server Action de `/get-quote` continua a gravar, porque a Local API ignora o access control por omissão. A gravação passa a declarar `overrideAccess: true` explicitamente, para que a dependência fique visível no código e não implícita num default.
- O comentário no topo de `src/collections/QuoteRequests.ts` deixa de descrever a escrita pública como intencional.
- **BREAKING** (só para clientes da API): `POST /api/quote-requests` sem autenticação passa a responder 403. Nenhum cliente legítimo usa este caminho.

## Capabilities

### New Capabilities

_(nenhuma)_

### Modified Capabilities

- `quote-request-intake`: o requisito de acesso passa de "create público" para "escrita só pelo servidor"; a criação anónima pela API deixa de ser aceite.

## Impact

- **Código:** `src/collections/QuoteRequests.ts` (access + comentário), `src/app/(app)/[locale]/(pages)/get-quote/actions.ts` (`overrideAccess: true` explícito).
- **Schema/DB:** nenhuma alteração; access control não gera migração.
- **Independente** da migração para o Directus, que herda o mesmo princípio (papel público sem acesso à coleção) na fase 1.
