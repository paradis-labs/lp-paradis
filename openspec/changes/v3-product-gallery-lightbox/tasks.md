## 1. Componente

- [x] 1.1 Criar `src/components/GalleryLightbox/index.tsx` (`"use client"`), com props `shots: Media[]`, `title: string` e `locale: Locale`, e a grelha de hoje com cada imagem num `<button>` com nome acessível e `data-cursor-text` localizado (D1)
- [x] 1.2 Acrescentar o `Dialog` do `radix-ui` controlado por `index: number | null`, com `Dialog.Title` escondido, botão fechar, anterior/seguinte e contador (os três omitidos com uma só imagem), e textos em `Record<Locale, …>` (D2)
- [x] 1.3 Tratar ← e → no `Dialog.Content`, com volta nas pontas
- [x] 1.4 Em `onCloseAutoFocus`, devolver o foco ao botão da imagem visível, com fallback para o comportamento por omissão (D2)
- [x] 1.5 Parar o Lenis ao abrir e retomá-lo ao fechar com `useLenis()` (D3)
- [x] 1.6 Imagem do lightbox com `next/image` dimensionada pelas proporções (`width`/`height` do `Media`, `max-w-full max-h-full`) em vez de `fill`, para um clique ao lado dela cair no palco e fechar, `sizes="100vw"`, animação CSS sobre `data-state`, `motion-reduce:animate-none` e `data-cursor-tone="light"` no conteúdo (D4)

## 2. Integração

- [x] 2.1 Em `src/components/ProductDetail/index.tsx`, trocar o `.map` da galeria por `<GalleryLightbox shots={product.gallery} title={product.title} locale={locale} />` dentro do `Reveal`, mantendo o layout da grelha (a primeira imagem em duas colunas)

## 3. Verificação

- [x] 3.1 No `npm run dev`, no detalhe de um produto com várias imagens: abrir por clique, navegar com os botões e com ← →, dar a volta nas pontas, e fechar com Esc, com o ✕ e com um clique no fundo — verificado no Chrome (Génesis, 3 imagens): clique abre, → no último dá a volta, ← no primeiro dá a volta, fecha com Esc, ✕ e clique no fundo
- [x] 3.2 Abrir a imagem 1, ir à 3 e fechar com Esc: o foco fica na imagem 3 da grelha — verificado: abrir na 1, ← para a 3, Esc → foco em "…on an angled monitor" (a 3)
- [x] 3.3 Só com o teclado: Tab até uma imagem, Enter abre, Tab fica dentro do diálogo — verificado: Enter no botão focado abre; 5× Tab mantém o foco dentro do diálogo
- [x] 3.4 Com o lightbox aberto, rodar a roda e usar o touchpad: a página não rola. Depois de fechar, o scroll suave funciona — verificado com a roda (`scrollY` fixo, `html.lenis-stopped`); depois de fechar, `lenis-stopped` sai. Touchpad não testado à parte
- [x] 3.5 O cursor "View" aparece sobre a grelha, e dentro do lightbox fica claro sobre o fundo escuro — o disco claro aparece sobre o fundo escuro do lightbox; `data-cursor-text="View"` nos botões da grelha
- [ ] 3.6 Com `prefers-reduced-motion: reduce` emulado, abrir e fechar sem animação — POR FAZER: o browser não emulou `prefers-reduced-motion`; no código, `motion-reduce:animate-none` está no overlay, no conteúdo e na imagem
- [ ] 3.7 Num produto com uma só imagem, sem setas nem contador — POR FAZER: os quatro produtos têm 3 imagens; no código, as setas e o contador estão atrás de `total > 1`
- [ ] 3.8 `npm run build`: o chunk do lightbox só aparece na rota do detalhe — POR FAZER: o build não correu (o dev server estava a correr)
- [x] 3.9 `npx tsc --noEmit` e `npx biome check` nos ficheiros alterados
