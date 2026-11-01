## ADDED Requirements

### Requirement: Logo com o peso do tamanho em que aparece

O logo do header e o do footer SHALL ser imagens raster otimizáveis (PNG, ou SVG vetorial sem bitmaps embutidos), e nunca um SVG que embrulhe um bitmap. O ficheiro de origem SHALL ter no máximo 3× a largura em que o logo é mostrado no header (134 px), e SHALL ser servido pelo `next/image` no tamanho de cada sítio. Os fallbacks em `public/` e os ficheiros do hcms (`sites.logo`, `sites.logo_inverse`) SHALL seguir a mesma regra.

#### Scenario: Header em desktop

- **WHEN** a home abre a 1440px
- **THEN** o pedido do logo do header devolve uma imagem otimizada (WebP ou AVIF) com menos de 10 KB, e não o SVG de 40 KB

#### Scenario: hcms sem logo

- **WHEN** o site do hcms não tem `logo`
- **THEN** o header usa o fallback de `public/` com o mesmo limite

### Requirement: Blur da navbar

A navbar fixa SHALL usar `backdrop-filter: blur(12px) saturate(160%)` sobre o fundo branco a 55%, em vez do blur de 20px.

#### Scenario: Scroll por cima do vídeo

- **WHEN** a navbar passa por cima do vídeo dos serviços
- **THEN** o fundo por trás fica desfocado a 12px

### Requirement: Pesos da Inter

A fonte Inter SHALL carregar só os pesos 400, 500 e 600. O negrito do texto rico (`<strong>`, `<b>`) SHALL usar 600, para o browser não sintetizar um 700 que não foi carregado. Os títulos em Gilroy não mudam.

#### Scenario: Resposta do FAQ com negrito

- **WHEN** a resposta do FAQ contém "**2 weeks to 6 months**"
- **THEN** o trecho aparece a 600, com a face carregada, e não com negrito sintetizado
