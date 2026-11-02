## Context

O `LitText` (`v3-scroll-lit-text`) parte o texto em letras e acende-as com o scroll. Na home está em seis chamadas, que dão dez textos: o título e o subtítulo do about (`page.tsx`), o título e o subtítulo do `SectionHeading` (×3, `v3-section-heading-lit`) e o título e o subtítulo do FAQ (`v3-lit-text-all-pages`). Este change tira-o das descrições.

Cores do mockup v3 (`MainV3.dc.html`) para as descrições, contra o código:

| Descrição | Mockup | Hoje | Sem `LitText` |
|---|---|---|---|
| About (`page.tsx:80`) | `#31373d` | `text-muted-foreground` + `tone="inherit"` | `#31373d`, certo |
| `SectionHeading` (×3) | `rgba(255,255,255,0.64)` | `tone="dark"` → `text-white` | branco 100% herdado do pai: **errado** |
| FAQ (`FAQSection:55`) | `#31373d` | `text-muted-foreground` + `tone="inherit"` | `#31373d`, certo |

O resto do texto da home (lead do Hero, cartões de serviço e de produto, testemunhos, títulos) já tem as cores do mockup e não muda.

## Goals / Non-Goals

**Goals:**
- As cinco descrições da home sem efeito, estáticas desde o primeiro frame.
- O subtítulo do painel escuro na cor do mockup (branco a 64%).

**Non-Goals:**
- Os títulos: continuam a acender. Alinhar os títulos do painel e do FAQ com o mockup (onde só o about anima) é outra decisão.
- Outras páginas (`PageHeader`, detalhe de produto, Get Quote).
- Mudar o `LitText` ou o `.lit`.

## Decisions

**D1. Tirar o `LitText` no chamador, não uma prop.** O `<p>` passa a ter o texto directamente. Uma prop `lit={false}` no `LitText` seria um componente que às vezes não faz nada; e o `SectionHeading` não precisa de uma prop `litSubtitle`, porque os três chamadores querem o mesmo.

**D2. A cor do subtítulo escuro no `<p>`, com `text-white/64`.** É a classe que `v3-section-heading-lit` tirou (design.md:26 desse change) e a que os cartões de serviço já usam. O pai `text-white` fica, porque é a cor do título.

**D3. About e FAQ mantêm `text-muted-foreground`.** O `--muted-foreground` é `#31373d`, igual ao mockup. Não se troca por um hex.

**D4. O import do `LitText` fica nos três ficheiros**, porque os títulos continuam a usá-lo.

## Risks / Trade-offs

- [O cabeçalho passa a ter um título a acender por cima de um parágrafo estático, e já não a cascata título → subtítulo] → É o pedido; o about do mockup já tem exactamente esta forma (título animado, parágrafo `#31373d` estático).
- [O branco a 64% sobre `#212528` dá menos contraste do que o 100%] → É a cor do mockup e a dos cartões de serviço; a 18px, ~7:1 sobre `#212528`, acima de 4.5:1.
