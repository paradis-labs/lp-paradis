## Context

Antes do v3 (`d7199f5`), o `MarqueeServices` era client component sobre o `ScrollVelocityRow` e cada item tinha `group/item`, `text-primary/60 hover:text-primary transition-colors duration-300` e duas lâmpadas Solar, `Linear` e `Bold`, alternadas com `hidden`/`group-hover/item:block`. O reskin v3 (`v3-home-reskin`, D5) passou a faixa para CSS (`.marquee-track`, 45 s, pausa em `.marquee:hover` e em `[data-paused]`) e trocou a lâmpada por um SVG inline só com traço, justificado por evitar uma fronteira de cliente. O destaque por item desapareceu nessa passagem.

A justificação não se aplica: `page.tsx` e `Footer` são server components e importam ícones da raiz de `@solar-icons/react` sem `"use client"`.

## Goals / Non-Goals

**Goals:**
- Repor o destaque por item com o aspeto da referência: cor plena e lâmpada preenchida no item sob o ponteiro.
- Manter o marquee como server component, sem JS novo no cliente.
- Manter tudo o resto do marquee v3 tal como está.

**Non-Goals:**
- Repor a velocidade ligada ao scroll do `ScrollVelocityRow`.
- Mudar as medidas do v3 (`text-lg`, 22 px, `gap-3.5`, `pr-10`) para as antigas (`text-xl`, 24 px, `gap-4`, `pr-12`).
- Resolver a divergência de `idle-runtime-budget` sobre a reatividade ao scroll (pertence à `v3-home-reskin`).

## Decisions

### D1. Lâmpada Solar nos dois pesos, em vez do SVG inline
A referência é o desenho do `LightbulbMinimalistic` (`Bold` no item em destaque). O SVG atual tem outro desenho e só traço; preencher o seu path não daria a mesma forma. Volta a Solar, importada pela raiz como no resto do site, com `width`/`height` de 22 e `aria-hidden`.

*Alternativa:* desenhar à mão uma variante preenchida do SVG atual. Rejeitada: duplica um ícone que a dependência já tem e afasta-se da referência.

### D2. Troca dos ícones por sobreposição com `opacity`
Os dois ícones ficam empilhados na mesma célula (`grid` com ambos em `[grid-area:1/1]`); o `Bold` começa em `opacity-0` e passa a `opacity-100` com `group-hover/item`, o `Linear` faz o inverso, ambos com `transition-opacity duration-300`. Assim a lâmpada acompanha a transição de cor do texto, e a caixa do ícone tem sempre o mesmo tamanho (cumpre "sem salto de layout").

*Alternativa:* `hidden`/`block` como no original. Mais simples, mas a lâmpada muda num frame enquanto o texto transita em 300 ms. A diferença é pequena; se a sobreposição complicar o alinhamento, cair para `hidden`/`block` é aceitável.

### D3. Hover só com Tailwind, sem regras novas em `globals.css`
`group/item` no `<li>`, `group-hover/item:` nos filhos e `hover:text-primary` no item. No Tailwind v4 a variante `hover:` já vem dentro de `@media (hover: hover)`, o que cumpre o requisito de não prender o destaque em ecrãs táteis sem código extra. O `prefers-reduced-motion` em `globals.css` só desliga a animação da faixa, por isso o destaque continua a funcionar sem mudanças.

### D4. A cor passa do `div` da faixa para cada item
Hoje `text-primary/60` está no `.marquee-track`. Passa para o `<li>`, que é quem muda de estado. O `currentColor` dos ícones Solar segue o texto, como antes.

## Risks / Trade-offs

- [A Solar ganha uma fronteira de cliente numa versão futura] → hoje não tem (é a mesma importação de `page.tsx`); se o build acusar, o `MarqueeServices` continua server e só os ícones passariam a um leaf.
- [Hover num item em movimento é difícil de acertar] → a faixa já pausa em `.marquee:hover` antes de o ponteiro chegar ao item, por isso o item fica parado sob o ponteiro.
- [Dois ícones por item duplicam SVGs no HTML] → são poucos itens (×2 cópias); o custo é desprezável e o original fazia o mesmo.
