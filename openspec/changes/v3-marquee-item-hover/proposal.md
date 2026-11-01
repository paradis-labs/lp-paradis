## Why

O reskin v3 trocou o `ScrollVelocityRow` do marquee de serviços por uma faixa CSS e, pelo caminho, perdeu o destaque por item no hover: antes, o serviço sob o ponteiro passava de `text-primary/60` a cor plena e a lâmpada passava de contorno a preenchida (`LightbulbMinimalistic` da Solar, peso `Bold`). Hoje o hover só pausa a faixa inteira, e todos os itens ficam iguais. O efeito original deve voltar, com o aspeto da referência: o item em destaque escuro com a lâmpada cheia, os restantes esbatidos com a lâmpada em contorno.

## What Changes

- Cada item do marquee ganha um estado de hover próprio: o texto e o ícone passam de `text-primary/60` a `text-primary` numa transição de 300 ms, e a lâmpada troca de contorno para preenchida.
- A lâmpada inline (só traço, desenho próprio) volta a ser o `LightbulbMinimalistic` da `@solar-icons/react`, nos pesos `Linear` e `Bold`, porque é esse o desenho da referência e o SVG atual não tem variante preenchida.
- A pausa da faixa no hover, a pausa fora da viewport, a máscara nas pontas, a duração de 45 s e as medidas do v3 (`text-lg`, ícone de 22 px, espaçamentos) não mudam.
- O marquee continua a ser server component: a Solar já é importada pela raiz em server components (`page.tsx`, `Footer`), sem fronteira de cliente. O comentário que diz o contrário é corrigido.

## Capabilities

### New Capabilities
- `services-marquee-hover`: o destaque por item do marquee de serviços no hover (cor plena, lâmpada preenchida, transição), em dispositivos com hover, nas duas cópias da faixa e também com movimento reduzido.

### Modified Capabilities
<!-- Nenhuma: o requisito do marquee vive em `v3-home-visual`, que ainda está na change aberta `v3-home-reskin` e não em `openspec/specs/`. Este destaque soma-se a ele e não muda nada do que ele exige (loop de 45 s, máscara, pausa no hover e fora da viewport). -->

## Impact

- **Código**: `src/components/MarqueeServices/index.tsx`. `globals.css` só se a troca de ícone usar regras próprias (ver design).
- **Dependências**: nenhuma nova (`@solar-icons/react` já é dependência).
- **Sem mudanças** em conteúdo, hcms, `MarqueePause` ou nas regras `.marquee`/`.marquee-track`.
- **Fora do âmbito**: `openspec/specs/idle-runtime-budget/spec.md` ainda exige que o marquee reaja à velocidade do scroll, o que o v3 removeu de propósito (D5 de `v3-home-reskin`). Essa divergência é da `v3-home-reskin` e resolve-se lá.
