## 1. Pré-requisitos

- [ ] 1.1 Arquivar `v3-product-detail` (fechando a 4.2 com uma referência a esta change), para o `product-detail-page` existir em `openspec/specs/`
- [x] 1.2 Confirmar no hcms o que o `market` dos projectos guarda: "Angola" nos dois, por isso a ficha fica com "Market" (D5)

## 2. Conteúdo

- [x] 2.1 `types.ts`: `ProductPage.others: Project[]` → `next: Project | null`, com o comentário actualizado
- [x] 2.2 `providers/hcms.ts` → `getProduct`: `next = projects[(index + 1) % projects.length]`, ou `null` com um só projecto (D2)

## 3. Cabeçalho

- [x] 3.1 `PageHeader`: o H1 e o lead numa coluna (`max-w-205`, `gap-4`), e os `children` alinhados ao fundo (`lg:items-end`); sai o `-mt-3` do lead (D1)
- [x] 3.2 `PageHeader`: sai o `titleSize`/`xl`; o H1 fica a 72 / 56 / 40px com `leading-[1.05]`
- [x] 3.3 Breadcrumb do detalhe: seta "←" de 16px antes de "Our Products" (cor `#212528`, peso 500, `gap` 8px), `gap` 10px entre itens, separador `#c4c8cb`

## 4. Secções

- [x] 4.1 Capa: `h-85` (340px) abaixo de 768px
- [x] 4.2 Ficha: um comentário no `ProductDetail` a dizer porque é que a ficha mostra "Market" e não o "Pricing" do design (D5)
- [x] 4.3 Painel escuro: a pill por cima do texto (coluna, `gap-7`), 120px entre os blocos (`gap-30`), os cartões de características com `mt-7` depois do texto da solução, a máscara a `ellipse_60%_40%`, e em mobile `m-2` e padding de 56 / 20px
- [x] 4.4 Galeria: as imagens a 260px abaixo de 768px
- [x] 4.5 Testemunho: o ícone de aspas (40px, `#c4c8cb`), a autoria empilhada e centrada, o avatar de 56px ou as iniciais num disco escuro (D6), o nome a 16px semibold, a tag a 14px e a citação a 24px em mobile

## 5. Next product

- [x] 5.1 `NextProductCard` em `src/components/NextProductCard/index.tsx`, conforme o spec "O produto seguinte" (D3)
- [x] 5.2 O falso botão "View product →" com a animação do `Button` escuro, comandada pelo hover do cartão (D4)
- [x] 5.3 `ProductDetail`: a secção com o H2 "Next product" (32px) e o link de texto "View all products →" (`RollText` + seta), padding `0 0 112px`; a cópia "More Products", "Keep exploring…" e "View All" sai do `COPY`, e entram "Next product", "View all products" e "View product" em EN e PT

## 6. Verificação

- [ ] 6.1 `/en/products/kitenda`, `/pt/products/kitenda` e o último produto da listagem (o "Next" volta ao primeiro), lado a lado com o artboard, em desktop e a 390px
- [ ] 6.2 `/en/products` e `/en/get-quote` sem mudanças visuais no cabeçalho
- [x] 6.3 `npm run lint` e `npm run build`
