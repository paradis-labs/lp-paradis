## Why

O v3 acrescenta uma página própria para os produtos (artboard "v3 · Products (EN)", em `openspec/design/v3 · Products (EN)-html/`), aberta pelo "View All" da home e pelo link "Products" da navbar. Hoje os produtos só existem como secção da home. O canvas também desenha uma página de detalhe por produto, mas essa precisa de schema novo no hcms e fica de fora. Esta change entrega a listagem com os dados que o hcms já tem.

## What Changes

- Rota nova `/[locale]/products`, prerenderizada em `en` e `pt`, com o layout do v3: `PageHeader` (eyebrow, H1, lead) e uma grelha de cartões de produto.
- Cada cartão é um link para o site do produto (num novo separador) com número (`01`, `02`, … pela ordem authorada), título, capa com zoom no hover e cursor "Explore", e descrição.
- O cabeçalho reutiliza o conteúdo do bloco `#products` da página `home` no hcms (eyebrow, título, lead), que é o mesmo texto que o mockup mostra. Não há página nova no hcms.
- Leitura nova cacheada `getProductsPage(locale)` em `@/content`, com tags e invalidação próprias.
- `generateMetadata` a partir do título e do lead do bloco.
- **Fora do âmbito:** a categoria (`Fintech · Prepaid cards`) e as tags (`Web App`, …) dos cartões do mockup, porque os `projects` do hcms não têm esses campos, e a página de detalhe `/products/[slug]`.

## Capabilities

### New Capabilities
- `products-listing-page`: a rota `/products`: origem do conteúdo, cartões, destino dos links, degradação, SEO, cache e invalidação.

### Modified Capabilities
(nenhuma: os links para `/products` na navbar, no footer e no "View All" são URLs authorados no hcms, e `navbar-link-destinations` já cobre o prefixo de locale)

## Impact

- **Código**: `src/app/(app)/[locale]/(pages)/products/page.tsx` (novo), `src/components/ProductsListing/` (novo, com o cartão), `src/content/index.ts`, `types.ts`, `cache-tags.ts`, `providers/hcms.ts`.
- **Cache**: `ContentRead` ganha `"products-page"`, que é invalidada por `projects`, `directus_files` e pelas coleções de página (`pages`, `page_blocks`, `block_*`). `cms/revalidate-all.ts` cobre-a sem alteração, porque itera as coleções.
- **Conteúdo (edição, não schema)**: no hcms, apontar para `/products` o item "Products" da navegação `header`, o link equivalente do footer e o CTA do bloco `#products`. Até lá a página existe mas só se chega a ela por URL.
- **Depende de** `v3-home-reskin` (`PageHeader`, cursor, footer, navbar). É independente de `v3-get-quote`.
