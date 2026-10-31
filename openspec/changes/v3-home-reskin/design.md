## Context

- **Referência:** `openspec/design/v3 · EN-html/MainV3.dc.html` (export do canvas "Paradis Landing Page", artboard "v3 · EN"). O README do export diz para o tratar como mockup de referência: replicar os valores e não copiar o markup. O canvas tem também a "Motion & performance spec", que inventaria as animações atuais e prioriza correções (P1–P3). O v3 já responde a várias.
- **Estado atual:** `page.tsx` da home compõe `Hero`, `MarqueeServices`, about, vídeo com `Parallax`, `ServicesSection`, `ProductsSection`, `TestimonialsSection` e `FAQSection`. O motion assenta em `motion` (`Reveal`, `TextReveal`, `ScrollVelocityRow`, springs do `CursorFollower`, `CursorGlow`) e o smooth scroll no Lenis (`SmoothScroll`). O `Button` tem `textSwap`, `circleIcon` e `magnetic`, e um mapa de inversão por variante (`swapInvert`).
- **A estrutura do v3 é a mesma da página atual:** os mesmos ids de âncora, o mesmo notch entre o vídeo e o painel escuro (os `clip-path` do mockup são os de `homepage-shape-interlock`) e a mesma origem de conteúdo. Por isso é um reskin, e não uma página nova.
- **Restrições:** Cache Components (sem valores instáveis em prerender), React Compiler, Biome, sem test runner (a verificação faz-se em fixtures dev-only), conteúdo só por `@/content`, nenhuma escrita no schema do hcms.

## Goals / Non-Goals

**Goals:**
- A home com o aspeto e o motion do v3 nos quatro breakpoints do mockup.
- Primitivas do v3 (botão, `PageHeader`, cartão de chamada, revelação, cursor) prontas para `v3-get-quote` e `v3-products-listing`.
- Menos JS de animação no cliente: reveal, marquee, sweep e acordeão em CSS, com um único observer partilhado.
- Manter todos os orçamentos já especificados (idle, frame, memória, bundle, visibilidade de texto).

**Non-Goals:**
- A página `/get-quote` (fica em `v3-get-quote`) e a rota `/products` (fica em `v3-products-listing`).
- A página de detalhe de produto, que precisa de schema novo no `Template-multisite-tenant`.
- Campos novos no hcms, ou alterar a origem de qualquer texto que já vem do CMS.
- Portar o smooth scroll por `wheel` do mockup.

## Decisions

### D1. Motion em CSS, com um observer partilhado e o estado no React
O mockup resolve quase tudo em CSS e usa um só `IntersectionObserver` que acrescenta classes. O site faz o mesmo no CSS, mas o estado de cada bloco é do React: um client component pequeno, `Reveal`, envolve cada bloco revelável e escreve `data-rv="idle|out|in"` (ou `data-rv-group` nas grelhas). Todos partilham um único observer, ao nível do módulo. As secções continuam server components e passam os filhos ao `Reveal`.
- *Corrigido na implementação:* a primeira versão tinha um único `RevealRoot` no layout a escrever classes no DOM. A página hidrata depois do layout (streaming), por isso ele marcava elementos ainda não hidratados. O React 19 reportava a divergência (classe e atributo a mais em relação ao HTML do servidor), e um re-render que mudasse o `className` apagava a marca e voltava a esconder o bloco. Com o estado no próprio componente, a mudança só acontece depois de ele estar hidratado. A pausa do marquee seguiu o mesmo caminho (`MarqueePause`).
- *Alternativa:* manter `motion` com `whileInView` e `once: true`. Rejeitada: um nó motion por cartão e o bundle do `motion` no caminho crítico, para um efeito que o CSS faz.
- O observer usa `threshold: 0` e nenhuma margem negativa (`scroll-reveal-animations`), e não os `-8%`/`0.12` do mockup.
- Sem JavaScript, ou com a hidratação morta, nada sai de `idle`, e `idle` é visível. A rede de segurança `[data-reveal]` deixa de ser precisa para a revelação.

### D2. H1 do hero só com deslocamento
O `dsSlideIn` do mockup parte de `opacity: 0`. No H1, a implementação usa uma variante só com `transform`, e a descrição, os CTAs e o marquee mantêm o fade. É o ponto P1 da Motion spec. O custo visual é pequeno: o H1 já está no sítio certo e só sobe.

### D3. Botão: o efeito `ds-btn` dentro do `Button` existente
O `Button` mantém a API (`variant`, `size`, `href`, `asChild`, `textSwap`, `circleIcon`, `trailingIcon`) e o mapa de inversão tipado por variante. Muda a implementação das camadas: o painel com arco (`border-radius: 50% 50% 0 0` → `0`), o rótulo em duas cópias com roll e o disco com dois glifos que rolam na vertical. Os tokens do mockup (`--fill`, `--hfg`, `--dbg`, `--dfg`, `--dbgh`, `--dfgh`) mapeiam para as variantes assim:

| mockup | variante | uso |
|---|---|---|
| `ds-dark` | `primary` | navbar, hero, FAQ |
| `ds-outline` | `outline` | hero (chamada), about |
| `ds-white` | `inverted` | "View All", footer, menu |
| `ds-ghost` | `outline-inverted` | footer, menu (chamada) |

`magnetic` e `use-magnetic` saem. O mockup define `magMove`, mas nenhum elemento o usa.

*Acrescentado na implementação:* o caminho `href` do `Button` passa a renderizar o `Link` do `next/link` quando o destino é interno (começa por `/`), e uma `<a>` nua no resto. Antes, um CTA interno com animação obrigava a escolher entre `asChild` + `Link` (sem camadas) e `href` (sem roteamento de cliente). A navbar usava o `asChild` por isso, e passa a usar `href` (delta em `navbar-link-destinations`).
- *Alternativa:* um componente `DsButton` novo ao lado do `Button`. Rejeitada: duplicaria a lógica de `href`/`asChild`/Calendly (`cms-authored-cta-links`, `calendly-popup-cta`), que é justamente o que esses requisitos protegem.

### D4. Acordeão: Radix com animação por grid-rows, sem `forceMount`
O Radix Accordion fica pela semântica (teclado, `aria-controls`, `type="single"`). O `Content` anima `grid-template-rows` 0fr↔1fr por **keyframes** (`.faq-body` em `globals.css`), em vez das keyframes de `height`, o que responde ao item "Animar height provoca layout" da Motion spec.
- *Corrigido na implementação:* a primeira versão desta decisão usava `forceMount` com transição. Não funciona: o Radix põe `hidden` no conteúdo fechado, e o preflight do Tailwind força `display: none !important` em `[hidden]`. Além disso, as respostas fechadas ficariam no DOM do servidor e ocultas sem JavaScript, o que viola `text-visibility-guarantees`. Com keyframes, o `Presence` do Radix espera pelo `animationend` antes de desmontar.

### D5. Marquee CSS que pausa fora do ecrã
O `ScrollVelocityRow` (velocidade ligada ao scroll) dá lugar a uma faixa CSS de 45 s com `translate3d(-50%)` sobre a lista duplicada uma vez. Para cumprir `idle-runtime-budget`, o `MarqueePause` (estado no React, pela razão de D1) põe `animation-play-state: paused` quando a faixa sai da viewport ou a aba fica oculta. O marquee deixa de usar `ui/scroll-based-velocity`, que fica para os testemunhos (D6).

### D6. Testemunhos mantêm o movimento anterior
O mockup v3 desenha as colunas paradas. A primeira implementação seguiu-o, mas o movimento foi pedido de volta: as colunas continuam a usar o `ScrollVelocityRow` (vertical, direcções alternadas, aceleração pelo scroll, pausa no hover), que já cumpria `idle-runtime-budget` e `client-memory-budget`. Do v3 ficam os cartões e a janela com fade. Por isso o `ui/scroll-based-velocity` não é apagado; só o marquee de serviços deixa de o usar.

### D7. Cursor novo no lugar do `CursorFollower` e do `CursorGlow`
Um client island carregado com `next/dynamic` só quando `matchMedia("(hover: hover) and (pointer: fine)")` é verdadeiro (ponto P2 da Motion spec). Interpola com lerp 0,2 por frame e para o rAF quando converge. O modo vem de `closest()` num `mouseover` delegado (`[data-cursor-text]` → texto, `.btn`/`button` → botão, `a` → link). O tom claro vem de `closest('[data-cursor-tone="light"]')`, marcado no painel escuro, no footer e no menu. Sem `mix-blend-difference`, que obrigava a compor a página inteira em cada frame. Saem `CursorFollower` e `ui/cursor-glow`.

### D8. Navbar em glass com blur de 20px
Valor do mockup, mais leve do que os 40px atuais (P2 da Motion spec). O fundo passa a ser permanente: sai o estado `scrollY > 8`, e com ele o listener de scroll do `NavBarRoot`. Se o orçamento de `scroll-frame-budget` falhar em mobile, o recurso é baixar para 12px sem mudar o resto.

### D9. Cópia de UI nova em `Record<Locale, …>`
Os textos do v3 sem campo no hcms ficam no componente que os usa, em EN e PT, como o resto da cópia de UI do repo: "NAVIGATION", "Ready to build?" (menu), "Open/Close menu", "Still have questions?", "Talk to us on a 30-minute call.". O CTA do cartão de chamada é o `secondaryCta` do hero, que já é o "Schedule a Call" authorado, para não haver um segundo URL do Calendly em código.

### D10. `NavBar` ganha `socialLinks`
O menu mobile mostra as redes. Já vêm no item `sites` que o provider lê para o navbar e o footer, e o mapeamento existe (`FooterSocialLink`). Basta pedi-las na leitura do navbar e expô-las no tipo `NavBar`. A invalidação já existe: `sites` → `readTag("navbar")`.

### D11. `PageHeader` partilhado
A grelha de 90×30 mascarada, o eyebrow em pill, o H1 Gilroy e o lead, que se repetem em Products, Get Quote e no detalhe de produto do canvas, ficam num componente server `PageHeader` (`eyebrow?`, `title`, `lead?`, `children?` para ações). Entra aqui, mostrado só na fixture `v3`, para as duas changes seguintes não dependerem uma da outra.

### D12. Smooth scroll fica no Lenis
O mockup tem o seu próprio lerp no `wheel` com `preventDefault`. O repo já tem o Lenis, que a Motion spec dá como "bem resolvido" e que cumpre `idle-runtime-budget` (dorme parado). O offset das âncoras (96px, a altura da navbar) passa para o Lenis e para `scroll-margin-top`.

## Risks / Trade-offs

- **`animation-timeline` só existe nos Chromium recentes** → noutros navegadores o sweep não acontece e o título fica sólido. É aceitável, e está especificado.
- **Revelar uma só vez muda a "identidade de scroll"** que justificou o replay em `prevent-invisible-text` → é uma decisão do design v3, registada como REMOVED na delta spec com a razão.
- **`backdrop-filter` permanente na navbar** → custo de composição em scroll. Mitigação: medir com o perfil de `scroll-frame-budget` e cair para 12px se falhar (D8).
- **A grelha de serviços está desenhada para 7 itens** → com outro número, a grelha cai para colunas regulares (especificado). O editor deve saber que a composição "bonita" só aparece com 7.
- **Remover `motion` de vários sítios toca em muitos ficheiros** → o risco de regressão fica nas fixtures existentes (`buttons`, `navbar`, `footer`, `calendly`), que têm de continuar a renderizar, mais a fixture `v3` nova.
- **O footer muda em todas as rotas, incluindo `/get-quote`** → a faixa de contacto direto continua lá até `v3-get-quote` a mover para o aside. Entre as duas changes, a página de orçamento fica com o layout novo do footer e a faixa antiga por cima, o que é coerente.

## Migration Plan

1. Entra numa branch a partir de `develop`, com commits por bloco (primitivas → navbar/menu → secções → footer → limpeza), seguindo `change-landing`.
2. Não há migração de dados nem de conteúdo. O deploy é o normal (imagem standalone).
3. Rollback: reverter o merge. Nada no hcms depende desta change.

## Open Questions

- O PT de "Ready to build?" e "Still have questions?": a tradução fica a cargo de quem implementa, ou há cópia aprovada?
- Os ícones da grelha de serviços continuam os do repo por slug (como decidido na fase 1) ou passam aos traços do mockup? Por omissão: os do repo.
