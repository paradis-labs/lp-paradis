## Why

O `Template-multisite-tenant` vai carregar os quatro produtos do canvas v3 (change `paradis-v3-products`). Com eles chegam duas coisas que o site ainda não lê:
- **Um `lead` próprio para o detalhe**, diferente do `summary` do cartão. No canvas, o cartão da Ficha Segura diz "The smart deposit simulator…" e o detalhe diz "Find your best return…". Hoje o site usa o `summary` nos dois.
- **A escolha dos produtos da home pelo hcms.** A decisão do utilizador (2026-11-01) é mostrar só três na home: o bloco `#products` com `featured_only`, e o `is_featured` de cada projecto. Hoje a home lista todos.

## What Changes

- **Detalhe:** o `PageHeader` usa o `lead` do projecto, e o `summary` quando o `lead` está vazio. O cartão da listagem, o da home e o "Next product" continuam com o `summary`.
- **Home:** com `featured_only` ligado no bloco `#products`, a secção mostra só os projectos com `is_featured`. Desligado, mostra todos, como hoje. A listagem `/products` e o "Next product" mostram sempre todos.
- **Fora do âmbito:** o `limit` e o `sort_by` do bloco, e a ordem própria da home (fica a do `sort`).

## Capabilities

### New Capabilities
- `v3-products-content`: o lead do detalhe e o destaque dos produtos na home.

### Modified Capabilities
(nenhuma)

## Impact

- **Código:**
  - `src/content/types.ts` (`ProductDetail.lead`, `Project.featured`);
  - `src/content/providers/hcms.ts`: `is_featured` em `PROJECT_FIELDS`, `blocks.item:block_collection.featured_only` na leitura da página e o filtro na homepage;
  - `src/components/ProductDetail/`.
- **Schema:** `featured_only` e `is_featured` já existem no hcms. O `lead` chega por `translations.*`, por isso esta change pode entrar antes ou depois do campo existir em produção.
- **Cache:** nenhuma leitura nova.
- **Depende de** `v3-cms-gaps`.
