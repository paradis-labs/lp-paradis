# cms-cache-revalidation Specification

## Purpose

TBD — a completar ao arquivar.

_Introduzida por `cache-revalidation-observability`, sincronizada antes de arquivar._

## Requirements

### Requirement: Revalidação autenticada por segredo partilhado
O endpoint `POST /api/cms/revalidate` SHALL aceitar um pedido só quando o header `x-revalidate-secret` é igual ao `CMS_REVALIDATE_SECRET` do site, numa comparação de tempo constante. Sem segredo configurado no site, SHALL recusar todos os pedidos. A resposta de recusa SHALL ser `401 { "error": "unauthorized" }` nos dois casos, sem indicar ao cliente qual deles foi.

#### Scenario: Segredo certo
- **WHEN** o hcms envia um pedido com o segredo igual ao `CMS_REVALIDATE_SECRET`
- **THEN** o endpoint processa o corpo

#### Scenario: Segredo errado
- **WHEN** o pedido traz um segredo diferente do configurado
- **THEN** o endpoint responde 401 com `{ "error": "unauthorized" }`

#### Scenario: Site sem segredo configurado
- **WHEN** o `CMS_REVALIDATE_SECRET` está vazio ou ausente e chega um pedido com qualquer segredo
- **THEN** o endpoint responde 401 com `{ "error": "unauthorized" }`, a mesma resposta do segredo errado

### Requirement: Invalidação por coleção do hcms
Um pedido autorizado com corpo válido SHALL invalidar, com `revalidateTag(tag, { expire: 0 })`, as tags que `hcmsCollectionTags` devolve para a `collection` do corpo, e responder `200 { "revalidated": [tags] }`. Uma coleção que o site não conhece SHALL dar `200 { "revalidated": [] }`. Um corpo inválido, ou com um `site` diferente de `paradis`, SHALL dar 400.

#### Scenario: Coleção mapeada
- **WHEN** chega um pedido autorizado com `{ "site": "paradis", "collection": "projects" }`
- **THEN** a tag `cms:collection:projects` é invalidada, o endpoint responde `200 { "revalidated": ["cms:collection:projects"] }` e o pedido seguinte a uma página que lê projectos é renderizado de novo

#### Scenario: Coleção não mapeada
- **WHEN** chega um pedido autorizado com uma coleção que o site não usa
- **THEN** o endpoint responde `200 { "revalidated": [] }` sem invalidar nada

#### Scenario: Outro site
- **WHEN** chega um pedido autorizado com `site` diferente de `paradis`
- **THEN** o endpoint responde 400 e não invalida nada

### Requirement: Cada desfecho da revalidação fica registado
O endpoint SHALL escrever uma linha de log com o prefixo `[cache]` em todos os desfechos: invalidação feita, nada a invalidar, recusa por segredo, corpo inválido e outro site. A linha SHALL incluir a coleção e o evento quando o corpo os trouxer. Uma recusa por segredo SHALL dizer no log se o site não tem segredo configurado ou se o segredo recebido está errado. O log SHALL nunca conter o valor de nenhum dos dois segredos.

#### Scenario: Invalidação registada
- **WHEN** um pedido autorizado invalida tags
- **THEN** o log mostra uma linha `[cache]` com o evento, a coleção, as chaves e as tags invalidadas

#### Scenario: Coleção não mapeada registada
- **WHEN** um pedido autorizado traz uma coleção que o site não conhece
- **THEN** o log mostra uma linha `[cache]` a dizer que nada foi invalidado, com o nome da coleção

#### Scenario: Recusa por segredo em falta no site
- **WHEN** chega um pedido e o `CMS_REVALIDATE_SECRET` não está configurado
- **THEN** o log mostra uma linha `[cache]` a dizer que o pedido foi recusado porque o site não tem segredo configurado

#### Scenario: Recusa por segredo errado
- **WHEN** chega um pedido com um segredo que não bate com o configurado
- **THEN** o log mostra uma linha `[cache]` a dizer que o segredo recebido está errado, sem nenhum dos valores

#### Scenario: Corpo inválido ou outro site registado
- **WHEN** um pedido autorizado é recusado com 400
- **THEN** o log mostra uma linha `[cache]` com o motivo (corpo inválido, ou o `site` recebido)

### Requirement: Aviso no arranque sem segredo de revalidação
Ao arrancar, um servidor Next.js em runtime Node SHALL escrever um único `console.warn` quando o `CMS_REVALIDATE_SECRET` está vazio ou ausente, a dizer que a revalidação pelo hcms está desligada e que o conteúdo só se atualiza pela expiração da cache. O servidor SHALL arrancar na mesma. O aviso SHALL ficar fora do `next build`.

#### Scenario: Produção sem segredo
- **WHEN** o servidor arranca sem `CMS_REVALIDATE_SECRET`
- **THEN** o log mostra o aviso uma vez e o site serve pedidos normalmente

#### Scenario: Segredo configurado
- **WHEN** o servidor arranca com `CMS_REVALIDATE_SECRET` preenchido
- **THEN** não aparece nenhum aviso

#### Scenario: Build sem segredo
- **WHEN** o `next build` corre sem `CMS_REVALIDATE_SECRET` (como no Dockerfile)
- **THEN** o build não mostra o aviso e termina com sucesso
