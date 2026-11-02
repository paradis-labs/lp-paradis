## Context

- **Referência:** `openspec/design/v3 · EN-html/MainV3.dc.html` e `openspec/design/v3 · Product detail — Kitenda (EN)-html/Product.dc.html`, exportados a 2026-10-31 da versão 1793432751 do canvas.
- **O mockup faz o efeito em JS** (`// 3 · texto que ganha opacidade letra a letra`):
  - um listener de `scroll` agenda um rAF;
  - o rAF lê o `getBoundingClientRect()` de cada `[data-sw]` e calcula `p = (0,85·vh − top) / ((0,85 − 0,35)·vh + altura)`;
  - escreve `opacity = 0,22 + 0,78·t` em cada `.sw-c`, com `t = clamp(p·n − i)`;
  - cada `.sw-c` tem `transition: opacity .25s linear`.
- **O que está hoje no lp:** o sweep em gradiente (`.sweep`, `.sweep-dark`) da versão anterior do canvas.

## Goals / Non-Goals

**Goals:**
- O mesmo efeito visual em Chrome, Edge e Safari recentes.
- Legível sem JavaScript, sem flash, sem trabalho de frame em JS.
- Cartões de características com ícone, lidos do hcms.

**Non-Goals:**
- Igualdade exacta no Firefox: lá o texto fica estático a 100%.
- O efeito noutros textos além dos três do mockup.

## Decisions

### D1. CSS ligado ao scroll, e não o JS do mockup
Com o JS, o estado inicial tem de ser escolhido antes de o script arrancar, e as duas opções violam `text-visibility-guarantees`:
- começar a 22% deixa o texto quase ilegível se o bundle ou a hidratação falharem;
- começar a 100% faz o about, que está à vista no carregamento num ecrã grande, acender e depois apagar.

Com CSS o browser anima sem o bundle, e o estado sem suporte é o final. Em troca, o Firefox fica sem efeito.

### D2. A curva do mockup numa `view-timeline`
O host (`.lit`) declara `view-timeline-name: --lit`. Cada letra tem `animation: lit-in linear both; animation-timeline: --lit`. A janela de cada letra é desfasada com `--i` (índice) e `--n` (total):

```
animation-range-start: cover calc(var(--start) + (var(--span) * var(--i) / var(--n)))
animation-range-end:   cover calc(var(--start) + (var(--span) * (var(--i) + 1) / var(--n)))
```

`--start` e `--span` são exactamente o intervalo do mockup (topo a 85% → fundo a 35%), sem afinação: `cover` mede `100vh + altura do bloco`, por isso o início fica a `15vh` e a duração a `calc(100% - 50vh)`, qualquer que seja a altura. Medido no Chrome a 1440px, nos três alvos: a opacidade de cada letra fica a ≤0,001 da fórmula do mockup em p = 0; 0,25; 0,5; 0,75; 1.

Um antepassado com `overflow: hidden` é um scroll container que não rola, e prende o `view-timeline` (foi o caso do painel escuro). Para recortar, `overflow: clip`.

`@keyframes lit-in { from { opacity: .22 } to { opacity: 1 } }`. A `transition` de 0,25s do mockup não se aplica: com scroll-driven a opacidade acompanha o scroll directamente, e uma transição por cima atrasaria o efeito.

### D3. Partição no servidor, acessível
Um componente server `LitText` recebe a string e devolve:
- `<span class="sr-only">{texto}</span>`;
- `<span aria-hidden>`, com cada palavra num `<span class="whitespace-nowrap">` e cada letra num `<span style="--i:k">`. Os espaços ficam como texto entre palavras.

`--n` fica no host. Para 120 caracteres são ~150 nós: é aceitável para três blocos.

### D4. Ícones numa lista fechada, inline
`swap`, `trend`, `shield`, `calculator`, `globe` e `clock`, cada um com o seu path SVG de traço (os três primeiros são os do mockup). É fechada pela razão que o `Footer` documenta: um mapa aberto sobre um namespace impede o tree-shaking. No hcms é um `select` com os mesmos valores (`seed-paradis-v3-features`).

### D5. Os deltas anteriores
O requisito "Título com sweep de cor ligado ao scroll" (delta `scroll-reveal-animations` em `v3-home-reskin`) e o cenário dos "três passos" (delta `product-detail-page` em `v3-product-detail`) são editados nesses changes, ainda por arquivar, para apontarem para este. Assim o arquivo não promove para as specs principais um comportamento que já não existe.

## Risks / Trade-offs

- [Um `overflow: hidden` novo num antepassado congela o efeito] → documentado em `globals.css`; usar `overflow-clip`.
- [Firefox sem efeito] → aceite: o texto fica legível, e a experiência degrada sem partir.
- [Muitos nós] → limitado a três blocos de texto curto.
