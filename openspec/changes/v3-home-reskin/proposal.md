## Why

O design v3 da landing page (canvas "Paradis Landing Page", artboard "v3 · EN", exportado em `openspec/design/v3 · EN-html/`) foi fechado e é o que se pretende em produção. A home do site tem hoje a mesma estrutura de secções, mas outro acabamento e outro motion. O v3 também resolve vários pontos da "Motion & performance spec" do mesmo canvas: H1 escondido até hidratar, reveal que reanima sempre, blur pesado na navbar.

## What Changes

- Reskin da home (`/[locale]`) para o v3, **sem mudar a ordem nem a origem do conteúdo**: hero, marquee, about, vídeo com notch + painel escuro (serviços, produtos, testemunhos), FAQ e footer.
- **Botões**: o efeito atual (painel quadrado + textSwap + magnético) é trocado pelo do v3: o preenchimento sobe em arco, o rótulo rola e o disco do ícone rola na vertical. O efeito passa a valer para todos os CTAs, incluindo os do footer. O magnético sai.
- **Navbar**: barra em glass permanente, links com roll no hover. O CTA passa para o menu abaixo de 768px.
- **Menu mobile novo**: painel escuro numerado (01–05), com CTAs, switch de idioma e redes sociais.
- **Motion**: entrada do hero em sequência em CSS, com o H1 pintado no primeiro frame. Reveal ao scroll de **disparo único**. Título do about que ganha cor com o scroll (`animation-timeline: view()`). Marquee CSS de 45 s com pausa no hover. Accordion do FAQ por `grid-template-rows`. Cursor com modos (link, botão, texto) e tom claro ou escuro conforme a zona. **BREAKING** (comportamento): os blocos deixam de reanimar ao reentrar na viewport.
- **Testemunhos**: cartões e janela com fade do v3, mantendo o movimento contínuo atual das colunas.
- **FAQ**: novo cartão "Still have questions?" com o CTA de chamada, por baixo da lista.
- **Footer** (layout partilhado por todas as rotas): faixa "Ready to build?" com dois CTAs no topo, logo + tagline, colunas de links e barra de copyright com as redes. A faixa de contacto direto de `/get-quote` fica como está (é tratada em `v3-get-quote`).
- **Primitivas partilhadas do v3**, para as changes seguintes as usarem: `PageHeader` (grelha + eyebrow + H1 + lead) e uma fixture dev-only `/[locale]/fixtures/v3`.
- Remoção do código que deixa de ser usado: `ui/text-reveal`, `ui/cursor-glow`, `use-magnetic`, e o que mais ficar órfão.

## Capabilities

### New Capabilities
- `v3-home-visual`: o contrato visual e de interação da home v3: tokens, navbar em glass, hero, marquee, grelha de serviços, cartões de produto, colunas de testemunhos, FAQ com cartão de chamada, layout do footer e cursor.
- `mobile-navigation-menu`: o menu mobile do v3: o que contém, de onde vem cada peça, como abre e fecha, e o comportamento de foco e de scroll.

### Modified Capabilities
- `scroll-reveal-animations`: os blocos passam a revelar **uma só vez**. O `TextReveal` palavra a palavra dá lugar ao sweep de cor ligado ao scroll. Os parâmetros de animação deixam de ser "os anteriores" e passam a ser os do v3.
- `navbar-link-destinations`: os botões do navbar passam de `asChild` + `Link` a `href`. Um destino interno continua a navegar pelo `Link`, agora sem perder as camadas da animação.
- `button-hover-inversion`: o painel de preenchimento passa a subir em arco, o disco rola. A inversão aplica-se a todas as variantes usadas em CTA (incluindo o footer). A espessura do contorno passa a depender do tamanho e continua constante entre repouso e hover.

## Impact

- **Código**: `src/app/(app)/[locale]/(pages)/page.tsx`, `globals.css`, `Button`, `CalendlyCta`, `NavBar/*`, `Header`, `Hero`, `MarqueeServices`, `ServicesSection`, `ProductsSection`, `Card`, `TestimonialsSection`, `TestimonialCard`, `FAQSection`, `ui/accordion`, `CursorFollower`, `Footer`, `ui/reveal`. Fixtures de botões e navbar atualizadas, fixture `v3` nova.
- **Conteúdo**: nenhum campo novo no hcms. O domínio `NavBar` ganha `socialLinks`, lido do mesmo item `sites` que já alimenta o navbar e o footer (já invalidado pela tag de `sites`).
- **Dependências**: nenhuma nova. O `motion` deixa de servir o reveal, o marquee e o accordion. Mantém-se onde ainda for preciso (`NavigationProgress`). O Lenis (`SmoothScroll`) fica, e o smooth scroll por `wheel` do mockup **não** é portado.
- **Performance**: as specs `idle-runtime-budget`, `scroll-frame-budget`, `client-memory-budget` e `text-visibility-guarantees` continuam a valer sem alteração, e a implementação tem de as cumprir.
- **Sequência**: esta change entra primeiro. `v3-get-quote` e `v3-products-listing` dependem das primitivas daqui (botão, `PageHeader`, footer).
