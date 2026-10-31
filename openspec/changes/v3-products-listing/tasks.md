## 1. Conteúdo

- [x] 1.1 `types.ts`: tipo `ProductsPage` (`eyebrow`, `title`, `lead`, `items: Project[]`)
- [x] 1.2 `providers/hcms.ts`: extrair o mapeamento de `Project` da homepage para uma função partilhada
- [x] 1.3 `providers/hcms.ts`: `getProductsPage(locale)`: bloco `block_collection #products` da `home` + `projects`, com validação zod e fallback para `en-US`
- [x] 1.4 `cache-tags.ts`: `"products-page"` em `ContentRead`, em `READ_COLLECTIONS` (`projects`, `media`) e em `PAGE_READS`
- [x] 1.5 `index.ts`: `getProductsPage` com `"use cache"`, `cacheTag` e `cacheLife` de 1 h, exportado por `@/content`

## 2. Página

- [x] 2.1 `src/app/(app)/[locale]/(pages)/products/page.tsx` com `requireLocale()`, `PageHeader` (pisos em `Record<Locale, …>`) e `generateMetadata`
- [x] 2.2 `ProductsListing` + cartão: âncora externa num novo separador, número com dois dígitos, `<h2>`, capa `next/image` com `sizes` e zoom no hover, `data-cursor-text="Explore"`, descrição, texto de novo separador para leitores de ecrã
- [x] 2.3 Grelha de 2 colunas (uma abaixo de 900px), alturas e paddings do mockup, contorno `#d4d7da` no hover, `prefers-reduced-motion`
- [x] 2.4 Revelação de disparo único com stagger de 0,12 s (`data-rv`)
- [x] 2.5 Estado vazio com cópia de UI localizada
- [x] 2.6 `NavActiveContext`: link corrente por correspondência exata de pathname, na barra e no menu mobile

## 3. Conteúdo no hcms (edição, não schema)

- [ ] 3.1 Pedir a um editor que aponte para `/products` o item "Products" da navegação `header`, o link de produtos do footer e a CTA "View All" do bloco `#products`, e confirmar a revalidação

## 4. Verificação

- [ ] 4.1 Comparar `/en/products` e `/pt/products` com o artboard a 1440, 1024, 768 e 390px (sem categoria nem tags, de propósito)
- [ ] 4.2 Revalidação: `POST /api/cms/revalidate` com `projects` e com `block_collection` invalida a página
- [x] 4.3 Leitor de ecrã e teclado: cada cartão é um link com nome e destino claros
- [x] 4.4 `npm run build` prerenderiza `/en/products` e `/pt/products`, e `npm run lint` passa
