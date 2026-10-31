## Why

O canvas v3 tem um artboard de detalhe de produto ("v3 · Product detail — Kitenda") que ficou de fora do `v3-products-listing` por falta de campos no hcms. O `seed-paradis-v3` do `Template-multisite-tenant` acrescenta esses campos aos `projects` (mercado, plataforma, desafio, solução, passos, galeria e testemunho) e aplica-os em `hcms.paradis.host`. Com eles, a listagem pode mostrar a categoria e as tags, e cada produto passa a ter uma página no site.

## What Changes

- **Rota nova `/[locale]/products/[slug]`**, prerenderizada para cada projecto nos dois locales, com o layout do artboard:
  - `PageHeader` com breadcrumb e o CTA "Visit <produto>";
  - capa larga;
  - ficha (Category · Market · Platform · Live at);
  - painel escuro com desafio, solução e passos;
  - galeria;
  - testemunho;
  - "More Products".
- **Leitura nova cacheada `getProduct(locale, slug)`**, mais a lista de slugs para `generateStaticParams`. Um slug desconhecido dá 404.
- **`Project` no domínio ganha `slug`, `category` e `tags`**, e um tipo `ProductDetail` acrescenta o resto. Os campos de detalhe são opcionais, e cada secção da página só renderiza com conteúdo.
- **Listagem `/products`:** os cartões passam a mostrar a categoria e as tags. **BREAKING** (comportamento): o cartão leva à página de detalhe do produto, e já não ao site externo. O site externo fica no botão "Visit".
- **Invalidação:** `categories` e `projects_files` do hcms passam a invalidar as leituras que populam projectos.

## Capabilities

### New Capabilities
- `product-detail-page`: a rota `/products/[slug]`: conteúdo, secções, degradação, SEO, cache e 404.

### Modified Capabilities
- `products-listing-page`: os cartões mostram a categoria e as tags, e o link do cartão passa a ser a página de detalhe.

## Impact

- **Código:**
  - `src/content/types.ts`, `providers/hcms.ts`, `index.ts`, `cache-tags.ts`;
  - `src/components/ProductsListing`, `src/components/ProductDetail/*` (novo);
  - `src/app/(app)/[locale]/(pages)/products/[slug]/page.tsx` (novo).
- **Depende de** o `seed-paradis-v3` estar aplicado em `hcms.paradis.host`. Pedir ao Directus campos que não existem dá 403 ao pedido inteiro, por isso esta change não pode ir para produção antes.
- **A home não muda:** os cartões de produto continuam a abrir o site externo.
