## MODIFIED Requirements

### Requirement: Invalidação por coleção do hcms
Um pedido autorizado com corpo válido SHALL invalidar, com `revalidateTag(tag, { expire: 0 })`, as tags que `hcmsCollectionTags` devolve para a `collection` do corpo, e responder `200 { "revalidated": [tags] }`. Uma coleção que o site não conhece SHALL dar `200 { "revalidated": [] }`. Um corpo inválido, ou com um `site` diferente de `paradis`, SHALL dar 400.

#### Scenario: Coleção mapeada
- **WHEN** chega um pedido autorizado com `{ "site": "paradis", "collection": "projects" }`
- **THEN** a tag `cms:collection:projects` é invalidada, o endpoint responde `200 { "revalidated": ["cms:collection:projects"] }` e o pedido seguinte a uma página que lê projectos é renderizado de novo

#### Scenario: Site alterado invalida o SEO
- **WHEN** chega um pedido autorizado com `{ "site": "paradis", "collection": "sites" }`
- **THEN** as tags `revalidated` incluem `cms:seo`, e o pedido seguinte gera os metadados com os valores novos do `sites`

#### Scenario: Coleção não mapeada
- **WHEN** chega um pedido autorizado com uma coleção que o site não usa
- **THEN** o endpoint responde `200 { "revalidated": [] }` sem invalidar nada

#### Scenario: Outro site
- **WHEN** chega um pedido autorizado com `site` diferente de `paradis`
- **THEN** o endpoint responde 400 e não invalida nada
