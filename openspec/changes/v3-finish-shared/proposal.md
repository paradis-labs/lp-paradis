## Why

A comparação de 2026-11-01 entre o canvas do v3 (artifact "Paradis Landing Page": `MainV3`, `Products`, `GetQuote`, `Product*`) e o código mostrou que as páginas já têm todas as secções, mas que um punhado de diferenças se repete em várias delas porque vive em peças partilhadas: as margens laterais abaixo de 1280px, o `PageHeader`, o fundo das capas, o estado ativo do navbar e as setas dos botões. Corrigi-las uma vez fecha a maior parte do que ainda se nota entre o design e o site, antes das lacunas específicas de cada página (`v3-finish-pages`) e das do CMS (`v3-cms-gaps`).

## What Changes

- **Margem lateral única abaixo de 1280px:** 24px até 1279px e 20px até 767px (a `.pad-x` do canvas) em todos os contentores de superfície clara: a listagem de produtos, o get-quote, a galeria e o "Next product" do detalhe, a secção "About" da home e o footer. Hoje são 12/16px nas páginas (32/40px no about, somando o contentor e o bloco) e 40–56px no footer (`FOOTER_GUTTER`). O FAQ da home e a secção de factos do detalhe já estão a 20/24px. Os contentores dentro do painel escuro já seguem a `.dark-shape .pad-x` (40/20px) e não mudam.
- **`PageHeader` alinhado com o canvas:** padding horizontal de 80px a partir de 768px (hoje 40px até `xl`), coluna do H1 com 1000px (hoje 820px), 40px entre a coluna e as ações (hoje 32px), e o H1 em 72 / 56 (≤1023px) / 40 (≤767px). O artboard do get-quote desenha 52/38; fica a escala das outras duas páginas, porque o componente é um só.
- **Token `cover-ground` (`#5a5b5d`)** para o fundo por trás das capas de produto, usado no cartão da home, no cartão da listagem, na capa do detalhe e na do "Next product" (hoje `bg-white/4` e `bg-primary`).
- **"Products" ativo nas páginas de detalhe:** um link de página fica corrente também nos caminhos que descem dele por segmento (`/en/products/kitenda` ativa `/en/products`), menos a raiz do locale, que continua a exigir igualdade.
- **Setas e lâmpada do canvas:** os glifos Solar (`ArrowRightDown`, `ArrowRightUp`, `ArrowRight`, `LightbulbMinimalistic`) dão lugar aos traços que o canvas desenha, em componentes decorativos ao jeito do `ExternalArrow`. O hover dos itens do marquee (lâmpada cheia) mantém-se.
- **Fora do âmbito:** os desvios assumidos ao canvas (letras acesas a mais, subtítulos escuros a 100%, testemunhos em movimento, H1 sem fade, hover do marquee, validação do get-quote); o "Next product", que continua a seguir a ordem da lista; e as lacunas específicas de página e de CMS.

## Capabilities

### New Capabilities
- `v3-shared-layout`: as regras partilhadas pelas páginas do v3: margem lateral, `PageHeader`, fundo das capas e glifos de seta e de lâmpada.

### Modified Capabilities
- `navbar-link-destinations`: ganha a regra do link corrente: correspondência por segmento para links de página, igualdade para a raiz do locale, e a precedência das secções da home.

## Impact

- **Código:** `src/app/(app)/globals.css` (token `cover-ground`, utilitário `gutter`), `src/components/PageHeader/`, `ProductsListing/`, `ProductCard/`, `ProductDetail/`, `NextProductCard/`, `GetQuote/`, `Footer/`, `Card/`, `Hero/`, `Header/`, `ProductsSection/`, `MarqueeServices/`, `NavBar/NavActiveContext.tsx`, a página da home (CTA do about) e um módulo novo `Glyphs/`, que o `ExternalArrow` passa a usar.
- **Fixtures:** `fixtures/buttons` passa a usar os glifos novos.
- **Sem impacto** no hcms, no cache nem nos tipos de conteúdo.
- **Depende de** `v3-home-reskin`, `v3-products-listing`, `v3-get-quote` e `v3-product-detail-match-design`, que estão por commitar na árvore. Esta change parte do estado atual dos ficheiros.
