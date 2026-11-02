## 1. Preparação

- [x] 1.1 Confirmar que as classes citadas no design ainda estão nos ficheiros (`px-3 md:px-4 xl:px-0`, `FOOTER_GUTTER`, `max-w-205`, `bg-white/4`, `bg-primary` nas capas, a igualdade em `isNavLinkActive`), porque há trabalho v3 por commitar nos mesmos componentes
- [ ] 1.2 (Ultrapassada: o código mudou antes das capturas; a comparação de 8.1 faz-se contra os artboards) Tirar capturas de referência de `/en`, `/en/products`, `/en/products/kitenda` e `/en/get-quote` a 1440, 1024, 768 e 390px, para comparar no fim

## 2. Tokens e utilitário (globals.css)

- [x] 2.1 `@utility gutter` (24px → 20px abaixo de 768 → 0 a partir de 1280) ao lado do `@utility container`
- [x] 2.2 Token `--cover-ground: #5a5b5d` + `--color-cover-ground` em `@theme inline` (`bg-cover` é o `background-size` do Tailwind v4, D3)

## 3. Margens laterais

- [x] 3.1 `ProductsListing`: a secção e a grelha passam a `gutter`
- [x] 3.2 `ProductDetail`: a galeria e o "Next product" passam a `gutter`; a secção de factos fica como está
- [x] 3.3 `GetQuote/index.tsx`: a grelha do formulário e do aside passa a `gutter`
- [x] 3.4 Home, secção "About": o contentor perde a margem própria e o bloco usa `gutter` abaixo de `xl`, mantendo o padding de desktop
- [x] 3.5 `Footer`: `FOOTER_GUTTER` passa a `gutter` nas três faixas

## 4. PageHeader

- [x] 4.1 Padding horizontal de 80px a partir de `md` (sai o `md:px-10 … xl:px-20`)
- [x] 4.2 Coluna do H1 e do lead com `max-w-250` e `lg:gap-10` entre a coluna e as ações
- [x] 4.3 Confirmar a escala do H1 em 72/56/40 nos cortes 1024/768, e atualizar o comentário do componente com as medidas do canvas

## 5. Fundo das capas

- [x] 5.1 `Card` (home), `ProductCard` (listagem), a capa do `ProductDetail` e a do `NextProductCard` passam ao token de 2.2

## 6. Link corrente do navbar

- [x] 6.1 `isNavLinkActive`: correspondência por segmento (`href + "/"`), com exceção para a raiz do locale; reescrever o comentário que justificava a igualdade
- [x] 6.2 Confirmar no desktop e no menu mobile: "Products" ativo em `/en/products/kitenda`, "Home" inativo em `/pt/get-quote`, e "Services" a ganhar a "Home" na home

## 7. Glifos

- [x] 7.1 `src/components/Glyphs/index.tsx`: `ArrowDownRight`, `ArrowUpRight`, `ArrowRight` e `Bulb` (com `filled`), decorativos, com `size` e `className`, e o tamanho por omissão igual ao da Solar
- [x] 7.2 `Button`: o tipo de `trailingIcon` não precisou de mudar, porque os glifos aceitam um subconjunto das `IconProps` da Solar e encaixam como estão
- [x] 7.3 Trocar a Solar pelos glifos no hero, no header ("Get Quote"), no CTA do about, no footer, no envio do get-quote, no "Visit" do detalhe, no "View All" da home e no `NextProductCard`
- [x] 7.4 `MarqueeServices`: `Bulb` em contorno e preenchido, mantendo a troca no hover
- [x] 7.5 `ExternalArrow` passa a usar o `ArrowUpRight` dos glifos, e sai o import do `lucide-react` se mais nada o usar
- [x] 7.6 `fixtures/buttons` com os glifos novos

## 8. Verificação

- [x] 8.1 Comparar as quatro páginas com os artboards a 1440, 1024, 768 e 390px: margens, cabeçalho, capas e setas (medido por estilos computados num iframe de largura fixa: gutter 24/20/0, cabeçalho 80/88 e 20/40, H1 72/56/40, coluna 1000px, capa `#5a5b5d`)
- [x] 8.2 Sem overflow horizontal a 390px na listagem, no get-quote e no detalhe (`responsive-content-fit`)
- [ ] 8.3 Leitor de ecrã: os botões com glifos anunciam só o rótulo
- [x] 8.4 `npm run build` passa; o `npm run lint` só acusa os 5 erros que já existiam em `src/components/ui/` (`grid-pattern`, `marquee`, `scroll-based-velocity`), fora desta change
