## Context

- **Referência:** o artboard "v3 · Product detail — Kitenda" do canvas, em `project/Product.dc.html` (não foi exportado para `openspec/design/`).
- **Campos no hcms:** vêm do `seed-paradis-v3` do template. Os novos (`market`, `platform`, `challenge`, `solution`, `steps`, `gallery`, `testimonial`) juntam-se aos que já existiam (`slug`, `category`, `tags`, `summary`, `image`, `url`).
- **Ordem obrigatória:** o Directus responde 403 ao pedido inteiro quando se pede um campo que não existe. O provider só pode pedir os campos novos depois de eles estarem em `hcms.paradis.host`.

## Goals / Non-Goals

**Goals:**
- A página de detalhe com o aspeto do artboard, a degradar por secção.
- A listagem a mostrar categoria e tags e a levar ao detalhe.

**Non-Goals:**
- A home: os cartões de produto continuam a abrir o site externo.
- Um lightbox para a galeria.

## Decisions

### D1. O cartão da listagem leva ao detalhe
No mockup, o cartão da listagem e os cartões de "More Products" apontam para o site externo, como se o detalhe não existisse. Com a página no site, o percurso natural é este: listagem → detalhe → "Visit". O site externo fica a um clique, no CTA do cabeçalho e no "Live at" da ficha.

### D2. Slug `en-US` e `generateStaticParams` por página
O `slug` é lido em `en-US` (como o dos serviços, `hcms.ts`), e o PT segue-o. A página declara `generateStaticParams` a partir da lista de slugs. Com `cacheComponents` um parâmetro sem valores conhecidos é erro de build, e o layout já dá o `locale`.

### D3. Uma leitura para a página, e o resto reaproveitado
`getProduct(locale, slug)` devolve o `ProductDetail` e os outros projectos (para "More Products") de uma só vez. `getProductSlugs()` dá a lista de slugs para os params, a partir de `getProductsPage("en")`, que já está cacheada. O mapeamento de projecto é o `toProjects` partilhado, agora com `slug`, `category` e `tags`.

### D4. Invalidação pelas colecções novas
`categories` e `projects_files` entram em `HCMS_COLLECTION_TAGS` com `collectionTag("projects")`: só os projectos as usam neste site.

## Risks / Trade-offs

- [O cartão deixa de abrir o site externo] → o CTA "Visit" e o "Live at" mantêm-no a um clique, e a home continua como estava.
- [Os textos de desafio, solução e passos foram escritos no seed] → a página mostra o que estiver em prd. Se o editor os deixar vazios, as secções não renderizam.
