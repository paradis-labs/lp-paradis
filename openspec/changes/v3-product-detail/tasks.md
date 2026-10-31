## 1. Pré-requisito

- [x] 1.1 Confirmar em `hcms.paradis.host`, com o token de leitura da Paradis, que os `projects` têm `market`, `platform`, `challenge`, `solution`, `steps`, `gallery` e `testimonial` (`seed-paradis-v3`, secção 6)

## 2. Conteúdo

- [x] 2.1 `types.ts`: `Project` ganha `slug`, `category` e `tags`; tipo `ProductDetail` (`market`, `platform`, `challenge`, `solution`, `steps`, `gallery`, `testimonial`) e `ProductPage` (`product`, `others`)
- [x] 2.2 `providers/hcms.ts`: `PROJECT_FIELDS` e `toProjects` com `slug`, `category` e `tags`; `getProduct(locale, slug)`
- [x] 2.3 `cache-tags.ts`: leitura `product` (`projects`, `testimonials`, `media`) e `categories`/`projects_files` → `cms:collection:projects`
- [x] 2.4 `index.ts`: `getProduct` cacheado

## 3. Página

- [x] 3.1 `products/[slug]/page.tsx`: `requireLocale`, `generateStaticParams`, `notFound()`, `generateMetadata`
- [x] 3.2 `ProductDetail`: cabeçalho com breadcrumb e CTA, capa, ficha, painel escuro com desafio, solução e passos, galeria, testemunho e "More Products", cada um só com conteúdo
- [x] 3.3 `ProductsListing`: cartão leva ao detalhe; categoria e tags

## 4. Verificação

- [x] 4.1 `/en/products/kitenda`, `/pt/products/ficha-segura` e `/en/products/nao-existe` (404)
- [ ] 4.2 Comparar com o artboard em desktop e a 390px
- [x] 4.3 `npm run lint` e `npm run build`
