## Context

- `ProductDetail` passa o `product.description` (o `summary`) ao `PageHeader` como `lead`.
- `toProjects` é partilhado pela homepage, pela listagem e pelo detalhe. Lê `PROJECT_FIELDS` (`url`, `tags`, categoria, imagem) mais `translations.*`.
- A leitura das páginas pede `blocks.item:block_collection.source` e `.translations.*`. O `rawBlock.item` é `.loose()`, por isso deixa passar campos a mais.
- No template, o `block_collection` tem `featured_only` (bool) e os `projects` têm `is_featured` (bool), os dois já em produção.

## Goals / Non-Goals

**Goals:** o lead do detalhe e o destaque da home, lidos do hcms, sem depender da ordem dos deploys.

**Non-Goals:** o `limit` e o `sort_by` do bloco; uma ordem da home diferente da do `sort`.

## Decisions

### D1. O `lead` vem por `translations.*`
As traduções já são pedidas com `*`, por isso o `lead` chega sem ser nomeado e o pedido não falha num hcms sem ele. `ProductDetail.lead` é `tr(record, "lead", language)` no mapeamento do detalhe, e o `ProductDetail` usa `product.lead ?? product.description`. Não entra no `cms:check`: um campo em falta não parte nada.

### D2. `featured` no domínio, filtro na homepage
- `Project` ganha `featured: boolean`, de `is_featured === true`, e `is_featured` entra em `PROJECT_FIELDS`. É um campo que existe desde o início do template.
- A leitura da página passa a pedir `blocks.item:block_collection.featured_only`.
- A homepage filtra `projects.items` por `featured` só quando o bloco `#products` tem `featured_only === true`. A listagem e o detalhe não filtram.
- *Alternativa:* filtrar no pedido ao hcms (`filter: { is_featured: true }`). Rejeitada: a homepage e a listagem partilham a leitura dos projectos, e um pedido a mais por página não compensa para quatro itens.

## Risks / Trade-offs

- **Um editor liga o `featured_only` sem marcar nenhum projecto** → a secção fica vazia. É o comportamento que a opção descreve; a secção desliga-se pelo `hide_block`.
- **A ordem da home no canvas (Talama antes da Génesis) difere do `sort`** → aceite (D5 da `paradis-v3-products`).

## Migration Plan

Merge e deploy em qualquer ordem em relação à `paradis-v3-products`. Rollback por revert.
