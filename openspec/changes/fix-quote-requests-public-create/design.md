## Context

A Server Action em `get-quote/actions.ts` grava com `payload.create({ collection: "quote-requests", data })`, sem `overrideAccess`. Na Local API do Payload 3 o default de `overrideAccess` é `true`, por isso a regra `create` da coleção nunca é avaliada nesse caminho. A regra só é avaliada na API REST/GraphQL (`/api/quote-requests`), onde a única guarda passa a ser o schema do Payload.

## Goals / Non-Goals

**Goals:**
- Fechar a escrita anónima pela API sem mudar o comportamento do formulário.
- Tornar explícita no código a razão pela qual a Server Action consegue gravar.

**Non-Goals:**
- Rate limiting, captcha ou outras guardas de spam (continuam as atuais).
- Qualquer alteração ao Directus (a fase 1 da migração define o mesmo princípio lá).

## Decisions

**`create: ({ req }) => Boolean(req.user)` em vez de `() => false`.** Um editor autenticado no `/admin` pode querer registar um lead que chegou por telefone. `false` proibiria isso sem ganho de segurança, porque o vetor de ataque é o pedido anónimo.

**`overrideAccess: true` explícito na Server Action.** É redundante com o default, e é de propósito: quem ler `actions.ts` vê que a gravação contorna o access control. Também protege contra uma mudança futura do default ou contra alguém que acrescente `overrideAccess: false` "por segurança" e parta o formulário sem perceber porquê.

Alternativa considerada: passar um `user` de sistema à Local API. Rejeitada por exigir um utilizador de serviço no Payload só para isto, que a fase 5 apagaria.

## Risks / Trade-offs

- [Um cliente externo dependia do POST público] → Não há nenhum no repositório; o formulário é o único produtor. Confirmar nos logs do servidor que não há POSTs a `/api/quote-requests` com origem diferente antes do deploy.
- [O formulário deixar de gravar se o default da Local API mudar] → Mitigado pelo `overrideAccess: true` explícito.

## Migration Plan

Deploy normal. Rollback: reverter o commit. Não há estado a migrar.
